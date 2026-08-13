import { exec } from 'child_process';
import { promisify } from 'util';
import { ARDUINO_CLI } from './arduinoCompiler.js';

const execAsync = promisify(exec);

export interface DetectedHardwareDevice {
  boardName: string;
  port: string;
  status: 'connected' | 'disconnected';
  chip: string;
  vendor: string;
  vendorId?: string;
  productId?: string;
  fqbn?: string;
  label?: string;
  isVerifiedArduino?: boolean;
}

// Known USB VID / PID Lookup Database for Hardware Detection
const KNOWN_VID_PID_DB: Record<string, { boardName: string; vendor: string; chip: string; fqbn: string }> = {
  // Arduino Official
  '2341:0043': { boardName: 'Arduino Uno', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:uno' },
  '2341:0010': { boardName: 'Arduino Uno', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:uno' },
  '2341:0042': { boardName: 'Arduino Mega 2560', vendor: 'Arduino SA', chip: 'ATmega2560', fqbn: 'arduino:avr:mega' },
  '2341:003F': { boardName: 'Arduino Mega 2560', vendor: 'Arduino SA', chip: 'ATmega2560', fqbn: 'arduino:avr:mega' },
  '2341:0070': { boardName: 'Arduino Nano', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:nano' },

  // CH340 / CH341 Clones (Nano, ESP8266, ESP32)
  '1A86:7523': { boardName: 'Arduino Nano (CH340)', vendor: 'WCH.cn (Qinheng)', chip: 'CH340G / ATmega328P', fqbn: 'arduino:avr:nano' },
  '1A86:5523': { boardName: 'ESP8266 NodeMCU (CH340)', vendor: 'WCH.cn (Qinheng)', chip: 'CH340 / ESP8266', fqbn: 'esp8266:esp8266:generic' },

  // CP2102 / CP2104 (NodeMCU ESP8266, ESP32 DevKit)
  '10C4:EA60': { boardName: 'ESP32 Dev Module', vendor: 'Silicon Labs', chip: 'CP2102 / ESP32-D0WDQ6', fqbn: 'esp32:esp32:esp32' },
  '10C4:EA70': { boardName: 'ESP32 Dev Module', vendor: 'Silicon Labs', chip: 'CP2105 / ESP32', fqbn: 'esp32:esp32:esp32' },

  // FTDI Clones & Genuine
  '0403:6001': { boardName: 'Arduino Nano (FTDI)', vendor: 'FTDI Ltd', chip: 'FT232RL / ATmega328P', fqbn: 'arduino:avr:nano' },
  '0403:6015': { boardName: 'Arduino Micro', vendor: 'FTDI Ltd', chip: 'FT230X', fqbn: 'arduino:avr:micro' },

  // Espressif Native USB
  '303A:1001': { boardName: 'ESP32-S3 DevKit', vendor: 'Espressif Systems', chip: 'ESP32-S3 USB JTAG', fqbn: 'esp32:esp32:esp32s3' },
};

export class BoardManagerService {
  /**
   * Scans system hardware and returns list of detected boards and COM ports with full VID/PID metadata
   */
  public static async scanHardware(): Promise<DetectedHardwareDevice[]> {
    const devices: DetectedHardwareDevice[] = [];

    // 1. Primary Method: Try arduino-cli board list --json
    try {
      const { stdout } = await execAsync(`"${ARDUINO_CLI}" board list --json`, { timeout: 8000 });
      const parsed = JSON.parse(stdout);

      const detectedList = Array.isArray(parsed)
        ? parsed
        : parsed?.detected_ports && Array.isArray(parsed.detected_ports)
        ? parsed.detected_ports
        : [];

      if (detectedList.length > 0) {
        for (const item of detectedList) {
          if (item.port && item.port.address) {
            const portName = item.port.address;
            const vidRaw = item.port.properties?.vid || item.port.hardware_id?.split(':')?.[0] || '';
            const pidRaw = item.port.properties?.pid || item.port.hardware_id?.split(':')?.[1] || '';

            // Clean hex prefixes (0x2341 -> 2341)
            const vid = vidRaw.replace(/^0x/i, '').toUpperCase();
            const pid = pidRaw.replace(/^0x/i, '').toUpperCase();
            const vidPidKey = `${vid}:${pid}`;

            const knownMeta = KNOWN_VID_PID_DB[vidPidKey];
            const matchedBoard = item.matching_boards?.[0];
            const manufacturer = item.port.properties?.manufacturer || item.port.properties?.product || '';

            const isVerified = Boolean(
              matchedBoard ||
                knownMeta ||
                /arduino|ch340|ftdi|cp210|espressif|silicon labs|wch/i.test(manufacturer)
            );

            let boardName = 'Serial Port (Unverified)';
            let fqbn = undefined;
            let vendor = item.port.properties?.vendorName || item.port.protocol_label || 'Serial Port';
            let chip = 'Microcontroller Core';

            if (matchedBoard) {
              boardName = matchedBoard.name;
              fqbn = matchedBoard.fqbn;
              vendor = knownMeta?.vendor || item.port.properties?.manufacturer || 'Arduino SA';
              chip = knownMeta?.chip || 'ATmega328P';
            } else if (knownMeta) {
              boardName = knownMeta.boardName;
              fqbn = knownMeta.fqbn;
              vendor = knownMeta.vendor;
              chip = knownMeta.chip;
            } else if (isVerified) {
              boardName = manufacturer || 'Arduino Board';
              fqbn = 'arduino:avr:uno';
            } else {
              boardName = `Serial Port (${portName})`;
              vendor = item.port.protocol_label || 'Generic Serial';
            }

            devices.push({
              boardName,
              port: portName,
              status: 'connected',
              chip,
              vendor,
              vendorId: vid || undefined,
              productId: pid || undefined,
              fqbn,
              label: `${portName} (${boardName})`,
              isVerifiedArduino: isVerified,
            });
          }
        }
      }
    } catch (_err) {
      // Ignore CLI failure, fall back to OS PnP enumeration
    }

    // 2. Secondary Method: OS Windows PnP query if list empty
    if (devices.length === 0 && process.platform === 'win32') {
      try {
        const pnpDevices = await this.scanWindowsPnpSerialPorts();
        devices.push(...pnpDevices);
      } catch (_e) {
        // Ignore PnP error
      }
    }

    if (devices.length === 0) {
      return [];
    }

    // Deduplicate by port address to avoid duplicate React key warnings
    const uniqueMap = new Map<string, DetectedHardwareDevice>();
    for (const dev of devices) {
      if (!uniqueMap.has(dev.port)) {
        uniqueMap.set(dev.port, dev);
      }
    }
    return Array.from(uniqueMap.values());
  }

  /**
   * Scans Windows PnP registry for COM ports with VID/PID parsing
   */
  private static async scanWindowsPnpSerialPorts(): Promise<DetectedHardwareDevice[]> {
    const devices: DetectedHardwareDevice[] = [];
    try {
      const { stdout } = await execAsync('wmic path Win32_PnPEntity where "Caption like \'%COM%\'" get Caption, DeviceID /format:csv', { timeout: 8000 });
      const lines = stdout.split('\n').filter(Boolean);

      for (const line of lines) {
        const comMatch = line.match(/(COM\d+)/i);
        const vidPidMatch = line.match(/VID_([0-9A-F]{4})&PID_([0-9A-F]{4})/i);

        if (comMatch) {
          const port = comMatch[1].toUpperCase();
          const vid = vidPidMatch ? vidPidMatch[1].toUpperCase() : '';
          const pid = vidPidMatch ? vidPidMatch[2].toUpperCase() : '';
          const key = `${vid}:${pid}`;

          const known = KNOWN_VID_PID_DB[key];
          const isBluetooth = /bluetooth/i.test(line);

          let boardName = 'Serial Port';
          let vendor = 'USB Serial Hardware';
          let chip = 'Microcontroller Core';
          let fqbn: string | undefined = undefined;
          let isVerified = false;

          if (known) {
            boardName = known.boardName;
            vendor = known.vendor;
            chip = known.chip;
            fqbn = known.fqbn;
            isVerified = true;
          } else if (line.includes('CH340')) {
            boardName = 'Arduino Nano (CH340)';
            vendor = 'WCH.cn (Qinheng)';
            chip = 'CH340G / ATmega328P';
            fqbn = 'arduino:avr:nano';
            isVerified = true;
          } else if (line.includes('CP210')) {
            boardName = 'ESP32 Dev Module';
            vendor = 'Silicon Labs';
            chip = 'CP2102 / ESP32';
            fqbn = 'esp32:esp32:esp32';
            isVerified = true;
          } else if (line.includes('Arduino')) {
            boardName = 'Arduino Board';
            vendor = 'Arduino SA';
            chip = 'ATmega328P';
            fqbn = 'arduino:avr:uno';
            isVerified = true;
          } else if (isBluetooth) {
            boardName = `Bluetooth Link (${port})`;
            vendor = 'Standard Bluetooth';
            isVerified = false;
          } else {
            boardName = `Serial Port (${port})`;
            vendor = 'Generic Serial';
            isVerified = false;
          }

          devices.push({
            boardName,
            port,
            status: 'connected',
            chip,
            vendor,
            vendorId: vid || undefined,
            productId: pid || undefined,
            fqbn,
            label: `${port} (${boardName})`,
            isVerifiedArduino: isVerified,
          });
        }
      }
    } catch (_) {}

    return devices;
  }

  /**
   * Returns rich simulated hardware list when no physical hardware is plugged in
   */
  public static getSimulatedHardwareList(): DetectedHardwareDevice[] {
    return [
      {
        boardName: 'Arduino Uno',
        port: 'COM3',
        status: 'connected',
        chip: 'ATmega328P',
        vendor: 'Arduino SA',
        vendorId: '2341',
        productId: '0043',
        fqbn: 'arduino:avr:uno',
        label: 'COM3 (Arduino Uno)',
      },
      {
        boardName: 'Arduino Nano',
        port: 'COM5',
        status: 'connected',
        chip: 'ATmega328P (CH340G)',
        vendor: 'WCH.cn (Qinheng)',
        vendorId: '1A86',
        productId: '7523',
        fqbn: 'arduino:avr:nano',
        label: 'COM5 (Arduino Nano)',
      },
      {
        boardName: 'Arduino Mega 2560',
        port: 'COM7',
        status: 'connected',
        chip: 'ATmega2560',
        vendor: 'Arduino SA',
        vendorId: '2341',
        productId: '0042',
        fqbn: 'arduino:avr:mega',
        label: 'COM7 (Arduino Mega 2560)',
      },
      {
        boardName: 'ESP32 Dev Module',
        port: 'COM4',
        status: 'connected',
        chip: 'ESP32-D0WDQ6 (CP2102)',
        vendor: 'Silicon Labs',
        vendorId: '10C4',
        productId: 'EA60',
        fqbn: 'esp32:esp32:esp32',
        label: 'COM4 (ESP32 Dev Module)',
      },
      {
        boardName: 'ESP8266 NodeMCU',
        port: 'COM8',
        status: 'connected',
        chip: 'ESP8266EX (CH340)',
        vendor: 'WCH.cn',
        vendorId: '1A86',
        productId: '5523',
        fqbn: 'esp8266:esp8266:generic',
        label: 'COM8 (ESP8266 NodeMCU)',
      },
    ];
  }
}

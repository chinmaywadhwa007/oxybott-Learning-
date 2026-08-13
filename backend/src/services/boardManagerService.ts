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

// Known USB VID / PID Lookup Database for Microcontroller Hardware Detection
const KNOWN_VID_PID_DB: Record<string, { boardName: string; vendor: string; chip: string; fqbn: string }> = {
  // Official Arduino Boards
  '2341:0043': { boardName: 'Arduino Uno', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:uno' },
  '2341:0010': { boardName: 'Arduino Uno', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:uno' },
  '2341:0001': { boardName: 'Arduino Uno', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:uno' },
  '2341:0243': { boardName: 'Arduino Uno WiFi Rev2', vendor: 'Arduino SA', chip: 'ATmega4809', fqbn: 'arduino:megaavr:uno2018' },
  '2341:1002': { boardName: 'Arduino Uno R4 Minima', vendor: 'Arduino SA', chip: 'RA4M1', fqbn: 'arduino:renesas_uno:minima' },
  '2341:0069': { boardName: 'Arduino Uno R4 WiFi', vendor: 'Arduino SA', chip: 'RA4M1', fqbn: 'arduino:renesas_uno:unowifi' },
  '2341:0042': { boardName: 'Arduino Mega 2560', vendor: 'Arduino SA', chip: 'ATmega2560', fqbn: 'arduino:avr:mega' },
  '2341:003F': { boardName: 'Arduino Mega 2560', vendor: 'Arduino SA', chip: 'ATmega2560', fqbn: 'arduino:avr:mega' },
  '2341:0070': { boardName: 'Arduino Nano', vendor: 'Arduino SA', chip: 'ATmega328P', fqbn: 'arduino:avr:nano' },
  '2341:0036': { boardName: 'Arduino Leonardo', vendor: 'Arduino SA', chip: 'ATmega32u4', fqbn: 'arduino:avr:leonardo' },
  '2341:8036': { boardName: 'Arduino Leonardo', vendor: 'Arduino SA', chip: 'ATmega32u4', fqbn: 'arduino:avr:leonardo' },
  '2341:0037': { boardName: 'Arduino Micro', vendor: 'Arduino SA', chip: 'ATmega32u4', fqbn: 'arduino:avr:micro' },
  '2341:8037': { boardName: 'Arduino Micro', vendor: 'Arduino SA', chip: 'ATmega32u4', fqbn: 'arduino:avr:micro' },

  // CH340 / CH341 Clones (Nano, ESP8266, ESP32)
  '1A86:7523': { boardName: 'Arduino Nano (CH340)', vendor: 'WCH.cn (Qinheng)', chip: 'CH340G / ATmega328P', fqbn: 'arduino:avr:nano' },
  '1A86:5523': { boardName: 'ESP8266 NodeMCU (CH340)', vendor: 'WCH.cn (Qinheng)', chip: 'CH340 / ESP8266', fqbn: 'esp8266:esp8266:generic' },

  // CP2102 / CP2104 (NodeMCU ESP8266, ESP32 DevKit)
  '10C4:EA60': { boardName: 'ESP32 Dev Module', vendor: 'Silicon Labs', chip: 'CP2102 / ESP32', fqbn: 'esp32:esp32:esp32' },
  '10C4:EA70': { boardName: 'ESP32 Dev Module', vendor: 'Silicon Labs', chip: 'CP2105 / ESP32', fqbn: 'esp32:esp32:esp32' },

  // FTDI Clones & Genuine
  '0403:6001': { boardName: 'Arduino Nano (FTDI)', vendor: 'FTDI Ltd', chip: 'FT232RL / ATmega328P', fqbn: 'arduino:avr:nano' },
  '0403:6015': { boardName: 'Arduino Micro', vendor: 'FTDI Ltd', chip: 'FT230X', fqbn: 'arduino:avr:micro' },

  // Espressif Native USB
  '303A:1001': { boardName: 'ESP32-S3 DevKit', vendor: 'Espressif Systems', chip: 'ESP32-S3 USB JTAG', fqbn: 'esp32:esp32:esp32s3' },
  '303A:0002': { boardName: 'ESP32-S2 DevKit', vendor: 'Espressif Systems', chip: 'ESP32-S2 USB', fqbn: 'esp32:esp32:esp32s2' },

  // Raspberry Pi Pico & STM32
  '2E8A:0003': { boardName: 'Raspberry Pi Pico', vendor: 'Raspberry Pi', chip: 'RP2040', fqbn: 'rp2040:rp2040:rp2040' },
  '2E8A:000A': { boardName: 'Raspberry Pi Pico W', vendor: 'Raspberry Pi', chip: 'RP2040', fqbn: 'rp2040:rp2040:rp2040' },
  '0483:374B': { boardName: 'STM32F103 (Blue Pill)', vendor: 'STMicroelectronics', chip: 'STM32F103', fqbn: 'STMicroelectronics:stm32:GenF1' },
};

export class BoardManagerService {
  /**
   * Scans system hardware using `arduino-cli board list --json`.
   * Returns ONLY actual verified detected Arduino / microcontroller boards.
   * DOES NOT fabricate fake boards or report unverified Windows COM ports as Arduino.
   */
  public static async scanHardware(): Promise<DetectedHardwareDevice[]> {
    const devices: DetectedHardwareDevice[] = [];

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

            // A device is a verified Arduino/microcontroller ONLY if:
            // 1. arduino-cli identified a matching board, OR
            // 2. The USB VID:PID matches a known microcontroller board in KNOWN_VID_PID_DB
            if (matchedBoard || knownMeta) {
              const boardName = matchedBoard?.name || knownMeta?.boardName || 'Arduino Board';
              const fqbn = matchedBoard?.fqbn || knownMeta?.fqbn || 'arduino:avr:uno';
              const vendor = knownMeta?.vendor || item.port.properties?.manufacturer || 'Arduino SA';
              const chip =
                knownMeta?.chip ||
                (fqbn.includes('mega')
                  ? 'ATmega2560'
                  : fqbn.includes('nano')
                  ? 'ATmega328P'
                  : fqbn.includes('esp32')
                  ? 'ESP32'
                  : 'ATmega328P');

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
                isVerifiedArduino: true,
              });
            }
          }
        }
      }
    } catch (_err) {
      // CLI error or no boards connected — return empty list []
    }

    // Deduplicate by port address
    const uniqueMap = new Map<string, DetectedHardwareDevice>();
    for (const dev of devices) {
      if (!uniqueMap.has(dev.port)) {
        uniqueMap.set(dev.port, dev);
      }
    }
    return Array.from(uniqueMap.values());
  }
}

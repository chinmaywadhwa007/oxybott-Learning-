import { exec } from 'child_process';
import { promisify } from 'util';
import { ARDUINO_CLI } from './arduinoCompiler.js';

const execAsync = promisify(exec);

export interface BoardProfile {
  id: string;
  name: string;
  fqbn: string;
  architecture: string;
  icon: string;
  description: string;
}

export interface SerialPortInfo {
  port: string;
  label: string;
  boardName?: string;
}

export const SUPPORTED_BOARDS: BoardProfile[] = [
  {
    id: 'uno',
    name: 'Arduino Uno',
    fqbn: 'arduino:avr:uno',
    architecture: 'avr',
    icon: '⚡',
    description: 'ATmega328P based microcontroller board',
  },
  {
    id: 'nano',
    name: 'Arduino Nano',
    fqbn: 'arduino:avr:nano',
    architecture: 'avr',
    icon: '🔹',
    description: 'Compact ATmega328P board',
  },
  {
    id: 'mega',
    name: 'Arduino Mega 2560',
    fqbn: 'arduino:avr:mega',
    architecture: 'avr',
    icon: '⬛',
    description: 'ATmega2560 board with 54 digital I/O pins',
  },
  {
    id: 'leonardo',
    name: 'Arduino Leonardo',
    fqbn: 'arduino:avr:leonardo',
    architecture: 'avr',
    icon: '🟡',
    description: 'ATmega32u4 board with native USB capabilities',
  },
  {
    id: 'micro',
    name: 'Arduino Micro',
    fqbn: 'arduino:avr:micro',
    architecture: 'avr',
    icon: '🟣',
    description: 'Small form-factor ATmega32u4 board',
  },
  {
    id: 'esp8266',
    name: 'ESP8266 NodeMCU',
    fqbn: 'esp8266:esp8266:generic',
    architecture: 'esp8266',
    icon: '🌐',
    description: 'Wi-Fi enabled micro-controller chip',
  },
  {
    id: 'esp32',
    name: 'ESP32 Dev Module',
    fqbn: 'esp32:esp32:esp32',
    architecture: 'esp32',
    icon: '📡',
    description: 'Dual-core Wi-Fi & Bluetooth microcontroller',
  },
  {
    id: 'stm32',
    name: 'STM32F103 (Blue Pill)',
    fqbn: 'STMicroelectronics:stm32:GenF1',
    architecture: 'stm32',
    icon: '🔷',
    description: 'ARM Cortex-M3 32-bit microcontroller',
  },
  {
    id: 'rp2040',
    name: 'Raspberry Pi Pico (RP2040)',
    fqbn: 'rp2040:rp2040:rp2040',
    architecture: 'rp2040',
    icon: '🍓',
    description: 'Dual ARM Cortex-M0+ silicon board',
  },
];

export async function detectConnectedBoards(): Promise<{ cliInstalled: boolean; boards: BoardProfile[] }> {
  try {
    const { stdout } = await execAsync(`"${ARDUINO_CLI}" version`);
    const isCliAvailable = stdout.toLowerCase().includes('arduino-cli');
    return { cliInstalled: isCliAvailable, boards: SUPPORTED_BOARDS };
  } catch (_err) {
    return { cliInstalled: false, boards: SUPPORTED_BOARDS };
  }
}

import { BoardManagerService, DetectedHardwareDevice } from './boardManagerService.js';

export async function detectSerialPorts(): Promise<(SerialPortInfo & Partial<DetectedHardwareDevice>)[]> {
  try {
    const devices = await BoardManagerService.scanHardware();
    return devices.map((d) => ({
      port: d.port,
      label: d.label || `${d.port} (${d.boardName})`,
      boardName: d.boardName,
      status: d.status,
      chip: d.chip,
      vendor: d.vendor,
      vendorId: d.vendorId,
      productId: d.productId,
      fqbn: d.fqbn,
    }));
  } catch (_err) {
    const fallback = BoardManagerService.getSimulatedHardwareList();
    return fallback.map((d) => ({
      port: d.port,
      label: d.label || `${d.port} (${d.boardName})`,
      boardName: d.boardName,
      status: d.status,
      chip: d.chip,
      vendor: d.vendor,
      vendorId: d.vendorId,
      productId: d.productId,
      fqbn: d.fqbn,
    }));
  }
}

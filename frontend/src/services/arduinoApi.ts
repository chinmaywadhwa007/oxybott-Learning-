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
  status?: 'connected' | 'disconnected';
  chip?: string;
  vendor?: string;
  vendorId?: string;
  productId?: string;
  fqbn?: string;
}

export interface MemoryUsage {
  flashBytes: number;
  flashPercent: number;
  maxFlashBytes: number;
  sramBytes: number;
  sramPercent: number;
  maxSramBytes: number;
}

export interface CompileResponse {
  success: boolean;
  simulated: boolean;
  logs: string[];
  sketchSize?: string;
  dynamicMem?: string;
  compileTimeMs: number;
  errors?: string[];
  warnings?: string[];
  memoryUsage?: MemoryUsage;
}

export interface UploadResponse {
  success: boolean;
  simulated: boolean;
  logs: string[];
  error?: string;
}

const API_BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/arduino`
    : 'https://oxybott-learning.onrender.com/api/arduino';

export async function fetchBoards(): Promise<BoardProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/boards`);
    if (!res.ok) throw new Error('Failed to fetch boards');
    const data = await res.json();
    return data.boards || [];
  } catch (_err) {
    // Fallback if backend is offline
    return [
      { id: 'uno', name: 'Arduino Uno', fqbn: 'arduino:avr:uno', architecture: 'avr', icon: '⚡', description: 'ATmega328P based board' },
      { id: 'nano', name: 'Arduino Nano', fqbn: 'arduino:avr:nano', architecture: 'avr', icon: '🔹', description: 'Compact ATmega328P board' },
      { id: 'esp32', name: 'ESP32 Dev Module', fqbn: 'esp32:esp32:esp32', architecture: 'esp32', icon: '📡', description: 'Dual-core Wi-Fi & Bluetooth' },
      { id: 'esp8266', name: 'ESP8266 NodeMCU', fqbn: 'esp8266:esp8266:generic', architecture: 'esp8266', icon: '🌐', description: 'Wi-Fi micro-controller' },
    ];
  }
}

export async function fetchPorts(): Promise<SerialPortInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/ports`);
    if (!res.ok) throw new Error('Failed to fetch serial ports');
    const data = await res.json();
    return data.ports || [];
  } catch (_err) {
    return [
      { port: 'COM3', label: 'COM3 (Virtual Arduino Uno)', boardName: 'Arduino Uno' },
      { port: 'COM4', label: 'COM4 (Virtual ESP32)', boardName: 'ESP32' },
    ];
  }
}

export async function requestCompile(code: string, fqbn: string): Promise<CompileResponse> {
  try {
    const res = await fetch(`${API_BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, fqbn }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        simulated: false,
        logs: [
          `❌ [Compiler API Error] ${errJson.error || res.statusText || 'Compilation failed on server'}`,
        ],
        errors: [errJson.error || 'Server error'],
        compileTimeMs: 0,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      simulated: false,
      logs: [
        '❌ [Network Error] Backend compiler API is offline or unreachable.',
        `Details: ${err.message || 'Connection refused'}`,
      ],
      errors: [err.message || 'Network error'],
      compileTimeMs: 0,
    };
  }
}

export async function requestUpload(code: string, fqbn: string, port: string): Promise<UploadResponse> {
  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, fqbn, port }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        simulated: false,
        logs: [
          `❌ [Uploader API Error] ${errJson.error || res.statusText || 'Upload failed on server'}`,
        ],
        error: errJson.error || 'Upload error',
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      simulated: false,
      logs: [
        '❌ [Network Error] Backend uploader API is offline or unreachable.',
        `Details: ${err.message || 'Connection refused'}`,
      ],
      error: err.message || 'Network error',
    };
  }
}

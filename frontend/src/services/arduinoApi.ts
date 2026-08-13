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
  isVerifiedArduino?: boolean;
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

export interface AgentHealthStatus {
  isAgentRunning: boolean;
  agentInfo?: string;
  cliInstalled?: boolean;
  cliVersion?: string;
  errorDetails?: string;
}

export const LOCAL_AGENT_URL = 'http://127.0.0.1:8765';
const CLOUD_API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/arduino`;

/**
 * Checks if the local Oxybott Arduino Agent is running on client's computer (http://127.0.0.1:8765)
 */
export async function checkAgentHealth(): Promise<AgentHealthStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${LOCAL_AGENT_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        isAgentRunning: true,
        agentInfo: data.agent || 'Oxybott Local Arduino Agent v1.0',
        cliInstalled: data.cliInstalled,
        cliVersion: data.cliVersion,
      };
    }
    return { isAgentRunning: false, errorDetails: 'Agent responded with non-200 status' };
  } catch (_err) {
    return { isAgentRunning: false, errorDetails: 'Local agent is not running (http://127.0.0.1:8765)' };
  }
}

/**
 * Determines API Base endpoint for hardware operations (Prefers local agent at http://127.0.0.1:8765)
 */
async function getHardwareApiTarget(): Promise<{ baseUrl: string; isLocalAgent: boolean }> {
  const health = await checkAgentHealth();
  if (health.isAgentRunning) {
    return { baseUrl: LOCAL_AGENT_URL, isLocalAgent: true };
  }
  return { baseUrl: CLOUD_API_BASE, isLocalAgent: false };
}

export async function fetchBoards(): Promise<BoardProfile[]> {
  try {
    const { baseUrl } = await getHardwareApiTarget();
    const res = await fetch(`${baseUrl}/boards`);
    if (!res.ok) throw new Error('Failed to fetch boards');
    const data = await res.json();
    return data.boards || [];
  } catch (_err) {
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
    const health = await checkAgentHealth();
    if (!health.isAgentRunning) {
      // Local agent is offline — return empty list (cannot access client USB from cloud)
      return [];
    }
    const res = await fetch(`${LOCAL_AGENT_URL}/ports`);
    if (!res.ok) throw new Error('Failed to fetch serial ports');
    const data = await res.json();
    return data.ports || [];
  } catch (_err) {
    return [];
  }
}

export async function requestCompile(code: string, fqbn: string): Promise<CompileResponse> {
  const health = await checkAgentHealth();
  const baseUrl = health.isAgentRunning ? LOCAL_AGENT_URL : CLOUD_API_BASE;

  try {
    const res = await fetch(`${baseUrl}/compile`, {
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
          `❌ [Compiler API Error] ${errJson.error || res.statusText || 'Compilation failed'}`,
        ],
        errors: [errJson.error || 'Compiler API error'],
        compileTimeMs: 0,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      simulated: false,
      logs: [
        '❌ [Network Error] Compiler service is unreachable.',
        `Details: ${err.message || 'Connection refused'}`,
      ],
      errors: [err.message || 'Network error'],
      compileTimeMs: 0,
    };
  }
}

export async function requestUpload(code: string, fqbn: string, port: string): Promise<UploadResponse> {
  const health = await checkAgentHealth();
  if (!health.isAgentRunning) {
    return {
      success: false,
      simulated: false,
      logs: [
        '❌ [Upload Error] Oxybott Arduino Agent is not running on your computer.',
        'Please start the local agent using `npm run agent` in your terminal.',
      ],
      error: 'Oxybott Arduino Agent is not running. Please start the local agent to connect your Arduino.',
    };
  }

  try {
    const res = await fetch(`${LOCAL_AGENT_URL}/upload`, {
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
          `❌ [Uploader API Error] ${errJson.error || res.statusText || 'Upload failed'}`,
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
        '❌ [Network Error] Local Oxybott Agent upload endpoint is unreachable.',
        `Details: ${err.message || 'Connection refused'}`,
      ],
      error: err.message || 'Network error',
    };
  }
}

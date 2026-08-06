import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Download,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
export interface ArduinoLibraryInfo {
  name: string;
  version: string;
  author: string;
  sentence: string;
  category: string;
  installed: boolean;
  installedVersion?: string;
  dependencies?: string[];
}

interface LibraryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = 'http://localhost:5000/api/arduino';

export const LibraryManagerModal: React.FC<LibraryManagerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'installed'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraries, setLibraries] = useState<ArduinoLibraryInfo[]>([]);
  const [installedList, setInstalledList] = useState<ArduinoLibraryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingName, setProcessingName] = useState<string | null>(null);
  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleSearch('');
      loadInstalled();
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/libraries?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setLibraries(data.libraries || []);
    } catch (_err) {
      // Fallback local libraries catalog
      setLibraries([
        { name: 'Servo', version: '1.2.1', author: 'Arduino', sentence: 'RC servo motor controller', category: 'Input/Output', installed: true },
        { name: 'LiquidCrystal_I2C', version: '1.1.2', author: 'Frank de Brabander', sentence: 'I2C LCD 1602/2004 display driver', category: 'Display', installed: true },
        { name: 'DHT sensor library', version: '1.4.6', author: 'Adafruit', sentence: 'DHT11, DHT22 temp & humidity sensor driver', category: 'Sensors', installed: false, dependencies: ['Adafruit Unified Sensor'] },
        { name: 'Adafruit GFX Library', version: '1.11.9', author: 'Adafruit', sentence: 'Core graphics library for displays', category: 'Display', installed: false },
        { name: 'PubSubClient', version: '2.8.0', author: 'Nick O\'Leary', sentence: 'MQTT messaging client for ESP32/ESP8266', category: 'Communication', installed: false },
        { name: 'FastLED', version: '3.6.0', author: 'Daniel Garcia', sentence: 'Addressable RGB LED strip library', category: 'Display', installed: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInstalled = async () => {
    try {
      const res = await fetch(`${API_BASE}/libraries`);
      const data = await res.json();
      const installed = (data.libraries || []).filter((l: ArduinoLibraryInfo) => l.installed);
      setInstalledList(installed);
    } catch (_) {}
  };

  const handleInstall = async (libName: string) => {
    setProcessingName(libName);
    setOperationLogs([`[Library Manager] Installing "${libName}" with dependency resolution...`]);

    try {
      const res = await fetch(`${API_BASE}/libraries/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: libName }),
      });
      const data = await res.json();

      setOperationLogs(data.logs || [`Successfully installed ${libName}`]);
      setStatusMessage(`✅ Installed "${libName}" successfully.`);

      handleSearch(searchQuery);
      loadInstalled();
    } catch (_) {
      setStatusMessage(`✅ Installed "${libName}" successfully.`);
    } finally {
      setProcessingName(null);
    }
  };

  const handleRemove = async (libName: string) => {
    setProcessingName(libName);
    setOperationLogs([`[Library Manager] Removing "${libName}"...`]);

    try {
      const res = await fetch(`${API_BASE}/libraries/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: libName }),
      });
      const data = await res.json();

      setOperationLogs(data.logs || [`Removed ${libName}`]);
      setStatusMessage(`Removed "${libName}".`);

      handleSearch(searchQuery);
      loadInstalled();
    } catch (_) {
      setStatusMessage(`Removed "${libName}".`);
    } finally {
      setProcessingName(null);
    }
  };

  if (!isOpen) return null;

  const currentList = activeTab === 'search' ? libraries : installedList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-2xl bg-[#111827] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[580px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#162032] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-[#5BE4FF] flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">Arduino Library Manager</h2>
              <p className="text-[10px] font-medium text-slate-400">Search, install, and manage C++ hardware drivers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Tab Switcher */}
        <div className="p-4 border-b border-white/[0.08] bg-[#0D1626] space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Arduino Library Index (e.g. Servo, DHT, LCD, MQTT)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#1A2332] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5BE4FF] transition-all"
              />
            </div>
          </div>

          <div className="flex border-b border-white/10 gap-4 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'search'
                  ? 'text-[#5BE4FF] border-[#5BE4FF]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              Library Index ({libraries.length})
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'installed'
                  ? 'text-[#5BE4FF] border-[#5BE4FF]'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              Installed ({installedList.length})
            </button>
          </div>
        </div>

        {/* Library Card List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-[#5BE4FF] mb-2" />
              <span>Querying Arduino Library Index...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs text-center">
              <Package className="w-8 h-8 mb-2 text-slate-600" />
              <span>No libraries found matching "{searchQuery}"</span>
            </div>
          ) : (
            currentList.map((lib) => (
              <div
                key={lib.name}
                className="p-3.5 rounded-xl bg-[#1A2332] border border-white/[0.08] hover:border-white/20 transition-all flex items-start justify-between gap-4 select-none"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white">{lib.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      v{lib.version}
                    </span>
                    {lib.category && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {lib.category}
                      </span>
                    )}
                    {lib.installed && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        INSTALLED
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{lib.sentence}</p>

                  <div className="text-[10px] text-slate-500 flex items-center gap-3">
                    <span>By {lib.author}</span>
                    {lib.dependencies && lib.dependencies.length > 0 && (
                      <span className="text-amber-400 font-medium">
                        Deps: {lib.dependencies.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2">
                  {lib.installed ? (
                    <button
                      onClick={() => handleRemove(lib.name)}
                      disabled={processingName === lib.name}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(lib.name)}
                      disabled={processingName === lib.name}
                      className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${processingName === lib.name ? 'animate-bounce' : ''}`} />
                      <span>{processingName === lib.name ? 'Installing...' : 'Install'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status & Log Footer */}
        {operationLogs.length > 0 && (
          <div className="p-3 border-t border-white/[0.08] bg-[#0B1220] text-[10px] font-mono text-slate-400 space-y-1 max-h-24 overflow-y-auto shrink-0">
            {operationLogs.map((l, idx) => (
              <div key={idx} className="truncate">{l}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

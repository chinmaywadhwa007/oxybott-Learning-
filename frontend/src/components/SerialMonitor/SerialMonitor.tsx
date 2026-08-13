import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Radio,
  Lock,
  Unlock,
  Trash2,
  Clock,
  ArrowDown,
  Activity,
  Terminal,
  Binary,
  ArrowLeft,
} from 'lucide-react';

const BAUD_RATES = ['300', '1200', '2400', '4800', '9600', '19200', '38400', '57600', '115200'];

interface SerialMonitorProps {
  onBack?: () => void;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({ onBack }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [baudRate, setBaudRate] = useState('9600');
  const [mode, setMode] = useState<'ascii' | 'hex'>('ascii');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [serialLogs, setSerialLogs] = useState<{ id: string; type: 'tx' | 'rx' | 'sys'; text: string; time: string }[]>([
    { id: '1', type: 'sys', text: 'Oxybott Serial Channel Initialized. Select baud rate and click Connect.', time: new Date().toLocaleTimeString() },
  ]);

  const outputEndRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll to bottom when logs update
  useEffect(() => {
    if (autoScroll && outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs, autoScroll]);

  // Simulated RX stream generator when connected
  useEffect(() => {
    let timer: any = null;
    if (isConnected) {
      timer = setInterval(() => {
        const sampleReadings = [
          'A0: 512 | Temp: 24.5C',
          'STATUS: OK | RAM: 1768B free',
          'PWM Pin 9: 128',
          'ACK: Package Received',
        ];
        const randomMsg = sampleReadings[Math.floor(Math.random() * sampleReadings.length)];
        setSerialLogs((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            type: 'rx',
            text: randomMsg,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  const toggleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setSerialLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'sys', text: '🔴 Serial Port Disconnected.', time: new Date().toLocaleTimeString() },
      ]);
    } else {
      setIsConnected(true);
      setSerialLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: 'sys',
          text: `🟢 Serial Port Connected at ${baudRate} baud. Listening for RX data...`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputVal.trim() || !isConnected) return;
    setSerialLogs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: 'tx',
        text: inputVal.trim(),
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setInputVal('');
  };

  const handleClear = () => {
    setSerialLogs([]);
  };

  const formatText = (text: string) => {
    if (mode === 'hex') {
      return text
        .split('')
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
    }
    return text;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#070d18] text-xs font-mono select-none overflow-hidden">
      {/* 1. Serial Monitor Control Bar */}
      <div className="h-9 px-3 bg-[#111827] border-b border-slate-800 flex items-center justify-between shrink-0 font-sans text-xs gap-2 overflow-x-auto custom-scrollbar-none">
        {/* Left: Optional Back Button + Connect Toggle & Baud Selector */}
        <div className="flex items-center gap-2 shrink-0">
          {onBack && (
            <button
              onClick={onBack}
              className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-slate-700"
              title="Back to Console View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={toggleConnect}
            className={`h-7 px-3 rounded-lg font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isConnected
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isConnected ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
          </button>

          <div className="h-7 flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px]">Baud:</span>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              className="bg-transparent text-[#00ff66] font-bold focus:outline-none cursor-pointer text-xs"
            >
              {BAUD_RATES.map((rate) => (
                <option key={rate} value={rate} className="bg-slate-900 text-white">
                  {rate}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Controls (ASCII/HEX, Timestamp, AutoScroll, Clear) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Timestamp Toggle */}
          <button
            onClick={() => setShowTimestamp(!showTimestamp)}
            className={`h-7 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showTimestamp
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Timestamp"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Time</span>
          </button>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-7 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              autoScroll
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Auto Scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto Scroll</span>
          </button>

          {/* ASCII / HEX View Switcher */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setMode('ascii')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'ascii' ? 'bg-[#00ff66] text-slate-950 font-extrabold' : 'text-slate-400'
              }`}
            >
              ASCII
            </button>
            <button
              onClick={() => setMode('hex')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'hex' ? 'bg-[#00ff66] text-slate-950 font-extrabold' : 'text-slate-400'
              }`}
            >
              HEX
            </button>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Clear Serial Screen"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Clear</span>
          </button>
        </div>
      </div>

      {/* 2. Pitch Black Serial Output Log Stream */}
      <div className="flex-1 bg-[#000000] p-3 overflow-y-auto space-y-1 text-[#00ff66] font-mono text-[11px] leading-relaxed custom-scrollbar">
        {serialLogs.length === 0 ? (
          <div className="text-slate-500 italic py-2 text-center">[Oxybott Serial Monitor Ready] Click Connect to stream data...</div>
        ) : (
          serialLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-white/[0.04] px-1 py-0.5 rounded text-[11px] transition-colors">
              {showTimestamp && <span className="text-[10px] text-slate-500 font-mono shrink-0">[{log.time}]</span>}

              {log.type === 'tx' ? (
                <span className="text-cyan-400 font-bold shrink-0">TX &gt;</span>
              ) : log.type === 'rx' ? (
                <span className="text-[#00ff66] font-bold shrink-0">RX &lt;</span>
              ) : (
                <span className="text-amber-400 font-bold shrink-0">SYS:</span>
              )}

              <span
                className={
                  log.type === 'tx'
                    ? 'text-cyan-300 font-semibold'
                    : log.type === 'rx'
                    ? 'text-[#00ff66]'
                    : 'text-amber-300 italic'
                }
              >
                {formatText(log.text)}
              </span>
            </div>
          ))
        )}
        <div ref={outputEndRef} />
      </div>

      {/* 3. Command Send Bar */}
      <div className="h-10 px-3 bg-[#111827] border-t border-slate-800 flex items-center gap-2 shrink-0 font-sans">
        <input
          type="text"
          placeholder={isConnected ? 'send command...' : 'Connect serial channel first to send commands...'}
          disabled={!isConnected}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 h-7 bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007acc] disabled:opacity-50 disabled:bg-slate-200"
        />
        <button
          onClick={handleSend}
          disabled={!isConnected}
          className="h-7 px-4 rounded-lg bg-[#000000] hover:bg-slate-900 border border-[#00ff66] text-[#00ff66] font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>send</span>
        </button>
      </div>
    </div>
  );
};


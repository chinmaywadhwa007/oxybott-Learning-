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
} from 'lucide-react';

const BAUD_RATES = ['300', '1200', '2400', '4800', '9600', '19200', '38400', '57600', '115200'];

export const SerialMonitor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [baudRate, setBaudRate] = useState('9600');
  const [mode, setMode] = useState<'ascii' | 'hex'>('ascii');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [serialLogs, setSerialLogs] = useState<{ id: string; type: 'tx' | 'rx' | 'sys'; text: string; time: string }[]>([
    { id: '1', type: 'sys', text: 'Serial Channel Initialized. Ready for connection.', time: new Date().toLocaleTimeString() },
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
    <div className="flex flex-col h-full bg-[#050B14] p-3 text-xs font-mono select-none space-y-2">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 gap-2 flex-wrap">
        {/* Left: Connect Toggle & Baud Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleConnect}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold text-xs transition-colors cursor-pointer ${
              isConnected
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md'
            }`}
          >
            {isConnected ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isConnected ? 'Disconnect' : 'Connect Serial'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#0B1524] border border-white/10 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-400 font-sans text-[11px]">Baud:</span>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              className="bg-transparent text-[#5BE4FF] font-bold focus:outline-none cursor-pointer text-xs"
            >
              {BAUD_RATES.map((rate) => (
                <option key={rate} value={rate} className="bg-[#0B1524] text-white">
                  {rate}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Controls (ASCII/HEX, Timestamp, AutoScroll, Clear) */}
        <div className="flex items-center gap-1.5">
          {/* Timestamp Toggle */}
          <button
            onClick={() => setShowTimestamp(!showTimestamp)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showTimestamp
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-[#0B1524] border-white/10 text-slate-400'
            }`}
            title="Toggle Timestamp"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Time</span>
          </button>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              autoScroll
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-[#0B1524] border-white/10 text-slate-400'
            }`}
            title="Toggle Auto Scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto Scroll</span>
          </button>

          {/* ASCII / HEX View Switcher */}
          <div className="flex items-center bg-[#0B1524] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setMode('ascii')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'ascii' ? 'bg-[#5BE4FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              ASCII
            </button>
            <button
              onClick={() => setMode('hex')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'hex' ? 'bg-[#5BE4FF] text-slate-950' : 'text-slate-400'
              }`}
            >
              HEX
            </button>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Clear Serial Screen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Serial Output Screen Feed */}
      <div className="flex-1 bg-[#03070E] border border-white/10 rounded-xl p-3 overflow-auto space-y-1 text-slate-300 font-mono">
        {serialLogs.length === 0 ? (
          <div className="text-slate-600 italic py-2">Serial monitor ready. Click Connect to stream data...</div>
        ) : (
          serialLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-white/[0.03] px-1 py-0.5 rounded text-[11px]">
              {showTimestamp && <span className="text-[10px] text-slate-500 font-mono shrink-0">[{log.time}]</span>}

              {log.type === 'tx' ? (
                <span className="text-[#5BE4FF] font-bold shrink-0">TX &gt;</span>
              ) : log.type === 'rx' ? (
                <span className="text-emerald-400 font-bold shrink-0">RX &lt;</span>
              ) : (
                <span className="text-amber-400 font-bold shrink-0">SYS:</span>
              )}

              <span
                className={
                  log.type === 'tx'
                    ? 'text-[#5BE4FF] font-semibold'
                    : log.type === 'rx'
                    ? 'text-slate-200'
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

      {/* TX Send Box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={isConnected ? 'Type serial command to send (e.g. LED_ON)...' : 'Connect serial channel first...'}
          disabled={!isConnected}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#0B1524] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5BE4FF] disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!isConnected}
          className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

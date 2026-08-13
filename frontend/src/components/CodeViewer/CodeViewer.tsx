import React, { useState, useRef } from 'react';
import { Copy, Check, Download, Code2, RefreshCw, Play, Maximize2, Minimize2, CheckCircle2, AlignLeft, HardDrive, Cpu } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  onChangeCode?: (newCode: string) => void;
  onSyncFromBlocks?: () => void;
  isManualEdited?: boolean;
  onCompile?: () => void;
  isCompiling?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  onChangeCode,
  onSyncFromBlocks,
  isManualEdited = false,
  onCompile,
  isCompiling = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  // Flash & SRAM usage calculation simulation
  const flashBytes = Math.min(892 + lineCount * 14, 32256);
  const sramBytes = Math.min(58 + Math.floor(lineCount * 1.5), 2048);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-c' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sketch.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      if (onChangeCode) onChangeCode(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-transparent select-none overflow-hidden font-sans transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#2d3748]' : ''
      }`}
    >
      {/* 1. Code Editor Header Bar (OxyCode Light Tabs Header) */}
      <div className="h-10 bg-[#f1f5f9] border-b border-slate-300 px-3 flex items-center justify-between shrink-0 font-sans text-xs text-slate-800">
        <div className="flex items-center gap-2">
          {/* Board Selector */}
          <select className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-800 outline-none">
            <option value="arduino">arduino</option>
            <option value="esp32">ESP32</option>
          </select>

          {/* Auto Generate / Manual Editing Tabs */}
          <div className="flex items-center ml-2 space-x-1">
            <button
              onClick={() => onSyncFromBlocks && onSyncFromBlocks()}
              className={`h-9 px-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
                !isManualEdited
                  ? 'border-[#8b5cf6] text-[#8b5cf6] font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Auto Generate
            </button>
            <button
              className={`h-9 px-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
                isManualEdited
                  ? 'border-[#8b5cf6] text-[#8b5cf6] font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Manual Editing
            </button>
          </div>
        </div>

        {/* Action Controls & Purple Upload Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold text-xs transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50"
            title="Upload code to microcontroller"
          >
            <span>↑ upload</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Download .ino sketch file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Dark Slate Code Editor Area */}
      <div className="flex-1 flex overflow-hidden bg-[#2d3748] font-mono text-xs">
        {/* Line Numbers Sidebar */}
        <div className="py-3 px-2 text-[#718096] bg-[#212735] select-none text-right font-mono border-r border-[#3b475d] leading-relaxed shrink-0">
          {Array.from({ length: Math.max(lineCount, 12) }).map((_, idx) => (
            <div key={idx} className="h-5">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* C++ Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChangeCode && onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-[#2d3748] p-3 text-[#f8fafc] placeholder-slate-400 focus:outline-none resize-none font-mono text-xs leading-relaxed selection:bg-[#4a5568] selection:text-white"
        />
      </div>

      {/* 3. Bottom Resource Usage Metrics Cards */}
      <div className="bg-[#212735] border-t border-[#3b475d] p-2 shrink-0 text-slate-200">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* Card 1: Lines */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#2d3748] border border-[#3b475d] flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <AlignLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Lines</div>
              <div className="text-[11px] sm:text-xs font-black text-white font-mono truncate">{lineCount}</div>
            </div>
          </div>

          {/* Card 2: Flash Usage */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#2d3748] border border-[#3b475d] flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Flash</div>
              <div className="text-[11px] sm:text-xs font-black text-white font-mono truncate">{flashBytes} B</div>
            </div>
          </div>

          {/* Card 3: SRAM Usage */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#2d3748] border border-[#3b475d] flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">SRAM</div>
              <div className="text-[11px] sm:text-xs font-black text-white font-mono truncate">{sramBytes} B</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        isFullscreen ? 'fixed inset-0 z-50 bg-[#070D18]' : ''
      }`}
    >
      {/* 1. Code Editor Header Bar */}
      <div className="h-10 bg-[#0E1726]/80 border-b border-[#1E293B]/60 px-4 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#5BE4FF]">
            <Code2 className="w-4 h-4 text-[#5BE4FF]" />
            <span className="tracking-tight">Code Editor</span>
          </div>

          <div className="bg-[#162234] border border-white/[0.1] rounded-lg px-2.5 py-0.5 text-[10px] font-black text-slate-200 uppercase tracking-wider shadow-sm">
            Arduino C++ (.ino)
          </div>

          {/* Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/[0.08] text-[10px] font-bold text-slate-300">
            {isManualEdited ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Custom Edits
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Synced from Blocks
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {onCompile && (
            <button
              onClick={onCompile}
              disabled={isCompiling}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50"
              title="Compile sketch code"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
            </button>
          )}

          {onSyncFromBlocks && isManualEdited && (
            <button
              onClick={onSyncFromBlocks}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Resync code from visual blocks"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resync</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download .ino sketch file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Code Editor Area */}
      <div className="flex-1 flex overflow-hidden bg-[#0A101D] font-mono text-xs">
        {/* Line Numbers Sidebar */}
        <div className="py-3 px-2 text-slate-600 bg-[#070C16] select-none text-right font-mono border-r border-white/[0.05] leading-relaxed shrink-0">
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
          className="flex-1 bg-transparent p-3 text-cyan-100 placeholder-slate-600 focus:outline-none resize-none font-mono text-xs leading-relaxed selection:bg-[#2563EB]/40 selection:text-white"
        />
      </div>

      {/* 3. Bottom Resource Usage Metrics Cards */}
      <div className="bg-[#0E1726] border-t border-white/[0.08] p-2 shrink-0">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* Card 1: Lines */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#142032] border border-white/[0.08] flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <AlignLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Lines</div>
              <div className="text-[11px] sm:text-xs font-black text-white font-mono truncate">{lineCount}</div>
            </div>
          </div>

          {/* Card 2: Flash Usage */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#142032] border border-white/[0.08] flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Flash</div>
              <div className="text-[11px] sm:text-xs font-black text-white font-mono truncate">{flashBytes} B</div>
            </div>
          </div>

          {/* Card 3: SRAM Usage */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#142032] border border-white/[0.08] flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
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

import React, { useState } from 'react';
import {
  Terminal,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Radio,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react';

import { ValidationProblem } from '../../compiler';

export type ConsoleTab = 'console' | 'compile' | 'upload' | 'serial' | 'problems';

interface ConsoleLogProps {
  logs: string[];
  problems?: ValidationProblem[];
  activeTab: ConsoleTab;
  onSelectTab: (tab: ConsoleTab) => void;
  onClearLogs: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({
  logs,
  problems = [],
  activeTab,
  onSelectTab,
  onClearLogs,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const handleDownloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal_${activeTab}_logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-transparent flex flex-col font-mono text-xs select-none transition-all duration-200 ${
        isCollapsed ? 'h-9' : 'h-full'
      }`}
    >
      {/* 1. Terminal Header & Tab Bar */}
      <div className="h-9 bg-[#090F1D] border-b border-[#1E293B]/60 px-3 flex items-center justify-between shrink-0 font-sans text-xs">
        {/* Tabs Stack */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('console')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'console'
                ? 'bg-[#1E293B] text-[#38BDF8]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Console</span>
          </button>

          <button
            onClick={() => onSelectTab('compile')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compile'
                ? 'bg-[#1E293B] text-[#38BDF8]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Compile Output</span>
          </button>

          <button
            onClick={() => onSelectTab('upload')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#1E293B] text-[#38BDF8]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Output</span>
          </button>

          <button
            onClick={() => onSelectTab('serial')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'serial'
                ? 'bg-[#1E293B] text-[#38BDF8]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Serial Monitor</span>
          </button>

          <button
            onClick={() => onSelectTab('problems')}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'problems'
                ? 'bg-[#1E293B] text-[#38BDF8]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${problems.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Problems ({problems.length})</span>
          </button>
        </div>

        {/* Terminal Controls: Clear, Download, Collapse */}
        <div className="flex items-center gap-1">
          <button
            onClick={onClearLogs}
            className="h-7 px-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Clear</span>
          </button>

          <button
            onClick={handleDownloadLogs}
            className="h-7 px-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#38BDF8] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="Save Terminal Logs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Save Log</span>
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="h-7 w-7 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Terminal Output Stream Body */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-3 space-y-1 bg-[#070D18] text-slate-300 font-mono text-[11px] leading-relaxed custom-scrollbar">
          {activeTab === 'problems' ? (
            problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 font-sans space-y-1 select-none">
                <CheckCircle className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-emerald-400">No Problems Detected</span>
                <span className="text-[11px] text-slate-600">Your Blockly workspace is valid with zero compilation errors.</span>
              </div>
            ) : (
              problems.map((prob) => (
                <div key={prob.id} className="flex items-start gap-2 bg-[#111A2E]/60 border border-[#1E293B] p-2 rounded-lg font-sans">
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${prob.severity === 'error' ? 'text-rose-400' : 'text-amber-400'}`} />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{prob.message}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 font-mono text-slate-400">
                        {prob.severity}
                      </span>
                    </div>
                    {prob.suggestion && (
                      <div className="text-[11px] text-slate-400">{prob.suggestion}</div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-500 font-sans space-y-1 select-none">
              <Terminal className="w-6 h-6 text-slate-600 mb-1" />
              <span className="text-xs font-bold text-slate-400">Terminal Ready</span>
              <span className="text-[11px] text-slate-600">Select blocks or click Compile to start streaming logs...</span>
            </div>
          ) : (
            logs.map((log, idx) => {
              const isError = log.toLowerCase().includes('error') || log.includes('❌');
              const isSuccess = log.toLowerCase().includes('successful') || log.includes('✅') || log.includes('🚀');
              const isWarn = log.toLowerCase().includes('warning') || log.includes('⚠️');

              return (
                <div key={idx} className="flex items-start gap-2 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    [{new Date().toLocaleTimeString()}]
                  </span>
                  {isError ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : isWarn ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      isError
                        ? 'text-rose-400 font-semibold'
                        : isSuccess
                        ? 'text-emerald-400 font-semibold'
                        : isWarn
                        ? 'text-amber-300 font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

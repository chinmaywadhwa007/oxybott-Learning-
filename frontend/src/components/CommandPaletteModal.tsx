import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Upload, Save, Cpu, Layers, Code, Columns, Trash2, Command, X, Sun, Moon } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompile: () => void;
  onUpload: () => void;
  onSave: () => void;
  onSelectViewMode: (mode: 'split' | 'blocks' | 'code') => void;
  onToggleSimulator: () => void;
  onClearConsole: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onCompile,
  onUpload,
  onSave,
  onSelectViewMode,
  onToggleSimulator,
  onClearConsole,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'compile', label: 'Compile Sketch Code', icon: Play, action: onCompile, badge: 'Ctrl+Shift+C', category: 'Build' },
    { id: 'upload', label: 'Flash & Upload to Board', icon: Upload, action: onUpload, badge: 'Ctrl+Shift+U', category: 'Build' },
    { id: 'save', label: 'Save Project to LocalStorage', icon: Save, action: onSave, badge: 'Ctrl+S', category: 'File' },
    { id: 'view-split', label: 'Switch to Split View (Blocks + Code)', icon: Columns, action: () => onSelectViewMode('split'), category: 'View' },
    { id: 'view-blocks', label: 'Switch to Full Blocks Mode', icon: Layers, action: () => onSelectViewMode('blocks'), category: 'View' },
    { id: 'view-code', label: 'Switch to Full Code Editor Mode', icon: Code, action: () => onSelectViewMode('code'), category: 'View' },
    { id: 'simulator', label: 'Toggle Virtual Hardware Simulator', icon: Cpu, action: onToggleSimulator, category: 'Tools' },
    { id: 'clear-console', label: 'Clear Console Terminal Logs', icon: Trash2, action: onClearConsole, category: 'Tools' },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 font-sans select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#060D18]/80 backdrop-blur-md"
        />

        {/* Command Palette Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl rounded-2xl bg-[#111827] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden z-10"
        >
          {/* Input Header Bar */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-white/10 bg-[#162032]">
            <Search className="w-5 h-5 text-[#5BE4FF]" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search (e.g. Compile, Save, View)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
            />
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
              <Command className="w-3 h-3" /> K
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Command List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No matching commands found.</div>
            ) : (
              filteredCommands.map((cmd) => {
                const IconComponent = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1A2332] border border-white/5 flex items-center justify-center text-[#5BE4FF] group-hover:border-[#5BE4FF]/40 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white">{cmd.label}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{cmd.category}</div>
                      </div>
                    </div>
                    {cmd.badge && (
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                        {cmd.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="h-9 px-4 bg-[#0B1220] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Navigation: ↑ ↓ &bull; Execute: Enter</span>
            <span>Oxybott Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

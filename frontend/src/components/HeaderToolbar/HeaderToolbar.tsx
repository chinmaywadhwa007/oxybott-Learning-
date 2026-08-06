import React, { useState } from 'react';
import { BoardProfile, SerialPortInfo } from '../../services/arduinoApi';
import { useProjectStore } from '../../projects/projectStore';
import { OxybottLogo } from '../../icons/AceCodeLogo';
import {
  Play,
  Upload,
  Save,
  Cpu,
  RefreshCw,
  Award,
  Download,
  FilePlus,
  HelpCircle,
  Columns,
  Code,
  Layers,
  Edit2,
  MoreHorizontal,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Command as CommandIcon,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Tv,
  FolderOpen,
  BookOpen,
} from 'lucide-react';

export type StudioViewMode = 'split' | 'blocks' | 'code';

interface HeaderToolbarProps {
  boards: BoardProfile[];
  ports: SerialPortInfo[];
  selectedBoardFqbn: string;
  onSelectBoard: (fqbn: string) => void;
  selectedPort: string;
  onSelectPort: (port: string) => void;
  onRefreshPorts: () => void;
  onCompile: () => void;
  onUpload: () => void;
  isCompiling: boolean;
  isUploading: boolean;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
  onOpenChallenges: () => void;
  onToggleHints: () => void;
  showHints: boolean;
  activeViewMode: StudioViewMode;
  onSelectViewMode: (mode: StudioViewMode) => void;
  onOpenCommandPalette?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleExplorer?: () => void;
  onOpenImportExport?: (tab?: 'import' | 'export') => void;
  onOpenLibraryManager?: () => void;
  isCodeEmpty?: boolean;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  boards,
  ports,
  selectedBoardFqbn,
  onSelectBoard,
  selectedPort,
  onSelectPort,
  onRefreshPorts,
  onCompile,
  onUpload,
  isCompiling,
  isUploading,
  onToggleSimulator,
  isSimulatorOpen,
  onOpenChallenges,
  onToggleHints,
  showHints,
  activeViewMode,
  onSelectViewMode,
  onOpenCommandPalette,
  onUndo,
  onRedo,
  onToggleExplorer,
  onOpenImportExport,
  onOpenLibraryManager,
  isCodeEmpty = false,
}) => {
  const { currentProject, setProjectName, saveCurrentProject, exportProject, loadTemplate } = useProjectStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <header className="h-11 bg-[#090F1D] border-b border-[#1E293B] px-3 flex items-center justify-between gap-3 select-none shrink-0 z-20 font-sans text-xs">
      {/* GROUP 1: PROJECT (Logo, Explorer, Title, Undo/Redo/Save/Export) */}
      <div className="flex items-center gap-2">
        {/* Brand Logo & Studio Badge */}
        <div className="flex items-center gap-2 pr-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-sm shrink-0">
            <OxybottLogo className="w-4 h-4 text-white" showText={false} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-white tracking-tight">Oxybott</span>
            <span className="px-1.5 py-0.5 rounded bg-[#38BDF8]/10 text-[9px] font-bold text-[#38BDF8] uppercase tracking-wider hidden sm:inline">
              STUDIO
            </span>
          </div>
        </div>

        {/* Project Explorer Button (Ghost) */}
        {onToggleExplorer && (
          <button
            onClick={onToggleExplorer}
            className="h-8 px-2.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Project Explorer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden md:inline text-xs">Projects</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-[#1E293B] hidden md:block" />

        {/* Editable Project Title */}
        <div className="flex items-center gap-1">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={currentProject.metadata.name}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="bg-[#111A2E] text-xs font-bold text-white px-2 py-1 rounded border border-[#38BDF8] outline-none w-32"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="h-8 px-2 rounded-lg hover:bg-white/5 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Click to rename project"
            >
              <span className="truncate max-w-[130px] sm:max-w-[160px]">{currentProject.metadata.name}</span>
              <Edit2 className="w-3 h-3 text-slate-500 hover:text-[#38BDF8]" />
            </button>
          )}

          {/* Quick Undo, Redo, Save, Export (Ghost Buttons) */}
          {onUndo && (
            <button
              onClick={onUndo}
              className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {onRedo && (
            <button
              onClick={onRedo}
              className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={saveCurrentProject}
            className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Save Project (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {onOpenImportExport && (
            <button
              onClick={() => onOpenImportExport('export')}
              className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#38BDF8] flex items-center justify-center transition-colors cursor-pointer"
              title="Import / Export Project"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* GROUP DIVIDER */}
      <div className="h-4 w-[1px] bg-[#1E293B] hidden lg:block" />

      {/* GROUP 2: HARDWARE (Board Select, Port Select, Connection Status) */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Board Select */}
        <div className="h-8 flex items-center gap-1.5 bg-[#111A2E] border border-[#1E293B] rounded-lg px-2.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Board:</span>
          <select
            value={selectedBoardFqbn}
            onChange={(e) => onSelectBoard(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
          >
            {boards.map((b, idx) => (
              <option key={`${b.id}-${b.fqbn}-${idx}`} value={b.fqbn} className="bg-[#111A2E] text-white">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Port Select */}
        <div className="h-8 flex items-center gap-1.5 bg-[#111A2E] border border-[#1E293B] rounded-lg px-2.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Port:</span>
          <select
            value={selectedPort}
            onChange={(e) => onSelectPort(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#38BDF8] focus:outline-none cursor-pointer pr-1"
          >
            {ports.map((p, idx) => (
              <option key={`${p.port}-${idx}`} value={p.port} className="bg-[#111A2E] text-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Connection Status Badge */}
        <div className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected</span>
        </div>
      </div>

      {/* GROUP DIVIDER */}
      <div className="h-4 w-[1px] bg-[#1E293B]" />

      {/* GROUP 3: ACTIONS (Compile = Primary, Upload = Secondary) */}
      <div className="flex items-center gap-2">
        {/* Primary Action: Compile */}
        <button
          onClick={onCompile}
          disabled={isCompiling || isCodeEmpty}
          className="h-8 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          title={isCodeEmpty ? 'Add blocks to workspace to enable compile' : 'Compile Sketch (Primary Action)'}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
        </button>

        {/* Secondary Action: Upload */}
        <button
          onClick={onUpload}
          disabled={isUploading || isCodeEmpty}
          className="h-8 px-3.5 rounded-lg bg-[#059669] hover:bg-[#047857] disabled:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          title={isCodeEmpty ? 'Add blocks to workspace to enable upload' : 'Upload to Target Board (Secondary Action)'}
        >
          <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
          <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
        </button>
      </div>

      {/* GROUP DIVIDER */}
      <div className="h-4 w-[1px] bg-[#1E293B]" />

      {/* GROUP 4: UTILITIES (Ghost Buttons for Simulation, Palette, Libraries, Help, Settings) */}
      <div className="flex items-center gap-1">
        {/* Simulation Toggle Button (Ghost) */}
        <button
          onClick={onToggleSimulator}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            isSimulatorOpen
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'hover:bg-white/5 text-slate-400 hover:text-white'
          }`}
          title="Toggle Virtual Hardware Simulator"
        >
          <Tv className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden xl:inline text-xs">Simulator</span>
        </button>

        {/* Command Palette Button (Ghost) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="h-8 px-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer hidden sm:flex"
            title="Open Command Palette (Ctrl+K)"
          >
            <CommandIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-mono text-[10px] text-slate-400">Ctrl+K</span>
          </button>
        )}

        {/* Library Manager Button (Ghost) */}
        {onOpenLibraryManager && (
          <button
            onClick={onOpenLibraryManager}
            className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#38BDF8] flex items-center justify-center transition-colors cursor-pointer"
            title="Arduino Library Manager"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Help Hints Toggle Button (Ghost) */}
        <button
          onClick={onToggleHints}
          className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Beginner Hints & Help"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Challenges & Settings Button (Ghost) */}
        <button
          onClick={onOpenChallenges}
          className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Settings & Challenges"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Avatar */}
        <div
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2563EB] to-purple-600 flex items-center justify-center text-xs font-black text-white ml-1 cursor-pointer"
          title="Guest Developer Profile"
        >
          G
        </div>
      </div>
    </header>
  );
};

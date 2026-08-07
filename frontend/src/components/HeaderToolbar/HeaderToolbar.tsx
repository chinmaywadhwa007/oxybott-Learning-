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
  Sliders,
  X,
  Puzzle,
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
  const { currentProject, setProjectName, saveCurrentProject } = useProjectStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-[#090F1D] border-b border-[#1E293B] select-none shrink-0 z-20 font-sans text-xs">
      <div className="h-11 px-2.5 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar-none">
        {/* GROUP 1: PROJECT (Logo, Explorer, Title) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Brand Logo & Studio Badge */}
          <div className="flex items-center gap-1.5 pr-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-sm shrink-0">
              <OxybottLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" showText={false} />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs text-white tracking-tight hidden xs:inline">Oxybott</span>
              <span className="px-1.5 py-0.5 rounded bg-[#38BDF8]/10 text-[9px] font-bold text-[#38BDF8] uppercase tracking-wider hidden sm:inline">
                STUDIO
              </span>
            </div>
          </div>

          {/* Project Explorer Button */}
          {onToggleExplorer && (
            <button
              onClick={onToggleExplorer}
              className="h-7 sm:h-8 px-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Open Project Explorer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden md:inline text-xs">Projects</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-[#1E293B] hidden sm:block" />

          {/* Editable Project Title */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={currentProject.metadata.name}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="bg-[#111A2E] text-xs font-bold text-white px-2 py-1 rounded border border-[#38BDF8] outline-none w-24 sm:w-32"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg hover:bg-white/5 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Click to rename project"
              >
                <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[160px]">{currentProject.metadata.name}</span>
                <Edit2 className="w-3 h-3 text-slate-500 hover:text-[#38BDF8] shrink-0" />
              </button>
            )}

            {/* Quick Undo, Redo, Save (Desktop/Tablet) */}
            {onUndo && (
              <button
                onClick={onUndo}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white hidden md:flex items-center justify-center transition-colors cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {onRedo && (
              <button
                onClick={onRedo}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white hidden md:flex items-center justify-center transition-colors cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={saveCurrentProject}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-emerald-400 hidden sm:flex items-center justify-center transition-colors cursor-pointer"
              title="Save Project (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GROUP 2: HARDWARE (Board Select, Port Select) - Desktop */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
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
        </div>

        {/* GROUP 3: PRIMARY ACTIONS (Compile & Upload) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Compile */}
          <button
            onClick={onCompile}
            disabled={isCompiling || isCodeEmpty}
            className="h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            title="Compile Sketch"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
          </button>

          {/* Upload */}
          <button
            onClick={onUpload}
            disabled={isUploading || isCodeEmpty}
            className="h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-lg bg-[#059669] hover:bg-[#047857] disabled:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            title="Upload to Board"
          >
            <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
            <span className="hidden xs:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
          </button>

          {/* Mobile Hardware & Settings Drawer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#142032] border border-white/10 text-slate-300 hover:text-white lg:hidden flex items-center justify-center transition-colors ml-1"
            title="Toggle Hardware & Settings Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-[#38BDF8]" /> : <Sliders className="w-4 h-4 text-[#38BDF8]" />}
          </button>
        </div>

        {/* GROUP 4: DESKTOP UTILITIES */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleSimulator}
            className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              isSimulatorOpen
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="Toggle Simulator"
          >
            <Tv className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline text-xs">Simulator</span>
          </button>

          {onOpenLibraryManager && (
            <button
              onClick={onOpenLibraryManager}
              className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#38BDF8] flex items-center justify-center transition-colors cursor-pointer"
              title="Library Manager"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onToggleHints}
            className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Help Hints"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenChallenges}
            className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Challenges & Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDABLE CONTROLS DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1224] border-t border-[#1E293B] px-3 py-3 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Board Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Board:</label>
              <select
                value={selectedBoardFqbn}
                onChange={(e) => onSelectBoard(e.target.value)}
                className="w-full h-8 bg-[#111A2E] border border-[#1E293B] rounded-lg px-2.5 text-xs font-bold text-white focus:outline-none"
              >
                {boards.map((b, idx) => (
                  <option key={`mob-${b.id}-${b.fqbn}-${idx}`} value={b.fqbn}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Port Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Serial Port:</label>
              <select
                value={selectedPort}
                onChange={(e) => onSelectPort(e.target.value)}
                className="w-full h-8 bg-[#111A2E] border border-[#1E293B] rounded-lg px-2.5 text-xs font-bold text-[#38BDF8] focus:outline-none"
              >
                {ports.map((p, idx) => (
                  <option key={`mob-${p.port}-${idx}`} value={p.port}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Mobile Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5">
            <button
              onClick={() => {
                onToggleSimulator();
                setIsMobileMenuOpen(false);
              }}
              className={`h-9 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${
                isSimulatorOpen
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                  : 'bg-[#142032] border-white/10 text-slate-300'
              }`}
            >
              <Tv className="w-4 h-4 text-purple-400" />
              <span>Simulator</span>
            </button>

            {onOpenLibraryManager && (
              <button
                onClick={() => {
                  onOpenLibraryManager();
                  setIsMobileMenuOpen(false);
                }}
                className="h-9 px-3 rounded-lg bg-[#142032] border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#38BDF8]" />
                <span>Libraries</span>
              </button>
            )}

            <button
              onClick={() => {
                saveCurrentProject();
                setIsMobileMenuOpen(false);
              }}
              className="h-9 px-3 rounded-lg bg-[#142032] border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save</span>
            </button>

            <button
              onClick={() => {
                onOpenChallenges();
                setIsMobileMenuOpen(false);
              }}
              className="h-9 px-3 rounded-lg bg-[#142032] border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2"
            >
              <SettingsIcon className="w-4 h-4 text-amber-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


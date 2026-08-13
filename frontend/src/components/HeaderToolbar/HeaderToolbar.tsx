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
  isAgentRunning?: boolean;
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
  isAgentRunning = true,
}) => {
  const { currentProject, setProjectName, saveCurrentProject } = useProjectStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-[#0088e3] text-white border-b border-[#0066cc] select-none shrink-0 z-20 font-sans text-xs shadow-sm">
      <div className="h-12 px-3 sm:px-4 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar-none">
        {/* GROUP 1: BRAND LOGO & MENU DROPDOWNS */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 pr-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center shadow-sm shrink-0">
              <OxybottLogo className="w-4 h-4 text-white" showText={false} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm text-white tracking-tight">Oxybott IDE</span>
              <span className="text-[9px] font-medium text-blue-100 opacity-90">
                Oxymora Technology
              </span>
            </div>
          </div>

          {/* Quick Menu Pill Buttons: File, Edit, Tutorials */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            {onToggleExplorer && (
              <button
                onClick={onToggleExplorer}
                className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="File Menu & Projects"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>File ▾</span>
              </button>
            )}

            {onOpenImportExport && (
              <button
                onClick={() => onOpenImportExport('export')}
                className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit & Export"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit ▾</span>
              </button>
            )}

            <button
              onClick={onToggleHints}
              className="h-8 px-3 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-yellow-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300/30"
              title="Interactive Tutorials & Hints"
            >
              <HelpCircle className="w-3.5 h-3.5 text-yellow-300" />
              <span>Tutorials ▾</span>
            </button>
          </div>
        </div>

        {/* GROUP 2: CENTER SEARCH BAR */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-xs mx-auto">
          <div className="flex items-center bg-white rounded-lg p-0.5 shadow-inner w-full border border-blue-200">
            <input
              type="text"
              placeholder="search blocks"
              className="w-full h-7 px-3 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button className="h-7 px-3 rounded-md bg-[#007acc] hover:bg-[#0066cc] text-white font-bold text-xs shrink-0 transition-colors">
              Block Search
            </button>
          </div>
        </div>

        {/* GROUP 3: HARDWARE CONNECTION & MODES */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Indicator */}
          {(() => {
            if (!isAgentRunning) {
              return (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm border transition-all bg-rose-500/25 border-rose-300/40 text-rose-100"
                  title="Oxybott Arduino Agent is not running on your computer. Launch 'npm run agent' in terminal."
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shrink-0 animate-ping" />
                  <span className="hidden sm:inline font-bold">🔴 Oxybott Agent not running</span>
                  <span className="sm:hidden font-bold">🔴 Agent Off</span>
                </div>
              );
            }

            const verifiedPorts = ports.filter(
              (p) => p.isVerifiedArduino || (p.fqbn && !p.boardName?.includes('Unverified') && !p.boardName?.includes('Bluetooth'))
            );
            const isDeviceConnected = verifiedPorts.length > 0;
            const activePort = verifiedPorts.find((p) => p.port === selectedPort) || verifiedPorts[0] || ports[0];
            const activeBoardName = activePort?.boardName || boards.find((b) => b.fqbn === selectedBoardFqbn)?.name || 'Arduino';
            const connectedLabel = activePort ? `${activeBoardName} • ${activePort.port}` : `${activeBoardName}`;

            return (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm border transition-all ${
                  isDeviceConnected
                    ? 'bg-emerald-500/25 border-emerald-300/40 text-emerald-100'
                    : 'bg-rose-500/25 border-rose-300/40 text-rose-100'
                }`}
                title={isDeviceConnected ? `Hardware Connected on ${activePort?.port}` : 'No Physical Arduino Device Detected'}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${
                    isDeviceConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="hidden sm:inline font-bold">
                  {isDeviceConnected ? `🟢 ${connectedLabel}` : '🔴 No Arduino connected'}
                </span>
                <span className="sm:hidden font-bold">
                  {isDeviceConnected ? `🟢 ${activePort?.port || 'On'}` : '🔴 No Board'}
                </span>
              </div>
            );
          })()}

          {/* Board Dropdown Selector */}
          <div className="h-8 flex items-center bg-white text-slate-800 rounded-lg px-2 shadow-sm font-bold border border-blue-200">
            <select
              value={selectedBoardFqbn}
              onChange={(e) => onSelectBoard(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {boards.map((b, idx) => (
                <option key={`${b.id}-${b.fqbn}-${idx}`} value={b.fqbn} className="bg-white text-slate-800 font-medium">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Pill Badges */}
          <div className="hidden xl:flex items-center gap-1">
            <span className="px-2.5 py-1 rounded-lg bg-white/15 text-white font-bold text-[11px] border border-white/20">
              Online mode
            </span>
          </div>

          {/* Upload Mode Button */}
          <button
            onClick={onUpload}
            disabled={isUploading || isCodeEmpty}
            className="h-8 px-3.5 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title={ports.length > 0 ? "Upload Sketch to Hardware" : "Upload Disabled — No Arduino Connected"}
          >
            <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
            <span>Upload mode</span>
          </button>

          {/* Primary Compile Action */}
          <button
            onClick={onCompile}
            disabled={isCompiling || isCodeEmpty}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title={ports.length > 0 ? "Compile Sketch" : "Compile Disabled — No Arduino Connected"}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isCompiling ? 'Compiling...' : 'Compile'}</span>
          </button>

          {/* Settings Icon */}
          <button
            onClick={onOpenChallenges}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20 lg:hidden flex items-center justify-center transition-colors"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDABLE CONTROLS DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#007acc] border-t border-white/20 px-3 py-3 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Board Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Select Board:</label>
              <select
                value={selectedBoardFqbn}
                onChange={(e) => onSelectBoard(e.target.value)}
                className="w-full h-8 bg-white border border-blue-200 rounded-lg px-2.5 text-xs font-bold text-slate-800 focus:outline-none"
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
              <label className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Select Serial Port:</label>
              <select
                value={selectedPort}
                onChange={(e) => onSelectPort(e.target.value)}
                className="w-full h-8 bg-white border border-blue-200 rounded-lg px-2.5 text-xs font-bold text-[#007acc] focus:outline-none"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10">
            <button
              onClick={() => {
                onToggleSimulator();
                setIsMobileMenuOpen(false);
              }}
              className="h-9 px-3 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4 text-purple-200" />
              <span>Simulator</span>
            </button>

            {onOpenLibraryManager && (
              <button
                onClick={() => {
                  onOpenLibraryManager();
                  setIsMobileMenuOpen(false);
                }}
                className="h-9 px-3 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-yellow-200" />
                <span>Libraries</span>
              </button>
            )}

            <button
              onClick={() => {
                saveCurrentProject();
                setIsMobileMenuOpen(false);
              }}
              className="h-9 px-3 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>Save</span>
            </button>

            <button
              onClick={() => {
                onOpenChallenges();
                setIsMobileMenuOpen(false);
              }}
              className="h-9 px-3 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <SettingsIcon className="w-4 h-4 text-white" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


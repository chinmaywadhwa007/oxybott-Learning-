import React, { useEffect, useState, useRef } from 'react';
import { HeaderToolbar, StudioViewMode } from '../components/HeaderToolbar/HeaderToolbar';
import { ToolboxSidebar, ToolboxCategory } from '../components/toolbox/ToolboxSidebar';
import { BoardStatusCard } from '../components/toolbox/BoardStatusCard';
import { BlocklyWorkspace, BlocklyWorkspaceRef } from '../workspace/BlocklyWorkspace';
import { CodeViewer } from '../components/CodeViewer/CodeViewer';
import { VirtualArduino } from '../simulator/VirtualArduino';
import { simulationEngine } from '../simulator/simulationEngine';
import { ConsoleLog, ConsoleTab } from '../components/ConsoleLog/ConsoleLog';
import { SerialMonitor } from '../components/SerialMonitor/SerialMonitor';
import { ChallengeModal } from '../components/ChallengeModal/ChallengeModal';
import { CommandPaletteModal } from '../components/CommandPaletteModal';
import { ProjectExplorer } from '../components/ProjectExplorer/ProjectExplorer';
import { ImportExportModal } from '../components/ImportExportModal/ImportExportModal';
import { LibraryManagerModal } from '../components/LibraryManagerModal/LibraryManagerModal';
import { fetchBoards, fetchPorts, requestCompile, requestUpload, BoardProfile, SerialPortInfo } from '../services/arduinoApi';
import { useProjectStore } from '../projects/projectStore';

export const BlocklyPage: React.FC = () => {
  const [boards, setBoards] = useState<BoardProfile[]>([]);
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedBoardFqbn, setSelectedBoardFqbn] = useState('arduino:avr:uno');
  const [selectedPort, setSelectedPort] = useState('COM3');

  // Layout & View Mode States
  const [viewMode, setViewMode] = useState<StudioViewMode>('split');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isLibraryManagerOpen, setIsLibraryManagerOpen] = useState(false);
  const [importExportTab, setImportExportTab] = useState<'import' | 'export'>('export');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Code & Edit States
  const [blocklyCode, setBlocklyCode] = useState('');
  const [code, setCode] = useState('');
  const [isManualEdited, setIsManualEdited] = useState(false);

  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [validationProblems, setValidationProblems] = useState<any[]>([]);

  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[10:24:15] ℹ Workspace loaded successfully',
    '[10:24:18] ✅ Code generated successfully',
    '[10:24:20] ⚡ Compilation finished successfully',
    '[10:24:20] ℹ Sketch uses 892 bytes (2%) of program storage space.',
    '[10:24:20] ℹ Global variables use 58 bytes (2%) of dynamic memory.',
  ]);
  const [activeConsoleTab, setActiveConsoleTab] = useState<ConsoleTab>('console');

  const workspaceRef = useRef<BlocklyWorkspaceRef | null>(null);
  const { saveCurrentProject } = useProjectStore();

  useEffect(() => {
    loadBoardsAndPorts();

    // Global Keyboard Shortcuts (Ctrl+K, Ctrl+S, Ctrl+Shift+C, Ctrl+Shift+U)
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentProject();
        setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Project saved.`]);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCompile();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleUpload();
      }
    };

    // Window Drag & Drop file import listener
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        const ext = file.name.toLowerCase();
        if (ext.endsWith('.ino') || ext.endsWith('.zip') || ext.endsWith('.json') || ext.endsWith('.ace') || ext.endsWith('.aceproj')) {
          setImportExportTab('import');
          setIsImportExportOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    // Auto-refresh hardware detection every 5 seconds (5000ms)
    const hardwareInterval = setInterval(() => {
      loadBoardsAndPorts();
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
      clearInterval(hardwareInterval);
    };
  }, []);

  const loadBoardsAndPorts = async () => {
    const bList = await fetchBoards();
    const pList = await fetchPorts();
    setBoards(bList);
    setPorts(pList);

    // Automatically populate toolbar dropdowns if new hardware detected
    if (pList.length > 0) {
      const activeP = pList.find((p) => p.port === selectedPort) || pList[0];
      if (activeP.fqbn && activeP.fqbn !== selectedBoardFqbn) {
        setSelectedBoardFqbn(activeP.fqbn);
      }
    }
  };

  const handleSelectCategory = (cat: ToolboxCategory) => {
    setActiveCategory(cat.name);
    if (workspaceRef.current) {
      workspaceRef.current.selectCategory(cat.blocklyCategoryName || cat.name);
    }
  };

  const handleBlocklyCodeChange = (newCode: string) => {
    setBlocklyCode(newCode);
    if (!isManualEdited) {
      setCode(newCode);
    }
  };

  const handleCodeEdit = (newCode: string) => {
    setCode(newCode);
    setIsManualEdited(true);
  };

  const handleSyncFromBlocks = () => {
    setIsManualEdited(false);
    setCode(blocklyCode);
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Resynced code editor with visual blocks.`]);
  };

  const handleCompile = async () => {
    if (!code || code.trim() === '') {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ Cannot compile: Blockly workspace is empty. Add blocks to generate code.`]);
      setActiveConsoleTab('compile');
      return;
    }

    setIsCompiling(true);
    setActiveConsoleTab('compile');
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ⚡ Starting compilation for [${selectedBoardFqbn}]...`]);

    console.log('[COMPILER PIPELINE] 4. Code passed to compiler API:\n', code);

    const res = await requestCompile(code, selectedBoardFqbn);
    setIsCompiling(false);

    if (res.logs && res.logs.length > 0) {
      setConsoleLogs((prev) => [...prev, ...res.logs]);
    }

    if (res.simulated) {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🌐 No physical hardware detected — Running in Virtual Hardware Simulator Mode!`]);
      setIsSimulatorOpen(true);
      simulationEngine.startSimulation(code);
    }

    if (res.success) {
      const metrics: string[] = [
        `[${new Date().toLocaleTimeString()}] ✅ [Compilation Successful] Exit Code 0 (${res.compileTimeMs}ms)`,
      ];
      if (res.sketchSize && res.sketchSize !== 'Unknown') {
        metrics.push(`[${new Date().toLocaleTimeString()}] ℹ Program Storage: ${res.sketchSize}`);
      }
      if (res.dynamicMem && res.dynamicMem !== 'Unknown') {
        metrics.push(`[${new Date().toLocaleTimeString()}] ℹ Dynamic Memory: ${res.dynamicMem}`);
      }
      setConsoleLogs((prev) => [...prev, ...metrics]);
    } else {
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ [Compilation Failed] Non-zero exit code or compiler error (${res.compileTimeMs}ms)`,
      ]);
    }
  };

  const handleUpload = async () => {
    if (!code || code.trim() === '') {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ Cannot upload: Blockly workspace is empty. Add blocks to generate code.`]);
      setActiveConsoleTab('upload');
      return;
    }

    setIsUploading(true);
    setActiveConsoleTab('upload');
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 Flashing target [${selectedBoardFqbn}] on ${selectedPort}...`]);

    console.log('[COMPILER PIPELINE] 4. Code passed to compiler API:\n', code);

    const res = await requestUpload(code, selectedBoardFqbn, selectedPort);
    setIsUploading(false);

    if (res.logs && res.logs.length > 0) {
      setConsoleLogs((prev) => [...prev, ...res.logs]);
    }

    if (res.simulated) {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🌐 Flashed to Virtual MCU — Launching Hardware Simulator!`]);
      setIsSimulatorOpen(true);
      simulationEngine.startSimulation(code);
    }

    if (res.success) {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Upload complete!`]);
    } else {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Upload failed: ${res.error || 'Check hardware connection'}`]);
    }
  };

  // Resizable Panels States (Workspace occupies ~62-65% of screen)
  const [leftWidth, setLeftWidth] = useState(210);
  const [rightWidth, setRightWidth] = useState(360);
  const [bottomHeight, setBottomHeight] = useState(180);

  // Mouse Drag Handlers for Panel Splitters
  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(180, startWidth + (moveEvent.clientX - startX)), 420);
      setLeftWidth(newWidth);
      workspaceRef.current?.resize();
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      workspaceRef.current?.resize();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(300, startWidth - (moveEvent.clientX - startX)), 850);
      setRightWidth(newWidth);
      workspaceRef.current?.resize();
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      workspaceRef.current?.resize();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleBottomMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = bottomHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.min(Math.max(100, startHeight - (moveEvent.clientY - startY)), 550);
      setBottomHeight(newHeight);
      workspaceRef.current?.resize();
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      workspaceRef.current?.resize();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const selectedBoardObj = boards.find((b) => b.fqbn === selectedBoardFqbn);
  const currentBoardName = selectedBoardObj ? selectedBoardObj.name : 'Arduino Uno';
  const activePortObj = ports.find((p) => p.port === selectedPort);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070D18] overflow-hidden text-slate-100 font-sans relative">
      {/* 1. TOP COMMAND BAR */}
      <HeaderToolbar
        boards={boards}
        ports={ports}
        selectedBoardFqbn={selectedBoardFqbn}
        onSelectBoard={setSelectedBoardFqbn}
        selectedPort={selectedPort}
        onSelectPort={setSelectedPort}
        onRefreshPorts={loadBoardsAndPorts}
        onCompile={handleCompile}
        onUpload={handleUpload}
        isCompiling={isCompiling}
        isUploading={isUploading}
        onToggleSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        isSimulatorOpen={isSimulatorOpen}
        onOpenChallenges={() => setIsChallengeOpen(true)}
        onToggleHints={() => setShowHints(!showHints)}
        showHints={showHints}
        activeViewMode={viewMode}
        onSelectViewMode={setViewMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onUndo={() => workspaceRef.current?.undo()}
        onRedo={() => workspaceRef.current?.redo()}
        onToggleExplorer={() => setIsExplorerOpen(!isExplorerOpen)}
        onOpenImportExport={(tab) => {
          setImportExportTab(tab || 'export');
          setIsImportExportOpen(true);
        }}
        onOpenLibraryManager={() => setIsLibraryManagerOpen(true)}
        isCodeEmpty={!code || code.trim() === ''}
      />

      {/* 2. MAIN THREE-PANEL IDE LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* LEFT PANEL: Toolbox Sidebar & Bottom Board Status Card */}
        {(viewMode === 'split' || viewMode === 'blocks') && (
          <>
            <div
              style={{ width: isSidebarCollapsed ? 64 : leftWidth }}
              className="h-full flex flex-col shrink-0 z-10 transition-all duration-150 bg-[#0B132B] border-r border-[#1E293B]/60"
            >
              <ToolboxSidebar
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
              {!isSidebarCollapsed && (
                <BoardStatusCard
                  boardName={activePortObj?.boardName || currentBoardName}
                  port={selectedPort}
                  isConnected={true}
                  chip={activePortObj?.chip}
                  vendor={activePortObj?.vendor}
                  vendorId={activePortObj?.vendorId}
                  productId={activePortObj?.productId}
                  onOpenBoardInfo={() => setIsChallengeOpen(true)}
                />
              )}
            </div>

            {/* Left Resizable Splitter */}
            {!isSidebarCollapsed && (
              <div
                onMouseDown={handleLeftMouseDown}
                className="w-1 h-full bg-[#1E293B]/40 hover:bg-[#38BDF8]/60 cursor-col-resize z-20 transition-colors group flex items-center justify-center shrink-0 select-none"
                title="Drag to resize Left Panel"
              >
                <div className="w-0.5 h-8 bg-slate-600/40 group-hover:bg-[#38BDF8] rounded-full" />
              </div>
            )}
          </>
        )}

        {/* CENTER PANEL: Blockly Workspace Canvas (PRIMARY FOCUS) */}
        {(viewMode === 'split' || viewMode === 'blocks') && (
          <div className="flex-1 h-full relative overflow-hidden bg-[#070D18]">
            <BlocklyWorkspace
              ref={workspaceRef}
              onCodeChange={handleBlocklyCodeChange}
              onValidationProblems={setValidationProblems}
              showHints={showHints}
              activeCategory={activeCategory}
            />
          </div>
        )}

        {/* RIGHT PANEL: Arduino C++ Code Editor */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <>
            {/* Right Resizable Splitter */}
            {viewMode === 'split' && (
              <div
                onMouseDown={handleRightMouseDown}
                className="w-1 h-full bg-[#1E293B]/40 hover:bg-[#38BDF8]/60 cursor-col-resize z-20 transition-colors group flex items-center justify-center shrink-0 select-none"
                title="Drag to resize Right Panel"
              >
                <div className="w-0.5 h-8 bg-slate-600/40 group-hover:bg-[#38BDF8] rounded-full" />
              </div>
            )}

            <div
              style={{ width: viewMode === 'split' ? rightWidth : '100%' }}
              className="h-full bg-[#0B132B] border-l border-[#1E293B]/60 shrink-0 overflow-hidden"
            >
              <CodeViewer
                code={code}
                onChangeCode={handleCodeEdit}
                onSyncFromBlocks={handleSyncFromBlocks}
                isManualEdited={isManualEdited}
                onCompile={handleCompile}
                isCompiling={isCompiling}
              />
            </div>
          </>
        )}

        {/* RIGHT COLLAPSIBLE VIRTUAL HARDWARE SIMULATOR */}
        {isSimulatorOpen && (
          <div className="w-[380px] h-full border-l border-[#1E293B]/60 shadow-2xl z-20 shrink-0 bg-[#070D18]">
            <VirtualArduino code={code} onClose={() => setIsSimulatorOpen(false)} />
          </div>
        )}
      </div>

      {/* 3. BOTTOM TERMINAL CONSOLE PANEL */}
      <div style={{ height: isConsoleCollapsed ? 36 : bottomHeight }} className="shrink-0 relative z-10 flex flex-col bg-[#0B132B] border-t border-[#1E293B]/60">
        {/* Bottom Resizable Splitter */}
        {!isConsoleCollapsed && (
          <div
            onMouseDown={handleBottomMouseDown}
            className="h-1 w-full bg-[#1E293B]/40 hover:bg-[#38BDF8]/60 cursor-row-resize z-20 transition-colors group flex items-center justify-center shrink-0 select-none"
            title="Drag to resize Bottom Panel"
          >
            <div className="h-0.5 w-8 bg-slate-600/40 group-hover:bg-[#38BDF8] rounded-full" />
          </div>
        )}

        {activeConsoleTab === 'serial' ? (
          <div className="flex-1 border-t border-white/[0.08] bg-[#090E17] relative z-10 overflow-hidden">
            <SerialMonitor />
          </div>
        ) : (
          <ConsoleLog
            logs={consoleLogs}
            problems={validationProblems}
            activeTab={activeConsoleTab}
            onSelectTab={setActiveConsoleTab}
            onClearLogs={() => setConsoleLogs([])}
            isCollapsed={isConsoleCollapsed}
            onToggleCollapse={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
          />
        )}
      </div>

      {/* COMMAND PALETTE OVERLAY (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCompile={handleCompile}
        onUpload={handleUpload}
        onSave={() => {
          saveCurrentProject();
          setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Project saved.`]);
        }}
        onSelectViewMode={setViewMode}
        onToggleSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        onClearConsole={() => setConsoleLogs([])}
      />

      {/* CHALLENGE & BOARD MODAL */}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        currentCode={code}
      />

      {/* VS CODE-STYLE PROJECT EXPLORER */}
      <ProjectExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
      />

      {/* IMPORT & EXPORT CENTER MODAL */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        defaultTab={importExportTab}
      />

      {/* ARDUINO LIBRARY MANAGER MODAL */}
      <LibraryManagerModal
        isOpen={isLibraryManagerOpen}
        onClose={() => setIsLibraryManagerOpen(false)}
      />
    </div>
  );
};

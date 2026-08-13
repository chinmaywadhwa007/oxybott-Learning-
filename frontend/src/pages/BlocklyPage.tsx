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
import { ToastNotification, ToastMessage } from '../components/common/ToastNotification';
import { fetchBoards, fetchPorts, requestCompile, requestUpload, checkAgentHealth, BoardProfile, SerialPortInfo } from '../services/arduinoApi';
import { compileWorkspaceWithValidation } from '../generators/arduinoGenerator';
import { useProjectStore } from '../projects/projectStore';

export const BlocklyPage: React.FC = () => {
  const [boards, setBoards] = useState<BoardProfile[]>([]);
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedBoardFqbn, setSelectedBoardFqbn] = useState('arduino:avr:uno');
  const [selectedPort, setSelectedPort] = useState('');
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(true);

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
  const lastValErrorRef = useRef<string>('');
  const { saveCurrentProject } = useProjectStore();

  // Toast notifications state & helper
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'error' | 'warning' | 'info' | 'success' = 'error', duration?: number) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, title, description, type, duration }]);
  };

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const prevPortsCountRef = useRef<number>(-1);

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

    // Hardware detection polling every 2.5 seconds (2500ms)
    const hardwareInterval = setInterval(() => {
      loadBoardsAndPorts();
    }, 2500);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
      clearInterval(hardwareInterval);
    };
  }, []);

  const loadBoardsAndPorts = async () => {
    const health = await checkAgentHealth();
    setIsAgentRunning(health.isAgentRunning);

    if (!health.isAgentRunning) {
      setPorts([]);
      return;
    }

    const bList = await fetchBoards();
    const pList = await fetchPorts();
    setBoards(bList);
    setPorts(pList);

    // Filter verified Arduino physical hardware devices
    const verifiedPorts = pList.filter(
      (p) => p.isVerifiedArduino || (p.fqbn && !p.boardName?.includes('Unverified') && !p.boardName?.includes('Bluetooth'))
    );

    const isInitialLoad = prevPortsCountRef.current === -1;

    // Detect Hardware Connection / Disconnection events
    if (!isInitialLoad && prevPortsCountRef.current === 0 && verifiedPorts.length > 0) {
      const activeP = verifiedPorts[0];
      addToast(
        `${activeP.boardName || 'Arduino'} Connected`,
        `Connected on ${activeP.port} ready for programming.`,
        'success'
      );
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🟢 [Hardware Connect] ${activeP.boardName || 'Arduino'} connected on ${activeP.port}.`,
      ]);
    } else if (!isInitialLoad && prevPortsCountRef.current > 0 && verifiedPorts.length === 0) {
      addToast('Arduino Disconnected', 'Please reconnect your board and try again.', 'error');
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🔴 [Hardware Disconnect] Arduino board unplugged/disconnected from USB port.`,
      ]);
    }
    prevPortsCountRef.current = verifiedPorts.length;

    // Automatically set active board and port if verified physical hardware is detected
    if (verifiedPorts.length > 0) {
      const activeP = verifiedPorts.find((p) => p.port === selectedPort) || verifiedPorts[0];
      if (activeP.port !== selectedPort) {
        setSelectedPort(activeP.port);
      }
      if (activeP.fqbn && activeP.fqbn !== selectedBoardFqbn) {
        setSelectedBoardFqbn(activeP.fqbn);
      }
    } else if (pList.length > 0) {
      const activeP = pList[0];
      if (activeP.port !== selectedPort) {
        setSelectedPort(activeP.port);
      }
    } else {
      if (selectedPort !== '') {
        setSelectedPort('');
      }
    }
  };

  const handleSelectCategory = (cat: ToolboxCategory) => {
    setActiveCategory(cat.name);
    if (workspaceRef.current) {
      workspaceRef.current.selectCategory(cat.blocklyCategoryName || cat.name);
    }
  };

  const handleValidationProblems = (problems: any[], isValid: boolean, errors: string[]) => {
    setValidationProblems(problems);

    const timestamp = new Date().toLocaleTimeString();
    const currentErrorStr = errors.join(' | ');

    if (!isValid && errors.length > 0) {
      if (lastValErrorRef.current !== currentErrorStr) {
        lastValErrorRef.current = currentErrorStr;
        const errorLogs = [
          `[${timestamp}] ❌ [Real-Time Validation Failed] ${errors.length} logic issue(s) detected:`,
          ...errors.map((err) => `   ↳ ❌ ${err}`),
          `[${timestamp}] ⚠️ Code generation suspended. Fix highlighted blocks on canvas or check the Problems tab.`,
        ];
        setConsoleLogs((prev) => [...prev, ...errorLogs]);
      }
    } else {
      if (lastValErrorRef.current !== '') {
        lastValErrorRef.current = '';
        setConsoleLogs((prev) => [
          ...prev,
          `[${timestamp}] ✅ [Real-Time Validation Passed] Code logic clean & valid. Arduino C++ generated cleanly.`,
        ]);
      }
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
    // 1. Requirement 8: Check Local Oxybott Agent Health
    const health = await checkAgentHealth();
    setIsAgentRunning(health.isAgentRunning);

    if (!health.isAgentRunning) {
      addToast(
        'Oxybott Agent not running',
        'Oxybott Arduino Agent is not running. Please start the local agent to connect your Arduino.',
        'error'
      );
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🔴 [Agent Offline] Oxybott Arduino Agent is not running on your computer. Launch 'npm run agent' in terminal.`,
      ]);
      return; // DO NOT call /compile!
    }

    // 2. Requirement 1 & 2: Verify Physical Arduino Hardware Device Presence
    const currentPorts = await fetchPorts();
    setPorts(currentPorts);

    const verifiedPorts = currentPorts.filter(
      (p) => p.isVerifiedArduino || (p.fqbn && !p.boardName?.includes('Unverified') && !p.boardName?.includes('Bluetooth'))
    );

    if (currentPorts.length === 0 || verifiedPorts.length === 0) {
      addToast(
        'Arduino device not connected',
        'Please connect your Arduino board and try again.',
        'error'
      );
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🔴 [Compilation Blocked] Arduino device not connected. Please connect your Arduino board and try again.`,
      ]);
      return; // DO NOT call /compile!
    }

    const workspace = workspaceRef.current?.getWorkspace();
    if (!workspace) return;

    // 3. Run Workspace Validation
    const valResult = compileWorkspaceWithValidation(workspace);

    if (!valResult.valid || valResult.errors.length > 0) {
      setActiveConsoleTab('problems');
      const errorLogs = [
        '==================================',
        'Blockly Validation Failed',
        '==================================',
        '',
        ...valResult.errors.map((err) => `❌ ${err}`),
        '',
        'Compilation cancelled.',
        'Please fix the highlighted blocks or inspect the Problems tab.',
      ];

      setConsoleLogs((prev) => [...prev, ...errorLogs]);
      return; // STOP! Do not call backend API or Arduino CLI!
    }

    setActiveConsoleTab('compile');

    if (!code || code.trim() === '') {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ Cannot compile: Blockly workspace is empty. Add blocks to generate code.`]);
      return;
    }

    setIsCompiling(true);
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ⚡ Starting compilation for [${selectedBoardFqbn}]...`]);

    console.log('[COMPILER PIPELINE] 4. Code passed to compiler API:\n', code);

    const res = await requestCompile(code, selectedBoardFqbn);
    setIsCompiling(false);

    if (res.logs && res.logs.length > 0) {
      setConsoleLogs((prev) => [...prev, ...res.logs]);
    }

    if (res.success) {
      addToast('Compilation successful', 'Sketch compiled cleanly with exit code 0', 'success');
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
      addToast('Compilation failed', res.errors?.[0] || 'Compiler returned non-zero exit code.', 'error');
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ [Compilation Failed] Non-zero exit code or compiler error (${res.compileTimeMs}ms)`,
      ]);
    }
  };

  const handleUpload = async () => {
    // 1. Requirement 8: Check Local Oxybott Agent Health
    const health = await checkAgentHealth();
    setIsAgentRunning(health.isAgentRunning);

    if (!health.isAgentRunning) {
      addToast(
        'Oxybott Agent not running',
        'Oxybott Arduino Agent is not running. Please start the local agent to connect your Arduino.',
        'error'
      );
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🔴 [Agent Offline] Oxybott Arduino Agent is not running on your computer. Launch 'npm run agent' in terminal.`,
      ]);
      return; // DO NOT call /upload!
    }

    // 2. Requirement 1, 2, 5: Fresh Port Check Before Upload
    const currentPorts = await fetchPorts();
    setPorts(currentPorts);

    const verifiedPorts = currentPorts.filter(
      (p) => p.isVerifiedArduino || (p.fqbn && !p.boardName?.includes('Unverified') && !p.boardName?.includes('Bluetooth'))
    );

    if (currentPorts.length === 0 || verifiedPorts.length === 0) {
      addToast(
        'Arduino device not connected',
        'Please connect your Arduino board and try again.',
        'error'
      );
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🔴 [Upload Blocked] Arduino device not connected. Please connect your Arduino board and try again.`,
      ]);
      return; // DO NOT call /upload!
    }

    // Fresh port resolution immediately before upload
    const activePort = verifiedPorts.find((p) => p.port === selectedPort) || verifiedPorts[0];
    const targetPort = activePort.port;
    const targetFqbn = activePort.fqbn || selectedBoardFqbn;

    if (!targetPort) {
      addToast('Port unavailable', 'No valid serial port detected for upload.', 'error');
      return;
    }

    const workspace = workspaceRef.current?.getWorkspace();
    if (!workspace) return;

    // 2. Run Workspace Validation
    const valResult = compileWorkspaceWithValidation(workspace);

    if (!valResult.valid || valResult.errors.length > 0) {
      setActiveConsoleTab('problems');
      const errorLogs = [
        '==================================',
        'Blockly Validation Failed',
        '==================================',
        '',
        ...valResult.errors.map((err) => `❌ ${err}`),
        '',
        'Upload cancelled.',
        'Please fix the highlighted blocks or inspect the Problems tab.',
      ];

      setConsoleLogs((prev) => [...prev, ...errorLogs]);
      return; // STOP! Do not call backend API or Arduino CLI!
    }

    setActiveConsoleTab('upload');

    if (!code || code.trim() === '') {
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ Cannot upload: Blockly workspace is empty. Add blocks to generate code.`]);
      return;
    }

    setIsUploading(true);
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 Flashing target [${targetFqbn}] on ${targetPort}...`]);

    console.log('[COMPILER PIPELINE] 4. Code passed to compiler API:\n', code);

    const res = await requestUpload(code, targetFqbn, targetPort);
    setIsUploading(false);

    if (res.logs && res.logs.length > 0) {
      setConsoleLogs((prev) => [...prev, ...res.logs]);
    }

    if (res.success) {
      addToast('Upload successful', `Successfully flashed code to ${targetPort}`, 'success');
      setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ [Upload Successful] Exit code 0. Target MCU restarted cleanly.`]);
    } else {
      addToast('Upload failed', res.error || 'Check hardware connection or COM port.', 'error');
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

  // Mobile responsiveness detector
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMob = window.innerWidth < 1024;
      setIsMobileScreen(isMob);
      if (isMob && viewMode === 'split') {
        setViewMode('blocks');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedBoardObj = boards.find((b) => b.fqbn === selectedBoardFqbn);
  const currentBoardName = selectedBoardObj ? selectedBoardObj.name : 'Arduino Uno';
  const activePortObj = ports.find((p) => p.port === selectedPort);
  const verifiedPorts = ports.filter(
    (p) => p.isVerifiedArduino || (p.fqbn && !p.boardName?.includes('Unverified') && !p.boardName?.includes('Bluetooth'))
  );
  const isDeviceConnected = isAgentRunning && verifiedPorts.length > 0 && Boolean(selectedPort);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#ffffff] overflow-hidden text-slate-800 font-sans relative">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
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
        isAgentRunning={isAgentRunning}
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
        {/* LEFT PANEL: Toolbox Sidebar & Bottom Board Status Card (Desktop/Tablet) */}
        {!isMobileScreen && (viewMode === 'split' || viewMode === 'blocks') && (
          <>
            <div
              style={{ width: isSidebarCollapsed ? 64 : leftWidth }}
              className="h-full flex flex-col shrink-0 z-10 transition-all duration-150 bg-[#f8fafc] border-r border-slate-200"
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
                  isConnected={isDeviceConnected}
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
                className="w-1 h-full bg-slate-200 hover:bg-[#007acc] cursor-col-resize z-20 transition-colors group flex items-center justify-center shrink-0 select-none"
                title="Drag to resize Left Panel"
              >
                <div className="w-0.5 h-8 bg-slate-400 group-hover:bg-white rounded-full" />
              </div>
            )}
          </>
        )}

        {/* MOBILE SLIDE-OVER TOOLBOX DRAWER */}
        {isMobileScreen && activeCategory === 'mobile_toolbox_open' && (
          <div className="absolute inset-0 z-30 bg-white flex flex-col">
            <div className="h-10 px-4 bg-[#007acc] border-b border-[#0066cc] flex items-center justify-between">
              <span className="font-bold text-xs text-white">Block Categories</span>
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded"
              >
                Close ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <ToolboxSidebar
                activeCategory={activeCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setActiveCategory(null);
                }}
                isCollapsed={false}
                onToggleCollapse={() => {}}
              />
            </div>
          </div>
        )}

        {/* CENTER PANEL: Blockly Workspace Canvas */}
        {(viewMode === 'split' || viewMode === 'blocks') && (
          <div className="flex-1 h-full relative overflow-hidden bg-[#ffffff]">
            <BlocklyWorkspace
              ref={workspaceRef}
              onCodeChange={handleBlocklyCodeChange}
              onValidationProblems={handleValidationProblems}
              showHints={showHints}
              activeCategory={activeCategory}
              onToggleTerminal={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
              isTerminalCollapsed={isConsoleCollapsed}
            />
          </div>
        )}

        {/* RIGHT PANEL: Arduino C++ Code Editor */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <>
            {/* Right Resizable Splitter */}
            {!isMobileScreen && viewMode === 'split' && (
              <div
                onMouseDown={handleRightMouseDown}
                className="w-1 h-full bg-slate-200 hover:bg-[#007acc] cursor-col-resize z-20 transition-colors group flex items-center justify-center shrink-0 select-none"
                title="Drag to resize Right Panel"
              >
                <div className="w-0.5 h-8 bg-slate-400 group-hover:bg-white rounded-full" />
              </div>
            )}

            <div
              style={{ width: viewMode === 'split' ? rightWidth : '100%' }}
              className="h-full bg-[#2d3748] border-l border-slate-300 shrink-0 overflow-hidden"
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

        {/* VIRTUAL HARDWARE SIMULATOR */}
        {isSimulatorOpen && (
          <div className="fixed inset-0 lg:static lg:inset-auto lg:w-[380px] h-full border-l border-slate-300 shadow-2xl z-40 shrink-0 bg-[#070D18]">
            <VirtualArduino code={code} onClose={() => setIsSimulatorOpen(false)} />
          </div>
        )}
      </div>

      {/* 3. BOTTOM TERMINAL CONSOLE PANEL */}
      {!isMobileScreen && (
        <div style={{ height: isConsoleCollapsed ? 36 : bottomHeight }} className="shrink-0 relative z-10 flex flex-col bg-[#1e293b] border-t border-slate-700">
          {!isConsoleCollapsed && (
            <div
              onMouseDown={handleBottomMouseDown}
              className="h-1 w-full bg-slate-700 hover:bg-[#007acc] cursor-row-resize z-20 transition-colors group flex items-center justify-center shrink-0 select-none"
              title="Drag to resize Bottom Panel"
            >
              <div className="h-0.5 w-8 bg-slate-400 group-hover:bg-white rounded-full" />
            </div>
          )}

          <ConsoleLog
            logs={consoleLogs}
            problems={validationProblems}
            activeTab={activeConsoleTab}
            onSelectTab={setActiveConsoleTab}
            onClearLogs={() => setConsoleLogs([])}
            isCollapsed={isConsoleCollapsed}
            onToggleCollapse={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
          />
        </div>
      )}

      {/* 4. VISUAL STUDIO BLUE STATUS FOOTER BAR */}
      <div className="h-6 bg-[#007acc] text-white select-none shrink-0 z-20 px-3 flex items-center justify-between font-sans text-[11px] font-semibold border-t border-blue-600 shadow-inner">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDeviceConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span>{isDeviceConnected ? `Connected (${selectedPort})` : 'Disconnected'}</span>
          </span>
          <span>|</span>
          <span>Board: {currentBoardName}</span>
          <span>|</span>
          <span>Mode: Upload Mode</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-blue-100 font-medium">
          <span>Oxymora Technology Pvt. Ltd.</span>
          <span>|</span>
          <span>v1.0.0</span>
        </div>
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


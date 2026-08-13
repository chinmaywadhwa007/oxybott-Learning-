import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as Blockly from 'blockly';
import { oxybottTheme } from '../themes/acecodeTheme';
import { oxybottToolbox } from '../toolbox/toolboxConfig';
import { registerAllBlocks } from '../blocks/registry';
import { generateArduinoCode, compileWorkspaceWithValidation } from '../generators/arduinoGenerator';
import { useProjectStore } from '../projects/projectStore';
import { getActiveHints, BeginnerHint } from '../education/beginnerHints';
import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  AlertCircle,
  Layers,
} from 'lucide-react';

export interface BlocklyWorkspaceRef {
  selectCategory: (categoryName: string) => void;
  undo: () => void;
  redo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  clearWorkspace: () => void;
  resize: () => void;
  getWorkspace: () => Blockly.WorkspaceSvg | null;
}

interface BlocklyWorkspaceProps {
  onCodeChange: (code: string) => void;
  onValidationProblems?: (problems: any[], isValid: boolean, errors: string[]) => void;
  showHints: boolean;
  activeCategory?: string | null;
  onToggleTerminal?: () => void;
  isTerminalCollapsed?: boolean;
}

export const BlocklyWorkspace = forwardRef<BlocklyWorkspaceRef, BlocklyWorkspaceProps>(
  ({ onCodeChange, onValidationProblems, showHints, onToggleTerminal, isTerminalCollapsed = false }, ref) => {
    const blocklyDivRef = useRef<HTMLDivElement | null>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const { currentProject, updateWorkspace } = useProjectStore();
    const [activeHints, setActiveHints] = useState<BeginnerHint[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const trashZoneRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const isOverTrashRef = useRef(false);   // live value readable inside closures
    const draggedBlockIdRef = useRef<string | null>(null); // block ID, not JS object

    useImperativeHandle(ref, () => ({
      getWorkspace: () => workspaceRef.current,
      selectCategory: (categoryName: string) => {
        if (workspaceRef.current) {
          const toolbox = workspaceRef.current.getToolbox();
          if (toolbox) {
            try {
              // Select category by name or index
              const items = toolbox.getToolboxItems();
              for (const item of items) {
                const anyItem = item as any;
                if (anyItem.name_ === categoryName || anyItem.name === categoryName || (typeof anyItem.getName === 'function' && anyItem.getName() === categoryName)) {
                  toolbox.setSelectedItem(item);
                  break;
                }
              }
            } catch (_e) {
              // Ignore selection errors
            }
          }
        }
      },
      undo: () => workspaceRef.current && workspaceRef.current.undo(false),
      redo: () => workspaceRef.current && workspaceRef.current.undo(true),
      zoomIn: () => workspaceRef.current && workspaceRef.current.zoomCenter(1),
      zoomOut: () => workspaceRef.current && workspaceRef.current.zoomCenter(-1),
      fitToScreen: () => workspaceRef.current && workspaceRef.current.zoomToFit(),
      clearWorkspace: () => {
        if (workspaceRef.current) {
          workspaceRef.current.clear();
          onCodeChange('');
        }
      },
      resize: () => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current);
        }
      },
    }));

    useEffect(() => {
      registerAllBlocks();

      if (blocklyDivRef.current && !workspaceRef.current) {
        const workspace = Blockly.inject(blocklyDivRef.current, {
          toolbox: oxybottToolbox,
          theme: oxybottTheme,
          grid: {
            spacing: 24,
            length: 4,
            colour: '#d0d7de',
            snap: true,
          },
          zoom: {
            controls: false, // Custom floating controls bar
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
            pinch: true,
          },
          trashcan: false,
          move: {
            scrollbars: {
              horizontal: true,
              vertical: true,
            },
            drag: true,
            wheel: false,
          },
          sounds: false,
        });

        workspaceRef.current = workspace;

        // Load initial workspace state
        if (currentProject.workspaceJson) {
          try {
            Blockly.serialization.workspaces.load(currentProject.workspaceJson, workspace);
          } catch (_e) {
            // Ignore parse errors on load
          }
        }

        // Run initial compilation on mount
        const initialResult = compileWorkspaceWithValidation(workspace);
        const initialJsonState = Blockly.serialization.workspaces.save(workspace);
        console.log('[COMPILER PIPELINE] 1. Workspace JSON (Mount):', initialJsonState);
        onCodeChange(initialResult.code);
        if (onValidationProblems) {
          onValidationProblems(initialResult.problems, initialResult.valid, initialResult.errors);
        }
        updateWorkspace(initialJsonState, initialResult.code);
        setActiveHints(getActiveHints(initialResult.code));

        const runWorkspaceValidation = () => {
          const jsonState = Blockly.serialization.workspaces.save(workspace);
          const result = compileWorkspaceWithValidation(workspace);

          onCodeChange(result.code);
          if (onValidationProblems) {
            onValidationProblems(result.problems, result.valid, result.errors);
          }

          updateWorkspace(jsonState, result.code);
          setActiveHints(getActiveHints(result.code));
        };

        // Add change listener for real-time C++ generation, validation & auto-save
        workspace.addChangeListener((event) => {
          // Track block drag start/end for trash zone visibility & post-drag validation
          if (event.type === Blockly.Events.BLOCK_DRAG) {
            const dragEvent = event as Blockly.Events.BlockDrag;
            const starting = dragEvent.isStart ?? false;

            if (starting) {
              // Drag started — capture block ID and show trash zone
              draggedBlockIdRef.current = (dragEvent as any).blockId ?? null;
              isDraggingRef.current = true;
              setIsDragging(true);
            } else {
              // Drag ended — Blockly has placed the block on canvas.
              const blockId = draggedBlockIdRef.current;
              const shouldDelete = isOverTrashRef.current && !!blockId;

              isDraggingRef.current = false;
              setIsDragging(false);
              isOverTrashRef.current = false;
              setIsOverTrash(false);
              draggedBlockIdRef.current = null;

              if (shouldDelete && blockId) {
                setTimeout(() => {
                  const block = workspace.getBlockById(blockId);
                  if (block) {
                    try { block.dispose(false); } catch (_) {}
                  }
                  runWorkspaceValidation();
                }, 20);
              } else {
                // Drag ended! Re-validate immediately after block drop
                setTimeout(runWorkspaceValidation, 20);
              }
            }
          }

          // Trigger validation on block creation, movement, edit, deletion, or variable changes (only when not mid-drag)
          if (
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_MOVE ||
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_DELETE ||
            event.type === Blockly.Events.VAR_CREATE ||
            event.type === Blockly.Events.VAR_DELETE ||
            event.type === Blockly.Events.VAR_RENAME
          ) {
            if (isDraggingRef.current) return; // Suppress validation while user is holding and moving block
            setTimeout(runWorkspaceValidation, 20);
          }
        });

        // Document-level mousemove: track if cursor is over trash zone while dragging
        const handleDocMouseMove = (e: MouseEvent) => {
          if (!isDraggingRef.current || !trashZoneRef.current) return;
          const rect = trashZoneRef.current.getBoundingClientRect();
          const over =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          isOverTrashRef.current = over;
          setIsOverTrash(over);
        };

        // document.mouseup only resets hover state — actual deletion happens above in BLOCK_DRAG
        const handleDocMouseUp = () => {
          // isOverTrashRef is read by the BLOCK_DRAG handler; no deletion here
        };

        document.addEventListener('mousemove', handleDocMouseMove);
        document.addEventListener('mouseup', handleDocMouseUp);

        // ResizeObserver to automatically adjust SVG canvas when panel resizes
        const resizeObserver = new ResizeObserver(() => {
          if (workspaceRef.current) {
            Blockly.svgResize(workspaceRef.current);
          }
        });
        if (blocklyDivRef.current) {
          resizeObserver.observe(blocklyDivRef.current);
        }

        (workspace as any)._customCleanup = () => {
          document.removeEventListener('mousemove', handleDocMouseMove);
          document.removeEventListener('mouseup', handleDocMouseUp);
          resizeObserver.disconnect();
        };

        // Initial code emission
        const initialCode = generateArduinoCode(workspace);
        onCodeChange(initialCode);
        setActiveHints(getActiveHints(initialCode));
      }

      return () => {
        if (workspaceRef.current) {
          // Run custom cleanup (remove doc listeners)
          if (typeof (workspaceRef.current as any)._customCleanup === 'function') {
            (workspaceRef.current as any)._customCleanup();
          }
          workspaceRef.current.dispose();
          workspaceRef.current = null;
        }
      };
    }, []);

    const handleUndo = () => workspaceRef.current && workspaceRef.current.undo(false);
    const handleRedo = () => workspaceRef.current && workspaceRef.current.undo(true);
    const handleZoomIn = () => workspaceRef.current && workspaceRef.current.zoomCenter(1);
    const handleZoomOut = () => workspaceRef.current && workspaceRef.current.zoomCenter(-1);
    const handleFitToScreen = () => workspaceRef.current && workspaceRef.current.zoomToFit();
    const handleClear = () => {
      if (workspaceRef.current) {
        workspaceRef.current.clear();
        onCodeChange('');
      }
    };

    // Handle mouse-up over trash zone to delete dragged block
    const handleTrashMouseUp = useCallback(() => {
      // No-op: deletion is now handled by document-level mouseup listener
    }, []);


    return (
      <div className="relative w-full h-full bg-[#ffffff] overflow-hidden flex flex-col font-sans select-none shadow-inner">
        {/* Educational Hints Banner */}
        {showHints && activeHints.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-col gap-1 z-10 text-slate-800">
            {activeHints.map((hint) => (
              <div key={hint.id} className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{hint.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Blockly Engine Container */}
        <div ref={blocklyDivRef} className="w-full flex-1 relative z-0 bg-[#ffffff]" />

        {/* Floating Workspace Toolbar (Undo, Redo, Zoom In, Zoom Out, Fit, Clear) */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 p-1.5 rounded-xl bg-white/95 border border-slate-200 shadow-lg backdrop-blur-md text-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline border-r border-slate-200 py-0.5">
            CANVAS
          </span>
          <button
            onClick={handleUndo}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#007acc] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#007acc]" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#007acc] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-[#007acc]" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
            title="Clear Workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scratch / Oxybott Floating Backpack & Terminal Toggle Button (Bottom Center) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={onToggleTerminal}
            className="px-5 py-1 rounded-t-xl bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-[#94a3b8] border border-b-0 border-slate-300 text-slate-700 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
            title={isTerminalCollapsed ? 'Open / Expand Terminal Console' : 'Close / Collapse Terminal Console'}
          >
            <span className="text-[10px] font-extrabold">{isTerminalCollapsed ? '▲' : '▼'}</span>
            <span>{isTerminalCollapsed ? 'Backpack (Open Terminal)' : 'Backpack (Close Terminal)'}</span>
          </button>
        </div>

        {/* Floating Zoom Action Bar Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold text-base transition-all cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold text-base transition-all cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleFitToScreen}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold text-base transition-all cursor-pointer"
            title="Reset Zoom"
          >
            =
          </button>
        </div>

        {/* Drag-and-Drop Trash Delete Zone */}
        <div
          ref={trashZoneRef}
          onMouseEnter={() => isDragging && setIsOverTrash(true)}
          onMouseLeave={() => setIsOverTrash(false)}
          onMouseUp={handleTrashMouseUp}
          style={{
            opacity: isDragging ? 1 : 0,
            pointerEvents: isDragging ? 'all' : 'none',
            transform: isDragging ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center gap-1.5 w-44 h-20 rounded-xl border-2 cursor-crosshair select-none ${
            isOverTrash
              ? 'bg-rose-50 border-rose-500 shadow-xl'
              : 'bg-white/95 border-rose-300 shadow-lg'
          } backdrop-blur-md`}
          title="Drop block here to delete"
        >
          <Trash2
            className={`w-5 h-5 transition-all duration-150 ${
              isOverTrash ? 'text-rose-600 scale-125' : 'text-rose-400'
            }`}
          />
          <span className={`text-[10px] font-extrabold tracking-wider uppercase transition-colors ${
            isOverTrash ? 'text-rose-800' : 'text-rose-500'
          }`}>
            {isOverTrash ? 'Release to Delete' : 'Drop Here to Delete'}
          </span>
        </div>
      </div>
    );
  }
);

BlocklyWorkspace.displayName = 'BlocklyWorkspace';

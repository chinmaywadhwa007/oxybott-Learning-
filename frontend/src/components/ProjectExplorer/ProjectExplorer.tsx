import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  Folder,
  FilePlus,
  FileText,
  FileCode2,
  FileJson,
  BookOpen,
  Image,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Edit3,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  FolderPlus,
  Clock,
  CheckCircle2,
  Cpu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useProjectStore, OxybottProject } from '../../projects/projectStore';

interface ProjectExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
  projectId: string | null;
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Virtual folder tree files for a project
const PROJECT_FILES = [
  { name: 'main.ino', icon: FileCode2, color: 'text-[#5BE4FF]' },
  { name: 'workspace.json', icon: FileJson, color: 'text-amber-400' },
  { name: 'README.md', icon: BookOpen, color: 'text-emerald-400' },
  { name: 'assets', icon: Folder, color: 'text-yellow-400', isDir: true },
];

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ isOpen, onClose }) => {
  const {
    savedProjects,
    currentProject,
    loadProject,
    deleteProject,
    duplicateProject,
    renameProject,
    createNewProject,
    exportProject,
    exportProjectById,
    importProject,
    saveCurrentProject,
  } = useProjectStore();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set([currentProject.metadata.id])
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, projectId: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);

  // Show toast notification
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setContextMenu((c) => ({ ...c, visible: false }));
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const toggleExpand = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLoadProject = (id: string) => {
    saveCurrentProject();
    loadProject(id);
    setExpandedProjects((prev) => new Set([...prev, id]));
    showToast('Project loaded');
  };

  const handleStartRename = (project: OxybottProject) => {
    setRenamingId(project.metadata.id);
    setRenameValue(project.metadata.name);
    setContextMenu((c) => ({ ...c, visible: false }));
  };

  const handleCommitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameProject(renamingId, renameValue.trim());
      showToast('Renamed successfully');
    }
    setRenamingId(null);
  };

  const handleDeleteProject = (id: string) => {
    if (deleteConfirm === id) {
      deleteProject(id);
      setDeleteConfirm(null);
      setContextMenu((c) => ({ ...c, visible: false }));
      showToast('Project deleted');
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateProject(id);
    setContextMenu((c) => ({ ...c, visible: false }));
    showToast('Project duplicated');
  };

  const handleExport = (id: string) => {
    exportProjectById(id);
    setContextMenu((c) => ({ ...c, visible: false }));
    showToast('Project exported');
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      importProject(content);
      showToast('Project imported');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateNew = () => {
    if (isCreating && newProjectName.trim()) {
      createNewProject(newProjectName.trim());
      showToast('New project created');
      setIsCreating(false);
      setNewProjectName('');
    } else {
      setIsCreating(true);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, projectId });
    setDeleteConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Explorer Panel */}
      <div
        ref={explorerRef}
        className="fixed left-0 top-0 h-screen w-[320px] z-50 flex flex-col bg-[#0D1626] border-r border-white/[0.08] shadow-2xl font-sans"
        style={{ animation: 'slideInLeft 0.18s ease-out' }}
      >
        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#111827] shrink-0">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#5BE4FF]" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Project Explorer</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-[#0D1626] shrink-0">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2563EB]/20 hover:bg-[#2563EB]/40 border border-[#2563EB]/30 text-[#5BE4FF] text-[11px] font-bold transition-all cursor-pointer"
            title="New Project"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>

          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
            title="Import .aceproj file"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            Import
          </button>

          <button
            onClick={() => { saveCurrentProject(); showToast('All projects saved'); }}
            className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
            title="Save all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* New Project Inline Input */}
        {isCreating && (
          <div className="px-3 py-2 bg-[#1A2332] border-b border-white/[0.08] flex items-center gap-2 shrink-0">
            <FolderPlus className="w-4 h-4 text-[#5BE4FF] shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNew();
                if (e.key === 'Escape') { setIsCreating(false); setNewProjectName(''); }
              }}
              className="flex-1 bg-transparent text-xs text-white outline-none border-b border-[#5BE4FF]/60 pb-0.5 placeholder:text-slate-500"
            />
            <button onClick={handleCreateNew} className="text-xs text-[#5BE4FF] font-bold hover:text-white cursor-pointer">✓</button>
            <button onClick={() => { setIsCreating(false); setNewProjectName(''); }} className="text-xs text-slate-500 hover:text-white cursor-pointer">✗</button>
          </div>
        )}

        {/* Project List (scrollable) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {/* Section Label */}
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Projects ({savedProjects.length})
            </span>
          </div>

          {savedProjects.length === 0 && (
            <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
              <Folder className="w-10 h-10 text-slate-600" />
              <p className="text-xs text-slate-500">No projects yet.<br />Click New to create one.</p>
            </div>
          )}

          {savedProjects.map((project) => {
            const isActive = project.metadata.id === currentProject.metadata.id;
            const isExpanded = expandedProjects.has(project.metadata.id);
            const isRenaming = renamingId === project.metadata.id;

            return (
              <div key={project.metadata.id} className="select-none">
                {/* Project Row */}
                <div
                  className={`group flex items-center gap-1 px-2 py-1.5 cursor-pointer transition-colors rounded mx-1 my-0.5 ${
                    isActive
                      ? 'bg-[#2563EB]/20 border border-[#2563EB]/30'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                  onClick={() => toggleExpand(project.metadata.id)}
                  onDoubleClick={() => handleLoadProject(project.metadata.id)}
                  onContextMenu={(e) => handleContextMenu(e, project.metadata.id)}
                >
                  {/* Expand chevron */}
                  <button
                    className="shrink-0 text-slate-500 hover:text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(project.metadata.id); }}
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5" />
                      : <ChevronRight className="w-3.5 h-3.5" />
                    }
                  </button>

                  {/* Folder icon */}
                  {isExpanded
                    ? <FolderOpen className="w-4 h-4 text-yellow-400 shrink-0" />
                    : <Folder className="w-4 h-4 text-yellow-400/70 shrink-0" />
                  }

                  {/* Project Name / Rename Input */}
                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleCommitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommitRename();
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-[#1A2332] text-xs text-white px-1 py-0.5 rounded border border-[#5BE4FF]/60 outline-none min-w-0"
                    />
                  ) : (
                    <span className={`flex-1 text-xs truncate font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {project.metadata.name}
                    </span>
                  )}

                  {/* Active badge */}
                  {isActive && (
                    <span className="shrink-0 text-[9px] font-black text-[#5BE4FF] bg-[#5BE4FF]/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                      Active
                    </span>
                  )}

                  {/* Context menu trigger */}
                  <button
                    className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e, project.metadata.id); }}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanded: Folder Tree */}
                {isExpanded && (
                  <div className="ml-6 border-l border-white/[0.06] pl-2 pb-1">
                    {/* Meta info */}
                    <div className="px-2 py-1 flex items-center gap-2 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Updated {formatRelative(project.metadata.updatedAt)}</span>
                      <span>·</span>
                      <Cpu className="w-3 h-3" />
                      <span className="uppercase">{project.metadata.boardId}</span>
                    </div>

                    {/* Virtual files */}
                    {PROJECT_FILES.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.04] cursor-default group/file transition-colors"
                      >
                        <file.icon className={`w-3.5 h-3.5 shrink-0 ${file.color}`} />
                        <span className="text-[11px] text-slate-400 group-hover/file:text-slate-200 transition-colors">
                          {file.name}
                        </span>
                        {file.name === 'main.ino' && (
                          <span className="ml-auto text-[9px] text-slate-600 font-mono">
                            {project.generatedCode.split('\n').length}L
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Open / Load button */}
                    {!isActive && (
                      <button
                        onClick={() => handleLoadProject(project.metadata.id)}
                        className="mt-1 mx-2 w-[calc(100%-16px)] py-1 rounded-lg bg-[#2563EB]/15 hover:bg-[#2563EB]/30 border border-[#2563EB]/20 text-[#5BE4FF] text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Open Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: current project info */}
        <div className="shrink-0 border-t border-white/[0.08] px-4 py-3 bg-[#0B1220] flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center shrink-0">
            <FileCode2 className="w-3.5 h-3.5 text-[#5BE4FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{currentProject.metadata.name}</div>
            <div className="text-[10px] text-slate-500 truncate">
              Saved {formatRelative(currentProject.metadata.updatedAt)}
            </div>
          </div>
          <button
            onClick={() => { saveCurrentProject(); showToast('Saved!'); }}
            className="shrink-0 p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
            title="Save current project"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.projectId && (
        <div
          className="fixed z-[60] min-w-[180px] bg-[#1A2332] border border-white/[0.12] rounded-xl shadow-2xl py-1 font-sans"
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {(() => {
            const proj = savedProjects.find((p) => p.metadata.id === contextMenu.projectId);
            if (!proj) return null;
            return (
              <>
                <div className="px-3 py-1.5 border-b border-white/[0.08] mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[160px]">
                    {proj.metadata.name}
                  </p>
                </div>

                <ContextMenuItem icon={FolderOpen} label="Open Project" onClick={() => { handleLoadProject(contextMenu.projectId!); setContextMenu(c => ({...c, visible: false})); }} />
                <ContextMenuItem icon={Edit3} label="Rename" onClick={() => handleStartRename(proj)} />
                <ContextMenuItem icon={Copy} label="Duplicate" onClick={() => handleDuplicate(contextMenu.projectId!)} />
                <ContextMenuItem icon={Download} label="Export .aceproj" onClick={() => handleExport(contextMenu.projectId!)} />

                <div className="border-t border-white/[0.08] my-1" />

                <ContextMenuItem
                  icon={Trash2}
                  label={deleteConfirm === contextMenu.projectId ? 'Click again to confirm' : 'Delete Project'}
                  danger
                  onClick={() => handleDeleteProject(contextMenu.projectId!)}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* Hidden import file input */}
      <input
        ref={importInputRef}
        type="file"
        accept=".aceproj,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2332] border border-white/[0.12] shadow-2xl text-sm font-semibold text-white"
          style={{ animation: 'slideInLeft 0.18s ease-out' }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </>
  );
};

// Small helper component for context menu items
const ContextMenuItem: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-left ${
      danger
        ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
    }`}
  >
    <Icon className="w-3.5 h-3.5 shrink-0" />
    {label}
  </button>
);

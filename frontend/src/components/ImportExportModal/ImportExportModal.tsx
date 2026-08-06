import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileCode2,
  Archive,
  FileJson,
  FileText,
  X,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useProjectStore, OxybottProject } from '../../projects/projectStore';
import {
  exportAsIno,
  exportAsZip,
  exportAsBlocklyJson,
  exportAsOxyProject,
  exportAsPdfReport,
  importProjectFile,
} from '../../services/importExportService';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'import' | 'export';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(defaultTab);
  const { currentProject, savedProjects, setProjectName, updateWorkspace } = useProjectStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setImportStatus(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    try {
      const imported = await importProjectFile(file);

      // Create new project object in store
      const newProj: OxybottProject = {
        metadata: {
          id: `proj_${Date.now()}`,
          name: imported.name,
          boardId: imported.boardId || 'uno',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          description: `Imported from ${file.name}`,
        },
        workspaceJson: imported.workspaceJson,
        generatedCode: imported.generatedCode,
      };

      // Set directly as current project and add to saved list
      const prevSaved = JSON.parse(localStorage.getItem('oxybott_saved_projects') || localStorage.getItem('acecode_saved_projects') || '[]');
      const updatedList = [newProj, ...prevSaved];
      localStorage.setItem('oxybott_saved_projects', JSON.stringify(updatedList));

      useProjectStore.setState({ currentProject: newProj, savedProjects: updatedList });

      setImportStatus({
        type: 'success',
        message: `Successfully imported "${imported.name}"`,
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Failed to import project file.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-xl bg-[#111827] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#162032]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#5BE4FF] flex items-center justify-center shadow-md">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">Project Import & Export Center</h2>
              <p className="text-[10px] font-medium text-slate-400">Save, export, or restore your Oxybott visual projects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] bg-[#0D1626]">
          <button
            onClick={() => { setActiveTab('export'); setImportStatus(null); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'text-[#5BE4FF] border-b-2 border-[#5BE4FF] bg-white/[0.03]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Formats
          </button>
          <button
            onClick={() => { setActiveTab('import'); setImportStatus(null); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'text-[#5BE4FF] border-b-2 border-[#5BE4FF] bg-white/[0.03]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Project
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Active Project: <span className="text-[#5BE4FF]">{currentProject.metadata.name}</span></span>
                <span className="text-[10px] font-mono text-slate-500">{currentProject.generatedCode.split('\n').length} lines of C++</span>
              </div>

              {/* Export Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. .ino */}
                <ExportCard
                  icon={FileCode2}
                  iconColor="text-[#5BE4FF]"
                  title="Arduino Source (.ino)"
                  desc="Native C++ source code ready for Arduino IDE"
                  onClick={() => exportAsIno(currentProject)}
                />

                {/* 2. .zip */}
                <ExportCard
                  icon={Archive}
                  iconColor="text-amber-400"
                  title="Full Bundle (.zip)"
                  desc="Zipped archive with main.ino, workspace JSON & README"
                  onClick={() => exportAsZip(currentProject)}
                />

                {/* 3. Blockly JSON */}
                <ExportCard
                  icon={FileJson}
                  iconColor="text-emerald-400"
                  title="Blockly Workspace (.json)"
                  desc="Raw visual blocks serialization for Blockly engines"
                  onClick={() => exportAsBlocklyJson(currentProject)}
                />

                {/* 4. .oxy / .oxyproj */}
                <ExportCard
                  icon={Sparkles}
                  iconColor="text-purple-400"
                  title="Oxybott Project (.oxyproj)"
                  desc="Complete Oxybott project file preserving all state"
                  onClick={() => exportAsOxyProject(currentProject, 'oxyproj')}
                />

                {/* 5. PDF Report */}
                <ExportCard
                  icon={FileText}
                  iconColor="text-rose-400"
                  title="PDF Report (.pdf)"
                  desc="Printable documentation with C++ code & metadata"
                  onClick={() => exportAsPdfReport(currentProject)}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#5BE4FF] bg-[#5BE4FF]/10 scale-[1.01]'
                    : 'border-white/10 hover:border-white/20 bg-[#0D1626]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-[#5BE4FF]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-extrabold text-white">Drag & drop your project file here</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports <span className="text-[#5BE4FF] font-mono font-bold">.ino</span>, <span className="text-amber-400 font-mono font-bold">.zip</span>, <span className="text-emerald-400 font-mono font-bold">.json</span>, or <span className="text-purple-400 font-mono font-bold">.oxy / .oxyproj</span>
                  </p>
                </div>
                <button className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold transition-all">
                  Browse Files
                </button>
              </div>

              {/* Status Notice */}
              {importStatus && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".ino,.zip,.json,.oxy,.oxyproj,.ace,.aceproj"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export Option Card Component
const ExportCard: React.FC<{
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  title: string;
  desc: string;
  onClick: () => void;
  className?: string;
}> = ({ icon: Icon, iconColor, title, desc, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-3.5 rounded-xl bg-[#1A2332] border border-white/[0.08] hover:border-[#5BE4FF]/40 text-left transition-all cursor-pointer group hover:scale-[1.01] ${className}`}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <div className="text-xs font-extrabold text-white group-hover:text-[#5BE4FF] transition-colors">{title}</div>
        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{desc}</div>
      </div>
    </div>
  </button>
);

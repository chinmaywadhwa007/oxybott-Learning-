import { create } from 'zustand';

export interface ProjectMetadata {
  id: string;
  name: string;
  boardId: string;
  createdAt: number;
  updatedAt: number;
  description?: string;
}

export interface OxybottProject {
  metadata: ProjectMetadata;
  workspaceJson: object;
  generatedCode: string;
}

interface ProjectState {
  currentProject: OxybottProject;
  savedProjects: OxybottProject[];
  setProjectName: (name: string) => void;
  setBoardId: (boardId: string) => void;
  updateWorkspace: (json: object, code: string) => void;
  saveCurrentProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  createNewProject: (name?: string) => void;
  exportProject: () => void;
  exportProjectById: (id: string) => void;
  importProject: (jsonString: string) => void;
  loadTemplate: (templateType: 'blink' | 'traffic' | 'servo' | 'weather') => void;
}

const EMPTY_WORKSPACE_JSON = {
  blocks: {
    languageVersion: 0,
    blocks: [],
  },
};

const EMPTY_CODE = '';

const INITIAL_PROJECT: OxybottProject = {
  metadata: {
    id: 'proj_default_empty',
    name: 'Untitled Arduino Project',
    boardId: 'uno',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    description: 'Clean visual Arduino project',
  },
  workspaceJson: EMPTY_WORKSPACE_JSON,
  generatedCode: EMPTY_CODE,
};

// Hydrate saved projects from localStorage on startup
const hydrateFromStorage = (): OxybottProject[] => {
  try {
    const raw = localStorage.getItem('oxybott_saved_projects') || localStorage.getItem('acecode_saved_projects');
    if (raw) {
      const parsed = JSON.parse(raw) as OxybottProject[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy default blink project if stored
        const valid = parsed.filter((p) => p.metadata.id !== 'proj_default_blink');
        if (valid.length > 0) return valid;
      }
    }
  } catch (_) {}
  return [INITIAL_PROJECT];
};

const HYDRATED_PROJECTS = hydrateFromStorage();
const HYDRATED_CURRENT = HYDRATED_PROJECTS[0] ?? INITIAL_PROJECT;

const BLINK_TEMPLATE_WORKSPACE_JSON = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'arduino_setup_loop',
        x: 50,
        y: 50,
        inputs: {
          SETUP: {
            block: {
              type: 'pin_mode',
              fields: { PIN: 13, MODE: 'OUTPUT' },
            },
          },
          LOOP: {
            block: {
              type: 'digital_write_high',
              fields: { PIN: 13 },
              next: {
                block: {
                  type: 'delay_ms',
                  fields: { DELAY_TIME: 1000 },
                  next: {
                    block: {
                      type: 'digital_write_low',
                      fields: { PIN: 13 },
                      next: {
                        block: {
                          type: 'delay_ms',
                          fields: { DELAY_TIME: 1000 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: HYDRATED_CURRENT,
  savedProjects: HYDRATED_PROJECTS,

  setProjectName: (name: string) => {
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        metadata: { ...state.currentProject.metadata, name, updatedAt: Date.now() },
      },
    }));
  },

  setBoardId: (boardId: string) => {
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        metadata: { ...state.currentProject.metadata, boardId, updatedAt: Date.now() },
      },
    }));
  },

  updateWorkspace: (json: object, code: string) => {
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        workspaceJson: json,
        generatedCode: code,
        metadata: { ...state.currentProject.metadata, updatedAt: Date.now() },
      },
    }));
  },

  saveCurrentProject: () => {
    const { currentProject, savedProjects } = get();
    const existingIndex = savedProjects.findIndex((p) => p.metadata.id === currentProject.metadata.id);
    let updatedList: OxybottProject[];
    if (existingIndex >= 0) {
      updatedList = [...savedProjects];
      updatedList[existingIndex] = currentProject;
    } else {
      updatedList = [currentProject, ...savedProjects];
    }
    set({ savedProjects: updatedList });
    localStorage.setItem('oxybott_saved_projects', JSON.stringify(updatedList));
  },

  loadProject: (id: string) => {
    const { savedProjects } = get();
    const found = savedProjects.find((p) => p.metadata.id === id);
    if (found) {
      set({ currentProject: found });
    }
  },

  deleteProject: (id: string) => {
    set((state) => {
      const filtered = state.savedProjects.filter((p) => p.metadata.id !== id);
      localStorage.setItem('oxybott_saved_projects', JSON.stringify(filtered));
      return { savedProjects: filtered };
    });
  },

  duplicateProject: (id: string) => {
    const { savedProjects } = get();
    const target = savedProjects.find((p) => p.metadata.id === id);
    if (target) {
      const dup: OxybottProject = {
        ...target,
        metadata: {
          ...target.metadata,
          id: `proj_${Date.now()}`,
          name: `${target.metadata.name} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
      set((state) => {
        const nextList = [dup, ...state.savedProjects];
        localStorage.setItem('oxybott_saved_projects', JSON.stringify(nextList));
        return { savedProjects: nextList, currentProject: dup };
      });
    }
  },

  renameProject: (id: string, newName: string) => {
    set((state) => {
      const updatedList = state.savedProjects.map((p) =>
        p.metadata.id === id
          ? { ...p, metadata: { ...p.metadata, name: newName, updatedAt: Date.now() } }
          : p
      );
      localStorage.setItem('oxybott_saved_projects', JSON.stringify(updatedList));
      const updatedCurrent =
        state.currentProject.metadata.id === id
          ? { ...state.currentProject, metadata: { ...state.currentProject.metadata, name: newName, updatedAt: Date.now() } }
          : state.currentProject;
      return { savedProjects: updatedList, currentProject: updatedCurrent };
    });
  },

  createNewProject: (name?: string) => {
    const newProj: OxybottProject = {
      metadata: {
        id: `proj_${Date.now()}`,
        name: name || 'Untitled Project',
        boardId: 'uno',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: 'New Oxybott project',
      },
      workspaceJson: { blocks: { languageVersion: 0, blocks: [] } },
      generatedCode: '// New project\nvoid setup() {\n}\n\nvoid loop() {\n}\n',
    };
    set((state) => {
      const nextList = [newProj, ...state.savedProjects];
      localStorage.setItem('oxybott_saved_projects', JSON.stringify(nextList));
      return { savedProjects: nextList, currentProject: newProj };
    });
  },

  exportProject: () => {
    const { currentProject } = get();
    const blob = new Blob([JSON.stringify(currentProject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.metadata.name.toLowerCase().replace(/\s+/g, '_')}.oxyproj`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportProjectById: (id: string) => {
    const { savedProjects } = get();
    const project = savedProjects.find((p) => p.metadata.id === id);
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.metadata.name.toLowerCase().replace(/\s+/g, '_')}.oxyproj`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importProject: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as OxybottProject;
      if (parsed.metadata && parsed.workspaceJson) {
        parsed.metadata.id = `proj_${Date.now()}`;
        set((state) => {
          const nextList = [parsed, ...state.savedProjects];
          localStorage.setItem('oxybott_saved_projects', JSON.stringify(nextList));
          return { savedProjects: nextList, currentProject: parsed };
        });
      }
    } catch (_err) {
      console.error('Invalid Oxybott project file');
    }
  },

  loadTemplate: (templateType) => {
    let name = 'Template Project';
    if (templateType === 'blink') name = 'Blink LED';
    else if (templateType === 'traffic') name = 'Traffic Light System';
    else if (templateType === 'servo') name = 'Servo Sweep';
    else if (templateType === 'weather') name = 'Weather Station LCD';

    const proj: OxybottProject = {
      metadata: {
        id: `proj_${templateType}_${Date.now()}`,
        name,
        boardId: 'uno',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: `Preset educational template: ${name}`,
      },
      workspaceJson: templateType === 'blink' ? BLINK_TEMPLATE_WORKSPACE_JSON : EMPTY_WORKSPACE_JSON,
      generatedCode: '',
    };
    set({ currentProject: proj });
  },
}));

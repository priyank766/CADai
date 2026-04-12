import { create } from 'zustand';

/**
 * Scene store -- single source of truth for all 3D scene data.
 * 
 * All viewport changes flow through this store. The AI agent
 * also applies its actions through store methods.
 */

const DEFAULT_MATERIALS = {
  steel: { color: '#A8A9AD', metalness: 0.8, roughness: 0.3, opacity: 1.0 },
  aluminum: { color: '#C0C0C0', metalness: 0.7, roughness: 0.4, opacity: 1.0 },
  plastic: { color: '#2D2D2D', metalness: 0.0, roughness: 0.6, opacity: 1.0 },
  default: { color: '#6b7280', metalness: 0.0, roughness: 0.5, opacity: 1.0 },
};

let idCounter = 0;
const generateId = () => `obj_${++idCounter}`;

const useSceneStore = create((set, get) => ({
  // Scene objects
  objects: [],

  // Selection
  selectedId: null,

  // Transform mode
  transformMode: 'translate', // 'translate' | 'rotate' | 'scale'

  // Agent state
  agentActions: [],
  agentLoading: false,
  agentError: null,

  // History for undo/redo
  history: [],
  historyIndex: -1,

  // ---- Object operations ----

  addObject: (obj) => set((state) => {
    const id = obj.id || generateId();
    const newObj = {
      id,
      name: obj.name || `Object ${state.objects.length + 1}`,
      type: obj.type || 'box',
      position: obj.position || [0, 0, 0],
      rotation: obj.rotation || [0, 0, 0],
      scale: obj.scale || [1, 1, 1],
      dimensions: obj.dimensions || { width: 1, height: 1, depth: 1 },
      material: obj.material || { ...DEFAULT_MATERIALS.default },
      visible: obj.visible !== undefined ? obj.visible : true,
      locked: obj.locked || false,
    };
    return {
      objects: [...state.objects, newObj],
      selectedId: id,
      history: [...state.history.slice(0, state.historyIndex + 1), { type: 'add', object: newObj }],
      historyIndex: state.historyIndex + 1,
    };
  }),

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map((obj) => {
      if (obj.id !== id) return obj;
      const updated = { ...obj };
      if (updates.position) updated.position = [...updates.position];
      if (updates.rotation) updated.rotation = [...updates.rotation];
      if (updates.scale) updated.scale = [...updates.scale];
      if (updates.material) updated.material = { ...updated.material, ...updates.material };
      if (updates.name) updated.name = updates.name;
      if (updates.dimensions) updated.dimensions = { ...updated.dimensions, ...updates.dimensions };
      if (updates.visible !== undefined) updated.visible = updates.visible;
      return updated;
    }),
  })),

  removeObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),

  duplicateObject: (id, offset = [2, 0, 0], newName = null, newId = null) => set((state) => {
    const source = state.objects.find((obj) => obj.id === id);
    if (!source) return state;

    const dupId = newId || generateId();
    const dup = {
      ...source,
      id: dupId,
      name: newName || `${source.name} (copy)`,
      position: [
        source.position[0] + offset[0],
        source.position[1] + offset[1],
        source.position[2] + offset[2],
      ],
      material: { ...source.material },
      dimensions: { ...source.dimensions },
    };
    return {
      objects: [...state.objects, dup],
      selectedId: dupId,
    };
  }),

  selectObject: (id) => set({ selectedId: id }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  clearScene: () => set({
    objects: [],
    selectedId: null,
    agentActions: [],
  }),

  // ---- Agent actions ----

  setAgentLoading: (loading) => set({ agentLoading: loading }),

  addAgentAction: (action) => set((state) => ({
    agentActions: [...state.agentActions, action],
  })),

  setAgentError: (error) => set({ agentError: error }),

  clearAgentActions: () => set({ agentActions: [], agentError: null }),

  /**
   * Apply a list of actions from the AI agent to the scene.
   * Each action is a tool result with 'tool' and relevant data.
   */
  applyAgentActions: (actions) => {
    const state = get();
    const idMap = {}; // maps $0, $1 etc. to real IDs

    actions.forEach((action, idx) => {
      switch (action.tool) {
        case 'create_shape': {
          const obj = action.object;
          get().addObject(obj);
          // Track created ID for cross-references
          idMap[`$${idx}`] = obj.id;
          break;
        }
        case 'modify_shape': {
          let targetId = action.object_id;
          if (targetId?.startsWith('$')) targetId = idMap[targetId] || targetId;
          if (action.updates) {
            get().updateObject(targetId, action.updates);
          }
          break;
        }
        case 'delete_object': {
          let targetId = action.object_id;
          if (targetId?.startsWith('$')) targetId = idMap[targetId] || targetId;
          get().removeObject(targetId);
          break;
        }
        case 'duplicate_object': {
          let sourceId = action.source_id;
          if (sourceId?.startsWith('$')) sourceId = idMap[sourceId] || sourceId;
          get().duplicateObject(sourceId, action.offset, action.new_name, action.new_id);
          if (action.new_id) idMap[`$${idx}`] = action.new_id;
          break;
        }
        case 'group_objects': {
          // For now, just log it -- full grouping in Phase 2
          break;
        }
        default:
          break;
      }
    });
  },

  // ---- Scene state export (for sending to backend) ----

  getSceneState: () => {
    const state = get();
    return {
      objects: state.objects,
      selected_object_id: state.selectedId,
      camera_position: [10, 10, 10],
    };
  },
}));

export default useSceneStore;

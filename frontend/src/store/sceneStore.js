import { create } from 'zustand';

/**
 * Scene store -- single source of truth for all 3D scene data.
 *
 * All viewport changes flow through this store. The AI agent
 * also applies its actions through store methods.
 *
 * Undo/redo uses full-state snapshots. Simple and correct.
 */

const DEFAULT_MATERIALS = {
  steel: { color: '#A8A9AD', metalness: 0.8, roughness: 0.3, opacity: 1.0 },
  aluminum: { color: '#C0C0C0', metalness: 0.7, roughness: 0.4, opacity: 1.0 },
  plastic: { color: '#2D2D2D', metalness: 0.0, roughness: 0.6, opacity: 1.0 },
  default: { color: '#6b7280', metalness: 0.0, roughness: 0.5, opacity: 1.0 },
};

let idCounter = 0;
const generateId = () => `obj_${++idCounter}`;

const HISTORY_LIMIT = 100;

// Deep-clone objects array so history entries are independent
const cloneObjects = (objects) =>
  objects.map((o) => ({
    ...o,
    position: [...o.position],
    rotation: [...o.rotation],
    scale: [...o.scale],
    dimensions: { ...o.dimensions },
    material: { ...o.material },
  }));

const useSceneStore = create((set, get) => {
  /**
   * Snapshot the current objects state into history. Drops any redo entries
   * beyond historyIndex so a new edit forks cleanly.
   */
  const pushHistory = (state) => {
    const snapshot = cloneObjects(state.objects);
    const trimmed = state.history.slice(0, state.historyIndex + 1);
    trimmed.push(snapshot);
    const overflow = Math.max(0, trimmed.length - HISTORY_LIMIT);
    const next = overflow ? trimmed.slice(overflow) : trimmed;
    return { history: next, historyIndex: next.length - 1 };
  };

  return {
    objects: [],
    selectedId: null,
    secondaryId: null, // used to pair a second object for CSG / measure ops
    transformMode: 'translate', // 'translate' | 'rotate' | 'scale'
    snap: { enabled: false, translate: 1, rotate: 15, scale: 0.1 }, // deg for rotate
    section: { enabled: false, axis: 'x', offset: 0, invert: false },

    agentActions: [],
    agentLoading: false,
    agentError: null,

    history: [[]],     // start with an empty-scene snapshot so undo to blank works
    historyIndex: 0,

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
        _geometry: obj._geometry,
      };
      const nextState = { ...state, objects: [...state.objects, newObj], selectedId: id };
      return { ...nextState, ...pushHistory(nextState) };
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

    // Call after an interactive transform gesture completes to record it
    commitHistory: () => set((state) => pushHistory(state)),

    removeObject: (id) => set((state) => {
      const nextState = {
        ...state,
        objects: state.objects.filter((obj) => obj.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    /**
     * Linear array: duplicate `count` copies along axis at `spacing` intervals.
     * Includes the original; adds count-1 new copies. One undo entry.
     */
    linearArray: (id, count, spacing, axis = 'x') => set((state) => {
      if (count < 2) return state;
      const source = state.objects.find((o) => o.id === id);
      if (!source) return state;

      const axisIdx = { x: 0, y: 1, z: 2 }[axis] ?? 0;
      const newObjs = [];
      for (let i = 1; i < count; i++) {
        const offset = [0, 0, 0];
        offset[axisIdx] = spacing * i;
        const dupId = `obj_${Date.now().toString(36)}_${i}`;
        newObjs.push({
          ...source,
          id: dupId,
          name: `${source.name} #${i + 1}`,
          position: [
            source.position[0] + offset[0],
            source.position[1] + offset[1],
            source.position[2] + offset[2],
          ],
          rotation: [...source.rotation],
          scale: [...source.scale],
          dimensions: { ...source.dimensions },
          material: { ...source.material },
        });
      }
      const nextState = {
        ...state,
        objects: [...state.objects, ...newObjs],
      };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    /**
     * Circular array: place `count` copies around a center point (default origin)
     * on a plane normal to `axis` ('x'|'y'|'z'), sweeping `angle` degrees total.
     * Uses full 360° if angle is 360. Each copy is also rotated to face the center
     * (like a bolt circle). One undo entry.
     */
    circularArray: (id, count, angleDeg, axis = 'y', center = [0, 0, 0]) => set((state) => {
      if (count < 2) return state;
      const source = state.objects.find((o) => o.id === id);
      if (!source) return state;

      const axisIdx = { x: 0, y: 1, z: 2 }[axis] ?? 1;
      const full = Math.abs(angleDeg - 360) < 0.01;
      const step = (angleDeg * Math.PI / 180) / (full ? count : count - 1);

      // Work out the in-plane axes (a, b) so we sweep around the rotation axis
      const a = axisIdx === 0 ? 1 : 0; // y-plane uses x-z, x-plane uses y-z, z-plane uses x-y
      const b = axisIdx === 0 ? 2 : (axisIdx === 1 ? 2 : 1);

      // Vector from center to source in the plane
      const vx = source.position[a] - center[a];
      const vz = source.position[b] - center[b];
      const r = Math.sqrt(vx * vx + vz * vz);
      const baseAngle = Math.atan2(vz, vx);

      const newObjs = [];
      for (let i = 1; i < count; i++) {
        const theta = baseAngle + step * i;
        const pos = [...source.position];
        pos[a] = center[a] + Math.cos(theta) * r;
        pos[b] = center[b] + Math.sin(theta) * r;

        const rot = [...source.rotation];
        rot[axisIdx] = source.rotation[axisIdx] + step * i;

        const dupId = `obj_${Date.now().toString(36)}_c${i}`;
        newObjs.push({
          ...source,
          id: dupId,
          name: `${source.name} #${i + 1}`,
          position: pos,
          rotation: rot,
          scale: [...source.scale],
          dimensions: { ...source.dimensions },
          material: { ...source.material },
        });
      }
      const nextState = { ...state, objects: [...state.objects, ...newObjs] };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    /**
     * Mirror an object across a world-space plane through the origin with the
     * given normal axis ('x'|'y'|'z'). Creates a new object and keeps the
     * original. Reflects position component and flips the corresponding scale
     * axis so transform gizmos stay well-formed.
     */
    mirrorObject: (id, axis = 'x') => set((state) => {
      const source = state.objects.find((o) => o.id === id);
      if (!source) return state;
      const axisIdx = { x: 0, y: 1, z: 2 }[axis] ?? 0;

      const pos = [...source.position];
      pos[axisIdx] = -pos[axisIdx];
      const scale = [...source.scale];
      scale[axisIdx] = -scale[axisIdx];

      const newObj = {
        ...source,
        id: `obj_${Date.now().toString(36)}_m`,
        name: `${source.name} (mirror ${axis.toUpperCase()})`,
        position: pos,
        rotation: [...source.rotation],
        scale,
        dimensions: { ...source.dimensions },
        material: { ...source.material },
      };
      const nextState = { ...state, objects: [...state.objects, newObj], selectedId: newObj.id };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    /**
     * Align object `movingId` to object `refId` along `axis` at `mode`.
     *   mode: 'min' | 'center' | 'max'
     * Uses inspectObject-style bbox math inline to avoid a circular import.
     * Translates moving object so the chosen edge/center matches the reference's.
     */
    alignObjects: (movingId, refId, axis, mode) => set((state) => {
      const moving = state.objects.find((o) => o.id === movingId);
      const ref = state.objects.find((o) => o.id === refId);
      if (!moving || !ref) return state;

      // AABB approximation from dimensions + scale + position (works for primitives
      // and 'mesh' objects because their geometry is already world-space baked).
      const bbox = (o) => {
        const d = o.dimensions || {};
        let w = 1, h = 1, dp = 1;
        switch (o.type) {
          case 'box':      w = d.width ?? 1; h = d.height ?? 1; dp = d.depth ?? 1; break;
          case 'sphere':   w = h = dp = 2 * (d.radius ?? 1); break;
          case 'cylinder': w = dp = 2 * Math.max(d.radiusTop ?? d.radius ?? 1, d.radiusBottom ?? d.radius ?? 1); h = d.height ?? 1; break;
          case 'cone':     w = dp = 2 * (d.radiusBottom ?? d.radius ?? 1); h = d.height ?? 1; break;
          case 'torus':    w = dp = 2 * ((d.radius ?? 1) + (d.tube ?? 0.3)); h = 2 * (d.tube ?? 0.3); break;
          case 'plane':    w = d.width ?? 1; h = 0.001; dp = d.height ?? 1; break;
          case 'mesh':
            if (o._geometry) {
              o._geometry.computeBoundingBox();
              const bb = o._geometry.boundingBox;
              return { min: bb.min.toArray(), max: bb.max.toArray() }; // already world-space
            }
            break;
        }
        const sx = Math.abs(o.scale[0]) * w / 2;
        const sy = Math.abs(o.scale[1]) * h / 2;
        const sz = Math.abs(o.scale[2]) * dp / 2;
        return {
          min: [o.position[0] - sx, o.position[1] - sy, o.position[2] - sz],
          max: [o.position[0] + sx, o.position[1] + sy, o.position[2] + sz],
        };
      };

      const axisIdx = { x: 0, y: 1, z: 2 }[axis] ?? 0;
      const bm = bbox(moving);
      const br = bbox(ref);

      let target;
      if (mode === 'min') target = br.min[axisIdx] + (bm.max[axisIdx] - bm.min[axisIdx]) / 2;
      else if (mode === 'max') target = br.max[axisIdx] - (bm.max[axisIdx] - bm.min[axisIdx]) / 2;
      else target = (br.min[axisIdx] + br.max[axisIdx]) / 2;

      const currentCenter = (bm.min[axisIdx] + bm.max[axisIdx]) / 2;
      const delta = target - currentCenter;

      const newPos = [...moving.position];
      newPos[axisIdx] += delta;
      const nextState = {
        ...state,
        objects: state.objects.map((o) => o.id === movingId ? { ...o, position: newPos } : o),
      };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    /** Nudge selected object by a world-space delta; no history entry per step. */
    nudgeObject: (id, delta) => set((state) => ({
      objects: state.objects.map((o) => {
        if (o.id !== id) return o;
        return {
          ...o,
          position: [o.position[0] + delta[0], o.position[1] + delta[1], o.position[2] + delta[2]],
        };
      }),
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
      const nextState = { ...state, objects: [...state.objects, dup], selectedId: dupId };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    selectObject: (id, { additive = false } = {}) => set((state) => {
      if (!additive) return { selectedId: id, secondaryId: null };
      if (!id || id === state.selectedId) return { secondaryId: null };
      return { secondaryId: id };
    }),

    /** Replace geometry-baked objects; used by CSG. */
    replaceObjects: (removeIds, add) => set((state) => {
      const filtered = state.objects.filter((o) => !removeIds.includes(o.id));
      const newObj = { ...add, id: `obj_${Date.now().toString(36)}` };
      const nextState = {
        ...state,
        objects: [...filtered, newObj],
        selectedId: newObj.id,
        secondaryId: null,
      };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    setTransformMode: (mode) => set({ transformMode: mode }),

    toggleSnap: () => set((state) => ({ snap: { ...state.snap, enabled: !state.snap.enabled } })),
    setSnapValues: (partial) => set((state) => ({ snap: { ...state.snap, ...partial } })),

    toggleSection: () => set((state) => ({ section: { ...state.section, enabled: !state.section.enabled } })),
    setSection: (partial) => set((state) => ({ section: { ...state.section, ...partial } })),

    clearScene: () => set((state) => {
      const nextState = { ...state, objects: [], selectedId: null, agentActions: [] };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    /** Replace the entire scene -- used by project load. */
    loadObjects: (objects) => set((state) => {
      const cloned = cloneObjects(objects);
      const nextState = { ...state, objects: cloned, selectedId: null };
      return { ...nextState, ...pushHistory(nextState) };
    }),

    toggleObjectVisibility: (id) => set((state) => ({
      objects: state.objects.map((o) =>
        o.id === id ? { ...o, visible: o.visible === false ? true : false } : o,
      ),
    })),

    // ---- Undo / redo ----

    undo: () => set((state) => {
      if (state.historyIndex <= 0) return state;
      const idx = state.historyIndex - 1;
      return {
        objects: cloneObjects(state.history[idx]),
        historyIndex: idx,
        selectedId: null,
      };
    }),

    redo: () => set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const idx = state.historyIndex + 1;
      return {
        objects: cloneObjects(state.history[idx]),
        historyIndex: idx,
        selectedId: null,
      };
    }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

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
     * The whole batch is one undo unit.
     */
    applyAgentActions: (actions) => {
      const idMap = {};

      actions.forEach((action, idx) => {
        switch (action.tool) {
          case 'create_shape': {
            const obj = action.object;
            get().addObject(obj);
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
  };
});

export default useSceneStore;

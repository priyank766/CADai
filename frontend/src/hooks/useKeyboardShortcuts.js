import { useEffect } from 'react';
import useSceneStore from '../store/sceneStore';

// Module-level in-memory clipboard. Not persisted; per-tab.
let clipboard = null;

/**
 * Global keyboard shortcuts. Mirrors the conventions of Blender / Fusion 360.
 *
 *   G / R / S        -> translate / rotate / scale
 *   Delete / Backspace -> remove selected
 *   Ctrl+Z / Ctrl+Y  -> undo / redo (Ctrl+Shift+Z also redoes)
 *   Ctrl+D           -> duplicate selected
 *   Escape           -> deselect
 */
export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in an input / textarea
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      const store = useSceneStore.getState();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (ctrl && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        store.redo();
        return;
      }
      if (ctrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (store.selectedId) store.duplicateObject(store.selectedId);
        return;
      }

      if (ctrl && (e.key === 'c' || e.key === 'C')) {
        const obj = store.objects.find((o) => o.id === store.selectedId);
        if (obj) {
          clipboard = {
            ...obj,
            position: [...obj.position],
            rotation: [...obj.rotation],
            scale: [...obj.scale],
            dimensions: { ...obj.dimensions },
            material: { ...obj.material },
          };
        }
        return;
      }
      if (ctrl && (e.key === 'v' || e.key === 'V')) {
        if (clipboard) {
          e.preventDefault();
          store.addObject({
            ...clipboard,
            id: undefined, // let the store mint a fresh id
            name: `${clipboard.name} (paste)`,
            position: [clipboard.position[0] + 2, clipboard.position[1], clipboard.position[2]],
          });
        }
        return;
      }

      // Arrow-key nudge along world axes (X = left/right, Z = up/down on the grid,
      // Alt+Up/Down = Y). Uses snap.translate when snap is on, else 1mm. Shift x10.
      const arrowMap = {
        ArrowLeft:  [-1, 0, 0],
        ArrowRight: [ 1, 0, 0],
        ArrowUp:    [ 0, 0, -1],
        ArrowDown:  [ 0, 0,  1],
      };
      if (arrowMap[e.key] && store.selectedId) {
        e.preventDefault();
        const base = store.snap.enabled ? store.snap.translate : 1;
        const step = base * (e.shiftKey ? 10 : 1);
        let [dx, dy, dz] = arrowMap[e.key];
        if (e.altKey) { dy = -dz; dz = 0; } // Alt swaps Z-axis keys to Y
        store.nudgeObject(store.selectedId, [dx * step, dy * step, dz * step]);
        store.commitHistory();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedId) {
          e.preventDefault();
          store.removeObject(store.selectedId);
        }
        return;
      }
      if (e.key === 'Escape') {
        store.selectObject(null);
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        store.setTransformMode('translate');
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        store.setTransformMode('rotate');
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        if (ctrl) return; // leave Ctrl+S for future save
        store.setTransformMode('scale');
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

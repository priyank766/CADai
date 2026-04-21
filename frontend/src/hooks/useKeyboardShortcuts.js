import { useEffect } from 'react';
import useSceneStore from '../store/sceneStore';

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

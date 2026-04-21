import { useEffect, useMemo, useRef, useState } from 'react';
import useSceneStore from '../../store/sceneStore';
import { exportScene } from '../../services/exporter';
import { saveProject, pickProjectFile } from '../../services/project';

/**
 * Command palette -- Ctrl+K / Cmd+K launcher.
 * Searches a flat list of actions, arrow keys to navigate, Enter to run.
 */

const SHAPE_DIMS = {
  box: { width: 2, height: 2, depth: 2 },
  cylinder: { radiusTop: 1, radiusBottom: 1, height: 2, radius: 1 },
  sphere: { radius: 1 },
  cone: { radiusBottom: 1, height: 2 },
  torus: { radius: 1, tube: 0.3 },
  plane: { width: 4, height: 4 },
};

function buildCommands(store, close) {
  const { addObject, removeObject, duplicateObject, clearScene, undo, redo,
          setTransformMode, selectObject, loadObjects, objects, selectedId,
          snap, toggleSnap } = store;

  const addShape = (type) => () => {
    addObject({
      type,
      name: `${type[0].toUpperCase() + type.slice(1)} ${Date.now().toString(36).slice(-3)}`,
      dimensions: { ...SHAPE_DIMS[type] },
      position: [0, (SHAPE_DIMS[type]?.height || 1) / 2, 0],
    });
  };

  const cmds = [
    { id: 'add-box', label: 'Add Box', group: 'Create', run: addShape('box') },
    { id: 'add-cylinder', label: 'Add Cylinder', group: 'Create', run: addShape('cylinder') },
    { id: 'add-sphere', label: 'Add Sphere', group: 'Create', run: addShape('sphere') },
    { id: 'add-cone', label: 'Add Cone', group: 'Create', run: addShape('cone') },
    { id: 'add-torus', label: 'Add Torus', group: 'Create', run: addShape('torus') },
    { id: 'add-plane', label: 'Add Plane', group: 'Create', run: addShape('plane') },

    { id: 'mode-translate', label: 'Transform: Translate', shortcut: 'G', group: 'Transform',
      run: () => setTransformMode('translate') },
    { id: 'mode-rotate', label: 'Transform: Rotate', shortcut: 'R', group: 'Transform',
      run: () => setTransformMode('rotate') },
    { id: 'mode-scale', label: 'Transform: Scale', shortcut: 'S', group: 'Transform',
      run: () => setTransformMode('scale') },

    { id: 'toggle-snap', label: `Grid snap: ${snap.enabled ? 'On' : 'Off'}`, group: 'View', run: toggleSnap },

    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', group: 'Edit', run: undo },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', group: 'Edit', run: redo },

    { id: 'duplicate', label: 'Duplicate selected', shortcut: 'Ctrl+D', group: 'Edit',
      disabled: !selectedId, run: () => selectedId && duplicateObject(selectedId) },
    { id: 'delete', label: 'Delete selected', shortcut: 'Del', group: 'Edit',
      disabled: !selectedId, run: () => selectedId && removeObject(selectedId) },
    { id: 'deselect', label: 'Deselect', shortcut: 'Esc', group: 'Edit',
      run: () => selectObject(null) },

    { id: 'save', label: 'Save project (.cadai.json)', group: 'File',
      disabled: objects.length === 0, run: () => saveProject(objects) },
    { id: 'load', label: 'Load project', group: 'File',
      run: async () => {
        const loaded = await pickProjectFile().catch((err) => { alert(err.message); return null; });
        if (loaded) loadObjects(loaded);
      } },
    { id: 'export-stl', label: 'Export STL', group: 'File',
      disabled: objects.length === 0, run: () => exportScene(objects, 'stl') },
    { id: 'export-obj', label: 'Export OBJ', group: 'File',
      disabled: objects.length === 0, run: () => exportScene(objects, 'obj') },
    { id: 'export-gltf', label: 'Export glTF', group: 'File',
      disabled: objects.length === 0, run: () => exportScene(objects, 'gltf') },

    { id: 'clear', label: 'Clear scene', group: 'Danger',
      disabled: objects.length === 0, run: clearScene },
  ];

  return cmds.map((c) => ({
    ...c,
    run: async () => {
      close();
      try { await c.run(); }
      catch (err) { alert(err.message || String(err)); }
    },
  }));
}

function scoreMatch(haystack, query) {
  if (!query) return 1;
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();
  if (h.includes(q)) return 2 - (h.indexOf(q) / h.length);

  // subsequence match
  let hi = 0;
  for (const ch of q) {
    hi = h.indexOf(ch, hi);
    if (hi === -1) return 0;
    hi++;
  }
  return 1;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  const store = useSceneStore();
  const commands = useMemo(() => buildCommands(store, () => setOpen(false)), [store]);

  // Toggle on Ctrl+K / Cmd+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    return commands
      .map((c) => ({ c, s: scoreMatch(c.label + ' ' + c.group, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }, [commands, query]);

  useEffect(() => {
    if (cursor >= filtered.length) setCursor(Math.max(0, filtered.length - 1));
  }, [filtered, cursor]);

  if (!open) return null;

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[cursor];
      if (cmd && !cmd.disabled) cmd.run();
    }
  };

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 92vw)',
          background: 'var(--surface-1, #1e1e22)',
          border: '1px solid var(--border, #333)',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          fontSize: 'var(--text-sm, 13px)',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
          onKeyDown={onInputKey}
          placeholder="Type a command..."
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text-primary, #eee)',
            padding: '14px 16px',
            fontSize: 14,
            borderBottom: '1px solid var(--border, #333)',
          }}
        />
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '4px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text-tertiary, #888)' }}>No matches.</div>
          ) : (
            filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                onMouseEnter={() => setCursor(i)}
                onClick={() => !cmd.disabled && cmd.run()}
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: cmd.disabled ? 'not-allowed' : 'pointer',
                  background: i === cursor ? 'var(--surface-2, #2a2a2e)' : 'transparent',
                  color: cmd.disabled ? 'var(--text-tertiary, #666)' : 'var(--text-primary, #eee)',
                  opacity: cmd.disabled ? 0.5 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary, #888)',
                    minWidth: 60,
                    letterSpacing: 0.6,
                  }}
                >
                  {cmd.group}
                </span>
                <span style={{ flex: 1 }}>{cmd.label}</span>
                {cmd.shortcut && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: 11,
                      color: 'var(--text-tertiary, #888)',
                      border: '1px solid var(--border, #333)',
                      borderRadius: 3,
                      padding: '1px 6px',
                    }}
                  >
                    {cmd.shortcut}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div
          style={{
            padding: '6px 12px',
            borderTop: '1px solid var(--border, #333)',
            fontSize: 11,
            color: 'var(--text-tertiary, #888)',
            display: 'flex',
            gap: 12,
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}

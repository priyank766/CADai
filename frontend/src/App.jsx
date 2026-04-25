import { useEffect, useState } from 'react';
import Viewport from './components/Viewport/Viewport';
import Toolbar from './components/Toolbar/Toolbar';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import ObjectTree from './components/ObjectTree/ObjectTree';
import AgentPanel from './components/AgentPanel/AgentPanel';
import CommandPalette from './components/CommandPalette/CommandPalette';
import BooleanBar from './components/BooleanBar/BooleanBar';
import SectionBar from './components/SectionBar/SectionBar';
import ShortcutsOverlay from './components/ShortcutsOverlay/ShortcutsOverlay';
import StatusBar from './components/StatusBar/StatusBar';
import useSceneStore from './store/sceneStore';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { checkHealth } from './services/api';
import { exportScene } from './services/exporter';
import { saveProject, pickProjectFile } from './services/project';
import { pickAndImportSTL } from './services/importer';

function App() {
  const setTransformMode = useSceneStore((s) => s.setTransformMode);
  const transformMode = useSceneStore((s) => s.transformMode);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const historyIndex = useSceneStore((s) => s.historyIndex);
  const history = useSceneStore((s) => s.history);
  const objects = useSceneStore((s) => s.objects);
  const loadObjects = useSceneStore((s) => s.loadObjects);
  const addObject = useSceneStore((s) => s.addObject);
  const snap = useSceneStore((s) => s.snap);
  const toggleSnap = useSceneStore((s) => s.toggleSnap);
  const [exportOpen, setExportOpen] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    checkHealth().catch((err) => {
      console.warn('Backend connection failed on startup:', err);
    });
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = () => {
    try {
      saveProject(objects);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLoad = async () => {
    try {
      const loaded = await pickProjectFile();
      if (loaded) loadObjects(loaded);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImportSTL = async () => {
    try {
      const obj = await pickAndImportSTL();
      if (obj) addObject(obj);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExport = async (format) => {
    setExportOpen(false);
    try {
      await exportScene(objects, format);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__title">
          CAD<span>ai</span>
        </div>

        <div className="transform-modes">
          {['translate', 'rotate', 'scale'].map((mode) => (
            <button
              key={mode}
              className={`transform-modes__btn ${transformMode === mode ? 'transform-modes__btn--active' : ''}`}
              onClick={() => setTransformMode(mode)}
              title={`${mode[0].toUpperCase()} — ${mode}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'var(--space-3)' }}>
          <BooleanBar />
        </div>

        <div style={{ marginLeft: 'var(--space-3)' }}>
          <SectionBar />
        </div>

        <div className="transform-modes" style={{ marginLeft: 'var(--space-3)' }}>
          <button
            className={`transform-modes__btn ${snap.enabled ? 'transform-modes__btn--active' : ''}`}
            onClick={toggleSnap}
            title={`Grid snap ${snap.enabled ? 'on' : 'off'}: ${snap.translate}mm / ${snap.rotate}° / ${snap.scale}`}
          >
            Snap {snap.enabled ? 'On' : 'Off'}
          </button>
        </div>

        <div className="transform-modes" style={{ marginLeft: 'var(--space-3)' }}>
          <button
            className="transform-modes__btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            className="transform-modes__btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', position: 'relative' }}>
          <button className="transform-modes__btn" onClick={handleLoad} title="Load project">
            Load
          </button>
          <button className="transform-modes__btn" onClick={handleImportSTL} title="Import STL model">
            Import STL
          </button>
          <button
            className="transform-modes__btn"
            onClick={handleSave}
            disabled={objects.length === 0}
            title="Save project as .cadai.json"
          >
            Save
          </button>
          <button
            className="transform-modes__btn"
            onClick={() => setExportOpen((v) => !v)}
            disabled={objects.length === 0}
            title="Export scene"
          >
            Export
          </button>
          {exportOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 4px)',
                background: 'var(--surface-1, #1e1e22)',
                border: '1px solid var(--border, #333)',
                borderRadius: 4,
                minWidth: 140,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {['stl', 'obj', 'gltf'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary, #eee)',
                    padding: '8px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm, 13px)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2, #2a2a2e)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <Toolbar />

      <Viewport />

      <aside className="right-panel">
        <PropertyPanel />
        <ObjectTree />
        <AgentPanel />
      </aside>

      <CommandPalette />
      <ShortcutsOverlay />
      <StatusBar />
    </div>
  );
}

export default App;

import { useEffect } from 'react';
import Viewport from './components/Viewport/Viewport';
import Toolbar from './components/Toolbar/Toolbar';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import ObjectTree from './components/ObjectTree/ObjectTree';
import AgentPanel from './components/AgentPanel/AgentPanel';
import useSceneStore from './store/sceneStore';
import { checkHealth } from './services/api';

function App() {
  const setTransformMode = useSceneStore((s) => s.setTransformMode);
  const transformMode = useSceneStore((s) => s.transformMode);
  
  // Health check on mount
  useEffect(() => {
    checkHealth().catch((err) => {
      console.warn('Backend connection failed on startup:', err);
    });
  }, []);

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
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <Toolbar />
      
      <Viewport />
      
      <aside className="right-panel">
        <PropertyPanel />
        <ObjectTree />
        <AgentPanel />
      </aside>
    </div>
  );
}

export default App;

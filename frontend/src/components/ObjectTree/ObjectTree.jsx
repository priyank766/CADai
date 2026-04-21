import useSceneStore from '../../store/sceneStore';

/**
 * Object tree -- scene hierarchy panel showing all objects.
 * Click a row to select; click the eye to toggle visibility.
 */
export default function ObjectTree() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const toggleObjectVisibility = useSceneStore((s) => s.toggleObjectVisibility);

  return (
    <div className="panel-section" style={{ maxHeight: '200px', overflowY: 'auto' }}>
      <div className="panel-section__header">
        <span className="panel-section__title">Scene</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          {objects.length}
        </span>
      </div>
      {objects.length === 0 ? (
        <div className="object-tree__empty">
          Scene is empty. Add shapes or use the AI agent.
        </div>
      ) : (
        <div style={{ paddingBottom: 'var(--space-2)' }}>
          {objects.map((obj) => {
            const hidden = obj.visible === false;
            return (
              <div
                key={obj.id}
                className={`object-tree__item ${obj.id === selectedId ? 'object-tree__item--selected' : ''}`}
                onClick={() => selectObject(obj.id)}
                style={{ opacity: hidden ? 0.5 : 1 }}
              >
                <ShapeIcon type={obj.type} />
                <span className="object-tree__name">{obj.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleObjectVisibility(obj.id);
                  }}
                  title={hidden ? 'Show' : 'Hide'}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                  }}
                >
                  <EyeIcon hidden={hidden} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShapeIcon({ type }) {
  const icons = {
    box: 'M3 7l9-4 9 4v10l-9 4-9-4V7z',
    sphere: 'M12 2a10 10 0 100 20 10 10 0 000-20z',
    cylinder: 'M4 6c0-1.1 3.58-2 8-2s8 .9 8 2v12c0 1.1-3.58 2-8 2s-8-.9-8-2V6z',
    cone: 'M12 2l-8 18h16L12 2z',
    torus: 'M12 6a6 6 0 100 12 6 6 0 000-12z',
    plane: 'M4 8h16v8H4V8z',
    mesh: 'M12 2L2 8l10 6 10-6-10-6zM2 14l10 6 10-6',
  };

  return (
    <svg className="object-tree__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={icons[type] || icons.box} />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

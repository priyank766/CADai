import useSceneStore from '../../store/sceneStore';

/**
 * Object tree -- scene hierarchy panel showing all objects.
 */
export default function ObjectTree() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectObject = useSceneStore((s) => s.selectObject);

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
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`object-tree__item ${obj.id === selectedId ? 'object-tree__item--selected' : ''}`}
              onClick={() => selectObject(obj.id)}
            >
              <ShapeIcon type={obj.type} />
              <span className="object-tree__name">{obj.name}</span>
            </div>
          ))}
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
  };

  return (
    <svg className="object-tree__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={icons[type] || icons.box} />
    </svg>
  );
}

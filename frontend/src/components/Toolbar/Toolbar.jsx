import useSceneStore from '../../store/sceneStore';

/**
 * Left toolbar -- shape primitives and transform tools.
 */

const SHAPES = [
  { type: 'box', label: 'Box', icon: BoxIcon },
  { type: 'cylinder', label: 'Cylinder', icon: CylinderIcon },
  { type: 'sphere', label: 'Sphere', icon: SphereIcon },
  { type: 'cone', label: 'Cone', icon: ConeIcon },
  { type: 'torus', label: 'Torus', icon: TorusIcon },
  { type: 'plane', label: 'Plane', icon: PlaneIcon },
];

const DIMS = {
  box: { width: 2, height: 2, depth: 2 },
  cylinder: { radiusTop: 1, radiusBottom: 1, height: 2, radius: 1 },
  sphere: { radius: 1 },
  cone: { radiusBottom: 1, height: 2 },
  torus: { radius: 1, tube: 0.3 },
  plane: { width: 4, height: 4 },
};

export default function Toolbar() {
  const addObject = useSceneStore((s) => s.addObject);
  const selectedId = useSceneStore((s) => s.selectedId);
  const removeObject = useSceneStore((s) => s.removeObject);
  const clearScene = useSceneStore((s) => s.clearScene);

  const handleAddShape = (type) => {
    addObject({
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now().toString(36).slice(-3)}`,
      dimensions: { ...DIMS[type] },
      position: [0, (DIMS[type]?.height || 1) / 2, 0],
    });
  };

  return (
    <div className="toolbar">
      {/* Shapes */}
      <div className="toolbar__section">
        {SHAPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            className="toolbar__btn"
            onClick={() => handleAddShape(type)}
          >
            <Icon />
            <span className="toolbar__tooltip">{label}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="toolbar__section">
        <button
          className="toolbar__btn"
          onClick={() => selectedId && removeObject(selectedId)}
          disabled={!selectedId}
        >
          <DeleteIcon />
          <span className="toolbar__tooltip">Delete</span>
        </button>
        <button
          className="toolbar__btn"
          onClick={clearScene}
        >
          <ClearIcon />
          <span className="toolbar__tooltip">Clear all</span>
        </button>
      </div>
    </div>
  );
}

// ---- Inline SVG Icons (small, professional, no emoji) ----

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

function CylinderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v14c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
    </svg>
  );
}

function SphereIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <path d="M12 3v18" />
    </svg>
  );
}

function ConeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3L5 19c0 1.1 3.13 2 7 2s7-.9 7-2L12 3z" />
      <ellipse cx="12" cy="19" rx="7" ry="2" />
    </svg>
  );
}

function TorusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <path d="M3 12c0-2.21 1.79-4 4-4 4.42 0 10 3.58 10 4s-5.58 4-10 4c-2.21 0-4-1.79-4-4z" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8l4-4h10l4 4-4 4H7L3 8z" />
      <path d="M7 12v8h10v-8" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

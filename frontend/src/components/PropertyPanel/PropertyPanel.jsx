import { useMemo, useState } from 'react';
import useSceneStore from '../../store/sceneStore';
import { inspectObject } from '../../services/inspect';
import { MATERIAL_PRESETS } from '../../services/materials';

function formatNum(n, digits = 2) {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs < 0.01) return n.toExponential(1);
  return n.toFixed(digits);
}

/**
 * Property panel -- shows and edits properties of the selected object.
 */
export default function PropertyPanel() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const secondaryId = useSceneStore((s) => s.secondaryId);
  const objects = useSceneStore((s) => s.objects);
  const updateObject = useSceneStore((s) => s.updateObject);
  const linearArray = useSceneStore((s) => s.linearArray);
  const circularArray = useSceneStore((s) => s.circularArray);
  const mirrorObject = useSceneStore((s) => s.mirrorObject);
  const alignObjects = useSceneStore((s) => s.alignObjects);

  const selectedObj = objects.find((o) => o.id === selectedId);
  const secondaryObj = objects.find((o) => o.id === secondaryId);

  if (!selectedObj) {
    return (
      <div className="panel-section">
        <div className="panel-section__header">
          <span className="panel-section__title">Properties</span>
        </div>
        <div className="panel-section__content">
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            No object selected
          </p>
        </div>
      </div>
    );
  }

  const handleVec3Change = (property, index, value) => {
    const vec = [...selectedObj[property]];
    vec[index] = parseFloat(value) || 0;
    updateObject(selectedId, { [property]: vec });
  };

  const handleMaterialChange = (key, value) => {
    updateObject(selectedId, {
      material: { [key]: key === 'color' ? value : parseFloat(value) || 0 },
    });
  };

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <span className="panel-section__title">Properties</span>
      </div>
      <div className="panel-section__content">
        {/* Name */}
        <div className="prop-row">
          <span className="prop-row__label">Name</span>
          <div className="prop-row__value">
            <input
              className="prop-input"
              value={selectedObj.name}
              onChange={(e) => updateObject(selectedId, { name: e.target.value })}
            />
          </div>
        </div>

        {/* Type */}
        <div className="prop-row">
          <span className="prop-row__label">Type</span>
          <div className="prop-row__value">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {selectedObj.type}
            </span>
          </div>
        </div>

        {/* Position */}
        <div className="prop-row">
          <span className="prop-row__label">Pos</span>
          <div className="prop-row__value">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <input
                key={axis}
                className="prop-input prop-input--small"
                type="number"
                step="0.1"
                value={selectedObj.position[i]?.toFixed(2) || 0}
                onChange={(e) => handleVec3Change('position', i, e.target.value)}
                title={axis}
              />
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="prop-row">
          <span className="prop-row__label">Rot</span>
          <div className="prop-row__value">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <input
                key={axis}
                className="prop-input prop-input--small"
                type="number"
                step="0.1"
                value={selectedObj.rotation[i]?.toFixed(2) || 0}
                onChange={(e) => handleVec3Change('rotation', i, e.target.value)}
                title={axis}
              />
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="prop-row">
          <span className="prop-row__label">Scale</span>
          <div className="prop-row__value">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <input
                key={axis}
                className="prop-input prop-input--small"
                type="number"
                step="0.1"
                value={selectedObj.scale[i]?.toFixed(2) || 0}
                onChange={(e) => handleVec3Change('scale', i, e.target.value)}
                title={axis}
              />
            ))}
          </div>
        </div>

        <DimensionFields obj={selectedObj} onChange={(k, v) => updateObject(selectedId, { dimensions: { [k]: v } })} />

        {/* Material presets */}
        <div className="prop-row" style={{ alignItems: 'flex-start' }}>
          <span className="prop-row__label">Preset</span>
          <div className="prop-row__value" style={{ flexWrap: 'wrap', gap: 4 }}>
            {MATERIAL_PRESETS.map((p) => (
              <button
                key={p.id}
                title={`${p.name} — metal ${p.metalness}, rough ${p.roughness}`}
                onClick={() => updateObject(selectedId, { material: { color: p.color, metalness: p.metalness, roughness: p.roughness } })}
                style={{
                  width: 18, height: 18, borderRadius: 3,
                  background: p.color,
                  border: selectedObj.material?.color?.toLowerCase() === p.color.toLowerCase() ? '2px solid var(--accent, #e59500)' : '1px solid var(--border, #333)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Material */}
        <div className="prop-row">
          <span className="prop-row__label">Color</span>
          <div className="prop-row__value">
            <input
              type="color"
              value={selectedObj.material.color || '#6b7280'}
              onChange={(e) => handleMaterialChange('color', e.target.value)}
              style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', background: 'none' }}
            />
            <input
              className="prop-input"
              value={selectedObj.material.color || '#6b7280'}
              onChange={(e) => handleMaterialChange('color', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>

        <div className="prop-row">
          <span className="prop-row__label">Metal</span>
          <div className="prop-row__value">
            <input
              className="prop-input"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={selectedObj.material.metalness ?? 0}
              onChange={(e) => handleMaterialChange('metalness', e.target.value)}
            />
          </div>
        </div>

        <div className="prop-row">
          <span className="prop-row__label">Rough</span>
          <div className="prop-row__value">
            <input
              className="prop-input"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={selectedObj.material.roughness ?? 0.5}
              onChange={(e) => handleMaterialChange('roughness', e.target.value)}
            />
          </div>
        </div>

        <InspectReadout obj={selectedObj} />
        {secondaryObj && <CompareReadout a={selectedObj} b={secondaryObj} />}
        {secondaryObj && (
          <AlignTool
            onAlign={(axis, mode) => alignObjects(secondaryId, selectedId, axis, mode)}
          />
        )}
        <ArrayTool onApply={(count, spacing, axis) => linearArray(selectedId, count, spacing, axis)} />
        <CircularArrayTool onApply={(count, angle, axis) => circularArray(selectedId, count, angle, axis)} />
        <MirrorTool onApply={(axis) => mirrorObject(selectedId, axis)} />
      </div>
    </div>
  );
}

function CompareReadout({ a, b }) {
  const ia = useMemo(() => { try { return inspectObject(a); } catch { return null; } }, [a]);
  const ib = useMemo(() => { try { return inspectObject(b); } catch { return null; } }, [b]);
  if (!ia || !ib) return null;

  const dx = ib.centroid[0] - ia.centroid[0];
  const dy = ib.centroid[1] - ia.centroid[1];
  const dz = ib.centroid[2] - ia.centroid[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border, #333)', paddingTop: 'var(--space-2)' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        Measure (A → B)
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Δ</span>
        <div className="prop-row__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          [{formatNum(dx)}, {formatNum(dy)}, {formatNum(dz)}]
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Dist</span>
        <div className="prop-row__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent, #e59500)' }}>
          {formatNum(dist, 3)} mm
        </div>
      </div>
    </div>
  );
}

const DIM_FIELDS = {
  box: [
    { key: 'width', label: 'Width' },
    { key: 'height', label: 'Height' },
    { key: 'depth', label: 'Depth' },
  ],
  cylinder: [
    { key: 'radiusTop', label: 'Radius ▲' },
    { key: 'radiusBottom', label: 'Radius ▼' },
    { key: 'height', label: 'Height' },
  ],
  sphere: [{ key: 'radius', label: 'Radius' }],
  cone: [
    { key: 'radiusBottom', label: 'Radius' },
    { key: 'height', label: 'Height' },
  ],
  torus: [
    { key: 'radius', label: 'Radius' },
    { key: 'tube', label: 'Tube' },
  ],
  plane: [
    { key: 'width', label: 'Width' },
    { key: 'height', label: 'Height' },
  ],
};

function DimensionFields({ obj, onChange }) {
  const fields = DIM_FIELDS[obj.type];
  if (!fields) return null; // mesh etc. have no editable dimensions
  return (
    <>
      {fields.map((f) => (
        <div className="prop-row" key={f.key}>
          <span className="prop-row__label">{f.label}</span>
          <div className="prop-row__value">
            <input
              className="prop-input"
              type="number"
              step="0.1"
              min="0"
              value={obj.dimensions?.[f.key] ?? ''}
              onChange={(e) => onChange(f.key, parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function ArrayTool({ onApply }) {
  const [count, setCount] = useState(4);
  const [spacing, setSpacing] = useState(5);
  const [axis, setAxis] = useState('x');

  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border, #333)', paddingTop: 'var(--space-2)' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        Linear Array
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Count</span>
        <div className="prop-row__value">
          <input className="prop-input" type="number" min="2" max="200" step="1"
            value={count} onChange={(e) => setCount(Math.max(2, parseInt(e.target.value) || 2))} />
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Spacing</span>
        <div className="prop-row__value">
          <input className="prop-input" type="number" step="0.1"
            value={spacing} onChange={(e) => setSpacing(parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Axis</span>
        <div className="prop-row__value" style={{ gap: 4 }}>
          {['x', 'y', 'z'].map((a) => (
            <button
              key={a}
              onClick={() => setAxis(a)}
              style={{
                flex: 1,
                padding: '4px 0',
                background: axis === a ? 'var(--accent, #e59500)' : 'transparent',
                color: axis === a ? '#1a1a1e' : 'var(--text-secondary)',
                border: '1px solid var(--border, #333)',
                borderRadius: 3,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label"></span>
        <div className="prop-row__value">
          <button
            onClick={() => onApply(count, spacing, axis)}
            style={{
              width: '100%', padding: '6px 0',
              background: 'var(--surface-2, #2a2a2e)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border, #333)',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Apply array ({count - 1} copies)
          </button>
        </div>
      </div>
    </div>
  );
}

function AlignTool({ onAlign }) {
  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border, #333)', paddingTop: 'var(--space-2)' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        Align B → A
      </div>
      {['x', 'y', 'z'].map((a) => (
        <div className="prop-row" key={a}>
          <span className="prop-row__label" style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{a}</span>
          <div className="prop-row__value" style={{ gap: 4 }}>
            {[
              ['min', 'Min'],
              ['center', 'Mid'],
              ['max', 'Max'],
            ].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => onAlign(a, mode)}
                style={{
                  flex: 1, padding: '3px 0',
                  background: 'var(--surface-2, #2a2a2e)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border, #333)',
                  borderRadius: 3, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MirrorTool({ onApply }) {
  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border, #333)', paddingTop: 'var(--space-2)' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        Mirror
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Plane</span>
        <div className="prop-row__value" style={{ gap: 4 }}>
          {[
            ['x', 'YZ'],
            ['y', 'XZ'],
            ['z', 'XY'],
          ].map(([axis, label]) => (
            <button
              key={axis}
              onClick={() => onApply(axis)}
              title={`Mirror across ${label} plane (normal = ${axis.toUpperCase()})`}
              style={{
                flex: 1, padding: '4px 0',
                background: 'var(--surface-2, #2a2a2e)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border, #333)',
                borderRadius: 3, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 11,
              }}
            >{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CircularArrayTool({ onApply }) {
  const [count, setCount] = useState(6);
  const [angle, setAngle] = useState(360);
  const [axis, setAxis] = useState('y');

  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border, #333)', paddingTop: 'var(--space-2)' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        Circular Array
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Count</span>
        <div className="prop-row__value">
          <input className="prop-input" type="number" min="2" max="200" step="1"
            value={count} onChange={(e) => setCount(Math.max(2, parseInt(e.target.value) || 2))} />
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Angle °</span>
        <div className="prop-row__value">
          <input className="prop-input" type="number" min="1" max="360" step="1"
            value={angle} onChange={(e) => setAngle(parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Axis</span>
        <div className="prop-row__value" style={{ gap: 4 }}>
          {['x', 'y', 'z'].map((a) => (
            <button
              key={a}
              onClick={() => setAxis(a)}
              style={{
                flex: 1, padding: '4px 0',
                background: axis === a ? 'var(--accent, #e59500)' : 'transparent',
                color: axis === a ? '#1a1a1e' : 'var(--text-secondary)',
                border: '1px solid var(--border, #333)',
                borderRadius: 3, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 11,
                textTransform: 'uppercase',
              }}
            >{a}</button>
          ))}
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label"></span>
        <div className="prop-row__value">
          <button
            onClick={() => onApply(count, angle, axis)}
            style={{
              width: '100%', padding: '6px 0',
              background: 'var(--surface-2, #2a2a2e)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border, #333)',
              borderRadius: 3, cursor: 'pointer', fontSize: 12,
            }}
          >
            Apply ({count - 1} copies around origin)
          </button>
        </div>
      </div>
    </div>
  );
}

function InspectReadout({ obj }) {
  const info = useMemo(() => {
    try { return inspectObject(obj); } catch { return null; }
    // Recompute when transform / dimensions / geometry change
  }, [obj.position, obj.rotation, obj.scale, obj.dimensions, obj._geometry, obj.type]);

  if (!info) return null;
  const { bbox, centroid, volume, surfaceArea } = info;

  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border, #333)', paddingTop: 'var(--space-2)' }}>
      <div style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>
        Inspect
      </div>
      <div className="prop-row">
        <span className="prop-row__label">BBox</span>
        <div className="prop-row__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {formatNum(bbox.width)} × {formatNum(bbox.height)} × {formatNum(bbox.depth)} mm
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Center</span>
        <div className="prop-row__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          [{formatNum(centroid[0])}, {formatNum(centroid[1])}, {formatNum(centroid[2])}]
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Volume</span>
        <div className="prop-row__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {formatNum(volume, 1)} mm³
        </div>
      </div>
      <div className="prop-row">
        <span className="prop-row__label">Area</span>
        <div className="prop-row__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {formatNum(surfaceArea, 1)} mm²
        </div>
      </div>
    </div>
  );
}

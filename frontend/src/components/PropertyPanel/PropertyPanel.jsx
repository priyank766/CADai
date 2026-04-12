import useSceneStore from '../../store/sceneStore';

/**
 * Property panel -- shows and edits properties of the selected object.
 */
export default function PropertyPanel() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const objects = useSceneStore((s) => s.objects);
  const updateObject = useSceneStore((s) => s.updateObject);

  const selectedObj = objects.find((o) => o.id === selectedId);

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
      </div>
    </div>
  );
}

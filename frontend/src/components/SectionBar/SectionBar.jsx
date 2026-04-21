import useSceneStore from '../../store/sceneStore';

/**
 * Section/cross-section controls. Toggle, axis, offset slider, invert.
 * When on, all meshes are clipped by a plane through the chosen axis at `offset`.
 */
export default function SectionBar() {
  const section = useSceneStore((s) => s.section);
  const toggleSection = useSceneStore((s) => s.toggleSection);
  const setSection = useSceneStore((s) => s.setSection);

  return (
    <div
      className="transform-modes"
      style={{ display: 'flex', gap: 4, alignItems: 'center' }}
      title="Section / cross-section clip plane"
    >
      <button
        className={`transform-modes__btn ${section.enabled ? 'transform-modes__btn--active' : ''}`}
        onClick={toggleSection}
      >
        Section {section.enabled ? 'On' : 'Off'}
      </button>
      {section.enabled && (
        <>
          {['x', 'y', 'z'].map((a) => (
            <button
              key={a}
              className={`transform-modes__btn ${section.axis === a ? 'transform-modes__btn--active' : ''}`}
              style={{ minWidth: 28, padding: '2px 8px', textTransform: 'uppercase' }}
              onClick={() => setSection({ axis: a })}
            >
              {a}
            </button>
          ))}
          <input
            type="range"
            min={-20}
            max={20}
            step={0.1}
            value={section.offset}
            onChange={(e) => setSection({ offset: parseFloat(e.target.value) })}
            style={{ width: 100 }}
            title={`Offset: ${section.offset.toFixed(1)} mm`}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', minWidth: 52 }}>
            {section.offset.toFixed(1)} mm
          </span>
          <button
            className="transform-modes__btn"
            onClick={() => setSection({ invert: !section.invert })}
            title="Flip clip side"
          >
            Flip
          </button>
        </>
      )}
    </div>
  );
}

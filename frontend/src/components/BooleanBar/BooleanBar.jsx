import useSceneStore from '../../store/sceneStore';
import { csgOperation } from '../../services/csg';

/**
 * Boolean operations bar. Shows when two objects are selected
 * (primary + shift-click secondary). Runs CSG via three-bvh-csg.
 * Inputs are consumed (removed) and replaced with the resulting mesh,
 * matching Fusion 360 / SolidWorks behavior.
 */
export default function BooleanBar() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const secondaryId = useSceneStore((s) => s.secondaryId);
  const replaceObjects = useSceneStore((s) => s.replaceObjects);

  const primary = objects.find((o) => o.id === selectedId);
  const secondary = objects.find((o) => o.id === secondaryId);
  const ready = !!(primary && secondary && primary.id !== secondary.id);

  const run = (op) => {
    try {
      const result = csgOperation(primary, secondary, op);
      replaceObjects([primary.id, secondary.id], result);
    } catch (err) {
      alert(`CSG failed: ${err.message}`);
    }
  };

  return (
    <div
      className="transform-modes"
      title={ready ? '' : 'Shift-click a second object to enable boolean ops'}
      style={{ opacity: ready ? 1 : 0.5 }}
    >
      <button
        className="transform-modes__btn"
        disabled={!ready}
        onClick={() => run('union')}
        title="Union (A + B)"
      >
        Union
      </button>
      <button
        className="transform-modes__btn"
        disabled={!ready}
        onClick={() => run('subtract')}
        title="Subtract (A − B)"
      >
        Subtract
      </button>
      <button
        className="transform-modes__btn"
        disabled={!ready}
        onClick={() => run('intersect')}
        title="Intersect (A ∩ B)"
      >
        Intersect
      </button>
    </div>
  );
}

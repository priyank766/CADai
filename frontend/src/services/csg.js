import * as THREE from 'three';
import { Brush, Evaluator, ADDITION, SUBTRACTION, INTERSECTION } from 'three-bvh-csg';

/**
 * Constructive Solid Geometry via three-bvh-csg.
 *
 * Inputs are scene-store objects (id/type/dimensions/position/rotation/scale/material).
 * Outputs are "baked" objects of type 'mesh' with a raw Three.js BufferGeometry payload.
 *
 * Mesh objects are rendered by SceneObject with a pre-built BufferGeometry
 * instead of re-deriving from the `dimensions` dict.
 */

const OP_MAP = {
  union: ADDITION,
  subtract: SUBTRACTION,
  intersect: INTERSECTION,
};

function buildGeometry(obj) {
  if (obj.type === 'mesh' && obj._geometry) return obj._geometry.clone();
  const d = obj.dimensions || {};
  switch (obj.type) {
    case 'box':
      return new THREE.BoxGeometry(d.width ?? 1, d.height ?? 1, d.depth ?? 1);
    case 'sphere':
      return new THREE.SphereGeometry(d.radius ?? 1, 48, 24);
    case 'cylinder':
      return new THREE.CylinderGeometry(
        d.radiusTop ?? d.radius ?? 1,
        d.radiusBottom ?? d.radius ?? 1,
        d.height ?? 1,
        48,
      );
    case 'cone':
      return new THREE.ConeGeometry(d.radiusBottom ?? d.radius ?? 1, d.height ?? 1, 48);
    case 'torus':
      return new THREE.TorusGeometry(d.radius ?? 1, d.tube ?? 0.3, 24, 64);
    case 'plane':
      return new THREE.PlaneGeometry(d.width ?? 1, d.height ?? 1);
    default:
      throw new Error(`CSG: unsupported shape type ${obj.type}`);
  }
}

function makeBrush(obj) {
  const geom = buildGeometry(obj);
  // Bake position/rotation/scale into the geometry so the resulting brush is in world space
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(obj.rotation[0], obj.rotation[1], obj.rotation[2]),
  );
  m.compose(
    new THREE.Vector3().fromArray(obj.position),
    q,
    new THREE.Vector3().fromArray(obj.scale),
  );
  geom.applyMatrix4(m);
  const brush = new Brush(geom);
  brush.updateMatrixWorld(true);
  return brush;
}

/**
 * Run a CSG op on two scene objects. Returns a new "mesh" scene object.
 * Does NOT mutate the input objects.
 */
export function csgOperation(objA, objB, op) {
  const flag = OP_MAP[op];
  if (flag === undefined) throw new Error(`CSG: unknown operation '${op}'`);

  const a = makeBrush(objA);
  const b = makeBrush(objB);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  const result = evaluator.evaluate(a, b, flag);

  // Extract baked BufferGeometry from the result brush
  const geom = result.geometry.clone();
  geom.computeVertexNormals();

  // Dispose temp resources
  a.geometry.dispose();
  b.geometry.dispose();
  result.geometry.dispose();

  const label = { union: 'Union', subtract: 'Difference', intersect: 'Intersection' }[op];
  return {
    type: 'mesh',
    name: `${label}(${objA.name}, ${objB.name})`,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    dimensions: {},
    material: { ...objA.material },
    _geometry: geom, // live BufferGeometry for rendering
    visible: true,
    locked: false,
  };
}

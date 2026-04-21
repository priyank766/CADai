import * as THREE from 'three';

/**
 * Inspect a scene object -- returns bounding box / volume / surface area / centroid
 * computed from the same geometry the viewport renders.
 *
 * For primitives this derives a fresh geometry with no baked transform, then
 * applies pos/rot/scale into the matrix when computing the world-space bbox.
 * For 'mesh' objects the geometry is already world-space, so pos/rot/scale
 * are applied on top.
 *
 * All dimensions are in scene units (1 unit ≈ 1mm for small parts).
 */

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
      return null;
  }
}

/**
 * Signed volume of a tetrahedron with one vertex at the origin (Gauss divergence).
 * Summing over all triangles gives the mesh volume — correct for any closed mesh.
 */
function computeVolumeAndArea(geom) {
  const pos = geom.getAttribute('position');
  const idx = geom.getIndex();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cross = new THREE.Vector3();

  let vol = 0;
  let area = 0;
  const triCount = idx ? idx.count / 3 : pos.count / 3;

  for (let i = 0; i < triCount; i++) {
    const ia = idx ? idx.getX(i * 3) : i * 3;
    const ib = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
    const ic = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;
    a.fromBufferAttribute(pos, ia);
    b.fromBufferAttribute(pos, ib);
    c.fromBufferAttribute(pos, ic);
    // signed tet volume
    vol += a.dot(cross.crossVectors(b, c)) / 6;
    // triangle area
    cross.crossVectors(b.clone().sub(a), c.clone().sub(a));
    area += cross.length() / 2;
  }
  return { volume: Math.abs(vol), area };
}

export function inspectObject(obj) {
  const geom = buildGeometry(obj);
  if (!geom) return null;

  // Apply world transform for bounding box and centroid
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

  geom.computeBoundingBox();
  const bbox = geom.boundingBox;
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  const { volume, area } = computeVolumeAndArea(geom);
  geom.dispose();

  return {
    bbox: {
      width: size.x,
      height: size.y,
      depth: size.z,
      min: bbox.min.toArray(),
      max: bbox.max.toArray(),
    },
    centroid: center.toArray(),
    volume, // mm^3
    surfaceArea: area, // mm^2
  };
}

import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

/**
 * Build a Three.js Group from the scene store's objects array.
 * Mirrors the geometry logic in SceneObject.jsx so exports match what's rendered.
 */
function buildGeometry(obj) {
  if (obj.type === 'mesh' && obj._geometry) return obj._geometry.clone();
  const d = obj.dimensions || {};
  switch (obj.type) {
    case 'box':
      return new THREE.BoxGeometry(d.width ?? 1, d.height ?? 1, d.depth ?? 1);
    case 'sphere':
      return new THREE.SphereGeometry(d.radius ?? 1, 32, 16);
    case 'cylinder':
      return new THREE.CylinderGeometry(
        d.radiusTop ?? d.radius ?? 1,
        d.radiusBottom ?? d.radius ?? 1,
        d.height ?? 1,
        32,
      );
    case 'cone':
      return new THREE.ConeGeometry(d.radiusBottom ?? d.radius ?? 1, d.height ?? 1, 32);
    case 'torus':
      return new THREE.TorusGeometry(d.radius ?? 1, d.tube ?? 0.3, 16, 48);
    case 'plane':
      return new THREE.PlaneGeometry(d.width ?? 1, d.height ?? 1);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function buildSceneGroup(objects) {
  const group = new THREE.Group();
  for (const obj of objects) {
    if (obj.visible === false) continue;
    const geom = buildGeometry(obj);
    const mat = new THREE.MeshStandardMaterial({
      color: obj.material?.color ?? '#888',
      metalness: obj.material?.metalness ?? 0,
      roughness: obj.material?.roughness ?? 0.5,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.fromArray(obj.position);
    mesh.rotation.fromArray(obj.rotation);
    mesh.scale.fromArray(obj.scale);
    mesh.name = obj.name || obj.id;
    group.add(mesh);
  }
  return group;
}

function download(filename, data, mime) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportScene(objects, format = 'stl', filename = 'cadai-scene') {
  if (!objects || objects.length === 0) {
    throw new Error('Scene is empty — nothing to export.');
  }
  const group = buildSceneGroup(objects);

  if (format === 'stl') {
    const exporter = new STLExporter();
    const stl = exporter.parse(group, { binary: true });
    download(`${filename}.stl`, stl, 'model/stl');
    return;
  }
  if (format === 'obj') {
    const exporter = new OBJExporter();
    const obj = exporter.parse(group);
    download(`${filename}.obj`, obj, 'text/plain');
    return;
  }
  if (format === 'gltf') {
    const exporter = new GLTFExporter();
    return new Promise((resolve, reject) => {
      exporter.parse(
        group,
        (result) => {
          const json = JSON.stringify(result, null, 2);
          download(`${filename}.gltf`, json, 'model/gltf+json');
          resolve();
        },
        (err) => reject(err),
        { binary: false },
      );
    });
  }
  throw new Error(`Unsupported format: ${format}`);
}

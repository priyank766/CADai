import * as THREE from 'three';

/**
 * Project save/load -- serializes the scene to a .cadai.json file
 * and restores it later. Keeps the format versioned so we can evolve it.
 *
 * 'mesh' objects carry a live THREE.BufferGeometry (from CSG results).
 * We serialize its position/normal/index attributes so CSG results persist.
 */

const FILE_VERSION = 2;

function serializeGeometry(geom) {
  const pos = geom.getAttribute('position');
  const norm = geom.getAttribute('normal');
  const idx = geom.getIndex();
  return {
    position: pos ? Array.from(pos.array) : null,
    normal: norm ? Array.from(norm.array) : null,
    index: idx ? Array.from(idx.array) : null,
  };
}

function deserializeGeometry(data) {
  const g = new THREE.BufferGeometry();
  if (data.position) g.setAttribute('position', new THREE.Float32BufferAttribute(data.position, 3));
  if (data.normal) g.setAttribute('normal', new THREE.Float32BufferAttribute(data.normal, 3));
  if (data.index) g.setIndex(data.index);
  if (!data.normal) g.computeVertexNormals();
  return g;
}

function serializeObject(obj) {
  if (obj.type === 'mesh' && obj._geometry) {
    const { _geometry, ...rest } = obj;
    return { ...rest, _geometrySerialized: serializeGeometry(_geometry) };
  }
  return obj;
}

function deserializeObject(obj) {
  if (obj.type === 'mesh' && obj._geometrySerialized) {
    const { _geometrySerialized, ...rest } = obj;
    return { ...rest, _geometry: deserializeGeometry(_geometrySerialized) };
  }
  return obj;
}

export function saveProject(objects, filename = 'scene.cadai.json') {
  const payload = {
    version: FILE_VERSION,
    savedAt: new Date().toISOString(),
    objects: objects.map(serializeObject),
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function pickProjectFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed.version || !Array.isArray(parsed.objects)) {
            return reject(new Error('Invalid project file.'));
          }
          if (parsed.version > FILE_VERSION) {
            return reject(new Error(`Project file version ${parsed.version} is newer than supported (${FILE_VERSION}).`));
          }
          resolve(parsed.objects.map(deserializeObject));
        } catch (err) {
          reject(new Error(`Could not parse project file: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    };
    input.click();
  });
}

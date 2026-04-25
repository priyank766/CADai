import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export function pickAndImportSTL() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const loader = new STLLoader();
          const geometry = loader.parse(reader.result);
          
          // Most CAD STL files are Z-up, but Three.js is Y-up.
          // Rotate the raw geometry -90 degrees on the X-axis to fix this.
          geometry.rotateX(-Math.PI / 2);
          
          geometry.computeVertexNormals();

          // Center the geometry so it doesn't appear far off
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          geometry.boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);

          const obj = {
            id: Math.random().toString(36).substring(2, 10),
            name: file.name.replace(/\.[^/.]+$/, "") || 'Imported STL',
            type: 'mesh',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            dimensions: {},
            material: {
              color: '#888888',
              metalness: 0.1,
              roughness: 0.5,
              opacity: 1.0,
            },
            visible: true,
            locked: false,
            _geometry: geometry, // keep the live buffer geometry for rendering and saving
          };
          resolve(obj);
        } catch (err) {
          reject(new Error(`Failed to parse STL: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read STL file.'));
      reader.readAsArrayBuffer(file);
    };
    input.click();
  });
}

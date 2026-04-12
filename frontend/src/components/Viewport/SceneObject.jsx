import { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import useSceneStore from '../../store/sceneStore';

/**
 * Renders a single scene object based on its type and properties.
 * Handles selection, transform gizmos, and material.
 */
export default function SceneObject({ data, isSelected, transformMode }) {
  const meshRef = useRef();
  const selectObject = useSceneStore((s) => s.selectObject);
  const updateObject = useSceneStore((s) => s.updateObject);

  const { type, position, rotation, scale, dimensions, material, visible } = data;

  if (!visible) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    selectObject(data.id);
  };

  // Build geometry based on type
  const geometry = getGeometry(type, dimensions);
  if (!geometry) return null;

  return (
    <>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        {geometry}
        <meshStandardMaterial
          color={material.color || '#6b7280'}
          metalness={material.metalness || 0}
          roughness={material.roughness || 0.5}
          opacity={material.opacity || 1}
          transparent={material.opacity < 1}
        />
        {/* Selection outline */}
        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[meshRef.current?.geometry]} />
            <lineBasicMaterial color="#e59500" linewidth={1} />
          </lineSegments>
        )}
      </mesh>

      {/* Transform gizmo for selected object */}
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          size={0.6}
          onObjectChange={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const rot = meshRef.current.rotation;
              const scl = meshRef.current.scale;
              updateObject(data.id, {
                position: [pos.x, pos.y, pos.z],
                rotation: [rot.x, rot.y, rot.z],
                scale: [scl.x, scl.y, scl.z],
              });
            }
          }}
        />
      )}
    </>
  );
}

function getGeometry(type, dims) {
  switch (type) {
    case 'box':
      return <boxGeometry args={[dims.width || 1, dims.height || 1, dims.depth || 1]} />;
    case 'sphere':
      return <sphereGeometry args={[dims.radius || 0.5, 32, 32]} />;
    case 'cylinder':
      return (
        <cylinderGeometry
          args={[
            dims.radiusTop ?? dims.radius ?? 0.5,
            dims.radiusBottom ?? dims.radius ?? 0.5,
            dims.height || 1,
            32,
          ]}
        />
      );
    case 'cone':
      return (
        <coneGeometry args={[dims.radiusBottom || 0.5, dims.height || 1, 32]} />
      );
    case 'torus':
      return (
        <torusGeometry args={[dims.radius || 0.5, dims.tube || 0.2, 16, 48]} />
      );
    case 'plane':
      return <planeGeometry args={[dims.width || 2, dims.height || 2]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

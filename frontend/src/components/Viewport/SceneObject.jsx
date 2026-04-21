import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import useSceneStore from '../../store/sceneStore';

/**
 * Renders a single scene object based on its type and properties.
 * Handles selection, transform gizmos, and material.
 */
export default function SceneObject({ data, isSelected, isSecondary, transformMode }) {
  const meshRef = useRef();
  const selectObject = useSceneStore((s) => s.selectObject);
  const updateObject = useSceneStore((s) => s.updateObject);
  const commitHistory = useSceneStore((s) => s.commitHistory);
  const snap = useSceneStore((s) => s.snap);
  const section = useSceneStore((s) => s.section);

  // Build a clipping plane from the store's section settings. The plane keeps
  // the half-space on the positive-normal side; `invert` flips which side shows.
  const clippingPlanes = useMemo(() => {
    if (!section.enabled) return [];
    const n = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[section.axis];
    const sign = section.invert ? -1 : 1;
    const normal = new THREE.Vector3(n[0] * sign, n[1] * sign, n[2] * sign);
    // plane equation: normal·x + constant = 0; we want x_axis >= offset (or <= if inverted)
    const constant = -section.offset * sign;
    return [new THREE.Plane(normal, constant)];
  }, [section.enabled, section.axis, section.offset, section.invert]);

  const { type, position, rotation, scale, dimensions, material, visible } = data;

  if (!visible) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    const additive = e.shiftKey || e.nativeEvent?.shiftKey;
    selectObject(data.id, { additive });
  };

  // Build geometry based on type ('mesh' reuses pre-baked BufferGeometry from CSG)
  const geometry = type === 'mesh' && data._geometry
    ? <primitive object={data._geometry} attach="geometry" />
    : getGeometry(type, dimensions);
  if (!geometry) return null;

  const outlineColor = isSelected ? '#e59500' : isSecondary ? '#3aa3ff' : null;

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
          clippingPlanes={clippingPlanes}
          side={clippingPlanes.length > 0 ? 2 /* DoubleSide shows the cut interior */ : 0}
        />
        {/* Selection outline (primary = amber, secondary = blue) */}
        {outlineColor && meshRef.current?.geometry && (
          <lineSegments>
            <edgesGeometry args={[meshRef.current.geometry]} />
            <lineBasicMaterial color={outlineColor} linewidth={1} />
          </lineSegments>
        )}
      </mesh>

      {/* Transform gizmo for selected object */}
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          size={0.6}
          translationSnap={snap.enabled ? snap.translate : null}
          rotationSnap={snap.enabled ? (snap.rotate * Math.PI) / 180 : null}
          scaleSnap={snap.enabled ? snap.scale : null}
          onMouseUp={() => commitHistory()}
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

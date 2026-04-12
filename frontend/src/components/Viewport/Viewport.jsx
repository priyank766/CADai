import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Environment,
  GizmoHelper,
  GizmoViewport,
  TransformControls,
} from '@react-three/drei';
import useSceneStore from '../../store/sceneStore';
import SceneObject from './SceneObject';

/**
 * 3D Viewport -- the main canvas where all geometry is rendered.
 * Uses React Three Fiber for declarative Three.js rendering.
 */
export default function Viewport() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const transformMode = useSceneStore((s) => s.transformMode);
  const selectObject = useSceneStore((s) => s.selectObject);

  return (
    <div className="viewport">
      <div className="viewport__info">
        <span className="viewport__badge">
          {objects.length} object{objects.length !== 1 ? 's' : ''}
        </span>
        {selectedId && (
          <span className="viewport__badge">
            Selected: {objects.find((o) => o.id === selectedId)?.name || selectedId}
          </span>
        )}
      </div>

      <Canvas
        camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => selectObject(null)}
        style={{ background: '#1a1a1e' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} castShadow />
        <directionalLight position={[-5, 8, -5]} intensity={0.3} />

        {/* Environment for reflections */}
        <Environment preset="city" background={false} />

        {/* Ground grid */}
        <Grid
          position={[0, -0.01, 0]}
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#2a2a2e"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3a3a3e"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
        />

        {/* Scene objects */}
        {objects.map((obj) => (
          <SceneObject
            key={obj.id}
            data={obj}
            isSelected={obj.id === selectedId}
            transformMode={transformMode}
          />
        ))}

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={2}
          maxDistance={100}
        />

        {/* View gizmo in the corner */}
        <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
          <GizmoViewport
            axisColors={['#e55', '#5e5', '#55e']}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}

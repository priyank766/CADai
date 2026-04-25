import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
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

// Camera preset positions. Distance is set by a fit-to-scene heuristic below.
const VIEW_PRESETS = {
  top:    { pos: [0, 1, 0],  up: [0, 0, -1] },
  front:  { pos: [0, 0, 1],  up: [0, 1, 0] },
  right:  { pos: [1, 0, 0],  up: [0, 1, 0] },
  iso:    { pos: [1, 0.75, 1], up: [0, 1, 0] },
};

/**
 * Raycast the mouse onto the Y=0 (ground) plane and broadcast the world-space
 * hit point as a `cadai:cursor` CustomEvent so the StatusBar can show it.
 */
function CursorTracker() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        window.dispatchEvent(new CustomEvent('cadai:cursor', {
          detail: { x: hit.x, y: hit.y, z: hit.z },
        }));
      }
    };
    const onLeave = () => {
      window.dispatchEvent(new CustomEvent('cadai:cursor-leave'));
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [camera, gl]);

  return null;
}

/** Translucent amber plane showing where the clip lies. */
function SectionHelper({ section }) {
  const { axis, offset, invert } = section;
  const rot = axis === 'x'
    ? [0, 0, Math.PI / 2]
    : axis === 'z'
    ? [Math.PI / 2, 0, 0]
    : [0, 0, 0];
  const pos = [0, 0, 0];
  pos[{ x: 0, y: 1, z: 2 }[axis]] = offset;
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial
        color="#e59500"
        opacity={0.12}
        transparent
        depthWrite={false}
        side={2 /* THREE.DoubleSide */}
      />
    </mesh>
  );
}

function CameraController({ viewRequest, onViewApplied }) {
  const { camera, controls } = useThree();

  if (viewRequest && controls) {
    const preset = VIEW_PRESETS[viewRequest];
    if (preset) {
      const dist = 12;
      camera.position.set(preset.pos[0] * dist, preset.pos[1] * dist, preset.pos[2] * dist);
      camera.up.set(preset.up[0], preset.up[1], preset.up[2]);
      controls.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
    onViewApplied();
  }
  return null;
}

/**
 * 3D Viewport -- the main canvas where all geometry is rendered.
 * Uses React Three Fiber for declarative Three.js rendering.
 */
export default function Viewport() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const secondaryId = useSceneStore((s) => s.secondaryId);
  const transformMode = useSceneStore((s) => s.transformMode);
  const selectObject = useSceneStore((s) => s.selectObject);
  const section = useSceneStore((s) => s.section);
  const viewRef = useRef(null);
  const [, setTick] = useState(0); // bump to notify CameraController

  const goView = (name) => {
    viewRef.current = name;
    setTick((n) => n + 1);
  };

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

      <div
        className="viewport__info"
        style={{ top: 'var(--space-3)', right: 'var(--space-3)', left: 'auto', display: 'flex', gap: 4 }}
      >
        {['top', 'front', 'right', 'iso'].map((v) => (
          <button
            key={v}
            onClick={() => goView(v)}
            title={`${v[0].toUpperCase() + v.slice(1)} view`}
            style={{
              background: 'rgba(30,30,34,0.8)',
              border: '1px solid var(--border, #333)',
              color: 'var(--text-secondary, #bbb)',
              padding: '4px 10px',
              borderRadius: 3,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <Canvas
        camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 50000 }}
        gl={{ antialias: true, alpha: false, localClippingEnabled: true }}
        onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
        onPointerMissed={() => selectObject(null)}
        style={{ background: '#1a1a1e' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} castShadow />
        <directionalLight position={[-5, 8, -5]} intensity={0.3} />

        {/* Environment for reflections */}
        <Environment preset="city" background={false} />

        {/* Origin axes (X=red, Y=green, Z=blue) — always visible at origin */}
        <primitive object={new THREE.AxesHelper(2)} />

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
          fadeDistance={1000}
          fadeStrength={1}
          infiniteGrid
        />

        {/* Section plane helper (translucent disk) */}
        {section.enabled && <SectionHelper section={section} />}

        {/* Scene objects */}
        {objects.map((obj) => (
          <SceneObject
            key={obj.id}
            data={obj}
            isSelected={obj.id === selectedId}
            isSecondary={obj.id === secondaryId}
            transformMode={transformMode}
          />
        ))}

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={1}
          maxDistance={50000}
        />

        {/* View gizmo in the corner */}
        <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
          <GizmoViewport
            axisColors={['#e55', '#5e5', '#55e']}
            labelColor="white"
          />
        </GizmoHelper>

        <CameraController
          viewRequest={viewRef.current}
          onViewApplied={() => { viewRef.current = null; }}
        />

        <CursorTracker />
      </Canvas>
    </div>
  );
}

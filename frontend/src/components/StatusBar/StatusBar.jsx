import { useEffect, useRef, useState } from 'react';
import useSceneStore from '../../store/sceneStore';

/**
 * Bottom status bar -- pro-CAD readout:
 *   - cursor world coords (picked from a custom event dispatched by the viewport)
 *   - object count
 *   - current transform mode + snap state
 *   - live FPS
 *
 * Intentionally thin (22px) and monospaced, like the SolidWorks / Fusion status bar.
 */
export default function StatusBar() {
  const objects = useSceneStore((s) => s.objects);
  const transformMode = useSceneStore((s) => s.transformMode);
  const snap = useSceneStore((s) => s.snap);
  const selectedId = useSceneStore((s) => s.selectedId);

  const [cursor, setCursor] = useState(null);
  const [fps, setFps] = useState(0);

  // Listen for cursor events dispatched by the viewport
  useEffect(() => {
    const onCursor = (e) => setCursor(e.detail);
    const onLeave = () => setCursor(null);
    window.addEventListener('cadai:cursor', onCursor);
    window.addEventListener('cadai:cursor-leave', onLeave);
    return () => {
      window.removeEventListener('cadai:cursor', onCursor);
      window.removeEventListener('cadai:cursor-leave', onLeave);
    };
  }, []);

  // FPS counter via requestAnimationFrame sampling
  const frames = useRef(0);
  const last = useRef(performance.now());
  useEffect(() => {
    let rafId;
    const tick = () => {
      frames.current++;
      const now = performance.now();
      if (now - last.current >= 500) {
        setFps(Math.round((frames.current * 1000) / (now - last.current)));
        frames.current = 0;
        last.current = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const fmt = (n) => (n >= 0 ? ` ${n.toFixed(2)}` : n.toFixed(2));

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 22,
        background: 'var(--surface-0, #141418)',
        borderTop: '1px solid var(--border, #333)',
        color: 'var(--text-tertiary, #888)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 18,
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      <span>
        {cursor
          ? <>XYZ <span style={v}>{fmt(cursor.x)}</span><span style={v}>{fmt(cursor.y)}</span><span style={v}>{fmt(cursor.z)}</span> mm</>
          : <>XYZ <span style={{ color: 'var(--text-tertiary)' }}>—</span></>
        }
      </span>
      <span>|</span>
      <span>Mode <span style={v}>{transformMode}</span></span>
      <span>Snap <span style={{ ...v, color: snap.enabled ? 'var(--accent, #e59500)' : 'var(--text-tertiary)' }}>{snap.enabled ? `${snap.translate}mm` : 'off'}</span></span>
      <span>Units <span style={v}>mm</span></span>
      <span style={{ marginLeft: 'auto' }}>
        Objects <span style={v}>{objects.length}</span>
        {selectedId && <> · Sel <span style={v}>1</span></>}
      </span>
      <span>FPS <span style={{ ...v, color: fps < 30 ? '#e55' : 'var(--text-secondary)' }}>{fps}</span></span>
    </div>
  );
}

const v = { color: 'var(--text-secondary, #bbb)' };

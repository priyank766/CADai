import { useEffect, useState } from 'react';

const GROUPS = [
  {
    title: 'Transform',
    items: [
      ['G', 'Translate mode'],
      ['R', 'Rotate mode'],
      ['S', 'Scale mode'],
    ],
  },
  {
    title: 'Edit',
    items: [
      ['Ctrl+Z', 'Undo'],
      ['Ctrl+Shift+Z / Ctrl+Y', 'Redo'],
      ['Ctrl+D', 'Duplicate selected'],
      ['Delete / Backspace', 'Delete selected'],
      ['Esc', 'Deselect'],
    ],
  },
  {
    title: 'Selection',
    items: [
      ['Click', 'Select object'],
      ['Shift+Click', 'Set secondary (for CSG / measure)'],
      ['Click empty space', 'Deselect all'],
    ],
  },
  {
    title: 'UI',
    items: [
      ['Ctrl+K', 'Command palette'],
      ['?', 'Toggle this overlay'],
    ],
  },
  {
    title: 'Viewport',
    items: [
      ['Left drag', 'Orbit'],
      ['Right drag', 'Pan'],
      ['Scroll', 'Zoom'],
    ],
  },
];

export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
        zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 92vw)', maxHeight: '82vh', overflowY: 'auto',
          background: 'var(--surface-1, #1e1e22)',
          border: '1px solid var(--border, #333)',
          borderRadius: 8,
          padding: 'var(--space-4, 20px)',
          color: 'var(--text-primary, #eee)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>Keyboard Shortcuts</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary, #888)' }}>Press <kbd style={kbd}>?</kbd> or <kbd style={kbd}>Esc</kbd> to close</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-tertiary, #888)', marginBottom: 8 }}>
                {g.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {g.items.map(([keys, desc]) => (
                  <div key={keys} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary, #bbb)' }}>{desc}</span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      {keys.split(' / ').map((k, i) => (
                        <kbd key={i} style={kbd}>{k}</kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const kbd = {
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: 11,
  border: '1px solid var(--border, #333)',
  borderRadius: 3,
  padding: '1px 6px',
  background: 'var(--surface-2, #2a2a2e)',
  color: 'var(--text-primary, #eee)',
};

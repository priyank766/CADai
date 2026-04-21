# Progress Tracker

> Living document — updated as work progresses.

## Current Status: 🟢 Phase 1 Complete, Phase 2 In Progress

---

## Phase 1: Foundation + AI Agent MVP

### Backend Setup
- [x] Initialize Python project with `uv`
- [x] Project structure (routers, services, models)
- [x] FastAPI app with CORS
- [x] Google ADK agent setup
- [x] Agent engine with tools
- [x] API endpoints functional
- [x] Session management (ADK `InMemoryRunner` requires explicit session creation)
- [x] `GOOGLE_API_KEY` env bridging from config's `gemini_api_key`

### Frontend Setup
- [x] Vite + React initialized in `/frontend`
- [x] Professional CAD Design system (CSS)
- [x] Layout panels
- [x] 3D Viewport
- [x] Toolbar
- [x] Properties panel
- [x] Agent panel
- [x] Scene state (Zustand)
- [x] Undo/Redo — snapshot-based, fully wired
- [x] Keyboard shortcuts (G/R/S, Delete, Ctrl+Z/Y, Ctrl+D, Esc)
- [x] Transform gestures commit a single undo entry on mouseUp

### Integration
- [x] Frontend ↔ Backend connected (`sendAgentAction` → `/api/agent/action`)
- [x] Agent actions update viewport (`applyAgentActions` in store)
- [x] `API_BASE` configurable via `VITE_API_URL`
- [ ] End-to-end verified with real Gemini key _(blocked on real API key being added to `backend/.env`)_

---

## Phase 2: Geometry + Export

### Export
- [x] STL export (binary)
- [x] OBJ export
- [x] glTF export (JSON)
- [x] Export menu in header
- [ ] STEP export (requires OCCT — future)

### Project persistence
- [x] Save scene as `.cadai.json` (versioned)
- [x] Load from `.cadai.json`
- [x] Per-object visibility toggle in Scene tree

### Geometry
- [x] Boolean operations (union / subtract / intersect via three-bvh-csg)
- [x] Multi-select (Shift+click secondary) with distinct outline color
- [x] Bounding box / volume / surface area / centroid readout (Inspect panel)
- [x] Grid-snap (translate 1mm / rotate 15° / scale 0.1) toggle for TransformControls
- [ ] Extrude from 2D sketch
- [ ] Fillet / chamfer
- [x] Measure: center-to-center distance + Δxyz when two objects selected
- [x] Dimension editing per shape (width/height/depth/radius/tube...) in PropertyPanel
- [ ] Multi-point measure (click arbitrary vertices)

### UX
- [x] Command palette (Ctrl+K) — fuzzy launcher for all actions
- [x] Keyboard shortcut overlay (press `?`)
- [x] Material preset swatches (steel, aluminum, copper, brass, plastics, rubber, wood, glass) matching AI agent's presets
- [x] Named camera views (Top / Front / Right / Iso) snap buttons in viewport
- [x] Linear array tool (count / spacing / axis) in PropertyPanel
- [x] Circular / polar array tool (count / sweep angle / axis) — bolt circles
- [x] Mirror tool (YZ / XZ / XY planes)
- [x] Arrow-key nudge with snap-step granularity; Shift ×10; Alt → Y axis
- [x] Section / cross-section clip plane (X/Y/Z axis, offset slider, flip); reveals CSG interiors
- [x] Always-visible origin axes helper (red=X, green=Y, blue=Z)
- [x] Status bar: cursor world coords (mm), mode, snap, units, object count, live FPS
- [ ] Split viewport (top/front/side/perspective)

---

## Completed Items

| Date | Item |
|---|---|
| 2026-04-12 | Project initialized. Docs created. |
| 2026-04-21 | Backend session bug fixed; API key env bridging added. |
| 2026-04-21 | Snapshot-based undo/redo wired end-to-end (history, buttons, keyboard). |
| 2026-04-21 | Keyboard shortcuts: G/R/S transform modes, Delete, Ctrl+Z/Y, Ctrl+D, Esc. |
| 2026-04-21 | STL / OBJ / glTF export via Three.js exporters + header menu. |
| 2026-04-21 | Project save/load (.cadai.json, versioned) + visibility toggle in object tree. |
| 2026-04-21 | Command palette (Ctrl+K) — fuzzy-search launcher for create/transform/edit/file/clear actions. |
| 2026-04-21 | Boolean CSG (union/subtract/intersect) via three-bvh-csg; shift-click secondary selection; baked BufferGeometry persists through save/load (project file v2). |
| 2026-04-21 | Inspect readout in PropertyPanel: bbox, volume (mm³ via divergence theorem), surface area (mm²), centroid. |
| 2026-04-21 | Grid-snap toggle in header + command palette; applies to translate/rotate/scale transforms. |
| 2026-04-21 | Per-shape dimension editing in PropertyPanel (box/cylinder/sphere/cone/torus/plane). |
| 2026-04-21 | Compare readout: Δxyz + center-to-center distance when two objects selected. |
| 2026-04-21 | Material preset swatches in PropertyPanel (9 engineering materials); shared source with agent. |
| 2026-04-21 | Keyboard shortcut overlay modal (press `?`); 5 grouped sections. |
| 2026-04-21 | Viewport camera view presets (Top/Front/Right/Iso) via OrbitControls target reset. |
| 2026-04-21 | Linear array tool: duplicate N copies along X/Y/Z at specified spacing; one undo entry. |
| 2026-04-21 | Circular/polar array tool: N copies around origin, sweep 1–360°, with per-copy orientation rotation (bolt-circle behavior). |
| 2026-04-21 | Bottom StatusBar: cursor-on-ground world coords (raycast), FPS sampler, mode/snap/units/count readouts. |
| 2026-04-21 | Mirror tool (YZ/XZ/XY planes) reflects position + flips scale axis. |
| 2026-04-21 | Arrow-key nudge (X/Z by default, Alt for Y), step = snap.translate or 1mm; Shift = ×10. |
| 2026-04-21 | Section view: per-material clipping plane (axis + offset + invert), translucent amber plane helper, DoubleSide on cut materials. |
| 2026-04-21 | Origin axes helper (Three.js AxesHelper) always-visible at world origin. |

---

## Blockers & Notes

| Date | Note |
|---|---|
| 2026-04-12 | Project initialized. Docs created. Ready to start Phase 1. |
| 2026-04-21 | Port 8000 in use on dev machine → backend now runs on 8001 by default. Frontend `API_BASE` follows suit. |
| 2026-04-21 | `backend/.env` still contains placeholder `GEMINI_API_KEY` — must be set to a real key before the agent flow works end-to-end. |

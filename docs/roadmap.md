# Roadmap — Phased Build Plan

## Vision

Build a portfolio-worthy, AI-powered 3D CAD platform that demonstrates:
- Full-stack engineering (Python backend + React frontend)
- AI/ML integration (agentic LLM with function calling)
- 3D graphics programming (Three.js / WebGL / WebGPU)
- System design (clean architecture, swappable components)
- Product thinking (great UX, not just a tech demo)

---

## Phase 1: Foundation + AI Agent MVP ⬅️ START HERE

**Goal**: Working 3D viewport with an AI agent that creates and manipulates shapes. This alone is a great LinkedIn post.

**Duration**: 1-2 weeks

### Backend Tasks
- [ ] Initialize Python project with `uv`
- [ ] FastAPI app structure with routers
- [ ] Gemini LLM client (isolated, swappable)
- [ ] AI Agent engine with tool definitions
- [ ] Tool implementations: `create_shape`, `modify_shape`, `delete_object`, `duplicate_object`, `group_objects`
- [ ] Scene state model (Pydantic)
- [ ] `/api/agent/action` endpoint
- [ ] `/api/health` endpoint
- [ ] CORS config for frontend

### Frontend Tasks
- [ ] Vite + React project setup
- [ ] Dark-mode design system (CSS variables, typography, spacing)
- [ ] Main layout: toolbar (left) + viewport (center) + properties (right) + agent panel (bottom-right)
- [ ] 3D Viewport with React Three Fiber
  - [ ] Grid floor + axes helper
  - [ ] Orbit controls (pan, zoom, rotate)
  - [ ] Environment lighting (HDRI or studio)
  - [ ] Object selection via raycasting
  - [ ] Transform gizmos (translate, rotate, scale)
- [ ] Toolbar with shape primitives (box, cylinder, sphere, cone, torus)
- [ ] Property panel (shows selected object's position, rotation, scale, material)
- [ ] Object tree / scene hierarchy
- [ ] AI Agent panel (action stream, not chat)
- [ ] Zustand store for scene state
- [ ] Undo/Redo system
- [ ] Smooth animations and transitions

### Deliverable
> A polished web app where you can place 3D shapes, manipulate them, AND ask the AI agent to build/modify things — and watch the viewport update in real-time.

---

## Phase 2: Advanced Geometry + Materials

**Goal**: Boolean operations, better materials, export capabilities.

**Duration**: 1-2 weeks

### Tasks
- [ ] Boolean operations (union, subtract, intersect) using three-bvh-csg or Manifold
- [ ] Material system (PBR materials: metalness, roughness, color picker)
- [ ] Material presets (wood, metal, plastic, glass, concrete)
- [ ] Export to STL, GLTF, OBJ
- [ ] Import GLTF/OBJ files
- [ ] Measurement tools (distance, angle, bounding box)
- [ ] Snap-to-grid and alignment tools
- [ ] AI agent gets geometry tools (boolean ops, extrude, fillet)
- [ ] AI agent gets analysis tools (measure, bounding box)
- [ ] Project save/load (JSON-based)

### Deliverable
> A capable 3D modeling tool with real geometry operations and file I/O.

---

## Phase 3: Parametric Design + Code Mode

**Goal**: Add parametric modeling via code editor — like CascadeStudio.

**Duration**: 2 weeks

### Tasks
- [ ] Monaco Editor integration (code panel)
- [ ] JavaScript-based parametric modeling API
- [ ] Parametric sliders linked to code variables
- [ ] OpenCascade.js (Wasm) integration for B-Rep modeling
- [ ] STEP file import/export
- [ ] Constraint system basics (parallel, perpendicular, tangent, distance)
- [ ] AI agent can generate parametric code
- [ ] Design history timeline (parametric replay)

### Deliverable
> Both visual AND code-based 3D modeling with a real CAD kernel.

---

## Phase 4: Advanced AI + Polish

**Goal**: AI becomes a true design copilot. Portfolio-ready polish.

**Duration**: 2 weeks

### Tasks
- [ ] Generative design: input goals → AI explores variations
- [ ] Design analysis: printability, structural integrity, weight estimation
- [ ] Image-to-CAD: upload sketch/photo → AI generates 3D model
- [ ] Multi-step agent reasoning (complex instructions)
- [ ] Keyboard shortcuts for all major actions
- [ ] Responsive layout (works on different screen sizes)
- [ ] Loading states, error handling, edge cases
- [ ] Landing page / onboarding for new users
- [ ] Demo video for LinkedIn
- [ ] README with screenshots and GIFs
- [ ] Deploy (Vercel for frontend, Railway/Render for backend)

### Deliverable
> A production-quality AI CAD platform ready for portfolio and deployment.

---

## LinkedIn Showcase Milestones 🎯

Each of these is a standalone LinkedIn post opportunity:

1. **Phase 1 complete** → "Built a 3D CAD platform with an AI agent — watch it create a coffee mug from a text prompt" (video demo)
2. **Phase 2 complete** → "Added boolean operations and PBR materials to my AI CAD tool" (before/after screenshots)
3. **Phase 3 complete** → "Code-CAD meets AI — parametric 3D modeling in the browser" (screen recording)
4. **Phase 4 complete** → "Full launch: AI-powered CAD platform with generative design" (polished demo video)

# Ideas & Future Features

> Brain dump for things we want to build, explore, or research. No idea is too wild here.

---

## 🔥 High Priority Ideas

### AI-Powered Features
- **Voice-to-CAD** — Use Web Speech API to speak commands: "rotate that 45 degrees"
- **Image-to-3D** — Upload a sketch/photo, AI generates a 3D model matching it
- **Design Variants** — "Show me 5 different chair designs" → AI generates variations
- **Assembly Assistant** — AI suggests how parts should connect
- **Dimension Inference** — AI guesses realistic dimensions from vague descriptions ("a small box" → 50mm × 30mm × 20mm)

### UX Features
- **Keyboard shortcut overlay** — Press `?` to see all shortcuts
- **Command palette** — Press `Ctrl+K` to search actions (like VS Code)
- **Onboarding tour** — First-time user tutorial with spotlight highlights
- **Dark/Light mode toggle** — Default dark, but allow light
- **Split viewport** — Multiple camera views (top, front, side, perspective) like SolidWorks

### Technical Features
- **Real-time collaboration** — WebSocket-based multiplayer editing
- **Version control** — Git-like branching for design iterations
- **Plugin system** — Let users extend the tool with custom shapes/tools
- **WebGPU renderer** — Upgrade from WebGL for better performance
- **Physics simulation** — Drop test, balance check, collision detection

---

## 💡 Inspiration Sources

| Source | What to Learn |
|---|---|
| Fusion 360 | Professional CAD UX, timeline, sketch → extrude workflow |
| Blender | 3D viewport controls, material editor, node system |
| Figma | Collaborative design, clean minimal UI, selection/transform UX |
| VS Code | Command palette, extensions, keyboard-first design |
| Spline.design | Beautiful web 3D tool, great animations and interactions |
| OnShape | Browser-based CAD, parametric modeling, constraint system |
| TinkerCAD | Simplified CAD for beginners, drag-and-drop shapes |

---

## 🧪 Research Topics

- [ ] OpenCascade.js — how heavy is the Wasm bundle? Can we lazy-load it?
- [ ] WebGPU availability — is it stable enough to use as primary renderer?
- [ ] Gemini function calling — what are the latency characteristics?
- [ ] three-bvh-csg vs Manifold — which is better for boolean operations?
- [ ] STEP file parsing in the browser — is it feasible without OCCT?
- [ ] STL generation from Three.js geometry — any good libraries?

---

## 🚫 Anti-Patterns to Avoid

- **Don't make it a chatbot** — The AI acts, it doesn't lecture
- **Don't overcomplicate Phase 1** — Ship something that works and looks great FIRST
- **Don't build a geometry kernel** — Use Three.js mesh-based approach for MVP, OCCT later
- **Don't ignore mobile** — Should at least be viewable on tablet
- **Don't skip animations** — Micro-animations are what make it feel premium

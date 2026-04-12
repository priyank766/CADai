# References

> Links and resources we studied, used, or plan to use.

---

## Open Source Projects

| Project | Link | Relevance |
|---|---|---|
| CascadeStudio | https://github.com/zalo/CascadeStudio | Browser-based parametric CAD — architecture reference |
| CADAM | https://github.com/Adam-CAD/CADAM | Text/image to 3D model web app |
| Text2CAD | https://github.com/orgs/Text2CAD/repositories | NeurIPS research: LLM → parametric CAD |
| Zoo Design Studio | https://github.com/KittyCAD/modeling-app | Open-source CAD app with AI integration |
| OpenCascade.js | https://github.com/nicolo-ribaudo/opencascade.js | OCCT CAD kernel compiled to WebAssembly |
| GenCAD (MIT) | https://github.com/mit-design-lab/GenCAD | Image-conditional CAD command generation |
| three-bvh-csg | https://github.com/gkjohnson/three-bvh-csg | Fast boolean operations for Three.js |
| Manifold | https://github.com/elalish/manifold | High-performance mesh boolean engine |

---

## Documentation & Tutorials

| Resource | Link | Topic |
|---|---|---|
| Three.js Docs | https://threejs.org/docs/ | 3D rendering API reference |
| R3F Docs | https://docs.pmnd.rs/react-three-fiber | React Three Fiber guide |
| Drei Docs | https://github.com/pmndrs/drei | Three.js React helpers |
| FastAPI Docs | https://fastapi.tiangolo.com/ | Backend framework |
| Gemini API Docs | https://ai.google.dev/docs | LLM API + function calling |
| OpenCascade.js Guide | https://ocjs.org/ | Wasm CAD kernel docs |
| Zustand Docs | https://github.com/pmndrs/zustand | State management |

---

## Key Articles & Discussions

| Title | Link | Takeaway |
|---|---|---|
| Building CAD in the browser with Three.js | Reddit thread (r/threejs) | Architecture advice, pitfalls |
| WebAssembly for CAD kernels | Medium article series | Performance benchmarks, OCCT Wasm setup |
| LLM + OpenSCAD code generation | Various dev.to posts | Prompt engineering for CAD code |
| Agentic AI with function calling | Google AI blog | How to build tool-using agents |

---

## NPM Packages We'll Use

### Frontend
```
react
react-dom
three
@react-three/fiber
@react-three/drei
zustand
framer-motion
@monaco-editor/react       (Phase 3)
three-bvh-csg              (Phase 2)
```

### Backend (Python)
```
fastapi
uvicorn[standard]
pydantic
pydantic-settings
google-adk
python-multipart
aiofiles
```

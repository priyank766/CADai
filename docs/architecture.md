 # System Architecture

## High-Level Overview

CADai is a three-tier web application with a clear separation between the 3D frontend, the Python backend, and the AI agent layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Toolbar  │  │  3D Viewport │  │ Property │  │  AI Agent  │  │
│  │  Panel   │  │   (R3F +     │  │  Panel   │  │  Panel     │  │
│  │          │  │  Three.js)   │  │          │  │ (Actions,  │  │
│  │ Tools    │  │              │  │ Object   │  │  not chat) │  │
│  │ Shapes   │  │  WebGPU /    │  │ Props    │  │            │  │
│  │ Actions  │  │  WebGL       │  │ Dims     │  │ Tool Calls │  │
│  └──────────┘  └──────────────┘  └──────────┘  └────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Scene State (Zustand Store)                  │   │
│  │   Objects[] | Constraints[] | History[] | Selection       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ REST / WebSocket
                                      │
┌─────────────────────────────────────┴───────────────────────────┐
│                       BACKEND (FastAPI + Python + Google ADK)           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  API Router  │  │  ADK Agent   │  │  Project Service      │  │
│  │  /api/agent  │  │  Engine      │  │  Save/Load/Export     │  │
│  │  /api/project│  │              │  │                       │  │
│  │  /api/export │  │  Tools:      │  │  File formats:        │  │
│  └──────────────┘  │  - create    │  │  - JSON (native)      │  │
│                     │  - modify    │  │  - STL export         │  │
│                     │  - delete    │  │  - GLTF export        │  │
│                     │  - duplicate │  │  - OBJ export         │  │
│                     └──────┬───────┘  └───────────────────────┘  │
│                            │                                     │
│                     ┌──────┴───────┐                             │
│                     │  LLM Backend │ ← Uses Google Gemini        │
│                     │  via ADK     │                             │
│                     └──────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Components

| Component | Responsibility |
|---|---|
| **3D Viewport** | Three.js scene rendering, camera controls, object interaction, raycasting |
| **Toolbar** | Shape creation tools, transform modes, view controls |
| **Property Panel** | Selected object properties (position, rotation, scale, material, dimensions) |
| **AI Agent Panel** | Shows AI actions in real-time, user can give natural language commands |
| **Object Tree** | Scene hierarchy, visibility toggles, selection |
| **Timeline/History** | Undo/redo steps, operation history |
| **Scene State** | Zustand store — single source of truth for all scene data |

### Backend Components

| Component | Responsibility |
|---|---|
| **API Router** | FastAPI routes, request validation, response formatting |
| **AI Agent Engine** | Receives user intent → plans steps → calls tools → returns actions |
| **LLM Client** | Isolated Gemini integration — one file swap to change provider |
| **Tool Registry** | Defines all tools the AI agent can use (see ai-agent-design.md) |
| **Project Service** | Save/load projects, export to various formats |

## Data Flow: AI Agent Action

```
User: "Add a cylinder on top of that box and make it a handle"

1. Frontend sends → POST /api/agent/action { prompt, scene_state }
2. Backend: AI Agent Engine receives request
3. Agent calls LLM with:
   - System prompt (you are a CAD agent)
   - Available tools (create_shape, modify_shape, etc.)
   - Current scene state (what objects exist, their properties)
   - User's prompt
4. LLM responds with tool calls:
   - create_shape(type="cylinder", radius=5, height=30, position=[0, 50, 0])
   - modify_shape(id="cylinder_1", material={color: "#888", metalness: 0.8})
   - group_objects(ids=["box_1", "cylinder_1"], name="Handle Assembly")
5. Backend executes tool calls → returns action list to frontend
6. Frontend applies actions to scene state → viewport updates
7. AI Agent Panel shows: "✓ Created cylinder · ✓ Applied material · ✓ Grouped as Handle Assembly"
```

## Key Design Principles

1. **Scene state is the truth** — All changes go through the Zustand store, never direct Three.js mutations
2. **AI acts, doesn't chat** — Every AI response is a list of executable actions, not paragraphs of text
3. **Tools are atomic** — Each tool does one thing. Complex operations = multiple tool calls
4. **History is everything** — Every action is recorded for undo/redo and parametric replay
5. **LLM is swappable** — The LLM client is a single file with a standard interface

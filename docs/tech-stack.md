# Technology Stack

## Overview

Every technology choice is made with three criteria:
1. **Best for the job** — Not just popular, but genuinely the right tool
2. **Portfolio value** — Impressive on a resume and LinkedIn
3. **Budget-friendly** — Free tiers, open source, no vendor lock-in

---

## Frontend

| Technology | Version | Purpose | Why |
|---|---|---|---|
| **React** | 18+ | UI framework | Industry standard, great ecosystem, employable skill |
| **Vite** | 5+ | Build tool | Fastest dev server, instant HMR, modern defaults |
| **Three.js** | r170+ | 3D rendering engine | Industry standard for web 3D, massive community |
| **React Three Fiber** | 8+ | React ↔ Three.js bridge | Declarative 3D, plays perfectly with React state |
| **@react-three/drei** | 9+ | Three.js helpers | Transform controls, orbit controls, grids, environment |
| **Zustand** | 4+ | State management | Lightweight, no boilerplate, perfect for real-time 3D state |
| **Monaco Editor** | Latest | Code editor (optional) | VS Code engine, if we add code-CAD mode |
| **Framer Motion** | 11+ | UI animations | Smooth micro-animations for the CAD UI |

### CSS Strategy
- **Vanilla CSS** with CSS custom properties (variables) for theming
- Dark mode as default (professional CAD look)
- CSS Grid + Flexbox for the panel layout
- No Tailwind — we need precise control for a CAD interface

---

## Backend

| Technology | Version | Purpose | Why |
|---|---|---|---|
| **Python** | 3.11+ | Backend language | Best AI/ML ecosystem, fast prototyping |
| **uv** | Latest | Package manager | Fast, modern, replaces pip/poetry/venv |
| **FastAPI** | 0.110+ | Web framework | Async, auto-docs, type-safe, fast |
| **Pydantic** | 2+ | Data validation | Request/response models, settings management |
| **google-genai** | Latest | Gemini SDK | Official Google AI SDK with function calling |
| **uvicorn** | Latest | ASGI server | Production-grade async server |

---

## AI Layer

| Technology | Purpose | Why |
|---|---|---|
| **Google Gemini** | Primary LLM | Free tier available, function calling support, budget-friendly |
| **Function Calling** | Agent tools | Native structured output — LLM returns tool calls, not text |

### LLM Abstraction (Swappable Design)

```
backend/
  services/
    llm/
      __init__.py          # Exports the active client
      base.py              # Abstract interface (BaseAIClient)
      gemini_client.py     # Gemini implementation ← ACTIVE
      openai_client.py     # OpenAI implementation (future)
      config.py            # API keys, model selection
```

To switch providers: change ONE import in `__init__.py`. Everything else stays the same.

---

## Dev Tools

| Tool | Purpose |
|---|---|
| **ESLint + Prettier** | Frontend code quality |
| **Ruff** | Python linting + formatting (blazing fast) |
| **Git** | Version control |

---

## What We're NOT Using (and Why)

| Technology | Why Not |
|---|---|
| **Tailwind CSS** | Need pixel-perfect control for CAD panels, grids, viewports |
| **Next.js** | Overkill — we don't need SSR for a CAD app, Vite is lighter |
| **LangChain** | Too heavy for what we need — we're building a simple tool-calling agent |
| **Docker** | Not needed for MVP — adds complexity, can add later |
| **Database** | File-based project storage for now — SQLite/Postgres later if needed |

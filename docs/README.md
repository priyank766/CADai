# CADai — Documentation Hub

> All project documentation lives here. This is the single source of truth for architecture, planning, progress, and ideas.

## 📁 Document Index

| Document | Purpose |
|---|---|
| [architecture.md](./architecture.md) | System architecture, component diagrams, data flow |
| [tech-stack.md](./tech-stack.md) | Technology choices and rationale |
| [ai-agent-design.md](./ai-agent-design.md) | AI agent architecture — tools, actions, function calling |
| [roadmap.md](./roadmap.md) | Phased build plan with milestones |
| [progress.md](./progress.md) | Living tracker of what's done, in-progress, and next |
| [ideas.md](./ideas.md) | Feature ideas, inspirations, future possibilities |
| [references.md](./references.md) | Links to repos, papers, tutorials, and tools we studied |
| [api-design.md](./api-design.md) | Backend API endpoints and contracts |

## Project Summary

**CADai** is a web-based 3D CAD platform with an AI agent that doesn't just chat — it **acts**. The AI observes your canvas, understands your design context, and autonomously performs operations like creating geometry, applying constraints, analyzing designs, and suggesting improvements.

### What Makes This Different

- **Not a chatbot** — The AI is an agent with tools. It creates, modifies, and analyzes 3D models directly.
- **Professional CAD UX** — Dark mode, precision tools, constraint system, real engineering workflows.
- **Agentic Architecture** — LLM + function calling + tool execution = AI that does real work.
- **Swappable AI** — Gemini today, GPT tomorrow, local model next week. One file change.

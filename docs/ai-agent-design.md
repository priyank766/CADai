# AI Agent Design — Not a Chatbot

## Core Philosophy

> The AI doesn't **talk about** doing things. It **does** things.

A chatbot says: *"You could try adding a cylinder on top of the box to create a handle."*
Our agent says: `[ACTION] create_cylinder → position_on_top → apply_material → group_objects`

The user sees the 3D viewport update in real-time as the agent works. The agent panel shows a **stream of actions** with status indicators, not a wall of text.

---

## Agent Architecture

```
┌─────────────────────────────────────────────┐
│              USER PROMPT                     │
│  "Make this look like a coffee mug"         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           CONTEXT BUILDER                    │
│                                             │
│  • Current scene objects + properties        │
│  • Selected object(s)                        │
│  • Recent action history                     │
│  • Available tools list                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           LLM (Gemini)                       │
│                                             │
│  System: "You are a CAD agent. You ONLY     │
│  respond with tool calls. Never explain."    │
│                                             │
│  Response: [                                 │
│    { tool: "create_cylinder", args: {...} }, │
│    { tool: "create_torus", args: {...} },    │
│    { tool: "boolean_subtract", args: {...} },│
│    { tool: "group_objects", args: {...} }     │
│  ]                                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           TOOL EXECUTOR                      │
│                                             │
│  Executes each tool call sequentially        │
│  Validates parameters                        │
│  Returns results + updated scene state       │
│  Streams status to frontend                  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          FRONTEND APPLIES ACTIONS            │
│                                             │
│  Scene updates in real-time                  │
│  Agent panel shows action log                │
│  History stack updated for undo              │
└─────────────────────────────────────────────┘
```

---

## Tool Definitions

These are the tools available to the AI agent. Each tool is a function with typed parameters.

### Scene Tools

| Tool | Parameters | Description |
|---|---|---|
| `create_shape` | `type, dimensions, position, rotation, material` | Create a primitive (box, cylinder, sphere, torus, cone, plane) |
| `modify_shape` | `object_id, property, value` | Change position, rotation, scale, dimensions, material |
| `delete_object` | `object_id` | Remove an object from the scene |
| `duplicate_object` | `object_id, offset` | Clone an object with optional position offset |
| `group_objects` | `object_ids, group_name` | Create a named group |

### Geometry Tools

| Tool | Parameters | Description |
|---|---|---|
| `boolean_union` | `object_a_id, object_b_id` | Merge two objects |
| `boolean_subtract` | `object_a_id, object_b_id` | Cut B from A |
| `boolean_intersect` | `object_a_id, object_b_id` | Keep only intersection |
| `extrude_face` | `object_id, face_index, distance` | Extrude a face |
| `apply_fillet` | `object_id, edge_indices, radius` | Round edges |

### Analysis Tools

| Tool | Parameters | Description |
|---|---|---|
| `measure_distance` | `point_a, point_b` | Calculate distance between points |
| `get_bounding_box` | `object_id` | Get object dimensions |
| `analyze_design` | `criteria[]` | Check printability, symmetry, balance |
| `suggest_improvements` | `focus_area` | Suggest design optimizations |

### Scene Query Tools

| Tool | Parameters | Description |
|---|---|---|
| `list_objects` | — | Get all objects in scene |
| `get_object_info` | `object_id` | Get full details of an object |
| `get_selected` | — | Get currently selected object(s) |
| `get_scene_summary` | — | High-level scene description |

---

## How the Agent Panel Looks (UI)

The agent panel is NOT a chat window. It's an **action stream**:

```
┌─ AI Agent ──────────────────────────────┐
│                                          │
│  ┌─ Command ───────────────────────────┐ │
│  │ "Make this look like a coffee mug"  │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ⚡ Planning actions...                  │
│                                          │
│  ✅ Created cylinder (body)              │
│     → 40mm × 60mm at origin             │
│                                          │
│  ✅ Created torus (handle)               │
│     → radius 15mm, tube 4mm             │
│     → positioned at right side           │
│                                          │
│  ✅ Boolean subtract (hollow interior)   │
│     → wall thickness: 3mm               │
│                                          │
│  ✅ Grouped as "Coffee Mug"             │
│                                          │
│  ── 4 actions completed in 2.1s ──       │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ What should I build or modify?      │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

Key differences from a chatbot:
- **No AI text paragraphs** — just action confirmations
- **Visual indicators** — checkmarks, spinners, progress
- **Direct links** — clicking an action highlights the object in viewport
- **Compact** — each action is one line, not a paragraph

---

## System Prompt (Core)

```
You are CADai Agent — an AI that designs 3D models by executing tool calls.

RULES:
1. NEVER respond with explanatory text. ONLY use tool calls.
2. Think step-by-step about what geometry is needed.
3. Use realistic dimensions in millimeters.
4. Apply appropriate materials (color, metalness, roughness).
5. Group related objects with descriptive names.
6. Consider the current scene state before making changes.
7. If the user's request is unclear, use get_scene_summary first,
   then make reasonable assumptions based on context.

You have access to the following tools:
{tool_definitions}

Current scene state:
{scene_state}

User's selected object:
{selected_object}
```

---

## Agentic Behaviors (Beyond Simple Prompts)

### Multi-Step Reasoning
User says "design a table" → Agent plans:
1. Create table top (box)
2. Create 4 legs (cylinders)
3. Position legs at corners
4. Group everything
5. Apply wood material

### Context Awareness
User has a box selected, says "add a hole" → Agent:
1. Reads selected object dimensions
2. Creates cylinder slightly larger than needed
3. Positions at center of the top face
4. Boolean subtract from the box

### Iterative Refinement
User says "make it bigger" → Agent:
1. Checks what's selected or most recently created
2. Scales it up proportionally
3. Adjusts connected/grouped objects if needed

### Proactive Suggestions (Future)
After user creates something, agent can offer:
- "This design has thin walls — add fillets for strength?"
- "Objects aren't aligned — should I snap to grid?"
- "This could be simplified by merging these 3 objects"

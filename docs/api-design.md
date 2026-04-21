# API Design

> Backend API endpoints and request/response contracts.

---

## Base URL

```
Development: http://localhost:8001/api  (default; override via frontend VITE_API_URL)
```

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

### AI Agent Action

The primary endpoint. User sends a prompt + current scene state → AI agent returns a list of executable actions.

```
POST /api/agent/action
```

**Request Body:**
```json
{
  "prompt": "Create a coffee mug",
  "scene_state": {
    "objects": [
      {
        "id": "box_1",
        "type": "box",
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1],
        "dimensions": { "width": 10, "height": 10, "depth": 10 },
        "material": { "color": "#4a90d9", "metalness": 0, "roughness": 0.5 }
      }
    ],
    "selected_object_id": "box_1",
    "camera_position": [10, 10, 10]
  }
}
```

**Response:**
```json
{
  "success": true,
  "actions": [
    {
      "tool": "create_shape",
      "args": {
        "type": "cylinder",
        "dimensions": { "radius": 20, "height": 50 },
        "position": [0, 25, 0],
        "material": { "color": "#c0c0c0", "metalness": 0.3, "roughness": 0.6 }
      },
      "description": "Created cylinder (mug body)"
    },
    {
      "tool": "create_shape",
      "args": {
        "type": "torus",
        "dimensions": { "radius": 12, "tube": 3 },
        "position": [22, 25, 0],
        "rotation": [0, 0, 1.5708],
        "material": { "color": "#c0c0c0", "metalness": 0.3, "roughness": 0.6 }
      },
      "description": "Created torus (handle)"
    },
    {
      "tool": "group_objects",
      "args": {
        "object_ids": ["$0", "$1"],
        "group_name": "Coffee Mug"
      },
      "description": "Grouped as Coffee Mug"
    }
  ],
  "agent_summary": "Created a coffee mug with body and handle — 3 actions"
}
```

**Notes:**
- `$0`, `$1` etc. refer to objects created by previous actions in the same response
- Each action has a human-readable `description` for the agent panel

---

### Export Scene

```
POST /api/export
```

**Request Body:**
```json
{
  "format": "stl",
  "scene_state": { ... }
}
```

**Response:** Binary file download

**Supported formats:** `stl`, `gltf`, `obj`

---

### Project Save/Load (Phase 2+)

```
POST /api/project/save
GET  /api/project/{project_id}
GET  /api/project/list
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROMPT",
    "message": "Prompt cannot be empty"
  }
}
```

---

## CORS Configuration

```python
origins = [
    "http://localhost:5173",    # Vite dev server
    "http://localhost:3000",    # Alternative
]
```

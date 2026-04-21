"""
CAD Agent Engine -- uses Google ADK to run the agentic AI.

This is the core that ties the LLM, tools, and scene context together.
The ADK Agent handles function calling automatically: the LLM decides
which tools to call, ADK executes them, and results flow back.
"""

from __future__ import annotations

import logging
import json
import os
from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner
from google.genai import types

from src.config import get_settings
from src.services.agent.tools import ALL_TOOLS

logger = logging.getLogger(__name__)
settings = get_settings()

# ADK reads GOOGLE_API_KEY from env — bridge from our config
if settings.gemini_api_key and not os.environ.get("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key

# System prompt -- instructs the model to act as a CAD agent, not a chatbot
SYSTEM_INSTRUCTION = """You are CADai Agent, an AI that designs 3D models by executing tool calls.

RULES:
1. You MUST respond ONLY with tool calls. Do NOT write explanatory text or paragraphs.
2. Think step-by-step about what geometry is needed to fulfill the user's request.
3. Use realistic, industry-standard dimensions. All dimensions are in scene units (1 unit = roughly 1mm in real scale for small parts, or treat as relative).
4. Apply appropriate materials -- use realistic colors, metalness, and roughness for the described object.
5. Give every object a clear, professional name (e.g. 'Flange Base Plate', 'M8 Mounting Hole', 'Heat Sink Fin Array').
6. Group related objects with descriptive assembly names.
7. Consider the current scene state before making changes. Do not create duplicates of objects that already exist unless asked.
8. If the user refers to 'it' or 'that', they mean the currently selected object or the most recently discussed object.
9. Position objects logically relative to each other. Stack things on top, align centers, offset appropriately.
10. When creating multi-part assemblies, build each component separately and then group them.

MATERIAL GUIDELINES:
- Steel/Metal: color=#A8A9AD, metalness=0.8, roughness=0.3
- Aluminum: color=#C0C0C0, metalness=0.7, roughness=0.4
- Plastic (dark): color=#2D2D2D, metalness=0.0, roughness=0.6
- Plastic (light): color=#E8E8E8, metalness=0.0, roughness=0.5
- Wood: color=#8B6914, metalness=0.0, roughness=0.8
- Rubber: color=#1A1A1A, metalness=0.0, roughness=0.9
- Copper: color=#B87333, metalness=0.9, roughness=0.2
- Glass: color=#88CCFF, metalness=0.1, roughness=0.1

You have access to scene manipulation tools. Use them."""


def _build_scene_context(scene_state: dict) -> str:
    """Format scene state into a readable context string for the agent."""
    objects = scene_state.get("objects", [])
    selected = scene_state.get("selected_object_id")

    if not objects:
        return "The scene is currently empty. No objects exist yet."

    lines = [f"Current scene has {len(objects)} object(s):"]
    for obj in objects:
        line = (
            f"  - id={obj['id']} name='{obj.get('name', 'Unnamed')}' "
            f"type={obj['type']} "
            f"pos=[{obj['position'][0]:.1f}, {obj['position'][1]:.1f}, {obj['position'][2]:.1f}]"
        )
        if obj.get("dimensions"):
            dims = obj["dimensions"]
            dim_parts = [f"{k}={v}" for k, v in dims.items() if v is not None]
            if dim_parts:
                line += f" dims=[{', '.join(dim_parts)}]"
        lines.append(line)

    if selected:
        lines.append(f"\nCurrently selected object: {selected}")

    return "\n".join(lines)


# Build the ADK Agent
cad_agent = Agent(
    name="cad_agent",
    model=settings.gemini_model,
    instruction=SYSTEM_INSTRUCTION,
    tools=ALL_TOOLS,
)

# In-memory runner for development
runner = InMemoryRunner(agent=cad_agent, app_name="cadai")

# Persistent user/session for now (single user dev mode)
USER_ID = "dev_user"
SESSION_ID = "dev_session"
_session_created = False


async def _ensure_session():
    """Create the dev session if it doesn't exist yet."""
    global _session_created
    if not _session_created:
        await runner.session_service.create_session(
            app_name="cadai",
            user_id=USER_ID,
            session_id=SESSION_ID,
        )
        _session_created = True


async def execute_agent_action(prompt: str, scene_state: dict) -> dict:
    """
    Execute an AI agent action given a user prompt and current scene state.

    Args:
        prompt: Natural language instruction from the user.
        scene_state: Current state of the 3D scene (objects, selection, camera).

    Returns:
        dict with 'success', 'actions', 'agent_summary', and optional 'error'.
    """
    try:
        await _ensure_session()

        # Build context-enriched prompt
        context = _build_scene_context(scene_state)
        full_prompt = f"{context}\n\nUser request: {prompt}"

        logger.info(f"Agent executing: {prompt}")

        # Create the user message
        message = types.Content(
            role="user",
            parts=[types.Part(text=full_prompt)],
        )

        # Run the agent and collect all events
        actions = []
        agent_text = ""

        async for event in runner.run_async(
            user_id=USER_ID,
            session_id=SESSION_ID,
            new_message=message,
        ):
            # Collect tool call results from function responses
            if event.content and event.content.parts:
                for part in event.content.parts:
                    # Check for function responses (tool results)
                    if part.function_response:
                        result = part.function_response.response
                        if isinstance(result, dict) and "tool" in result:
                            actions.append(result)
                    # Collect any text the model generates
                    elif part.text:
                        agent_text += part.text

        # Build summary
        if actions:
            summary = f"{len(actions)} action(s) completed"
        elif agent_text:
            summary = agent_text.strip()
        else:
            summary = "No actions were taken"

        logger.info(f"Agent completed: {len(actions)} actions")

        return {
            "success": True,
            "actions": actions,
            "agent_summary": summary,
            "error": None,
        }

    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)
        return {
            "success": False,
            "actions": [],
            "agent_summary": "",
            "error": str(e),
        }

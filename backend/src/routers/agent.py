"""Agent router -- handles AI agent action requests from the frontend."""

import logging
from fastapi import APIRouter
from src.models.agent import AgentActionRequest, AgentActionResponse
from src.services.agent.engine import execute_agent_action

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/action", response_model=AgentActionResponse)
async def agent_action(request: AgentActionRequest):
    """
    Execute an AI agent action.

    The frontend sends the user's prompt along with the current scene state.
    The agent analyzes the scene, plans tool calls, and returns a list of
    executable actions that the frontend applies to the 3D viewport.
    """
    logger.info(f"Agent action request: {request.prompt[:100]}")

    result = await execute_agent_action(
        prompt=request.prompt,
        scene_state=request.scene_state.model_dump(),
    )

    return AgentActionResponse(**result)

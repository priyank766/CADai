"""Pydantic models for agent requests and responses."""

from __future__ import annotations
from typing import Optional, Any
from pydantic import BaseModel
from src.models.scene import SceneState


class AgentActionRequest(BaseModel):
    """Request from frontend to execute an AI agent action."""
    prompt: str
    scene_state: SceneState


class ToolCall(BaseModel):
    """A single tool call returned by the AI agent."""
    tool: str
    args: dict[str, Any]
    description: str = ""


class AgentActionResponse(BaseModel):
    """Response from the AI agent with executable actions."""
    success: bool = True
    actions: list[ToolCall] = []
    agent_summary: str = ""
    error: Optional[str] = None

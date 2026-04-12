"""Pydantic models for scene objects and state."""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class MaterialData(BaseModel):
    """PBR material properties."""
    color: str = "#6b7280"
    metalness: float = 0.0
    roughness: float = 0.5
    opacity: float = 1.0


class DimensionsData(BaseModel):
    """Shape dimensions — fields vary by shape type."""
    width: Optional[float] = None
    height: Optional[float] = None
    depth: Optional[float] = None
    radius: Optional[float] = None
    radius_top: Optional[float] = None
    radius_bottom: Optional[float] = None
    tube: Optional[float] = None
    arc: Optional[float] = None


class SceneObject(BaseModel):
    """A single object in the 3D scene."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = "Object"
    type: str = "box"
    position: list[float] = [0.0, 0.0, 0.0]
    rotation: list[float] = [0.0, 0.0, 0.0]
    scale: list[float] = [1.0, 1.0, 1.0]
    dimensions: DimensionsData = Field(default_factory=DimensionsData)
    material: MaterialData = Field(default_factory=MaterialData)
    visible: bool = True
    locked: bool = False
    parent_id: Optional[str] = None


class SceneState(BaseModel):
    """Complete state of the 3D scene."""
    objects: list[SceneObject] = []
    selected_object_id: Optional[str] = None
    camera_position: list[float] = [10.0, 10.0, 10.0]

"""
CAD Agent Tools -- all tools the AI agent can invoke on the 3D scene.

Each function is a tool. The ADK reads the function name, docstring,
and type hints to build the schema automatically. Return dicts so the
model can process results.
"""

from __future__ import annotations
import uuid
import logging

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Scene manipulation tools
# ---------------------------------------------------------------------------

def create_shape(
    shape_type: str,
    name: str,
    width: float = 1.0,
    height: float = 1.0,
    depth: float = 1.0,
    radius: float = 0.5,
    radius_top: float = 0.5,
    radius_bottom: float = 0.5,
    tube: float = 0.2,
    position_x: float = 0.0,
    position_y: float = 0.0,
    position_z: float = 0.0,
    rotation_x: float = 0.0,
    rotation_y: float = 0.0,
    rotation_z: float = 0.0,
    color: str = "#6b7280",
    metalness: float = 0.0,
    roughness: float = 0.5,
) -> dict:
    """
    Create a 3D primitive shape in the scene.

    Args:
        shape_type: One of 'box', 'cylinder', 'sphere', 'cone', 'torus', 'plane'.
        name: Descriptive name for the object (e.g. 'Mounting Bracket Base').
        width: Width in scene units (used by box and plane).
        height: Height in scene units (used by box, cylinder, cone).
        depth: Depth in scene units (used by box).
        radius: Radius (used by sphere, torus).
        radius_top: Top radius (used by cylinder, cone).
        radius_bottom: Bottom radius (used by cylinder, cone).
        tube: Tube radius (used by torus).
        position_x: X position in the scene.
        position_y: Y position in the scene.
        position_z: Z position in the scene.
        rotation_x: X rotation in radians.
        rotation_y: Y rotation in radians.
        rotation_z: Z rotation in radians.
        color: Hex color string (e.g. '#4a90d9').
        metalness: PBR metalness value between 0 and 1.
        roughness: PBR roughness value between 0 and 1.

    Returns:
        dict with the created object data including its generated id.
    """
    obj_id = str(uuid.uuid4())[:8]
    logger.info(f"Tool: create_shape type={shape_type} name={name} id={obj_id}")

    return {
        "tool": "create_shape",
        "object": {
            "id": obj_id,
            "name": name,
            "type": shape_type,
            "position": [position_x, position_y, position_z],
            "rotation": [rotation_x, rotation_y, rotation_z],
            "scale": [1.0, 1.0, 1.0],
            "dimensions": {
                "width": width,
                "height": height,
                "depth": depth,
                "radius": radius,
                "radiusTop": radius_top,
                "radiusBottom": radius_bottom,
                "tube": tube,
            },
            "material": {
                "color": color,
                "metalness": metalness,
                "roughness": roughness,
                "opacity": 1.0,
            },
            "visible": True,
            "locked": False,
        },
        "description": f"Created {shape_type} '{name}'",
    }


def modify_shape(
    object_id: str,
    position_x: float = None,
    position_y: float = None,
    position_z: float = None,
    rotation_x: float = None,
    rotation_y: float = None,
    rotation_z: float = None,
    scale_x: float = None,
    scale_y: float = None,
    scale_z: float = None,
    color: str = None,
    metalness: float = None,
    roughness: float = None,
    name: str = None,
) -> dict:
    """
    Modify properties of an existing object in the scene.

    Args:
        object_id: The id of the object to modify.
        position_x: New X position (or None to keep current).
        position_y: New Y position (or None to keep current).
        position_z: New Z position (or None to keep current).
        rotation_x: New X rotation in radians (or None to keep current).
        rotation_y: New Y rotation in radians (or None to keep current).
        rotation_z: New Z rotation in radians (or None to keep current).
        scale_x: New X scale (or None to keep current).
        scale_y: New Y scale (or None to keep current).
        scale_z: New Z scale (or None to keep current).
        color: New hex color (or None to keep current).
        metalness: New metalness 0-1 (or None to keep current).
        roughness: New roughness 0-1 (or None to keep current).
        name: New name (or None to keep current).

    Returns:
        dict describing the modifications to apply.
    """
    logger.info(f"Tool: modify_shape id={object_id}")

    updates = {}
    if position_x is not None or position_y is not None or position_z is not None:
        updates["position"] = [position_x, position_y, position_z]
    if rotation_x is not None or rotation_y is not None or rotation_z is not None:
        updates["rotation"] = [rotation_x, rotation_y, rotation_z]
    if scale_x is not None or scale_y is not None or scale_z is not None:
        updates["scale"] = [scale_x, scale_y, scale_z]
    if color is not None or metalness is not None or roughness is not None:
        updates["material"] = {}
        if color is not None:
            updates["material"]["color"] = color
        if metalness is not None:
            updates["material"]["metalness"] = metalness
        if roughness is not None:
            updates["material"]["roughness"] = roughness
    if name is not None:
        updates["name"] = name

    return {
        "tool": "modify_shape",
        "object_id": object_id,
        "updates": updates,
        "description": f"Modified object {object_id}",
    }


def delete_object(object_id: str) -> dict:
    """
    Delete an object from the scene.

    Args:
        object_id: The id of the object to remove.

    Returns:
        dict confirming deletion.
    """
    logger.info(f"Tool: delete_object id={object_id}")
    return {
        "tool": "delete_object",
        "object_id": object_id,
        "description": f"Deleted object {object_id}",
    }


def duplicate_object(
    object_id: str,
    offset_x: float = 2.0,
    offset_y: float = 0.0,
    offset_z: float = 0.0,
    new_name: str = None,
) -> dict:
    """
    Duplicate an existing object with a position offset.

    Args:
        object_id: The id of the object to clone.
        offset_x: X offset from original position.
        offset_y: Y offset from original position.
        offset_z: Z offset from original position.
        new_name: Name for the duplicate (or None to auto-name).

    Returns:
        dict with duplication data.
    """
    new_id = str(uuid.uuid4())[:8]
    logger.info(f"Tool: duplicate_object {object_id} -> {new_id}")
    return {
        "tool": "duplicate_object",
        "source_id": object_id,
        "new_id": new_id,
        "offset": [offset_x, offset_y, offset_z],
        "new_name": new_name,
        "description": f"Duplicated object {object_id} as {new_name or new_id}",
    }


def group_objects(object_ids: list[str], group_name: str) -> dict:
    """
    Group multiple objects together under a named group.

    Args:
        object_ids: List of object ids to group together.
        group_name: Name for the group (e.g. 'Bearing Housing Assembly').

    Returns:
        dict with the group data.
    """
    group_id = str(uuid.uuid4())[:8]
    logger.info(f"Tool: group_objects name={group_name} ids={object_ids}")
    return {
        "tool": "group_objects",
        "group_id": group_id,
        "group_name": group_name,
        "object_ids": object_ids,
        "description": f"Grouped {len(object_ids)} objects as '{group_name}'",
    }


# ---------------------------------------------------------------------------
# Query tools
# ---------------------------------------------------------------------------

def get_scene_summary(scene_description: str = "") -> dict:
    """
    Request a summary of the current scene. Use this when you need to
    understand what objects already exist before making changes.

    Args:
        scene_description: The current scene state provided in the context.

    Returns:
        dict acknowledging the scene was reviewed.
    """
    return {
        "tool": "get_scene_summary",
        "description": "Reviewed current scene state",
    }


# ---------------------------------------------------------------------------
# Collect all tools for the agent
# ---------------------------------------------------------------------------

ALL_TOOLS = [
    create_shape,
    modify_shape,
    delete_object,
    duplicate_object,
    group_objects,
    get_scene_summary,
]

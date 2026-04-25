# CADai Backend Service

This repository contains the backend service for CADai. It is built using Python and FastAPI, serving as the core orchestrator between the frontend 3D viewport and the AI agent layer.

## Overview

The backend is responsible for receiving user intents from the frontend, processing them through the AI Agent Engine, and executing the necessary tool calls to mutate the 3D scene. It utilizes the Google Agent Development Kit (ADK) and Google Gemini to interpret natural language and generate structured action sequences.

## Architecture

The backend consists of several key components:

*   **API Router**: Handles FastAPI endpoints, request validation, and response formatting.
*   **AI Agent Engine**: The core processing unit that plans steps and calls tools based on the user's prompt and current scene state.
*   **LLM Client**: An isolated integration with the Gemini SDK, designed to be easily swappable.
*   **Tool Registry**: A comprehensive set of Python functions defining what the AI agent can do (e.g., `create_shape`, `boolean_union`, `group_objects`).
*   **Project Service**: Manages saving, loading, and exporting projects to various formats (JSON, STL, GLTF, OBJ).

## Prerequisites

*   Python 3.11 or higher
*   `uv` package manager

## Installation and Setup

1.  **Install Dependencies**: The project utilizes `uv` for fast dependency management.
    ```bash
    uv sync
    ```

2.  **Environment Variables**: Ensure your environment is configured with the necessary API keys for Google Gemini. You can create a `.env` file in the backend directory.

## Running the Server

Start the FastAPI development server:

```bash
uv run uvicorn src.main:app --reload
```

Alternatively, depending on the entry point configuration, you may run:
```bash
uv run src/main.py
```

The API documentation (Swagger UI) will typically be available at `/docs` once the server is running.

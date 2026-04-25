/**
 * API service -- communicates with the CADai backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function sendAgentAction(prompt, sceneState) {
  const response = await fetch(`${API_BASE}/agent/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      scene_state: sceneState,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

/**
 * Engineering material presets. Values mirror the AI agent's system prompt
 * so user-applied materials and agent-applied materials are interchangeable.
 */

export const MATERIAL_PRESETS = [
  { id: 'steel',    name: 'Steel',    color: '#A8A9AD', metalness: 0.8, roughness: 0.3 },
  { id: 'aluminum', name: 'Aluminum', color: '#C0C0C0', metalness: 0.7, roughness: 0.4 },
  { id: 'copper',   name: 'Copper',   color: '#B87333', metalness: 0.9, roughness: 0.2 },
  { id: 'brass',    name: 'Brass',    color: '#B5A642', metalness: 0.85, roughness: 0.25 },
  { id: 'plastic_dark',  name: 'Plastic (dark)',  color: '#2D2D2D', metalness: 0.0, roughness: 0.6 },
  { id: 'plastic_light', name: 'Plastic (light)', color: '#E8E8E8', metalness: 0.0, roughness: 0.5 },
  { id: 'rubber', name: 'Rubber', color: '#1A1A1A', metalness: 0.0, roughness: 0.9 },
  { id: 'wood',   name: 'Wood',   color: '#8B6914', metalness: 0.0, roughness: 0.8 },
  { id: 'glass',  name: 'Glass',  color: '#88CCFF', metalness: 0.1, roughness: 0.1 },
];

import { useState, useRef, useEffect } from 'react';
import useSceneStore from '../../store/sceneStore';
import { sendAgentAction } from '../../services/api';

const PRESET_PROMPTS = [
  'Flanged bearing housing with M8 mounting holes',
  'Heat sink with 8 fins, 2mm spacing',
  'NEMA 17 motor mounting bracket',
  'Cable management clip for 10mm cables',
  'PCB enclosure with snap-fit lid',
];

/**
 * Agent panel -- action stream UI for the AI agent.
 * This is NOT a chatbot. It shows a stream of executed actions.
 */
export default function AgentPanel() {
  const [prompt, setPrompt] = useState('');
  const agentActions = useSceneStore((s) => s.agentActions);
  const agentLoading = useSceneStore((s) => s.agentLoading);
  const agentError = useSceneStore((s) => s.agentError);
  const setAgentLoading = useSceneStore((s) => s.setAgentLoading);
  const addAgentAction = useSceneStore((s) => s.addAgentAction);
  const setAgentError = useSceneStore((s) => s.setAgentError);
  const applyAgentActions = useSceneStore((s) => s.applyAgentActions);
  const getSceneState = useSceneStore((s) => s.getSceneState);

  const actionsEndRef = useRef(null);

  useEffect(() => {
    actionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentActions]);

  const handleSubmit = async (text) => {
    const promptText = text || prompt;
    if (!promptText.trim() || agentLoading) return;

    setPrompt('');
    setAgentLoading(true);
    setAgentError(null);

    // Show the command in the action stream
    addAgentAction({ type: 'command', text: promptText });

    try {
      const sceneState = getSceneState();
      const response = await sendAgentAction(promptText, sceneState);

      if (response.success && response.actions.length > 0) {
        // Show each action in the stream
        response.actions.forEach((action) => {
          addAgentAction({
            type: 'success',
            text: action.description || `Executed ${action.tool}`,
          });
        });

        // Apply actions to the scene
        applyAgentActions(response.actions);

        // Summary
        addAgentAction({
          type: 'summary',
          text: response.agent_summary,
        });
      } else if (response.error) {
        addAgentAction({ type: 'error', text: response.error });
        setAgentError(response.error);
      } else {
        addAgentAction({
          type: 'info',
          text: response.agent_summary || 'No actions were taken',
        });
      }
    } catch (err) {
      const msg = err.message || 'Failed to connect to backend';
      addAgentAction({ type: 'error', text: msg });
      setAgentError(msg);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="agent-panel">
      <div className="panel-section__header">
        <span className="panel-section__title">AI Agent</span>
        {agentLoading && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
            Working...
          </span>
        )}
      </div>

      {/* Action stream */}
      <div className="agent-panel__actions">
        {agentActions.length === 0 ? (
          <div className="agent-panel__empty">
            <span style={{ fontSize: 'var(--text-lg)', opacity: 0.3 }}>&#9881;</span>
            <span>Describe what to build or modify.</span>
            <span style={{ fontSize: 'var(--text-xs)' }}>
              The agent executes actions directly on the scene.
            </span>
          </div>
        ) : (
          agentActions.map((action, i) => (
            <ActionItem key={i} action={action} />
          ))
        )}
        {agentLoading && (
          <div className="agent-action">
            <span className="agent-action__icon agent-action__icon--pending">&#9881;</span>
            <span className="agent-action__text">Planning actions...</span>
          </div>
        )}
        <div ref={actionsEndRef} />
      </div>

      {/* Preset suggestions */}
      {agentActions.length === 0 && (
        <div className="agent-presets">
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p}
              className="agent-preset"
              onClick={() => handleSubmit(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="agent-input">
        <input
          className="agent-input__field"
          placeholder="Describe what to build..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={agentLoading}
        />
        <button
          className="agent-input__submit"
          onClick={() => handleSubmit()}
          disabled={agentLoading || !prompt.trim()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ActionItem({ action }) {
  const iconMap = {
    command: { symbol: '>', className: '' },
    success: { symbol: '\u2713', className: 'agent-action__icon--success' },
    error: { symbol: '\u2717', className: 'agent-action__icon--error' },
    info: { symbol: 'i', className: '' },
    summary: { symbol: '\u2014', className: '' },
  };

  const icon = iconMap[action.type] || iconMap.info;

  return (
    <div className={`agent-action ${action.type === 'command' ? '' : ''}`}>
      <span
        className={`agent-action__icon ${icon.className}`}
        style={action.type === 'command' ? { color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 } : {}}
      >
        {icon.symbol}
      </span>
      <span
        className="agent-action__text"
        style={action.type === 'command' ? { color: 'var(--text-primary)', fontWeight: 500 } : {}}
      >
        {action.text}
      </span>
    </div>
  );
}

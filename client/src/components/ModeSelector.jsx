import React from 'react';

const MODES = [
  { id: 'ask',       label: '💬 Free Q&A',         desc: 'Ask anything through the DSSM lens' },
  { id: 'classify',  label: '🏛️ Stage Classifier',  desc: 'Classify a site into DSSM Stages 1–4' },
  { id: 'score',     label: '📊 FCP 2D Scorer',     desc: 'Score a site with the Field Companion Protocol' },
  { id: 'satellite', label: '🛰️ Satellite Analysis', desc: 'Predict excavation zones from satellite data' },
];

const s = {
  container: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1.5rem 0',
    flexWrap: 'wrap',
  },
  btn: (active) => ({
    flex: '1',
    minWidth: '180px',
    padding: '0.9rem 1rem',
    background: active ? 'linear-gradient(135deg, #3d2000, #5c3300)' : '#1a0f00',
    border: active ? '2px solid #d4a017' : '2px solid #3d2800',
    borderRadius: '8px',
    color: active ? '#f0c040' : '#8b6914',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  }),
  label: { fontSize: '0.95rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' },
  desc: { fontSize: '0.75rem', opacity: 0.8 },
};

export default function ModeSelector({ activeMode, onModeChange }) {
  return (
    <div style={s.container}>
      {MODES.map(m => (
        <button
          key={m.id}
          style={s.btn(activeMode === m.id)}
          onClick={() => onModeChange(m.id)}
        >
          <span style={s.label}>{m.label}</span>
          <span style={s.desc}>{m.desc}</span>
        </button>
      ))}
    </div>
  );
}

import React from 'react';

const STAGES = [
  { num: 1, name: 'Embodied Symbolic Familiarity', color: '#8B4513', shortName: 'Stage 1' },
  { num: 2, name: 'Ritualized Repetition',          color: '#CD853F', shortName: 'Stage 2' },
  { num: 3, name: 'Material Amplification',          color: '#DAA520', shortName: 'Stage 3' },
  { num: 4, name: 'Cognitive Offloading',            color: '#FFD700', shortName: 'Stage 4' },
];

const s = {
  container: { marginBottom: '1.5rem' },
  label: { fontSize: '0.8rem', color: '#a08040', marginBottom: '0.5rem', letterSpacing: '0.08em' },
  bar: { display: 'flex', gap: '4px', borderRadius: '6px', overflow: 'hidden' },
  segment: (active, color) => ({
    flex: 1,
    padding: '0.6rem 0.3rem',
    background: active ? color : '#2d1800',
    border: active ? `2px solid ${color}` : '2px solid #3d2800',
    textAlign: 'center',
    fontSize: '0.7rem',
    color: active ? '#fff' : '#6b5030',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.3s',
    cursor: 'default',
  }),
  num: { display: 'block', fontSize: '1.1rem', fontWeight: 'bold' },
};

export default function StageBar({ activeStage }) {
  return (
    <div style={s.container}>
      <div style={s.label}>DSSM STAGE</div>
      <div style={s.bar}>
        {STAGES.map(st => (
          <div key={st.num} style={s.segment(activeStage === st.num, st.color)}>
            <span style={s.num}>{st.num}</span>
            {st.shortName}
          </div>
        ))}
      </div>
    </div>
  );
}

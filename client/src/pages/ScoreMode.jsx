import React, { useState } from 'react';
import ResponsePanel from '../components/ResponsePanel';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../context/AuthContext';

const OBSERVABLES = [
  { id: 'O1', name: 'O1: Pigment / Ochre Use', placeholder: 'Describe pigment evidence: ochre pieces, grinding stones, residues, context...' },
  { id: 'O2', name: 'O2: Personal Ornaments', placeholder: 'Describe ornaments: shell beads, perforations, teeth, wear patterns...' },
  { id: 'O3', name: 'O3: Geometric Engravings', placeholder: 'Describe marks: incised patterns, motifs, repetition, surfaces...' },
  { id: 'O4', name: 'O4: Portable Symbolic Anchors', placeholder: 'Describe portable objects: figurines, amulets, decorated tools, seals...' },
  { id: 'O5', name: 'O5: Spatial Complexity / Architecture', placeholder: 'Describe spatial evidence: constructed features, non-domestic spaces, shrines...' },
  { id: 'O6', name: 'O6: Standardization / Transmission', placeholder: 'Describe standardization: CV metrics, cross-site consistency, production uniformity...' },
];

const PRESETS = [
  {
    label: 'Blombos Cave',
    siteName: 'Blombos Cave',
    location: 'Western Cape, South Africa',
    dateRange: '100,000–70,000 BCE',
    observables: {
      O1: 'Red ochre pieces with evidence of mixing and processing; ochre grinding slabs; residue on shells used as containers; pervasive use across multiple contexts',
      O2: 'Nassarius shell beads with standardized perforation technique, wear patterns indicating extended use, found in clusters suggesting social display',
      O3: 'Cross-hatched geometric engravings on ochre pieces (M1-Q1 series); repetitive parallel-line motifs on bone; consistent formal structure across multiple pieces',
      O4: 'Engraved ochre pieces as portable symbolic objects; decorated bone tools; ochre containers (abalone shells with residue)',
      O5: 'Structured occupation layers; hearths; evidence of specialized activity areas within cave; ochre processing workshop area',
      O6: 'Cross-hatched motifs reproduced with high fidelity across multiple pieces; standardized bead production method (CV < 0.2); multi-site transmission to Pinnacle Point',
    }
  },
  {
    label: 'Bruniquel Cave',
    siteName: 'Bruniquel Cave',
    location: 'Tarn-et-Garonne, France',
    dateRange: '176,500 BCE',
    observables: {
      O1: 'Burnt bone fragments associated with constructed structures; evidence of fire use deep in cave',
      O2: 'No personal ornaments identified',
      O3: 'No formal geometric engravings identified; possible marks on stalagmites',
      O4: 'Constructed stalagmite ring structures themselves as portable-principle anchors; deliberate material selection',
      O5: 'Two large circular/oval stalagmite constructions (6.7m² and 2.2m²) deep in cave (336m from entrance); deliberate architectural arrangement; controlled fire use within structures',
      O6: 'Consistent construction technique across both ring structures; deliberate selection of similarly-sized stalagmite fragments; spatial organization implies shared behavioral template',
    }
  },
  {
    label: 'Omo Kibish',
    siteName: 'Omo Kibish (KHS)',
    location: 'Omo Valley, Ethiopia',
    dateRange: '195,000 BCE',
    observables: {
      O1: 'Limited ochre evidence; some iron-oxide staining on sediments but no clear processing evidence',
      O2: 'No personal ornaments identified',
      O3: 'No geometric engravings identified',
      O4: 'No portable symbolic objects identified',
      O5: 'Basic occupation site; no constructed spatial features',
      O6: 'Lithic technology present but no symbolic standardization evidence',
    }
  },
  {
    label: 'Çatalhöyük',
    siteName: 'Çatalhöyük',
    location: 'Central Anatolia, Turkey',
    dateRange: '7500–5700 BCE',
    observables: {
      O1: 'Extensive red ochre use in burials; wall paintings with red geometric/zoomorphic designs; red plaster floors renewed repeatedly; symbolic death/renewal cycle evident',
      O2: 'Shell and stone beads in burials; animal teeth pendants; obsidian mirrors; bone tools with decoration; differential grave goods indicating social marking',
      O3: 'Geometric wall paintings (hunting scenes, vulture motifs, hand stencils); carved relief panels; repeated bull-head (bucranium) motif across buildings',
      O4: 'Clay figurines (mother goddess type); bull skulls (bucrania) mounted on walls as symbolic anchors; stamp seals; decorated obsidian',
      O5: 'Densely packed mud-brick architecture; no streets (roof access); dedicated shrine rooms with wall art and bucrania; consistent building orientation; death/burial integration into floors',
      O6: 'Bucranium installation repeated across 18 building levels; wall painting conventions transmitted across centuries; standardized burial posture (flexed, red ochre); pottery forms consistent across site',
    }
  },
];

const BENCHMARKS = [
  { name: 'Omo Kibish', score: 2, color: '#4a2800' },
  { name: 'Bruniquel Cave', score: 8, color: '#8B4513' },
  { name: 'Blombos Cave', score: 12, color: '#b8860b' },
];

const s = {
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  presetRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' },
  presetLabel: { fontSize: '0.75rem', color: '#6b5030', letterSpacing: '0.05em', marginBottom: '0.3rem' },
  presetBtn: {
    background: '#1a0f00',
    border: '1px solid #3d2800',
    borderRadius: '20px',
    padding: '0.3rem 0.8rem',
    color: '#a08040',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  headerRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: '180px' },
  label: { fontSize: '0.75rem', color: '#a08040', letterSpacing: '0.08em' },
  input: { background: '#1a0f00', border: '2px solid #3d2800', borderRadius: '6px', padding: '0.7rem', color: '#e8d5a3', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' },
  obsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' },
  obsCard: { background: '#1a0f00', border: '1px solid #3d2800', borderRadius: '8px', padding: '0.75rem' },
  obsLabel: { fontSize: '0.8rem', color: '#d4a017', fontWeight: 'bold', marginBottom: '0.4rem', display: 'block' },
  textarea: { width: '100%', background: '#0d0800', border: '1px solid #3d2800', borderRadius: '4px', padding: '0.5rem', color: '#c8b580', fontFamily: 'inherit', fontSize: '0.82rem', outline: 'none', resize: 'vertical', minHeight: '70px', lineHeight: '1.5', boxSizing: 'border-box' },
  btn: { background: 'linear-gradient(135deg, #5c3300, #8b5000)', border: '2px solid #d4a017', borderRadius: '8px', padding: '0.9rem 2rem', color: '#f0c040', fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: '0.5rem' },
  benchmarks: { display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' },
  benchmark: (color) => ({ background: color, border: '1px solid #d4a017', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#fff', flex: 1, textAlign: 'center', minWidth: '100px' }),
};

export default function ScoreMode() {
  const { refreshCredits } = useAuth();
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [observables, setObservables] = useState({});
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setObs = (id, val) => setObservables(prev => ({ ...prev, [id]: val }));

  const loadPreset = (preset) => {
    setSiteName(preset.siteName);
    setLocation(preset.location);
    setDateRange(preset.dateRange);
    setObservables(preset.observables);
    setResponse('');
    setError('');
  };

  const handleScore = async () => {
    if (!siteName || loading) return;
    setLoading(true); setError(''); setResponse('');

    try {
      const res = await apiFetch('/api/score', {
        method: 'POST',
        body: JSON.stringify({ siteName, location, dateRange, observables })
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) { fullAnswer += data.chunk; setResponse(fullAnswer); setLoading(false); }
              if (data.error) throw new Error(data.error);
            } catch(e) { /* partial */ }
          }
        }
      }
      refreshCredits();
    } catch(err) {
      setError(err.message || 'Scoring failed. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={s.presetLabel}>LOAD EXAMPLE SITE:</div>
      <div style={s.presetRow}>
        {PRESETS.map(p => (
          <button key={p.label} style={s.presetBtn} onClick={() => loadPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={s.form}>
        <div style={s.headerRow}>
          <div style={s.field}><label style={s.label}>SITE NAME *</label><input style={s.input} value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="e.g. Blombos Cave" /></div>
          <div style={s.field}><label style={s.label}>LOCATION</label><input style={s.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Western Cape, South Africa" /></div>
          <div style={s.field}><label style={s.label}>DATE</label><input style={s.input} value={dateRange} onChange={e => setDateRange(e.target.value)} placeholder="e.g. 100,000–70,000 BCE" /></div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#a08040', letterSpacing: '0.08em', marginTop: '0.5rem' }}>DESCRIBE EVIDENCE FOR EACH OBSERVABLE (leave blank if absent):</div>
        <div style={s.obsGrid}>
          {OBSERVABLES.map(obs => (
            <div key={obs.id} style={s.obsCard}>
              <span style={s.obsLabel}>{obs.name}</span>
              <textarea style={s.textarea} value={observables[obs.id] || ''} onChange={e => setObs(obs.id, e.target.value)} placeholder={obs.placeholder} />
            </div>
          ))}
        </div>
        <button style={s.btn} onClick={handleScore} disabled={loading}>{loading ? '⏳ Scoring...' : 'Score with FCP →'}</button>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b5030', marginTop: '0.75rem' }}>BENCHMARK COMPARISON:</div>
      <div style={s.benchmarks}>
        {BENCHMARKS.map(b => (
          <div key={b.name} style={s.benchmark(b.color)}>
            <div style={{ fontWeight: 'bold' }}>{b.name}</div>
            <div style={{ fontSize: '1.1rem' }}>{b.score}/12</div>
          </div>
        ))}
      </div>
      <ResponsePanel response={response} loading={loading} error={error} title={`FCP 2D SCORE — ${siteName || 'SITE'}`} />
    </div>
  );
}

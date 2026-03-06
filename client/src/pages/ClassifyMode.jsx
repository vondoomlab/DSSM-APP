import React, { useState } from 'react';
import ResponsePanel from '../components/ResponsePanel';
import StageBar from '../components/StageBar';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../context/AuthContext';

const PRESET_SITES = [
  { name: 'Blombos Cave', location: 'Western Cape, South Africa', date: '100,000–70,000 BCE', evidence: 'Nassarius shell beads with standardized perforation technique and wear patterns, ochre processing kits with grinding stones, engraved geometric patterns on ochre slabs, evidence of systematic pigment production.' },
  { name: 'Çatalhöyük', location: 'Anatolia, Turkey', date: '7500–5700 BCE', evidence: 'Elaborately decorated shrines with bull bucrania mounted on walls, female figurines, painted murals with geometric and figurative motifs, standardized house layout across settlement, communal burial under house floors, no writing or administrative records.' },
  { name: 'Caral', location: 'Supe Valley, Peru', date: '3000–1800 BCE', evidence: 'Large platform mounds (monumental construction), planned urban layout, quipu knotted records, textile production evidence, no writing system found, long-distance trade in marine goods, amphitheatre structures suggesting communal ritual.' },
];

const s = {
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: '200px' },
  label: { fontSize: '0.75rem', color: '#a08040', letterSpacing: '0.08em' },
  input: { background: '#1a0f00', border: '2px solid #3d2800', borderRadius: '6px', padding: '0.7rem', color: '#e8d5a3', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' },
  textarea: { background: '#1a0f00', border: '2px solid #3d2800', borderRadius: '6px', padding: '0.7rem', color: '#e8d5a3', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', resize: 'vertical', minHeight: '120px', lineHeight: '1.6' },
  btn: { background: 'linear-gradient(135deg, #5c3300, #8b5000)', border: '2px solid #d4a017', borderRadius: '8px', padding: '0.9rem 2rem', color: '#f0c040', fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' },
  presets: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  presetBtn: { background: '#1a0f00', border: '1px solid #3d2800', borderRadius: '4px', padding: '0.3rem 0.7rem', color: '#a08040', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' },
  presetsLabel: { fontSize: '0.75rem', color: '#6b5030', marginBottom: '0.3rem' },
};

export default function ClassifyMode() {
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('');
  const { refreshCredits } = useAuth();
  const [dateRange, setDateRange] = useState('');
  const [evidence, setEvidence] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedStage, setDetectedStage] = useState(null);

  const loadPreset = (preset) => {
    setSiteName(preset.name); setLocation(preset.location);
    setDateRange(preset.date); setEvidence(preset.evidence);
  };

  const handleClassify = async () => {
    if (!siteName || !evidence || loading) return;
    setLoading(true); setError(''); setResponse(''); setDetectedStage(null);

    try {
      const res = await apiFetch('/api/classify', {
        method: 'POST',
        body: JSON.stringify({ siteName, location, dateRange, evidence })
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      if (data.error) throw new Error(data.error);
      const fullAnswer = data.answer || '';
      setResponse(fullAnswer);
      setLoading(false);
      const stageMatch = fullAnswer.match(/Stage\s*[:-]?\s*(\d)/i);
      if (stageMatch) setDetectedStage(parseInt(stageMatch[1]));
      refreshCredits();
    } catch(err) {
      setError(err.message || 'Classification failed. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={s.presetsLabel}>LOAD EXAMPLE SITE:</div>
      <div style={s.presets}>
        {PRESET_SITES.map((p, i) => <button key={i} style={s.presetBtn} onClick={() => loadPreset(p)}>{p.name}</button>)}
      </div>
      <div style={s.form}>
        <div style={s.row}>
          <div style={s.field}><label style={s.label}>SITE NAME *</label><input style={s.input} value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="e.g. Çatalhöyük" /></div>
          <div style={s.field}><label style={s.label}>LOCATION</label><input style={s.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Anatolia, Turkey" /></div>
          <div style={s.field}><label style={s.label}>DATE RANGE</label><input style={s.input} value={dateRange} onChange={e => setDateRange(e.target.value)} placeholder="e.g. 7500–5700 BCE" /></div>
        </div>
        <div style={s.field}>
          <label style={s.label}>EVIDENCE DESCRIPTION *</label>
          <textarea style={s.textarea} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Describe archaeological evidence: pigment use, ornaments, engravings, portable objects, architecture, settlement size, standardization data..." />
        </div>
        <button style={s.btn} onClick={handleClassify} disabled={loading}>{loading ? '⏳ Classifying...' : 'Classify Site →'}</button>
      </div>
      {detectedStage && <div style={{ marginTop: '1rem' }}><StageBar activeStage={detectedStage} /></div>}
      <ResponsePanel response={response} loading={loading} error={error} title={`DSSM STAGE CLASSIFICATION — ${siteName || 'SITE'}`} />
    </div>
  );
}

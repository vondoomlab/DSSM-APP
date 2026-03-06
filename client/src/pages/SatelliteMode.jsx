import React, { useState } from 'react';
import axios from 'axios';
import ResponsePanel from '../components/ResponsePanel';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../context/AuthContext';

const KNOWN_REGIONS = [
  { name: 'Göbekli Tepe (Turkey)', lat: 37.22, lng: 38.92, notes: 'Landscape-anchor pathway; 11,500–8,000 BCE Pre-Pottery Neolithic. T-shaped limestone pillars with carved reliefs (foxes, vultures, boars, abstract symbols). Monumental ritual enclosures with no domestic occupation — coordinated supra-community labor. Key Stage 2→3 transition site; early monumental architecture without agriculture. Target: sub-surface enclosure rings, quarry sites, satellite communities within 10km.' },
  { name: 'Nile Valley (Egypt)', lat: 26.0, lng: 32.0, notes: 'Landscape-anchor pathway; Stage 2→3 transition sites between Badarian and Naqada periods' },
  { name: 'Indus Valley (Harappan)', lat: 29.0, lng: 71.0, notes: 'Infrastructure-quotidian pathway; subsurface grid layouts, standardized brick structures' },
  { name: 'Fertile Crescent (Mesopotamia)', lat: 34.5, lng: 43.5, notes: 'Landscape-anchor pathway; tell mounds, early temple platforms, clay token hoards' },
  { name: 'Maros-Pangkep (Sulawesi)', lat: -5.0, lng: 119.5, notes: 'Karst cave sites ≥67,800 BCE — SAR/LiDAR for cave complex mapping' },
  { name: 'Sri Lanka (Balangoda)', lat: 6.9, lng: 80.5, notes: 'Forager-mnemonic pathway; rock shelter networks, microlithic workshop sites' },
  { name: 'Vinca (SE Europe)', lat: 44.5, lng: 20.5, notes: 'Distributed symbolic pathway; small tell settlements 5700–4500 BCE' },
];

const SAT_TOOLS = [
  { id: 'lidar',     label: '⛰️ LiDAR / Elevation', desc: 'Bare earth models, mound detection' },
  { id: 'sentinel2', label: '🌿 Sentinel-2 (NDVI)',  desc: 'Crop marks, vegetation stress' },
  { id: 'sentinel1', label: '📡 Sentinel-1 (SAR)',   desc: 'Subsurface features, arid zones' },
  { id: 'sites',     label: '📍 Known Sites',        desc: 'Open Context database query' },
];

const s = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  panel: { background: '#1a0f00', border: '1px solid #3d2800', borderRadius: '8px', padding: '1rem' },
  label: { fontSize: '0.75rem', color: '#a08040', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' },
  input: { width: '100%', background: '#0d0800', border: '1px solid #3d2800', borderRadius: '4px', padding: '0.6rem', color: '#e8d5a3', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', marginBottom: '0.5rem', boxSizing: 'border-box' },
  select: { width: '100%', background: '#0d0800', border: '1px solid #3d2800', borderRadius: '4px', padding: '0.6rem', color: '#e8d5a3', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', marginBottom: '0.5rem', cursor: 'pointer' },
  textarea: { width: '100%', background: '#0d0800', border: '1px solid #3d2800', borderRadius: '4px', padding: '0.6rem', color: '#e8d5a3', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none', resize: 'vertical', minHeight: '100px', lineHeight: '1.6', boxSizing: 'border-box' },
  toolGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' },
  toolBtn: (active) => ({ background: active ? '#3d2800' : '#1a0f00', border: active ? '2px solid #d4a017' : '1px solid #3d2800', borderRadius: '6px', padding: '0.6rem', color: active ? '#f0c040' : '#6b5030', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', textAlign: 'left', transition: 'all 0.15s' }),
  toolLabel: { display: 'block', fontWeight: 'bold', marginBottom: '0.15rem', fontSize: '0.82rem' },
  toolDesc: { fontSize: '0.72rem', opacity: 0.8 },
  btn: { background: 'linear-gradient(135deg, #5c3300, #8b5000)', border: '2px solid #d4a017', borderRadius: '8px', padding: '0.9rem 2rem', color: '#f0c040', fontFamily: 'inherit', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '0.75rem' },
  fetchBtn: { background: '#2d1800', border: '1px solid #8b6914', borderRadius: '6px', padding: '0.6rem', color: '#d4a017', fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', width: '100%', marginBottom: '0.5rem' },
  satResult: { background: '#150c00', border: '1px solid #3d2800', borderRadius: '6px', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.82rem', color: '#a08040' },
  siteItem: { borderBottom: '1px solid #2d1800', padding: '0.4rem 0', color: '#c8b580' },
  regionBtn: { background: '#1a0f00', border: '1px solid #3d2800', borderRadius: '4px', padding: '0.25rem 0.6rem', color: '#a08040', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', margin: '0.2rem' },
};

export default function SatelliteMode() {
  const { refreshCredits } = useAuth();
  const [region, setRegion]             = useState('');
  const [lat, setLat]                   = useState('');
  const [lng, setLng]                   = useState('');
  const [radius, setRadius]             = useState('50');
  const [targetStage, setTargetStage]   = useState('');
  const [satObservations, setSatObs]    = useState('');
  const [activeTool, setActiveTool]     = useState('lidar');
  const [satData, setSatData]           = useState(null);
  const [satLoading, setSatLoading]     = useState(false);
  const [response, setResponse]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const loadRegion = (r) => { setRegion(r.name); setLat(r.lat.toString()); setLng(r.lng.toString()); setSatObs(r.notes); };

  const fetchSatData = async () => {
    if (!lat || !lng) return;
    setSatLoading(true); setSatData(null);
    try {
      if (activeTool === 'sites') {
        const res = await axios.get(`/api/satellite/sites?lat=${lat}&lng=${lng}&radius_km=${radius}`);
        setSatData(res.data);
      } else if (activeTool === 'sentinel2' || activeTool === 'sentinel1') {
        const collection = activeTool === 'sentinel1' ? 'SENTINEL-1' : 'SENTINEL-2';
        const res = await axios.get(`/api/satellite/sentinel?lat=${lat}&lng=${lng}&collection=${collection}`);
        setSatData(res.data);
      } else if (activeTool === 'lidar') {
        const latF = parseFloat(lat), lngF = parseFloat(lng), r = parseFloat(radius) / 111;
        const res = await axios.get(`/api/satellite/elevation?lat_min=${latF-r}&lat_max=${latF+r}&lng_min=${lngF-r}&lng_max=${lngF+r}`);
        setSatData(res.data);
      }
    } catch(err) {
      setSatData({ error: err.response?.data?.error || 'Satellite API error' });
    } finally {
      setSatLoading(false);
    }
  };

  const handlePredict = async () => {
    if ((!region && (!lat || !lng)) || loading) return;
    setLoading(true); setError(''); setResponse('');

    try {
      const res = await apiFetch('/api/predict', {
        method: 'POST',
        body: JSON.stringify({
          region,
          lat: parseFloat(lat) || null,
          lng: parseFloat(lng) || null,
          radius_km: parseInt(radius),
          target_stage: targetStage,
          satellite_observations: satObservations ? [{ type: 'Field notes', description: satObservations }] : [],
          known_sites: satData?.sites || [],
        })
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      if (data.error) throw new Error(data.error);
      const fullAnswer = data.answer || '';
      setResponse(fullAnswer);
      refreshCredits();
    } catch(err) {
      setError(err.message || 'Prediction failed. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#6b5030', marginBottom: '0.4rem' }}>QUICK LOAD REGION:</div>
      <div style={{ marginBottom: '1rem', flexWrap: 'wrap', display: 'flex' }}>
        {KNOWN_REGIONS.map((r, i) => <button key={i} style={s.regionBtn} onClick={() => loadRegion(r)}>{r.name}</button>)}
      </div>

      <div style={s.grid}>
        {/* Left: Location */}
        <div style={s.panel}>
          <span style={s.label}>LOCATION</span>
          <input style={s.input} placeholder="Region name" value={region} onChange={e => setRegion(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input style={{...s.input, flex:1}} placeholder="Latitude"  value={lat} onChange={e => setLat(e.target.value)} />
            <input style={{...s.input, flex:1}} placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
          <input style={s.input} placeholder="Search radius (km)" value={radius} onChange={e => setRadius(e.target.value)} />
          <span style={s.label}>TARGET DSSM STAGE</span>
          <select style={s.select} value={targetStage} onChange={e => setTargetStage(e.target.value)}>
            <option value="">Any stage</option>
            <option value="1">Stage 1 — Embodied Symbolic Familiarity</option>
            <option value="2">Stage 2 — Ritualized Repetition</option>
            <option value="3">Stage 3 — Material Amplification</option>
            <option value="4">Stage 4 — Cognitive Offloading</option>
          </select>
          <span style={s.label}>FIELD OBSERVATIONS / NOTES</span>
          <textarea style={s.textarea} value={satObservations} onChange={e => setSatObs(e.target.value)} placeholder="Describe known features: visible mounds, crop marks, known sites nearby, geology, cultural associations..." />
        </div>

        {/* Right: Satellite tools */}
        <div style={s.panel}>
          <span style={s.label}>SATELLITE DATA TOOL</span>
          <div style={s.toolGrid}>
            {SAT_TOOLS.map(t => (
              <button key={t.id} style={s.toolBtn(activeTool === t.id)} onClick={() => setActiveTool(t.id)}>
                <span style={s.toolLabel}>{t.label}</span>
                <span style={s.toolDesc}>{t.desc}</span>
              </button>
            ))}
          </div>
          <button style={s.fetchBtn} onClick={fetchSatData} disabled={satLoading || !lat || !lng}>
            {satLoading ? '⏳ Fetching...' : `Fetch ${SAT_TOOLS.find(t=>t.id===activeTool)?.label} Data`}
          </button>

          {satData && (
            <div style={s.satResult}>
              {satData.error && <span style={{ color: '#ff8080' }}>{satData.error}</span>}
              {satData.demo_mode && (
                <div>
                  <div style={{ color: '#f0c040', marginBottom: '0.3rem' }}>⚙️ Demo Mode</div>
                  <div>{satData.message}</div>
                  {satData.api_docs && <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#a08040' }}>{satData.api_docs}</div>}
                </div>
              )}
              {satData.products && (
                <div>
                  <div style={{ color: '#d4a017', marginBottom: '0.3rem' }}>{satData.collection} — {satData.products.length} products found</div>
                  {satData.products.slice(0,3).map((p, i) => <div key={i} style={s.siteItem}>{p.name?.slice(0,40)}... ({p.size_mb}MB)</div>)}
                </div>
              )}
              {satData.sites && (
                <div>
                  <div style={{ color: '#d4a017', marginBottom: '0.3rem' }}>{satData.total_sites} known sites within {radius}km</div>
                  {satData.sites.slice(0,5).map((site, i) => <div key={i} style={s.siteItem}>📍 {site.label} {site.category ? `(${site.category})` : ''}</div>)}
                </div>
              )}
              {satData.url && (
                <div>
                  <div style={{ color: '#d4a017', marginBottom: '0.3rem' }}>✅ Elevation data ready</div>
                  <div style={{ fontSize: '0.75rem', color: '#7a6040' }}>{satData.dataset} — bbox loaded</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button style={s.btn} onClick={handlePredict} disabled={loading}>
        {loading ? '⏳ Generating DSSM Predictions...' : '🏛️ Generate DSSM Excavation Zone Predictions →'}
      </button>

      <ResponsePanel response={response} loading={loading} error={error} title={`DSSM EXCAVATION PREDICTION — ${region || `${lat}, ${lng}`}`} />
    </div>
  );
}

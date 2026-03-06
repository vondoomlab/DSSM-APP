import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

/* ─── styles ─────────────────────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: '#0d0800',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier New', monospace",
    padding: '1rem',
  },
  card: {
    background: '#150c00',
    border: '2px solid #3d2800',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 0 40px rgba(180, 120, 0, 0.15)',
  },
  glyph:    { fontSize: '2.5rem', textAlign: 'center', display: 'block', marginBottom: '0.5rem' },
  title:    { color: '#d4a017', fontSize: '1.3rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.25rem' },
  subtitle: { color: '#6b5030', fontSize: '0.8rem', textAlign: 'center', marginBottom: '2rem', letterSpacing: '0.05em' },

  tabs: { display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #3d2800' },
  tab: (active) => ({
    flex: 1,
    padding: '0.6rem',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #d4a017' : '2px solid transparent',
    color: active ? '#f0c040' : '#6b5030',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
    marginBottom: '-2px',
    letterSpacing: '0.05em',
  }),

  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' },
  label: { fontSize: '0.72rem', color: '#a08040', letterSpacing: '0.08em' },
  input: {
    background: '#1a0f00',
    border: '2px solid #3d2800',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#e8d5a3',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(135deg, #5c3300, #8b5000)',
    border: '2px solid #d4a017',
    borderRadius: '8px',
    padding: '0.85rem',
    color: '#f0c040',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    marginTop: '0.5rem',
  },
  error: {
    background: '#2d0000',
    border: '1px solid #8b0000',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#ff8080',
    fontSize: '0.82rem',
    marginBottom: '1rem',
  },
  success: {
    background: '#002d00',
    border: '1px solid #008b00',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#80ff80',
    fontSize: '0.82rem',
    marginBottom: '1rem',
  },
  freeNote: {
    marginTop: '1.5rem',
    padding: '0.75rem',
    background: '#1a0f00',
    border: '1px solid #3d2800',
    borderRadius: '6px',
    fontSize: '0.78rem',
    color: '#a08040',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  infoRow: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  infoLink: {
    background: 'transparent',
    border: 'none',
    color: '#7a6030',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
    textDecoration: 'underline',
  },
  copyright: {
    marginTop: '0.75rem',
    fontSize: '0.68rem',
    color: '#4a3820',
    textAlign: 'center',
    letterSpacing: '0.04em',
  },

  /* ── info modal ── */
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '1rem',
  },
  modal: {
    background: '#150c00',
    border: '2px solid #8b6914',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%', maxWidth: '500px',
    boxShadow: '0 0 60px rgba(180,120,0,0.2)',
    fontFamily: "'Courier New', monospace",
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: { color: '#d4a017', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' },
  modalSub:   { color: '#6b5030', fontSize: '0.78rem', marginBottom: '1.5rem', letterSpacing: '0.04em' },
  section:    { marginBottom: '1.25rem' },
  sectionH:   { color: '#f0c040', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '0.06em' },
  sectionP:   { color: '#a08040', fontSize: '0.8rem', lineHeight: '1.65' },
  pkgCard: (highlight) => ({
    background: highlight ? '#2d1800' : '#1a0f00',
    border: `1px solid ${highlight ? '#d4a017' : '#3d2800'}`,
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '0.75rem',
  }),
  pkgName:   { color: '#e8d5a3', fontWeight: 'bold', fontSize: '0.92rem' },
  pkgPrice:  { color: '#f0c040', fontSize: '1.1rem', fontWeight: 'bold', float: 'right' },
  pkgDetail: { color: '#a08040', fontSize: '0.78rem', marginTop: '0.4rem', lineHeight: '1.55' },
  costTable: {
    background: '#1a0f00',
    border: '1px solid #3d2800',
    borderRadius: '6px',
    padding: '0.75rem',
    marginTop: '0.5rem',
  },
  costRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0.25rem 0', borderBottom: '1px solid #2d1800',
    fontSize: '0.78rem', color: '#a08040',
  },
  closeBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #5c3300, #8b5000)',
    border: '2px solid #d4a017',
    borderRadius: '8px',
    padding: '0.7rem',
    color: '#f0c040',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1rem',
  },
};

/* ─── Pricing Info Modal ─────────────────────────────────────────────────── */
function PricingInfoModal({ onClose }) {
  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalTitle}>🔮 What is DSSM Intelligence?</div>
        <div style={s.modalSub}>DEEP SYMBOLIC SYSTEMS MODEL · by Anthony Vondoom</div>

        <div style={s.section}>
          <div style={s.sectionH}>WHAT IS THIS SYSTEM?</div>
          <div style={s.sectionP}>
            DSSM Intelligence is an advanced AI reasoning engine built on Claude (Anthropic).
            It analyses archaeological sites, ancient structures and geospatial data using a
            proprietary symbolic framework — the Deep Symbolic Systems Model — developed by
            Anthony Vondoom. It combines satellite imagery, LiDAR terrain data, stage
            classification logic and multi-dimensional scoring to surface hidden patterns in
            ancient landscapes.
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionH}>HOW DO CREDITS WORK?</div>
          <div style={s.sectionP}>Each query consumes credits based on its complexity:</div>
          <div style={s.costTable}>
            {[
              ['💬 Free Q&A / Ask Mode',      '1 credit  — natural language questions'],
              ['🏛️ Stage Classifier',          '2 credits — archaeological stage analysis'],
              ['📊 FCP 2D Scorer',             '2 credits — multi-axis symbolic scoring'],
              ['🛰️ Satellite Predictor',       '3 credits — satellite + LiDAR integration'],
            ].map(([mode, desc]) => (
              <div key={mode} style={s.costRow}>
                <span>{mode}</span>
                <span style={{ color: '#f0c040', marginLeft: '0.5rem', textAlign: 'right' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionH}>CREDIT PACKAGES</div>

          <div style={s.pkgCard(false)}>
            <span style={s.pkgPrice}>$5</span>
            <div style={s.pkgName}>Scholar — 150 credits</div>
            <div style={s.pkgDetail}>
              Scholastic level research. Ideal for students, hobbyists and early-stage
              exploration. Run up to 150 Q&A queries, 75 stage classifications, or
              50 satellite predictions. Credits never expire.
            </div>
          </div>

          <div style={s.pkgCard(true)}>
            <span style={s.pkgPrice}>$33</span>
            <div style={s.pkgName}>Academic — 450 credits <span style={{ color: '#80c040', fontSize: '0.72rem' }}>BEST VALUE</span></div>
            <div style={s.pkgDetail}>
              Full academic research suite. Designed for scholars, analysts and serious
              investigators. Run 450 queries, 225 full classifications/scorings, or
              150 satellite analyses. Ideal for fieldwork, dissertations and systematic
              site surveys. Credits never expire.
            </div>
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionH}>WHY PAID CREDITS?</div>
          <div style={s.sectionP}>
            Every query runs a powerful AI model (Claude by Anthropic) which incurs real
            compute costs. Credits let you pay only for what you use, with no subscriptions
            or monthly fees. New accounts receive <strong style={{ color: '#f0c040' }}>2 free credits</strong> to
            explore the system before deciding to purchase.
          </div>
        </div>

        <div style={{ ...s.sectionP, fontSize: '0.72rem', color: '#4a3820', borderTop: '1px solid #2d1800', paddingTop: '0.75rem' }}>
          © Anthony Vondoom 2026. All Rights Reserved. · DSSM Intelligence System v1.1
        </div>

        <button style={s.closeBtn} onClick={onClose}>Got it — close ×</button>
      </div>
    </div>
  );
}

/* ─── LoginPage ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [tab,      setTab]      = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setTab('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {showInfo && <PricingInfoModal onClose={() => setShowInfo(false)} />}

      <div style={s.card}>
        <span style={s.glyph}>𓂀</span>
        <div style={s.title}>DSSM Intelligence System</div>
        <div style={s.subtitle}>DEEP SYMBOLIC SYSTEMS MODEL · v1.1</div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'login')}  onClick={() => { setTab('login');  setError(''); }}>SIGN IN</button>
          <button style={s.tab(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); }}>CREATE ACCOUNT</button>
        </div>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>EMAIL</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>PASSWORD</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'Minimum 6 characters' : '••••••••'}
              required
              minLength={6}
            />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? '⏳ Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <div style={s.freeNote}>
          {tab === 'signup'
            ? '🎁 New accounts receive 2 free credits to explore the system.\nNo payment required to get started.'
            : 'by Anthony Vondoom · Deep Symbolic Systems Model'}
        </div>

        <div style={s.infoRow}>
          <button style={s.infoLink} onClick={() => setShowInfo(true)}>
            ℹ️ What is this system? · Why credits? · Pricing explained
          </button>
        </div>

        <div style={s.copyright}>
          © Anthony Vondoom 2026. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}

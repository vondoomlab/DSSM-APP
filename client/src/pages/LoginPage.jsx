import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

/* ─── decorative hieroglyph positions ────────────────────────────────────── */
const FLOATERS = [
  { glyph: '𓂀', top: '6%',  left: '4%',  size: '3.5rem', opacity: 0.07, rotate: '-8deg' },
  { glyph: '𓃭', top: '12%', left: '88%', size: '2.8rem', opacity: 0.06, rotate: '10deg' },
  { glyph: '𓆏', top: '35%', left: '2%',  size: '2.2rem', opacity: 0.05, rotate: '-15deg' },
  { glyph: '𓇼', top: '55%', left: '92%', size: '3rem',   opacity: 0.06, rotate: '5deg' },
  { glyph: '𓊪', top: '70%', left: '5%',  size: '2.5rem', opacity: 0.05, rotate: '12deg' },
  { glyph: '𓋴', top: '80%', left: '85%', size: '2rem',   opacity: 0.07, rotate: '-6deg' },
  { glyph: '𓈖', top: '25%', left: '94%', size: '1.8rem', opacity: 0.04, rotate: '0deg' },
  { glyph: '𓏏', top: '88%', left: '45%', size: '2rem',   opacity: 0.04, rotate: '-3deg' },
  { glyph: '𓎡', top: '45%', left: '96%', size: '1.6rem', opacity: 0.05, rotate: '18deg' },
];

/* ─── styles ─────────────────────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: `
      repeating-linear-gradient(90deg,  transparent, transparent 120px, rgba(140,80,0,0.025) 120px, rgba(140,80,0,0.025) 121px),
      repeating-linear-gradient(180deg, transparent, transparent 90px,  rgba(110,55,0,0.02)  90px,  rgba(110,55,0,0.02)  91px),
      linear-gradient(170deg, #0c0500 0%, #180e04 45%, #110800 70%, #0c0500 100%)
    `,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier New', monospace",
    padding: '2rem 1rem',
    position: 'relative',
    overflow: 'hidden',
  },

  floater: (f) => ({
    position: 'fixed',
    top: f.top,
    left: f.left,
    fontSize: f.size,
    opacity: f.opacity,
    transform: `rotate(${f.rotate})`,
    pointerEvents: 'none',
    userSelect: 'none',
    color: '#c87820',
  }),

  hero: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  heroGlyph: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '0.6rem',
    filter: 'drop-shadow(0 0 18px rgba(212,160,23,0.5))',
  },
  heroTitle: {
    color: '#d4a017',
    fontSize: '1.55rem',
    fontWeight: 'bold',
    letterSpacing: '0.12em',
    textShadow: '0 0 30px rgba(212,160,23,0.35)',
    marginBottom: '0.3rem',
  },
  heroSub: {
    color: '#7a5a28',
    fontSize: '0.78rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },

  ornament: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    margin: '0.8rem auto 0',
    width: 'fit-content',
    color: '#3d2800',
    fontSize: '0.7rem',
    letterSpacing: '0.3em',
  },
  ornamentLine: {
    width: '60px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #4d3010)',
  },
  ornamentLineR: {
    width: '60px',
    height: '1px',
    background: 'linear-gradient(90deg, #4d3010, transparent)',
  },

  card: {
    background: 'linear-gradient(160deg, #160b02 0%, #1d1004 100%)',
    border: '1px solid #3d2800',
    borderRadius: '14px',
    padding: '2rem 2.25rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 0 50px rgba(140,80,0,0.12), inset 0 1px 0 rgba(212,160,23,0.06)',
    position: 'relative',
  },

  cornerTL: {
    position: 'absolute', top: '10px', left: '10px',
    width: '14px', height: '14px',
    borderTop: '1px solid #6b4a14', borderLeft: '1px solid #6b4a14',
    borderTopLeftRadius: '3px',
  },
  cornerTR: {
    position: 'absolute', top: '10px', right: '10px',
    width: '14px', height: '14px',
    borderTop: '1px solid #6b4a14', borderRight: '1px solid #6b4a14',
    borderTopRightRadius: '3px',
  },
  cornerBL: {
    position: 'absolute', bottom: '10px', left: '10px',
    width: '14px', height: '14px',
    borderBottom: '1px solid #6b4a14', borderLeft: '1px solid #6b4a14',
    borderBottomLeftRadius: '3px',
  },
  cornerBR: {
    position: 'absolute', bottom: '10px', right: '10px',
    width: '14px', height: '14px',
    borderBottom: '1px solid #6b4a14', borderRight: '1px solid #6b4a14',
    borderBottomRightRadius: '3px',
  },

  tabs: { display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid #2d1800' },
  tab: (active) => ({
    flex: 1,
    padding: '0.55rem',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #d4a017' : '2px solid transparent',
    color: active ? '#f0c040' : '#4a3820',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
    marginBottom: '-1px',
    letterSpacing: '0.08em',
    transition: 'color 0.15s',
  }),

  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.9rem' },
  label: { fontSize: '0.68rem', color: '#7a5a28', letterSpacing: '0.1em' },
  input: {
    background: '#110800',
    border: '1px solid #2d1800',
    borderRadius: '6px',
    padding: '0.7rem 0.9rem',
    color: '#e8d5a3',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(135deg, #4a2800, #7a4400)',
    border: '1px solid #c49020',
    borderRadius: '8px',
    padding: '0.8rem',
    color: '#f0c040',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '0.08em',
    marginTop: '0.5rem',
    boxShadow: '0 0 12px rgba(180,120,0,0.15)',
  },
  error: {
    background: '#200000',
    border: '1px solid #6b0000',
    borderRadius: '6px',
    padding: '0.65rem',
    color: '#ff8080',
    fontSize: '0.78rem',
    marginBottom: '0.9rem',
  },
  success: {
    background: '#002000',
    border: '1px solid #006b00',
    borderRadius: '6px',
    padding: '0.65rem',
    color: '#80ff80',
    fontSize: '0.78rem',
    marginBottom: '0.9rem',
  },

  freeNote: {
    marginTop: '1.25rem',
    padding: '0.65rem 0.9rem',
    background: '#0e0700',
    border: '1px solid #2a1a00',
    borderRadius: '6px',
    fontSize: '0.74rem',
    color: '#7a5a28',
    textAlign: 'center',
    lineHeight: '1.6',
  },

  infoRow: { marginTop: '0.85rem', textAlign: 'center' },
  infoLink: {
    background: 'transparent',
    border: 'none',
    color: '#5a4018',
    fontSize: '0.72rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
    textDecoration: 'underline',
  },

  quote: {
    marginTop: '2rem',
    textAlign: 'center',
    color: '#3d2c10',
    fontSize: '0.72rem',
    fontStyle: 'italic',
    letterSpacing: '0.06em',
    maxWidth: '360px',
  },
  quoteAuthor: {
    marginTop: '0.4rem',
    color: '#2d1e08',
    fontSize: '0.65rem',
    letterSpacing: '0.08em',
    fontStyle: 'normal',
  },

  copyright: {
    marginTop: '0.5rem',
    fontSize: '0.62rem',
    color: '#2d1e08',
    textAlign: 'center',
    letterSpacing: '0.04em',
  },

  /* ── info modal ── */
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '1rem',
  },
  modal: {
    background: '#150c00',
    border: '1px solid #8b6914',
    borderRadius: '14px',
    padding: '2rem',
    width: '100%', maxWidth: '480px',
    boxShadow: '0 0 60px rgba(180,120,0,0.2)',
    fontFamily: "'Courier New', monospace",
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: { color: '#d4a017', fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '0.25rem' },
  modalSub:   { color: '#5a4020', fontSize: '0.75rem', marginBottom: '1.5rem', letterSpacing: '0.04em' },
  section:    { marginBottom: '1.25rem' },
  sectionH:   { color: '#f0c040', fontSize: '0.78rem', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '0.08em' },
  sectionP:   { color: '#9a7840', fontSize: '0.78rem', lineHeight: '1.65' },
  pkgCard: (highlight) => ({
    background: highlight ? '#221200' : '#130b00',
    border: `1px solid ${highlight ? '#c49020' : '#2d1800'}`,
    borderRadius: '8px',
    padding: '0.9rem',
    marginBottom: '0.65rem',
  }),
  pkgName:   { color: '#e8d5a3', fontWeight: 'bold', fontSize: '0.88rem' },
  pkgPrice:  { color: '#f0c040', fontSize: '1.05rem', fontWeight: 'bold', float: 'right' },
  pkgDetail: { color: '#9a7840', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: '1.55' },
  costTable: {
    background: '#110800',
    border: '1px solid #2d1800',
    borderRadius: '6px',
    padding: '0.65rem',
    marginTop: '0.5rem',
  },
  costRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0.25rem 0', borderBottom: '1px solid #1a0f00',
    fontSize: '0.75rem', color: '#9a7840',
  },
  closeBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #4a2800, #7a4400)',
    border: '1px solid #c49020',
    borderRadius: '8px',
    padding: '0.7rem',
    color: '#f0c040',
    fontFamily: 'inherit',
    fontSize: '0.88rem',
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
        <div style={s.modalTitle}>𓂀 What is DSSM Intelligence?</div>
        <div style={s.modalSub}>the DEEP SYMBOLIC SYSTEMS MODEL · by Anthony Vondoom</div>

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
              ['💬 Free Q&A / Ask Mode',  '1 credit  — natural language questions'],
              ['🏛️ Stage Classifier',      '2 credits — archaeological stage analysis'],
              ['📊 FCP 2D Scorer',         '2 credits — multi-axis symbolic scoring'],
              ['🛰️ Satellite Predictor',   '3 credits — satellite + LiDAR integration'],
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
              Ideal for students, hobbyists and early-stage exploration. Run up to 150 Q&A
              queries, 75 stage classifications, or 50 satellite predictions. Credits never expire.
            </div>
          </div>

          <div style={s.pkgCard(true)}>
            <span style={s.pkgPrice}>$33</span>
            <div style={s.pkgName}>Academic — 450 credits <span style={{ color: '#80c040', fontSize: '0.7rem' }}>BEST VALUE</span></div>
            <div style={s.pkgDetail}>
              Full academic research suite. Designed for scholars, analysts and serious investigators.
              Run 450 queries, 225 full classifications, or 150 satellite analyses. Ideal for
              fieldwork, dissertations and systematic site surveys. Credits never expire.
            </div>
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionH}>WHY PAID CREDITS?</div>
          <div style={s.sectionP}>
            Every query runs a powerful AI model (Claude by Anthropic) which incurs real compute
            costs. Credits let you pay only for what you use, with no subscriptions or monthly fees.
            New accounts receive <strong style={{ color: '#f0c040' }}>2 free credits</strong> to
            explore the system before deciding to purchase.
          </div>
        </div>

        <div style={{ ...s.sectionP, fontSize: '0.68rem', color: '#3a2c10', borderTop: '1px solid #1a1000', paddingTop: '0.75rem' }}>
          © Anthony Vondoom 2026. All Rights Reserved. · DSSM Intelligence System v1.1
        </div>

        <button style={s.closeBtn} onClick={onClose}>Close ×</button>
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

      {/* floating hieroglyph decorations */}
      {FLOATERS.map((f, i) => (
        <span key={i} style={s.floater(f)}>{f.glyph}</span>
      ))}

      {/* hero branding above the card */}
      <div style={s.hero}>
        <span style={s.heroGlyph}>𓂀</span>
        <div style={s.heroTitle}>DSSM INTELLIGENCE</div>
        <div style={s.heroSub}>the Deep Symbolic Systems Model</div>
        <div style={s.ornament}>
          <div style={s.ornamentLine} />
          <span>𓏏</span>
          <div style={s.ornamentLineR} />
        </div>
      </div>

      {/* login / signup card */}
      <div style={s.card}>
        <div style={s.cornerTL} /><div style={s.cornerTR} />
        <div style={s.cornerBL} /><div style={s.cornerBR} />

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
            {loading ? '⏳ Please wait...' : tab === 'login' ? 'Enter the Archive →' : 'Create Account →'}
          </button>
        </form>

        <div style={s.freeNote}>
          {tab === 'signup'
            ? '𓂀 New accounts receive 2 free credits to explore the system. No payment required to get started.'
            : 'Reasoning Engine · by Anthony Vondoom · v1.1'}
        </div>

        <div style={s.infoRow}>
          <button style={s.infoLink} onClick={() => setShowInfo(true)}>
            What is this system? · How do credits work? · Pricing
          </button>
        </div>
      </div>

      {/* atmospheric quote */}
      <div style={s.quote}>
        "Civilization is not invented — it is rehearsed."
        <div style={s.quoteAuthor}>— the Deep Symbolic Systems Model</div>
      </div>

      <div style={s.copyright}>
        © Anthony Vondoom 2026. All Rights Reserved.
      </div>
    </div>
  );
}

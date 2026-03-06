import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiFetch';

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: '#150c00',
    border: '2px solid #8b6914',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%', maxWidth: '480px',
    boxShadow: '0 0 60px rgba(180,120,0,0.2)',
    fontFamily: "'Courier New', monospace",
  },
  title: { color: '#d4a017', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' },
  sub:   { color: '#6b5030', fontSize: '0.78rem', marginBottom: '1.5rem', letterSpacing: '0.05em' },
  packages: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' },
  pkg: (selected) => ({
    background: selected ? '#2d1800' : '#1a0f00',
    border: `2px solid ${selected ? '#d4a017' : '#3d2800'}`,
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.15s',
  }),
  pkgLabel:  { color: '#e8d5a3', fontWeight: 'bold', fontSize: '0.95rem' },
  pkgDetail: { color: '#a08040', fontSize: '0.8rem', marginTop: '0.2rem' },
  pkgPrice:  { color: '#f0c040', fontSize: '1.3rem', fontWeight: 'bold' },
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
    marginBottom: '0.75rem',
  },
  closeBtn: {
    width: '100%',
    background: 'transparent',
    border: '1px solid #3d2800',
    borderRadius: '8px',
    padding: '0.6rem',
    color: '#6b5030',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  costTable: {
    background: '#1a0f00',
    border: '1px solid #3d2800',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    fontSize: '0.78rem',
    color: '#a08040',
  },
  costRow: { display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #2d1800' },
};

const FALLBACK_PACKAGES = [
  { id: 'starter',  credits: 150, label: 'Scholar',  amount: '$5',  detail: 'Scholastic level — 150 credits for basic research & exploration' },
  { id: 'research', credits: 450, label: 'Academic', amount: '$33', detail: 'Academic level — 450 credits for serious scholarly investigation' },
];

export default function BuyCreditsModal({ onClose }) {
  const [packages,  setPackages]  = useState(FALLBACK_PACKAGES);
  const [selected,  setSelected]  = useState('research');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    fetch('/api/stripe/packages')
      .then(r => r.json())
      .then(d => { if (d.packages?.length) setPackages(d.packages); })
      .catch(() => {});
  }, []);

  const handleCheckout = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiFetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ package_id: selected }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        throw new Error(data.error || 'Could not start checkout');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.title}>🔮 Buy Credits</div>
        <div style={s.sub}>CREDITS NEVER EXPIRE · SECURE PAYMENT VIA STRIPE</div>

        <div style={s.costTable}>
          <div style={{ color: '#d4a017', marginBottom: '0.4rem', fontWeight: 'bold' }}>CREDIT COSTS PER REQUEST</div>
          {[['💬 Free Q&A', '1 credit'], ['🏛️ Stage Classifier', '2 credits'], ['📊 FCP 2D Scorer', '2 credits'], ['🛰️ Satellite Predict', '3 credits']].map(([mode, cost]) => (
            <div key={mode} style={s.costRow}><span>{mode}</span><span style={{ color: '#f0c040' }}>{cost}</span></div>
          ))}
        </div>

        <div style={s.packages}>
          {packages.map(pkg => (
            <div key={pkg.id} style={s.pkg(selected === pkg.id)} onClick={() => setSelected(pkg.id)}>
              <div>
                <div style={s.pkgLabel}>{pkg.label} — {pkg.credits} credits</div>
                <div style={s.pkgDetail}>{pkg.detail || `${pkg.credits} requests`}</div>
              </div>
              <div style={s.pkgPrice}>{pkg.amount}</div>
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#ff8080', fontSize: '0.82rem', marginBottom: '0.75rem' }}>⚠️ {error}</div>}

        <button style={s.btn} onClick={handleCheckout} disabled={loading}>
          {loading ? '⏳ Redirecting to Stripe...' : `Pay with Stripe →`}
        </button>
        <button style={s.closeBtn} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

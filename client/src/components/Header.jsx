import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BuyCreditsModal from './BuyCreditsModal';

const s = {
  header: {
    background: 'linear-gradient(135deg, #1a0800 0%, #2d1200 50%, #1a0800 100%)',
    borderBottom: '2px solid #8b6914',
    padding: '1.5rem 2rem',
    textAlign: 'center',
    position: 'relative',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#d4a017',
    letterSpacing: '0.05em',
    textShadow: '0 0 20px rgba(212,160,23,0.4)',
    marginBottom: '0.3rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#a08040',
    letterSpacing: '0.1em',
    fontStyle: 'italic',
  },
  glyph: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    right: '1.5rem',
    fontSize: '0.7rem',
    color: '#a08040',
    letterSpacing: '0.05em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.4rem',
  },
  authorBadge: {
    background: '#2d1200',
    border: '1px solid #8b6914',
    borderRadius: '4px',
    padding: '0.25rem 0.6rem',
  },
  creditsBadge: (low) => ({
    background: low ? '#2d0a00' : '#1a2d00',
    border: `1px solid ${low ? '#8b3000' : '#3d6914'}`,
    borderRadius: '4px',
    padding: '0.25rem 0.6rem',
    color: low ? '#ff8040' : '#80c040',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  }),
  errorBadge: {
    background: '#2d1000',
    border: '1px solid #6b3000',
    borderRadius: '4px',
    padding: '0.25rem 0.6rem',
    color: '#ff8040',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontSize: '0.68rem',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.68rem',
  },
  signOutBtn: {
    background: 'transparent',
    border: '1px solid #8b5000',
    borderRadius: '3px',
    padding: '0.2rem 0.5rem',
    color: '#c08040',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.68rem',
  },
};

export default function Header() {
  const { user, credits, creditsError, isAdmin, refreshCredits, signOut } = useAuth();
  const [showBuy,      setShowBuy]      = useState(false);
  const [retrying,     setRetrying]     = useState(false);
  const isLow = credits !== null && credits <= 3;

  const handleRetry = async () => {
    setRetrying(true);
    await refreshCredits();
    setRetrying(false);
  };

  return (
    <header style={s.header}>
      <span style={s.glyph}>𓂀</span>
      <h1 style={s.title}>DSSM Intelligence System</h1>
      <p style={s.subtitle}>Deep Symbolic Systems Model · Reasoning Engine · v1.1</p>

      <div style={s.badge}>
        <span style={s.authorBadge}>by Anthony Vondoom</span>

        {/* Credits loaded OK */}
        {user && credits !== null && (
          <span
            style={s.creditsBadge(isLow)}
            onClick={() => setShowBuy(true)}
            title="Click to buy more credits"
          >
            {isLow ? '⚠️' : '🔮'} {credits} credit{credits !== 1 ? 's' : ''}
          </span>
        )}

        {/* Credits failed to load — show retry */}
        {user && credits === null && creditsError && (
          <span style={s.errorBadge} onClick={handleRetry} title="Click to retry">
            {retrying ? '⏳ loading…' : '⚠️ credits — tap to retry'}
          </span>
        )}

        {/* Credits loading (null, no error yet) */}
        {user && credits === null && !creditsError && (
          <span style={{ ...s.errorBadge, color: '#a08040', borderColor: '#3d2800', cursor: 'default' }}>
            ⏳ loading credits…
          </span>
        )}

        {user && (
          <div style={s.userRow}>
            <span style={{ color: isAdmin ? '#f0c040' : '#a08040', fontWeight: isAdmin ? 'bold' : 'normal', letterSpacing: isAdmin ? '0.12em' : 'normal' }}>
              {isAdmin ? '𓂀 HORUS' : user.email?.split('@')[0]}
            </span>
            <button style={s.signOutBtn} onClick={signOut}>⏻ sign out</button>
          </div>
        )}

        {showBuy && <BuyCreditsModal onClose={() => setShowBuy(false)} />}
      </div>
    </header>
  );
}

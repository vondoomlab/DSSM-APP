import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import AskMode from './pages/AskMode';
import ClassifyMode from './pages/ClassifyMode';
import ScoreMode from './pages/ScoreMode';
import SatelliteMode from './pages/SatelliteMode';
import LoginPage from './pages/LoginPage';
import BuyCreditsModal from './components/BuyCreditsModal';

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0d0800 0%, #1a1000 50%, #0d0800 100%)',
    color: '#e8d5a3',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem 3rem',
  },
  loading: {
    minHeight: '100vh',
    background: '#0d0800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a08040',
    fontFamily: "'Courier New', monospace",
    fontSize: '1.2rem',
    letterSpacing: '0.1em',
  },
  lowCreditsBar: {
    background: '#2d0a00',
    borderBottom: '1px solid #8b3000',
    padding: '0.5rem 1.5rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#ff8040',
    fontFamily: "'Courier New', monospace",
  },
};

function AppInner() {
  const { user, credits, loading } = useAuth();
  const [mode,       setMode]       = useState('ask');
  const [showBuy,    setShowBuy]    = useState(false);

  // Still checking session
  if (loading) {
    return (
      <div style={styles.loading}>
        𓂀 &nbsp; Loading...
      </div>
    );
  }

  // Not logged in — show login page
  if (!user) {
    return <LoginPage />;
  }

  const renderMode = () => {
    switch (mode) {
      case 'classify':  return <ClassifyMode />;
      case 'score':     return <ScoreMode />;
      case 'satellite': return <SatelliteMode />;
      case 'ask':
      default:          return <AskMode />;
    }
  };

  return (
    <div style={styles.app}>
      <Header />

      {credits !== null && credits <= 3 && credits > 0 && (
        <div style={styles.lowCreditsBar}>
          ⚠️ Only {credits} credit{credits !== 1 ? 's' : ''} left —{' '}
          <span style={{ color: '#f0c040', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowBuy(true)}>buy more</span>
        </div>
      )}

      {credits === 0 && (
        <div style={{ ...styles.lowCreditsBar, background: '#3d0000', borderColor: '#ff0000', color: '#ff6060' }}>
          ❌ No credits remaining —{' '}
          <span style={{ color: '#f0c040', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowBuy(true)}>buy more</span>
        </div>
      )}

      {showBuy && <BuyCreditsModal onClose={() => setShowBuy(false)} />}

      <main style={styles.main}>
        <ModeSelector activeMode={mode} onModeChange={setMode} />
        {renderMode()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

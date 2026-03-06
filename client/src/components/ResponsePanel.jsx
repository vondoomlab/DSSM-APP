import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const s = {
  panel: {
    background: '#150c00',
    border: '1px solid #3d2800',
    borderRadius: '10px',
    padding: '1.5rem',
    marginTop: '1.5rem',
    lineHeight: '1.8',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #3d2800',
  },
  icon: { fontSize: '1.3rem' },
  title: { fontSize: '0.85rem', color: '#a08040', letterSpacing: '0.1em', fontWeight: 'bold' },
  actions: { marginLeft: 'auto', display: 'flex', gap: '0.4rem' },
  actionBtn: {
    background: 'transparent',
    border: '1px solid #3d2800',
    borderRadius: '5px',
    padding: '0.25rem 0.6rem',
    color: '#a08040',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
    transition: 'border-color 0.2s, color 0.2s',
  },
  actionBtnSuccess: {
    background: 'transparent',
    border: '1px solid #d4a017',
    borderRadius: '5px',
    padding: '0.25rem 0.6rem',
    color: '#f0c040',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
  },
  content: {
    color: '#e8d5a3',
    fontSize: '0.95rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a08040',
    fontSize: '0.9rem',
    letterSpacing: '0.1em',
  },
  error: {
    background: '#2d0000',
    border: '1px solid #8b0000',
    borderRadius: '6px',
    padding: '1rem',
    color: '#ff8080',
    fontSize: '0.9rem',
  },
};

export default function ResponsePanel({ response, loading, error, title = 'DSSM ANALYSIS' }) {
  const [copied, setCopied] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const panelRef = useRef(null);
  const hasScrolled = useRef(false);
  const animRef = useRef(null);

  // Typewriter effect when response arrives
  useEffect(() => {
    if (animRef.current) clearInterval(animRef.current);
    if (!response) { setDisplayed(''); return; }

    let index = 0;
    animRef.current = setInterval(() => {
      index += 8;
      if (index >= response.length) {
        setDisplayed(response);
        clearInterval(animRef.current);
      } else {
        setDisplayed(response.slice(0, index));
      }
    }, 16);

    return () => clearInterval(animRef.current);
  }, [response]);

  // Auto-scroll to panel when response first starts streaming
  useEffect(() => {
    if ((loading || response) && !hasScrolled.current && panelRef.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    if (!response && !loading && !error) {
      hasScrolled.current = false;
    }
  }, [loading, response, error]);

  if (!response && !loading && !error) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = response;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.md';
    const blob = new Blob([`# ${title}\n\n${response}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={s.panel} ref={panelRef}>
      <div style={s.header}>
        <span style={s.icon}>𓂀</span>
        <span style={s.title}>{title}</span>

        {displayed === response && response && !loading && (
          <div style={s.actions}>
            <button
              style={copied ? s.actionBtnSuccess : s.actionBtn}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              style={s.actionBtn}
              onClick={handleDownload}
              title="Download as Markdown file"
            >
              ⬇ Save .md
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div style={s.loading}>
          <div>Reasoning through the DSSM framework...</div>
          <div style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}>⏳</div>
        </div>
      )}

      {error && (
        <div style={s.error}>
          ⚠️ {error}
        </div>
      )}

      {displayed && !loading && (
        <div style={s.content}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, children, ...p}) => <h1 style={{color:'#d4a017', fontSize:'1.2rem', margin:'1rem 0 0.5rem', borderBottom:'1px solid #3d2800', paddingBottom:'0.25rem'}} {...p}>{children}</h1>,
              h2: ({node, children, ...p}) => <h2 style={{color:'#c49a17', fontSize:'1.05rem', margin:'1rem 0 0.4rem'}} {...p}>{children}</h2>,
              h3: ({node, children, ...p}) => <h3 style={{color:'#a08040', fontSize:'0.95rem', margin:'0.8rem 0 0.3rem'}} {...p}>{children}</h3>,
              strong: ({node, ...p}) => <strong style={{color:'#f0c040'}} {...p} />,
              code: ({node, inline, ...p}) => inline
                ? <code style={{background:'#2d1800', color:'#f0c040', padding:'0.1rem 0.3rem', borderRadius:'3px', fontSize:'0.85rem'}} {...p} />
                : <code style={{display:'block', background:'#1a0f00', border:'1px solid #3d2800', padding:'1rem', borderRadius:'6px', fontSize:'0.82rem', overflow:'auto', marginTop:'0.5rem'}} {...p} />,
              pre: ({node, ...p}) => <pre style={{background:'#1a0f00', border:'1px solid #3d2800', padding:'1rem', borderRadius:'6px', overflow:'auto', marginTop:'0.5rem'}} {...p} />,
              ul: ({node, ...p}) => <ul style={{paddingLeft:'1.5rem', marginBottom:'0.75rem'}} {...p} />,
              ol: ({node, ...p}) => <ol style={{paddingLeft:'1.5rem', marginBottom:'0.75rem'}} {...p} />,
              li: ({node, ...p}) => <li style={{marginBottom:'0.3rem'}} {...p} />,
              blockquote: ({node, ...p}) => <blockquote style={{borderLeft:'3px solid #d4a017', paddingLeft:'1rem', marginLeft:0, color:'#c49a40', fontStyle:'italic'}} {...p} />,
              p: ({node, ...p}) => <p style={{marginBottom:'0.75rem'}} {...p} />,
              hr: ({node, ...p}) => <hr style={{border:'none', borderTop:'1px solid #3d2800', margin:'1rem 0'}} {...p} />,
              table: ({node, ...p}) => <div style={{overflowX:'auto', marginBottom:'0.75rem'}}><table style={{borderCollapse:'collapse', width:'100%', fontSize:'0.85rem'}} {...p} /></div>,
              th: ({node, ...p}) => <th style={{border:'1px solid #3d2800', padding:'0.4rem 0.6rem', background:'#2d1800', color:'#d4a017', textAlign:'left'}} {...p} />,
              td: ({node, ...p}) => <td style={{border:'1px solid #2d1800', padding:'0.4rem 0.6rem', color:'#c8b580'}} {...p} />,
            }}
          >
            {displayed}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

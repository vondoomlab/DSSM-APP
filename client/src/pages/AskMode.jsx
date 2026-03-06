import React, { useState } from 'react';
import ResponsePanel from '../components/ResponsePanel';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../context/AuthContext';

const EXAMPLE_QUESTIONS = [
  "Why did the Indus Valley civilization never develop phonetic writing?",
  "What is the P7 threshold and why does it trigger Stage 3?",
  "Compare Blombos Cave to Bruniquel Cave using DSSM scoring",
  "Why is Sri Lanka considered a control case in DSSM theory?",
  "How does the Halafian pottery tradition demonstrate Stage 2 symbolic transmission?",
  "What is the Enhanced Working Memory Hypothesis?",
  "Explain the five DSSM stabilization pathways",
  "Why is writing a contingent outcome rather than an inevitable one?",
];

const s = {
  inputRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' },
  textarea: {
    flex: 1,
    background: '#1a0f00',
    border: '2px solid #3d2800',
    borderRadius: '8px',
    padding: '0.9rem',
    color: '#e8d5a3',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    resize: 'vertical',
    minHeight: '80px',
    outline: 'none',
    lineHeight: '1.6',
  },
  sendBtn: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #5c3300, #8b5000)',
    border: '2px solid #d4a017',
    borderRadius: '8px',
    padding: '0.9rem 1.5rem',
    color: '#f0c040',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid #3d2800',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    color: '#6b5030',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
  },
  examples: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' },
  exampleBtn: {
    background: '#1a0f00',
    border: '1px solid #3d2800',
    borderRadius: '20px',
    padding: '0.3rem 0.8rem',
    color: '#a08040',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  exampleLabel: { fontSize: '0.75rem', color: '#6b5030', marginBottom: '0.4rem', letterSpacing: '0.05em' },
  historyItem: {
    marginBottom: '0.75rem',
    padding: '0.75rem',
    background: '#1a0f00',
    border: '1px solid #2d1800',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#a08040',
  },
  userQ: { color: '#f0c040', marginBottom: '0.25rem', fontWeight: 'bold' },
};

export default function AskMode() {
  const { refreshCredits } = useAuth();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError('');
    setResponse('');

    const currentQuestion = question;
    setQuestion('');

    try {
      const conversationHistory = history.map(h => ([
        { role: 'user', content: h.question },
        { role: 'assistant', content: h.answer }
      ])).flat();

      // Use fetch with streaming (EventSource-style reading)
      const res = await apiFetch('/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: currentQuestion, conversationHistory })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      if (data.error) throw new Error(data.error);

      const fullAnswer = data.answer || '';
      setResponse(fullAnswer);

      if (fullAnswer) {
        setHistory(prev => [...prev, { question: currentQuestion, answer: fullAnswer }]);
        refreshCredits();
      }

    } catch (err) {
      setError(err.message || 'Failed to connect to DSSM Intelligence System. Is the server running?');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk();
  };

  return (
    <div>
      <div style={s.exampleLabel}>EXAMPLE QUESTIONS:</div>
      <div style={s.examples}>
        {EXAMPLE_QUESTIONS.map((q, i) => (
          <button key={i} style={s.exampleBtn} onClick={() => setQuestion(q)}>
            {q.length > 55 ? q.slice(0, 52) + '...' : q}
          </button>
        ))}
      </div>

      <div style={s.inputRow}>
        <textarea
          style={s.textarea}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any archaeology or DSSM question... (Ctrl+Enter to send)"
        />
        <button style={s.sendBtn} onClick={handleAsk} disabled={loading}>
          {loading ? '⏳' : 'Ask 𓂀'}
        </button>
      </div>

      {history.length > 0 && (
        <button style={s.clearBtn} onClick={() => { setHistory([]); setResponse(''); }}>
          Clear conversation
        </button>
      )}

      {history.length > 1 && (
        <div style={{ marginTop: '0.75rem' }}>
          {history.slice(0, -1).map((h, i) => (
            <div key={i} style={s.historyItem}>
              <div style={s.userQ}>Q: {h.question}</div>
              <div style={{ color: '#7a6040', fontSize: '0.8rem' }}>{h.answer.slice(0, 120)}...</div>
            </div>
          ))}
        </div>
      )}

      <ResponsePanel
        response={response}
        loading={loading}
        error={error}
        title="DSSM INTELLIGENCE RESPONSE"
      />
    </div>
  );
}

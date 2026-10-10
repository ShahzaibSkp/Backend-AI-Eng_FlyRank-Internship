import { useState } from 'react';

const examples = [
  'I was charged twice for my subscription and need a refund.',
  'The app keeps crashing when I try to upload my documents.',
  'Thank you for the quick help. Everything is working now!',
];

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitMessage(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('/api/v1/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The message could not be analyzed.');
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to connect to the API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-mark">✦</div>
        <div>
          <p className="eyebrow">AI-POWERED WORKFLOW</p>
          <h1>Support Triage AI</h1>
        </div>
        <div className="status"><span /> API ready</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow accent">SMARTER SUPPORT, FASTER</p>
          <h2>Turn every message into a clear next step.</h2>
          <p className="intro">
            Paste a customer message and let the AI classify its category, urgency,
            sentiment, and confidence in seconds.
          </p>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span>AI</span></div>
      </section>

      <section className="workspace">
        <form className="card composer" onSubmit={submitMessage}>
          <div className="card-heading">
            <div><span className="step">01</span><h3>Customer message</h3></div>
            <span className="hint">Max 5,000 characters</span>
          </div>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: I cannot access my account after resetting my password..."
            maxLength={5000}
            required
          />
          <div className="composer-footer">
            <span className="counter">{message.length} / 5,000</span>
            <button type="submit" disabled={loading || !message.trim()}>
              {loading ? 'Analyzing...' : 'Analyze message  →'}
            </button>
          </div>
          <div className="examples">
            <span>Try an example:</span>
            {examples.map((example) => (
              <button type="button" key={example} onClick={() => setMessage(example)}>
                {example}
              </button>
            ))}
          </div>
        </form>

        <section className="card results" aria-live="polite">
          <div className="card-heading">
            <div><span className="step">02</span><h3>AI assessment</h3></div>
            {result && <span className="complete">Analysis complete</span>}
          </div>
          {error && <div className="error">{error}</div>}
          {!result && !error && (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <strong>Your results will appear here</strong>
              <span>Submit a message to see the AI assessment.</span>
            </div>
          )}
          {result && (
            <div className="assessment">
              <div className="summary"><span>SUMMARY</span><p>{result.summary}</p></div>
              <div className="metrics">
                <Metric label="Category" value={result.category} />
                <Metric label="Urgency" value={result.urgency} />
                <Metric label="Sentiment" value={result.sentiment} />
                <Metric label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
              </div>
            </div>
          )}
        </section>
      </section>

      <footer>Built with React, Express, Zod, and an OpenAI-compatible AI API</footer>
    </main>
  );
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

export default App;

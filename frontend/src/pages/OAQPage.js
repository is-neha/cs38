/*
 * OAQPage.js — Community Q&A Page
 *
 * Changes: Prevent repeated view increments from the same viewer/browser by
 * persisting a 'viewed' list in localStorage (keyed per viewer_id when
 * available). toggleExpand now records/queries that list and only POSTs to
 * /api/oaq/:id/view and increments the local view count when the viewer has
 * not already viewed the question.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OAQPage.css';

function OAQPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  // ----- Core state -----
  const [oaqs, setOaqs] = useState([]);            // All fetched OAQs from the API
  const [loading, setLoading] = useState(true);      // Loading spinner state
  const [faqCategories, setFaqCategories] = useState([]); // Categories pulled from FAQ data

  // ----- New question form state -----
  const [newQuestion, setNewQuestion] = useState('');       // Question text
  const [newDescription, setNewDescription] = useState(''); // Optional details
  const [newCategory, setNewCategory] = useState('');       // Selected category
  const [submitting, setSubmitting] = useState(false);       // Form submission in progress
  const [error, setError] = useState('');                    // General error message
  const [duplicates, setDuplicates] = useState([]);          // Duplicate questions detected by AI
  const [aiReason, setAiReason] = useState('');              // AI explanation for duplicates

  // ----- Filter tab -----
  const [tab, setTab] = useState('all');                   // Current filter: all | unanswered | approved | promoted
  const [expandedId, setExpandedId] = useState(null);       // ID of the currently expanded question
  const [newAnswer, setNewAnswer] = useState('');           // Text for the answer being written

  // ----- Related questions (now removed from UI) -----
  const [related, setRelated] = useState(null);

  // ----- Form visibility & reporting -----
  const [showForm, setShowForm] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  // ----- View tracking with ref to prevent repeated increments -----
  const viewedOaqsRef = useRef(new Set());

  // ----- Fetch all OAQs -----
  const fetchOaqs = useCallback(() => {
    setLoading(true);
    let url = `/api/oaq`;
    if (tab === 'unanswered') url += '?status=open&hasAnswers=false';
    else if (tab !== 'all') url += `?status=${tab}`;
    fetch(url)
      .then(res => res.json())
      .then(data => { setOaqs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  useEffect(() => { fetchOaqs(); }, [fetchOaqs]);

  // ----- Fetch FAQ categories (used in the category <select>) -----
  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        const cats = data.map(c => c.category).filter(Boolean);
        setFaqCategories(cats);
      })
      .catch(() => {});
  }, []);

  // ----- POST a new question (with duplicate detection) -----
  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setError('');
    setDuplicates([]);
    setAiReason('');
    setSubmitting(true);
    try {
      const res = await authFetch('/api/oaq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion, description: newDescription, category: newCategory }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setDuplicates(data.duplicates || []);
        setAiReason(data.aiReason || '');
        return;
      }
      if (!res.ok) { setError(data.error); return; }
      setNewQuestion('');
      setNewDescription('');
      setNewCategory('');
      setShowForm(false);
      fetchOaqs();
    } catch { setError('Connection error'); }
    finally { setSubmitting(false); }
  };

  // ----- Fetch related questions (REMOVED from UI) -----
  const fetchRelated = async (question) => {
    const res = await fetch(`/api/ai/related?q=${encodeURIComponent(question)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.faq?.length || data.oaq?.length) setRelated(data);
    }
  };

  // ----- Voting on a question (upvote / downvote) -----
  const handleVote = async (id, value) => {
    if (!user) return navigate('/login');
    const res = await authFetch(`/api/oaq/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOaqs(prev => prev.map(o => o._id === updated._id ? updated : o));
    }
  };

  // ----- Expand / collapse answers for a question -----
  // When opening: POST to increment view count (only if not viewed by this viewer), fetch related questions.
  // When closing: clear related questions.
  const toggleExpand = id => {
    const isOpening = expandedId !== id;
    setExpandedId(prev => prev === id ? null : id);
    setNewAnswer('');
    if (isOpening) {
      // Only record view once per session per question
      if (!viewedOaqsRef.current.has(id)) {
        viewedOaqsRef.current.add(id);
        fetch(`/api/oaq/${id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?._id }),
        }).then(r => r.json()).then(data => {
          if (data.views !== undefined) {
            setOaqs(prev => prev.map(o => o._id === id ? { ...o, views: data.views } : o));
          }
        }).catch(() => {});
      }
      const oaq = oaqs.find(o => o._id === id);
      if (oaq) fetchRelated(oaq.question);
    } else {
      setRelated(null);
    }
  };

  // ----- Submit an answer to a question -----
  const submitAnswer = async (oaqId) => {
    if (!user) return navigate('/login');
    if (!newAnswer.trim()) return;
    const res = await authFetch(`/api/oaq/${oaqId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newAnswer }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOaqs(prev => prev.map(o => o._id === updated._id ? updated : o));
      setNewAnswer('');
    }
  };

  // ----- Voting on an answer -----
  const handleAnswerVote = async (oaqId, answerId, value) => {
    if (!user) return navigate('/login');
    const res = await authFetch(`/api/oaq/${oaqId}/answers/${answerId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOaqs(prev => prev.map(o => o._id === updated._id ? updated : o));
    }
  };

  // ----- Submit a report (question or answer) -----
  const handleReport = async () => {
    if (!user) return navigate('/login');
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      const res = await authFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          oaqId: reportTarget.oaqId,
          reason: reportReason,
        }),
      });
      if (res.ok) {
        setNotification('Report submitted. Thank you.');
        setReportTarget(null);
        setReportReason('');
      } else {
        const data = await res.json();
        setNotification(data.error || 'Failed to submit report');
      }
    } catch {
      setNotification('Failed to submit report');
    }
    setReportSubmitting(false);
  };

  // ----- Format a date for display (Indian locale, e.g. "15 May 2026") -----
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const timeAgo = d => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="oaq-page">
      <div className="oaq-container">
        {/* ----- Page header ----- */}
        <div className="oaq-header">
          <h1 className="oaq-title">Community Q&A</h1>
          <p className="oaq-subtitle">Ask questions, get answers from the community, and vote on the best responses.</p>
        </div>

        {/* ----- Submit question card / form ----- */}
        <div className="oaq-submit-card">
          <div className="oaq-submit-header">
            <h2>Ask a question</h2>
            {!showForm && <button className="oaq-btn oaq-btn--primary" onClick={() => setShowForm(true)}>+ New question</button>}
            {showForm && <button className="oaq-btn oaq-btn--ghost" onClick={() => { setShowForm(false); setDuplicates([]); setError(''); }}>Cancel</button>}
          </div>
          {showForm && (
            <form onSubmit={handleSubmit}>
              <textarea
                className="oaq-textarea"
                placeholder="What do you need help with? Be specific..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                rows={3}
              />
              <textarea
                className="oaq-textarea oaq-textarea--sm"
                placeholder="Add more details"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={2}
                style={{ marginTop: 8 }}
              />
              <div className="oaq-category-row">
                <select
                  className="oaq-select"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {faqCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              {duplicates.length > 0 ? (
                <div className="oaq-error" style={{ border: '1.5px solid var(--danger)', background: 'var(--danger-bg)' }}>
                  <strong>⚠️ This question already exists:</strong>
                  <ul style={{ margin: '6px 0 4px 18px', fontSize: '0.85rem' }}>
                    {duplicates.map((d, i) => (
                      <li key={i}>
                        {d.source === 'FAQ' ? (
                          <span
                            style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                            onClick={() => navigate(`/faq?category=${encodeURIComponent(d.category)}&question=${encodeURIComponent(d.text)}`)}
                            title="Click to view in FAQ"
                          >
                            📖 FAQ: {d.text}
                          </span>
                        ) : (
                          <span>
                            💬 OAQ: {d.text}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {aiReason && <p style={{ fontSize: '0.8rem', marginTop: 4 }}>{aiReason}</p>}
                </div>
              ) : error ? (
                <div className="oaq-error">{error}</div>
              ) : null}
              <button className="oaq-btn oaq-btn--primary" type="submit" disabled={submitting || !newQuestion.trim()}>
                {submitting ? 'Submitting…' : 'Submit question'}
              </button>
            </form>
          )}
        </div>

        {/* ----- Filter tabs ----- */}
        <div className="oaq-tabs">
          {['all', 'unanswered', 'approved', 'promoted'].map(t => (
            <button key={t} className={`oaq-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ----- OAQ list (loading, empty, or populated) ----- */}
        {loading ? (
          <div className="oaq-loader">Loading…</div>
        ) : oaqs.length === 0 ? (
          <div className="oaq-empty">No questions yet. Be the first to ask!</div>
        ) : (
          <div className="oaq-list">
            {oaqs.map(oaq => (
              <div key={oaq._id} className={`oaq-card ${oaq.status === 'approved' ? 'oaq-card--approved' : ''} ${oaq.status === 'promoted' ? 'oaq-card--promoted' : ''} ${oaq.isStale ? 'oaq-card--stale' : ''}`}>
                <div className="oaq-card__vote">
                  <button className={`oaq-vote-btn oaq-vote-btn--up ${user && oaq.votedUpBy?.includes(user._id) ? 'oaq-vote-btn--active' : ''}`} onClick={() => handleVote(oaq._id, 1)} title="Upvote">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <span className="oaq-vote-split">
                    <span className="oaq-vote-up">{oaq.upvotes}</span>
                    <span className="oaq-vote-down">{oaq.downvotes}</span>
                  </span>
                  <button className={`oaq-vote-btn oaq-vote-btn--down ${user && oaq.votedDownBy?.includes(user._id) ? 'oaq-vote-btn--active' : ''}`} onClick={() => handleVote(oaq._id, -1)} title="Downvote">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
                <div className="oaq-card__body">
                  <div className="oaq-card__top">
                    <h3 className="oaq-card__question">{oaq.question}</h3>
                    <div className="oaq-card__badges">
                      {oaq.isStale && <span className="oaq-badge oaq-badge--stale">⚠️ Stale</span>}
                      <span className={`oaq-status oaq-status--${oaq.status}`}>{oaq.status}</span>
                    </div>
                  </div>
                  {oaq.description && <p className="oaq-card__desc">{oaq.description}</p>}
                  {oaq.category && <span className="oaq-card__cat">{oaq.category}</span>}
                  <div className="oaq-card__meta">
                    <span>{oaq.submittedBy?.name || 'Anonymous'}</span>
                    <span title={formatDate(oaq.createdAt)}>{timeAgo(oaq.createdAt)}</span>
                    <span>{oaq.views || 0} view{(oaq.views || 0) !== 1 ? 's' : ''}</span>
                    <span>{oaq.answers.length} answer{oaq.answers.length !== 1 ? 's' : ''}</span>
                    {user && (
                      <button
                        className="oaq-report-btn"
                        onClick={() => setReportTarget({ type: 'question', id: oaq._id, oaqId: oaq._id })}
                        title="Report this question"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                        Report
                      </button>
                    )}
                  </div>
                  <button className="oaq-card__expand" onClick={() => toggleExpand(oaq._id)}>
                    {expandedId === oaq._id ? 'Hide answers' : `View ${oaq.answers.length} answer${oaq.answers.length !== 1 ? 's' : ''}`}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`oaq-chevron ${expandedId === oaq._id ? 'open' : ''}`}>
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                  {expandedId === oaq._id && (
                    <div className="oaq-answers">
                      {oaq.answers.length === 0 && <p className="oaq-answers__empty">No answers yet. Be the first to respond!</p>}
                      {oaq.answers.map(ans => (
                        <div key={ans._id} className={`oaq-answer ${ans.accepted ? 'oaq-answer--accepted' : ''}`}>
                          <div className="oaq-answer__vote">
                            <button className={`oaq-vote-btn oaq-vote-btn--sm oaq-vote-btn--up ${user && ans.votedUpBy?.includes(user._id) ? 'oaq-vote-btn--active' : ''}`} onClick={() => handleAnswerVote(oaq._id, ans._id, 1)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                            </button>
                            <span className="oaq-vote-split oaq-vote-split--sm">
                              <span className="oaq-vote-up">{ans.upvotes}</span>
                              <span className="oaq-vote-down">{ans.downvotes}</span>
                            </span>
                            <button className={`oaq-vote-btn oaq-vote-btn--sm oaq-vote-btn--down ${user && ans.votedDownBy?.includes(user._id) ? 'oaq-vote-btn--active' : ''}`} onClick={() => handleAnswerVote(oaq._id, ans._id, -1)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                          </div>
                          <div className="oaq-answer__body">
                            <p>{ans.text}</p>
                            <div className="oaq-answer__meta">
                              <span>{ans.submittedBy?.name || 'Anonymous'}</span>
                              <span>{formatDate(ans.createdAt)}</span>
                              {ans.verifiedByAdmin && <span className="oaq-answer__accepted-badge">✅ Verified by admin</span>}
                              {ans.answeredByAdmin && <span className="oaq-answer__accepted-badge" style={{ background: '#eef2ff', color: '#6366f1' }}>✅ Answered by admin</span>}
                              {ans.accepted && <span className="oaq-answer__accepted-badge">✓ Accepted</span>}
                              {user && (
                                <button
                                  className="oaq-report-btn oaq-report-btn--sm"
                                  onClick={() => setReportTarget({ type: 'answer', id: ans._id, oaqId: oaq._id })}
                                  title="Report this answer"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                    <line x1="4" y1="22" x2="4" y2="15" />
                                  </svg>
                                  Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {oaq.status !== 'promoted' && oaq.status !== 'rejected' && oaq.status !== 'approved' && user?._id !== oaq.submittedBy?._id && (
                        <div className="oaq-answer-form">
                          <textarea
                            className="oaq-textarea oaq-textarea--sm"
                            placeholder="Write your answer…"
                            value={newAnswer}
                            onChange={e => setNewAnswer(e.target.value)}
                            rows={2}
                          />
                          <button className="oaq-btn oaq-btn--secondary" onClick={() => submitAnswer(oaq._id)} disabled={!newAnswer.trim()}>
                            Post answer
                          </button>
                        </div>
                      )}

                      {(oaq.status === 'approved' || user?._id === oaq.submittedBy?._id) && (
                        <p className="oaq-answers__empty" style={{ marginTop: 12 }}>
                          {user?._id === oaq.submittedBy?._id ? 'You cannot answer your own question' : 'This question is closed for new answers'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reportTarget && (
        <div className="oaq-report-overlay" onClick={() => { setReportTarget(null); setReportReason(''); }}>
          <div className="oaq-report-modal" onClick={e => e.stopPropagation()}>
            <h3 className="oaq-report-modal__title">Report {reportTarget.type}</h3>
            <textarea
              className="oaq-textarea"
              placeholder="Why are you reporting this? (required)"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="oaq-report-modal__actions">
              <button className="oaq-btn oaq-btn--ghost" onClick={() => { setReportTarget(null); setReportReason(''); }}>Cancel</button>
              <button
                className="oaq-btn oaq-btn--primary"
                onClick={handleReport}
                disabled={!reportReason.trim() || reportSubmitting}
              >
                {reportSubmitting ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="oaq-toast" onClick={() => setNotification('')}>
          {notification}
        </div>
      )}
    </div>
  );
}

export default OAQPage;

<<<<<<< HEAD
=======
/*
 * OAQPage.js — Community Q&A Page
 *
 * OVERALL PURPOSE:
 *   This page lets users ask public questions (OAQ = Openly Asked Questions),
 *   view questions submitted by others, post answers, upvote/downvote both
 *   questions and answers, and report inappropriate content. It also checks
 *   for duplicate questions using AI before submission.
 *
 * KEY CONCEPTS:
 *   - Questions have statuses: open, approved, promoted, rejected.
 *   - Voting uses separate upvote/downvote counts (not a single net score).
 *   - Answers are shown inline when a question is expanded.
 *   - A "related questions" section (now removed) used to surface similar
 *     FAQs/OAQs; the fetchRelated function still exists but is unused in the UI.
 *   - A report modal lets users flag questions or answers for moderation.
 *   - The sort order (trending / newest / top voted) is computed client-side.
 */

>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AutocorrectInput from '../components/AutocorrectInput';
import './OAQPage.css';

function OAQPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [oaqs, setOaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqCategories, setFaqCategories] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState([]);
  const [aiReason, setAiReason] = useState('');
  const [sort, setSort] = useState('trending');
  const [expandedId, setExpandedId] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [related, setRelated] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

=======

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

  // ----- Sorting & expansion -----
  const [sort, setSort] = useState('trending');            // Current sort: trending | newest | votes
  const [expandedId, setExpandedId] = useState(null);       // ID of the currently expanded question
  const [newAnswer, setNewAnswer] = useState('');           // Text for the answer being written

  // ----- Related questions (now removed from UI) -----
  // The related questions section was previously shown inside the expanded
  // answer area. It fetched FAQ / OAQ matches from the AI endpoint.
  // The fetchRelated function and related state remain for potential re-use.
  const [related, setRelated] = useState(null);

  // ----- Form visibility & reporting -----
  const [showForm, setShowForm] = useState(false);              // Toggle new-question form
  const [reportTarget, setReportTarget] = useState(null);       // { type, id, oaqId } being reported
  const [reportReason, setReportReason] = useState('');         // Report explanation text
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [notification, setNotification] = useState('');         // Toast notification message

  // ----- Fetch all OAQs -----
  // Re-fetches `/api/oaq?sort=...` whenever the sort value changes.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
  const fetchOaqs = useCallback(() => {
    setLoading(true);
    fetch(`/api/oaq?sort=${sort}`)
      .then(res => res.json())
      .then(data => { setOaqs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sort]);

  useEffect(() => { fetchOaqs(); }, [fetchOaqs]);

<<<<<<< HEAD
=======
  // ----- Fetch FAQ categories (used in the category <select>) -----
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        const cats = data.map(c => c.category).filter(Boolean);
        setFaqCategories(cats);
      })
      .catch(() => {});
  }, []);

<<<<<<< HEAD
=======
  // ----- POST a new question (with duplicate detection) -----
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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
<<<<<<< HEAD
=======
      // 409 = duplicates found — AI compares the question against existing FAQ / OAQ entries
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
      if (res.status === 409) {
        setDuplicates(data.duplicates || []);
        setAiReason(data.aiReason || '');
        return;
      }
      if (!res.ok) { setError(data.error); return; }
<<<<<<< HEAD
=======
      // On success reset form and refresh the list
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
      setNewQuestion('');
      setNewDescription('');
      setNewCategory('');
      setShowForm(false);
      fetchOaqs();
    } catch { setError('Connection error'); }
    finally { setSubmitting(false); }
  };

<<<<<<< HEAD
=======
  // ----- Fetch related questions (REMOVED from UI) -----
  // Previously this was called when expanding a question and rendered the
  // `.oaq-related` block with links to similar FAQ / OAQ items.
  // The function and `related` state are preserved but currently unused.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
  const fetchRelated = async (question) => {
    const res = await fetch(`/api/ai/related?q=${encodeURIComponent(question)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.faq?.length || data.oaq?.length) setRelated(data);
    }
  };

<<<<<<< HEAD
=======
  // ----- Voting on a question (upvote / downvote) -----
  // Sends { value: 1 | -1 } to `/api/oaq/:id/vote`.
  // The server returns the updated OAQ object; we replace it in local state.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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

<<<<<<< HEAD
=======
  // ----- Expand / collapse answers for a question -----
  // When opening: POST to increment view count, fetch related questions.
  // When closing: clear related questions.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
  const toggleExpand = id => {
    const isOpening = expandedId !== id;
    setExpandedId(prev => prev === id ? null : id);
    setNewAnswer('');
    if (isOpening) {
      fetch(`/api/oaq/${id}/view`, { method: 'POST' }).catch(() => {});
<<<<<<< HEAD
=======
      // Optimistically increment view count locally
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
      setOaqs(prev => prev.map(o => o._id === id ? { ...o, views: (o.views || 0) + 1 } : o));
      const oaq = oaqs.find(o => o._id === id);
      if (oaq) fetchRelated(oaq.question);
    } else {
      setRelated(null);
    }
  };

<<<<<<< HEAD
=======
  // ----- Submit an answer to a question -----
  // POST to `/api/oaq/:oaqId/answers`. Server returns updated OAQ with new answer.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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

<<<<<<< HEAD
=======
  // ----- Voting on an answer -----
  // Same pattern as question voting but scoped to a specific answer.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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

<<<<<<< HEAD
=======
  // ----- Submit a report (question or answer) -----
  // Shows a modal; POST to `/api/reports` with target info.
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
  const handleReport = async () => {
    if (!user) return navigate('/login');
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      const res = await authFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
<<<<<<< HEAD
          targetType: reportTarget.type,
=======
          targetType: reportTarget.type,   // 'question' | 'answer'
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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

<<<<<<< HEAD
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getScore = o => (o.upvotes || 0) * 3 + (o.views || 0) * 0.5 + (o.answers?.length || 0) * 2;

  const sortedOaqs = [...oaqs].sort((a, b) => {
    if (sort === 'trending') return getScore(b) - getScore(a);
    if (sort === 'votes') return (b.upvotes || 0) - (a.upvotes || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
=======
  // ----- Format a date for display (Indian locale, e.g. "15 May 2026") -----
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // ----- Trending score formula -----
  // Used to sort by "trending": weights upvotes heavily, then answers, then views.
  const getScore = o => (o.upvotes || 0) * 3 + (o.views || 0) * 0.5 + (o.answers?.length || 0) * 2;

  // ----- Client-side sorted copy of the OAQ list -----
  const sortedOaqs = [...oaqs].sort((a, b) => {
    if (sort === 'trending') return getScore(b) - getScore(a);
    if (sort === 'votes') return (b.upvotes || 0) - (a.upvotes || 0);
    return new Date(b.createdAt) - new Date(a.createdAt); // 'newest'
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
  });

  return (
    <div className="oaq-page">
      <div className="oaq-container">
<<<<<<< HEAD
=======
        {/* ----- Page header ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
        <div className="oaq-header">
          <h1 className="oaq-title">Community Q&A</h1>
          <p className="oaq-subtitle">Ask questions, get answers from the community, and vote on the best responses.</p>
        </div>

<<<<<<< HEAD
        {/* Submit question */}
        <div className="oaq-submit-card">
          <div className="oaq-submit-header">
            <h2>Ask a question</h2>
=======
        {/* ----- Submit question card / form ----- */}
        <div className="oaq-submit-card">
          <div className="oaq-submit-header">
            <h2>Ask a question</h2>
            {/* Toggle button — shows either "+ New question" or "Cancel" */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
            {!showForm && <button className="oaq-btn oaq-btn--primary" onClick={() => setShowForm(true)}>+ New question</button>}
            {showForm && <button className="oaq-btn oaq-btn--ghost" onClick={() => { setShowForm(false); setDuplicates([]); setError(''); }}>Cancel</button>}
          </div>
          {showForm && (
            <form onSubmit={handleSubmit}>
<<<<<<< HEAD
=======
              {/* Uses AutocorrectInput for AI-powered spell/grammar correction on the question */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
              <AutocorrectInput
                as="textarea"
                className="oaq-textarea"
                placeholder="What do you need help with? Be specific..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                rows={3}
              />
<<<<<<< HEAD
=======
              {/* Optional description textarea */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
              <textarea
                className="oaq-textarea oaq-textarea--sm"
                placeholder="Add more details"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={2}
                style={{ marginTop: 8 }}
              />
<<<<<<< HEAD
=======
              {/* Category dropdown */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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
<<<<<<< HEAD
=======
              {/* Duplicate warning block (shown when server returns 409) */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
              {duplicates.length > 0 ? (
                <div className="oaq-error" style={{ border: '1.5px solid var(--danger)', background: 'var(--danger-bg)' }}>
                  <strong>⚠️ This question already exists:</strong>
                  <ul style={{ margin: '6px 0 4px 18px', fontSize: '0.85rem' }}>
                    {duplicates.map((d, i) => (
                      <li key={i}>
                        {d.source === 'FAQ' ? '📖 FAQ: ' : '💬 OAQ: '}
                        {d.text}
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

<<<<<<< HEAD
        {/* Sort */}
=======
        {/* ----- Sort toolbar ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
        <div className="oaq-toolbar">
          <span className="oaq-count">{oaqs.length} question{oaqs.length !== 1 ? 's' : ''}</span>
          <div className="oaq-sort">
            <button className={`oaq-sort-btn ${sort === 'trending' ? 'active' : ''}`} onClick={() => setSort('trending')}>Trending</button>
            <button className={`oaq-sort-btn ${sort === 'newest' ? 'active' : ''}`} onClick={() => setSort('newest')}>Newest</button>
            <button className={`oaq-sort-btn ${sort === 'votes' ? 'active' : ''}`} onClick={() => setSort('votes')}>Top voted</button>
          </div>
        </div>

<<<<<<< HEAD
        {/* OAQ list */}
=======
        {/* ----- OAQ list (loading, empty, or populated) ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
        {loading ? (
          <div className="oaq-loader">Loading…</div>
        ) : oaqs.length === 0 ? (
          <div className="oaq-empty">No questions yet. Be the first to ask!</div>
        ) : (
          <div className="oaq-list">
            {sortedOaqs.map(oaq => (
<<<<<<< HEAD
              <div key={oaq._id} className={`oaq-card ${oaq.status === 'approved' ? 'oaq-card--approved' : ''} ${oaq.status === 'promoted' ? 'oaq-card--promoted' : ''}`}>
=======
              /*
               * Each question card:
               *  - Gets special left border (oaq-card--approved / oaq-card--promoted)
               *    based on its moderation status.
               *  - Contains a vote column, body, and expandable answers section.
               */
              <div key={oaq._id} className={`oaq-card ${oaq.status === 'approved' ? 'oaq-card--approved' : ''} ${oaq.status === 'promoted' ? 'oaq-card--promoted' : ''}`}>
                {/* ----- Vote column (question level) ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                <div className="oaq-card__vote">
                  <button className="oaq-vote-btn oaq-vote-btn--up" onClick={() => handleVote(oaq._id, 1)} title="Upvote">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
<<<<<<< HEAD
=======
                  {/* Shows upvote / downvote counts stacked vertically */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                  <span className="oaq-vote-split">
                    <span className="oaq-vote-up">{oaq.upvotes}</span>
                    <span className="oaq-vote-down">{oaq.downvotes}</span>
                  </span>
                  <button className="oaq-vote-btn oaq-vote-btn--down" onClick={() => handleVote(oaq._id, -1)} title="Downvote">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
<<<<<<< HEAD
                <div className="oaq-card__body">
                  <div className="oaq-card__top">
                    <h3 className="oaq-card__question">{oaq.question}</h3>
=======
                {/* ----- Card body ----- */}
                <div className="oaq-card__body">
                  <div className="oaq-card__top">
                    <h3 className="oaq-card__question">{oaq.question}</h3>
                    {/* Status badge: open / approved / promoted / rejected */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                    <span className={`oaq-status oaq-status--${oaq.status}`}>{oaq.status}</span>
                  </div>
                  {oaq.description && <p className="oaq-card__desc">{oaq.description}</p>}
                  {oaq.category && <span className="oaq-card__cat">{oaq.category}</span>}
<<<<<<< HEAD
=======
                  {/* Meta row: author, date, views, answer count, report button */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                  <div className="oaq-card__meta">
                    <span>{oaq.submittedBy?.name || 'Anonymous'}</span>
                    <span>{formatDate(oaq.createdAt)}</span>
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
<<<<<<< HEAD
=======
                  {/* Expand / collapse answers toggle; chevron rotates 90° when open */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                  <button className="oaq-card__expand" onClick={() => toggleExpand(oaq._id)}>
                    {expandedId === oaq._id ? 'Hide answers' : `View ${oaq.answers.length} answer${oaq.answers.length !== 1 ? 's' : ''}`}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`oaq-chevron ${expandedId === oaq._id ? 'open' : ''}`}>
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

<<<<<<< HEAD
=======
                  {/* ----- Answers section (shown when expanded) ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                  {expandedId === oaq._id && (
                    <div className="oaq-answers">
                      {oaq.answers.length === 0 && <p className="oaq-answers__empty">No answers yet. Be the first to respond!</p>}
                      {oaq.answers.map(ans => (
<<<<<<< HEAD
=======
                        /*
                         * Each answer row:
                         *  - Has its own vote column (smaller buttons).
                         *  - Accepted answers get a green background and ✓ badge.
                         *  - Also has a report button for authenticated users.
                         */
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                        <div key={ans._id} className={`oaq-answer ${ans.accepted ? 'oaq-answer--accepted' : ''}`}>
                          <div className="oaq-answer__vote">
                            <button className="oaq-vote-btn oaq-vote-btn--sm oaq-vote-btn--up" onClick={() => handleAnswerVote(oaq._id, ans._id, 1)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                            </button>
                            <span className="oaq-vote-split oaq-vote-split--sm">
                              <span className="oaq-vote-up">{ans.upvotes}</span>
                              <span className="oaq-vote-down">{ans.downvotes}</span>
                            </span>
                            <button className="oaq-vote-btn oaq-vote-btn--sm oaq-vote-btn--down" onClick={() => handleAnswerVote(oaq._id, ans._id, -1)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                          </div>
                          <div className="oaq-answer__body">
                            <p>{ans.text}</p>
                            <div className="oaq-answer__meta">
                              <span>{ans.submittedBy?.name || 'Anonymous'}</span>
                              <span>{formatDate(ans.createdAt)}</span>
<<<<<<< HEAD
                              {ans.verifiedByAdmin && <span className="oaq-answer__accepted-badge">✅ Verified by admin</span>}
                              {ans.answeredByAdmin && <span className="oaq-answer__accepted-badge" style={{ background: '#eef2ff', color: '#6366f1' }}>✅ Answered by admin</span>}
=======
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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

<<<<<<< HEAD
                      {/* Related questions */}
                      {related && (
                        <div className="oaq-related">
                          <strong>Related questions:</strong>
                          {related.faq?.length > 0 && related.faq.map(cat => cat.questions.map((item, i) => (
                            <div key={i} className="oaq-related-item" onClick={() => navigate('/faq')}>
                              📖 {item.q}
                            </div>
                          )))}
                          {related.oaq?.length > 0 && related.oaq.map(o => (
                            <div key={o._id} className="oaq-related-item" onClick={() => { setExpandedId(o._id); fetchRelated(o.question); }}>
                              💬 {o.question}
                            </div>
                          ))}
                        </div>
                      )}

                      {oaq.status !== 'promoted' && oaq.status !== 'rejected' && oaq.status !== 'approved' && user?._id !== oaq.submittedBy?._id && (
=======
                      {/* ----- Answer submission form ----- */}
                      {/* Hidden if the question is promoted or rejected (moderation lock) */}
                      {oaq.status !== 'promoted' && oaq.status !== 'rejected' && (
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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
<<<<<<< HEAD
                      {(oaq.status === 'approved' || user?._id === oaq.submittedBy?._id) && (
                        <p className="oaq-answers__empty" style={{ marginTop: 12 }}>
                          {user?._id === oaq.submittedBy?._id ? 'You cannot answer your own question' : 'This question is closed for new answers'}
                        </p>
                      )}
=======

                      {/* ----- Related questions section (REMOVED) ----- */}
                      {/* Previously rendered here: <div className="oaq-related"> listing
                          FAQ / OAQ matches returned by fetchRelated(). It showed similar
                          questions to help users find existing answers before posting new ones.
                          The related state and fetchRelated function still exist but this UI
                          block has been removed. */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Report modal */}
=======
      {/* ----- Report modal overlay ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
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

<<<<<<< HEAD
=======
      {/* ----- Toast notification (auto-dismissed on click) ----- */}
>>>>>>> bda541506fe3be453675ab66fd034cae46aa6cb2
      {notification && (
        <div className="oaq-toast" onClick={() => setNotification('')}>
          {notification}
        </div>
      )}
    </div>
  );
}

export default OAQPage;

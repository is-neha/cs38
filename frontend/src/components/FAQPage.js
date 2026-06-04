/*
 * FAQPage — Main FAQ page component.
 *
 * Data flow:
 *   1) On mount, fetches all FAQ categories+questions from /api/faqs.
 *   2) Search filters the data client-side via a multi-word substring match
 *      against question text (q) and answer text (a).
 *   3) Results are displayed either as a card grid (default) or a flat list
 *      (when a search query is active).
 *
 * Accordion (expand/collapse):
 *   A flat object (openItems) tracks which question is open per category
 *   by mapping category index → question index. Only one question per
 *   category can be open at a time (accordion behaviour).
 *
 * Voice search:
 *   Uses the Web Speech API (SpeechRecognition). When the mic button is
 *   clicked, listening starts; on result, the transcript is set as the
 *   search query.
 *
 * Autocomplete dropdown:
 *   Rendered by the AutocorrectInput component. It fetches suggestions
 *   from /api/search/suggest with a 250 ms debounce and shows a
 *   positioned dropdown.
 *
 * Clear / Empty states:
 *   A clear (×) button appears when searchQuery is non-empty. If
 *   displayedData is empty and a search is active, an "empty" state is
 *   shown with a button to clear the search.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FAQItem from './FAQItem';
import AutocorrectInput from './AutocorrectInput';
import './FAQPage.css';
import Fuse from "fuse.js";

function FAQPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faqData, setFaqData] = useState([]);           // Full data from the API
  const [searchQuery, setSearchQuery] = useState('');    // Current search text
  const [loading, setLoading] = useState(true);           // Loading spinner state
  const [listening, setListening] = useState(false);      // Voice recognition active?
  const [openQuestionId, setOpenQuestionId] = useState(null);     // Accordion: { [catIndex]: qIndex | null }
  const gridRef = useRef(null);
  const recognitionRef = useRef(null);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micSupported = !!SpeechRecognition;

  // ── Voice search ──
  // Toggles the Web Speech API recogniser. On result, sets the transcript
  // as the search query and stops listening.
  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSearchQuery(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [listening, SpeechRecognition]);

  // Cleanup: abort any active recognition session when the component unmounts.
  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  // ── Data fetching ──
  // On mount, fetches all FAQ categories and questions from the backend API.
  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        setFaqData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Scroll to category from URL param ──
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const catParam = searchParams.get('category');
    const qParam = searchParams.get('question');
    if (!catParam || faqData.length === 0) return;
    if (qParam) {
      for (const cat of faqData) {
        const match = cat.questions.find(q => q.q === qParam);
        if (match) {
          setOpenQuestionId(match._id);
          setTimeout(() => {
            const el = document.getElementById(`faq-${match._id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 350);
          break;
        }
      }
    } else {
      const id = `faq-cat-${catParam.replace(/\s+/g, '-')}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const cat = faqData.find(c => c.category === catParam);
        if (cat && cat.questions.length > 0) {
          setOpenQuestionId(cat.questions[0]._id);
        }
      }
    }
  }, [searchParams, faqData]);

  // ── Client-side search filtering ──
  // If the trimmed query is empty or shorter than 2 characters, return all
  // data unchanged. Otherwise split the query into words and keep only
  // questions where every word appears somewhere in `q` or `a`
  // (case-insensitive substring match). Categories that end up with zero
  // matching questions are filtered out.

  const searchableFaqs = useMemo(() => {
    const items = [];

    faqData.forEach((category, catIdx) => {
      category.questions.forEach((question, qIdx) => {
        items.push({
          category: category.category,
          icon: category.icon,
          question: question.q,
          answer: question.a,
          qId: question._id,
          catIdx,
          qIdx
        });
      });
    });

    return items;
  }, [faqData]);

  const fuse = useMemo(() => {
    return new Fuse(searchableFaqs, {
      keys: [
        { name: "question", weight: 0.7 },
        { name: "answer", weight: 0.2 },
        { name: "category", weight: 0.1 }
      ],
      threshold: 0.45,
      ignoreLocation: true,
      minMatchCharLength: 1
    });
  }, [searchableFaqs]);

  const suggestions = useMemo(() => {
    const query = searchQuery.trim();

    if (query.length < 2) return [];

    return fuse
      .search(query)
      .slice(0, 10)
      .map(result => result.item);

  }, [searchQuery, fuse]);

  const displayedData = useMemo(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      return faqData;
    }

    const matchedIds = new Set(
      fuse.search(query).map(result => result.item.qId)
    );

    return faqData
      .map(category => ({
        ...category,
        questions: category.questions.filter(
          question => matchedIds.has(question._id)
        )
      }))
      .filter(category => category.questions.length > 0);

  }, [faqData, searchQuery, fuse]);

  const isSearching = searchQuery.trim().length >= 2;

  // ── View counter ──
  // Optimistically increments the view count locally so the UI updates
  // immediately (the actual POST to the API is handled inside FAQItem).
  const handleView = useCallback((catIdx, qIdx, actualViews) => {
    if (actualViews !== undefined) {
      setFaqData(prev => prev.map((cat, i) =>
        i === catIdx ? {
          ...cat, questions: cat.questions.map((q, j) =>
            j === qIdx ? { ...q, views: actualViews } : q
          )
        } : cat
      ));
    }
  }, []);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="faq-page">
        <div className="faq-container">
          <div className="faq-loader">
            <div className="faq-loader__bar" />
            <div className="faq-loader__cards">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="faq-loader__card">
                  <div className="faq-loader__header" />
                  <div className="faq-loader__item" />
                  <div className="faq-loader__item" />
                  <div className="faq-loader__item" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      {/* Decorative gradient background layer */}
      <div className="faq-gradient" />

      <div className="faq-container">
        {/* ── Header section ── */}
        <div className="faq-header">
          <span className="faq-badge">Help Center</span>
          <h1 className="faq-title">
            <span className="faq-title__text">Frequently Asked Questions</span>
          </h1>
          <p className="faq-subtitle">
            Everything you need to know about Vicharanashala Internship. Can't find what you're looking for?{' '}
            <a href="#contact" className="faq-contact-link">Contact our support team</a>.
          </p>
        </div>

        {/* ── Search bar with autocomplete, voice, and clear ── */}
        <div className="faq-search-wrapper">
          {/* "New question" button navigates to the community page */}
          <button className="faq-ask-btn" onClick={() => navigate('/community')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New question
          </button>
          <div className="faq-search">
            {/* Search icon */}
            <svg className="faq-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {/* AutocorrectInput renders the actual <input> + suggestion dropdown */}
            <AutocorrectInput
              className="faq-search-input"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suggestions={suggestions}
              onSuggestionClick={(item) => {
                setSearchQuery(item.question);

                setOpenQuestionId(item.qId);

                setTimeout(() => {
                  document
                    .getElementById(`faq-${item.qId}`)
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center"
                    });
                }, 100);
              }}
            />
            {/* Voice search button — only rendered if the browser supports it */}
            {micSupported && (
              <button
                className={`faq-search-mic ${listening ? 'faq-search-mic--active' : ''}`}
                onClick={toggleListening}
                title={listening ? 'Stop listening' : 'Search by voice'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
            {/* Clear button — visible only when there is a search query */}
            {searchQuery && (
              <button className="faq-search-clear" onClick={() => setSearchQuery('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Content area ── */}
        {displayedData.length === 0 ? (
          /* Empty state — shown when search yields no results */
          <div className="faq-empty">
            <div className="faq-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h3>No results found</h3>
            <p>Try a different search term or browse categories above.</p>
            <button className="faq-empty-btn" onClick={() => setSearchQuery('')}>
              Clear search
            </button>
          </div>
        ) : isSearching ? (
          /* ── Search-results view (flat list, no category grouping in layout) ── */
          <>
            <div className="faq-results-count">
              <span className="faq-results-count__dot" />
              Found {displayedData.reduce((sum, cat) => sum + cat.questions.length, 0)} result(s)
            </div>
            <div className="faq-list">
              {displayedData.map((category, catIdx) => (
                <div id={`faq-cat-${category.category.replace(/\s+/g, '-')}`} key={catIdx} className="faq-category-card" style={{ animationDelay: `${catIdx * 0.05}s` }}>
                  <div className="faq-category-card__header">
                    <span className="faq-category-card__icon">{category.icon}</span>
                    <h2 className="faq-category-card__title">{category.category}</h2>
                  </div>
                  {category.questions.map((item, qIdx) => (
                    <FAQItem
                      key={item._id || qIdx}
                      number={qIdx + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openQuestionId === item._id}
                      onToggle={() =>
                        setOpenQuestionId(
                          openQuestionId === item._id ? null : item._id
                        )
                      }
                      catId={category._id}
                      qId={item._id}
                      views={item.views}
                      onView={(actual) => handleView(catIdx, qIdx, actual)}
                      userId={user?._id}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── Default grid view — category cards arranged in a responsive grid ── */
          <div className="faq-grid" ref={gridRef}>
            {displayedData.map((category, catIdx) => (
              <div id={`faq-cat-${category.category.replace(/\s+/g, '-')}`} key={category._id || catIdx} className="faq-category-card" style={{ animationDelay: `${catIdx * 0.06}s` }}>
                <div className="faq-category-card__header">
                  <span className="faq-category-card__icon">{category.icon}</span>
                  <h2 className="faq-category-card__title">{category.category}</h2>
                  <span className="faq-category-card__count">{category.questions.length}</span>
                </div>
                <div className="faq-category-card__body">
                  {category.questions.map((item, qIdx) => (
                    <FAQItem
                      key={item._id || qIdx}
                      number={qIdx + 1}
                      question={item.q}
                      answer={item.a}
                      isOpen={openQuestionId === item._id}
                      onToggle={() =>
                        setOpenQuestionId(
                          openQuestionId === item._id ? null : item._id
                        )
                      }
                      catId={category._id}
                      qId={item._id}
                      views={item.views}
                      onView={(actual) => handleView(catIdx, qIdx, actual)}
                      userId={user?._id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="faq-footer">
          <p>Still have questions? <a href="#contact">Get in touch →</a></p>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;

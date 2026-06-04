import React, { useEffect, useRef } from 'react';
import './FAQItem.css';

function FAQItem({ number, question, answer, isOpen, onToggle, catId, qId, views, onView, userId }) {
  const hasRecordedViewRef = useRef(false);

  useEffect(() => {
    hasRecordedViewRef.current = false;
  }, [userId]);

  useEffect(() => {
    if (isOpen && !hasRecordedViewRef.current) {
      hasRecordedViewRef.current = true;
      fetch(`/api/faqs/${catId}/questions/${qId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then(r => r.json()).then(data => onView && onView(data.views)).catch(() => { });
    }
  }, [isOpen, catId, qId, onView, userId]);

  return (
    <div
      id={`faq-${qId}`}
      className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
    >
      <button className="faq-item__trigger" onClick={onToggle} aria-expanded={isOpen}>
        <span className="faq-item__number">{number}</span>
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__views">{views || 0} view{(views || 0) !== 1 ? 's' : ''}</span>
        <svg className={`faq-item__chevron ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <div className="faq-item__answer">
        <div className="faq-item__answer-inner">
          {answer.split(/(?<=\.) /).filter(Boolean).map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQItem;

import React from 'react';
import './FAQItem.css';

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faq-item__question">{question}</span>
        <div className="faq-item__icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="faq-item__chevron"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </button>
      <div className="faq-item__content" role="region">
        <div className="faq-item__answer">{answer}</div>
      </div>
    </div>
  );
}

export default FAQItem;

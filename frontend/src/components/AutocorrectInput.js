import { useState, useEffect, useRef } from 'react';

function AutocorrectInput({
  value,
  onChange,
  placeholder,
  className,
  suggestions = [],
  onSuggestionClick,
  inputRef
}) {

  const [show, setShow] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () =>
      document.removeEventListener('mousedown', handler);
  }, []);

  const selectItem = (item) => {
    onSuggestionClick(item);
    setShow(false);
  };

  const handleKeyDown = (e) => {
    if (!show || !suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i =>
        Math.min(i + 1, suggestions.length - 1)
      );
    }

    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i =>
        Math.max(i - 1, 0)
      );
    }

    else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault();
      selectItem(suggestions[selectedIdx]);
    }

    else if (e.key === 'Escape') {
      setShow(false);
    }
  };

  return (
    <div
      className="autocorrect-wrapper"
      ref={wrapperRef}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        onChange={(e) => {
          onChange(e);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onKeyDown={handleKeyDown}
      />

      {show &&
        suggestions.length > 0 && (
          <div className="faq-search-dropdown">

            {suggestions.map((item, index) => (
              <div
                key={item.qId}
                className={`faq-search-option ${selectedIdx === index
                    ? 'faq-search-option-active'
                    : ''
                  }`}
                onClick={() => selectItem(item)}
              >
                <div className="faq-search-option-question">
                  {item.question}
                </div>

                <div className="faq-search-option-category">
                  {item.icon} {item.category}
                </div>
              </div>
            ))}

          </div>
        )}
    </div>
  );
}

export default AutocorrectInput;
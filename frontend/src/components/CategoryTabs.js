import React, { useEffect, useRef } from 'react';
import './CategoryTabs.css';

function CategoryTabs({ categories, activeIndex, onSelect }) {
  const tabsRef = useRef([]);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const activeTab = tabsRef.current[activeIndex];
    if (activeTab && indicatorRef.current) {
      indicatorRef.current.style.width = `${activeTab.offsetWidth}px`;
      indicatorRef.current.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    }
  }, [activeIndex]);

  if (!categories?.length) return null;

  return (
    <div className="category-tabs">
      <div className="category-tabs__inner">
        <div className="category-tabs__list" role="tablist">
          {categories.map((cat, i) => (
            <button
              key={cat.category}
              ref={el => (tabsRef.current[i] = el)}
              className={`category-tab ${i === activeIndex ? 'category-tab--active' : ''}`}
              onClick={() => onSelect(i)}
              role="tab"
              aria-selected={i === activeIndex}
            >
              <span className="category-tab__icon">{cat.icon}</span>
              <span className="category-tab__label">{cat.category}</span>
              <span className="category-tab__count">{cat.questions.length}</span>
            </button>
          ))}
          <div className="category-tabs__indicator" ref={indicatorRef} />
        </div>
      </div>
    </div>
  );
}

export default CategoryTabs;

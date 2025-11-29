import React, { useRef } from 'react'

export default function Header(){
  const inputRef = useRef(null);

  function runSearch(q) {
    const qTrim = (q || '').trim();
    if (!qTrim) {
      // empty -> go home
      location.hash = '#home';
      return;
    }
    try {
      if (window && window.fedfDoSearchWithQ) {
        window.fedfDoSearchWithQ(qTrim);
        // also update hash for history
        location.hash = '#search-' + encodeURIComponent(qTrim);
        return;
      }
    } catch (e) { /* ignore */ }
    // fallback: update URL hash so legacy router handles it when ready
    location.hash = '#search-' + encodeURIComponent(qTrim);
  }

  return (
    <header>
      <button id="homeBtn" className="btn home-btn" title="Home" aria-label="Home">Home</button>
      <div className="brand">Virtual Art Gallery — FEDF-PS16</div>

      <div className="search-container">
        <div className="search" role="search">
          <input id="searchInput" ref={inputRef} type="search" placeholder="Search artists, art pieces, keywords (e.g. Sun)..." aria-label="Search"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                runSearch(inputRef.current && inputRef.current.value);
              }
            }}
          />
          <button id="searchBtn" onClick={() => runSearch(inputRef.current && inputRef.current.value)}>Search</button>
        </div>
      </div>

      <div className="header-actions">
        <div id="greeting" className="muted" style={{ fontSize: '0.95rem', cursor: 'pointer' }}></div>
        <button id="loginBtn" className="btn secondary">Login / Register</button>
        <button id="cartBtn" className="btn" title="View cart">Cart (0)</button>
      </div>
    </header>
  )
}

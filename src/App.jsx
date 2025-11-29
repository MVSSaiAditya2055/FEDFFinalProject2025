import React, { useEffect, useState } from 'react'
import { initLegacyApp } from './legacy'
import { searchData } from './store'
import Header from './components/Header'
import Carousel from './components/Carousel'
import Home from './components/Home'
import Calendar from './components/Calendar'
import SearchResults from './components/SearchResults'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ artworks: [], artists: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Initialize legacy DOM-based app (seeding, routing, listeners).
    // This keeps original app behavior while providing a React mount.
    initLegacyApp();

    // Listen for hash changes to clear search if user navigates home
    const handleHashChange = () => {
      if (location.hash === '#home' || location.hash === '') {
        setIsSearching(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [])

  const handleSearch = (q) => {
    const query = (q || '').trim();
    if (!query) {
      setIsSearching(false);
      setSearchQuery('');
      location.hash = '#home';
      return;
    }
    const results = searchData(query);
    setSearchResults(results);
    setSearchQuery(query);
    setIsSearching(true);
    location.hash = '#search-' + encodeURIComponent(query);
  };

  return (
    <>
      <Header onSearch={handleSearch} />

      <main id="app">
        {isSearching ? (
          <SearchResults results={searchResults} query={searchQuery} />
        ) : (
          <section>
            <Carousel />
            <Home />
          </section>
        )}

        <Calendar />
      </main>

      <footer>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <strong>About Us</strong>
            <div className="muted" style={{ marginTop: 6, maxWidth: 550 }}>We are a student-built prototype showcasing artworks, cultural context and virtual events. This project (FEDF-PS16) is developed as a Student Development Project.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Contact</strong>
            <div className="muted" style={{ marginTop: 6 }}>Email: fedf-p16@example.edu<br />Mentor: [Faculty Mentor Name]</div>
          </div>
        </div>
      </footer>

      {/* Dedicated search results page (legacy will render here when available) */}
      <div id="searchPage" className="section" aria-live="polite" style={{ display: 'none' }}></div>
    </>
  )
}
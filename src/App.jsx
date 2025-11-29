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

    // Listen for hash changes to handle navigation between search and details
    const handleHashChange = () => {
      const hash = location.hash;
      // If navigating back to a search URL, restore search mode
      if (hash.startsWith('#search-')) {
        const q = decodeURIComponent(hash.slice(8)); // remove #search-
        if (q) {
          setSearchQuery(q);
          setSearchResults(searchData(q));
          setIsSearching(true);
        }
      }
      // If navigating to home or any detail page, exit search mode
      else {
        setIsSearching(false);
        // We don't clear searchQuery here so it persists if they go back, 
        // but we do hide the search results view.
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
        {isSearching && (
          <SearchResults results={searchResults} query={searchQuery} />
        )}

        {/* Keep Home mounted so legacy.js can find #pageContent when navigating to detail pages */}
        <div style={{ display: isSearching ? 'none' : 'block' }}>
          <section>
            <Carousel />
            <Home />
          </section>
        </div>

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
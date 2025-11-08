import React, { useEffect } from 'react'
import { initLegacyApp } from './legacy'
import Header from './components/Header'
import Carousel from './components/Carousel'
import Home from './components/Home'
import Calendar from './components/Calendar'

export default function App() {
  useEffect(() => {
    // Initialize legacy DOM-based app (seeding, routing, listeners).
    // This keeps original app behavior while providing a React mount.
    initLegacyApp();
  }, [])

  return (
    <>
      <Header />

      <main id="app">
        <section>
          <Carousel />
          <Home />
        </section>

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

      {/* template used by legacy script */}
      <template id="searchResultsTemplate">
        <div>
          <h3>Search Results</h3>
          <div style={{ marginTop: 8 }}>
            <h4>Art Pieces</h4>
            <div id="artResults"></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <h4>Artists</h4>
            <div id="artistResults"></div>
          </div>
        </div>
      </template>
    </>
  )
}

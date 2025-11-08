import React from 'react'

export default function Home(){
  return (
    <div id="pageContent" className="section" aria-live="polite">
      <h3>Welcome to the Virtual Art Gallery</h3>
      <p className="muted">Explore artworks, learn cultural histories, join virtual tours and attend exhibitions. Use the search bar above to find art pieces or artists — example search term: <code>Sun</code>.</p>

      <div style={{ marginTop: 12 }}>
        <h4>Recent Art Pieces</h4>
        <div id="recentList"></div>
      </div>
    </div>
  )
}

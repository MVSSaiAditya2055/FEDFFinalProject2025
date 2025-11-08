import React from 'react'

export default function Carousel(){
  return (
    <div className="carousel section" id="carouselSection">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Featured</strong>
        <small className="muted">Click slideshow to open item</small>
      </div>
      <div className="carousel-stage" id="carouselStage" tabIndex={0} aria-live="polite"></div>
    </div>
  )
}

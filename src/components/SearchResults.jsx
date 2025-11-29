import React from 'react'
import { artistById, loadStore } from '../store'

export default function SearchResults({ results, query }) {
    const { artworks = [], artists = [] } = results || {};
    const store = loadStore(); // Need store to look up artist names for artworks

    return (
        <div className="section">
            <h3>Search Results for "{query}"</h3>

            <div style={{ marginTop: 12 }}>
                <h4>Art Pieces</h4>
                {artworks.length > 0 ? (
                    artworks.map(a => (
                        <div key={a.id} className="list-row">
                            <div className="thumb"><img src={a.image} alt={a.title} /></div>
                            <div className="meta">
                                <strong><a href={`#art-${a.id}`}>{a.title}</a></strong>
                                <div className="muted">by <a href={`#artist-${a.artistId}`}>{artistById(store, a.artistId)?.name || 'Unknown'}</a></div>
                            </div>
                            <div style={{ minWidth: 90, textAlign: 'right' }}>
                                <div className="muted">₹{a.price}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="muted">No art pieces match your search.</div>
                )}
            </div>

            <div style={{ marginTop: 16 }}>
                <h4>Artists</h4>
                {artists.length > 0 ? (
                    artists.map(a => (
                        <div key={a.id} className="list-row">
                            <div className="thumb"><img src={a.photo} alt={a.name} /></div>
                            <div className="meta">
                                <strong><a href={`#artist-${a.id}`}>{a.name}</a></strong>
                                <div className="muted">{a.bio || ''}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="muted">No artists match your search.</div>
                )}
            </div>
        </div>
    )
}
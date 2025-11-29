/* ====== Client-side "Database" Seed Data ====== */
const seed = {
  users: [
    { id: 'u_admin', name:'Admin', email:'admin@gallery.test', password:'adminpass', role:'admin', verified:true },
    { id: 'u_v1', name:'Asha Visitor', email:'asha@visitor.test', password:'pass123', role:'visitor', verified:true },
    // seed curator account
    { id: 'u_curator', name:'K. Curator', email:'curator@gallery.test', password:'curpass', role:'curator', verified:true }
  ],
  artists: [
    { id:'a1', name:'John Sun', bio:'Contemporary painter exploring light and mythology.', verified:true, photo:'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=300&q=60' },
    { id:'a2', name:'Meera Rao', bio:'Textile & folk art revivalist.', verified:true, photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=60' }
  ],
  artworks: [
    { id:'art1', title:"Sun Wukong's Might", artistId:'a1', description:'A dramatic oil painting inspired by myth and sunlight. Cultural notes: references to East Asian myth of the Great Monkey King.', image:'https://www.outregallery.com/cdn/shop/files/JedHenry-TheDestinedOn1.jpg?v=1730171536&width=949', price:1200, featured:true, videos:[] },
    { id:'art2', title:'Threads of Home', artistId:'a2', description:'A woven tapestry reimagining rural patterns. Cultural notes: traditional weaving motifs.', image:'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80', price:800, featured:true, videos:[] },
    { id:'art3', title:'Golden Hour Study', artistId:'a1', description:'Study in light and shadow, capturing late afternoon.', image:'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=900&q=80', price:450, featured:false, videos:[] }
  ],
  events: [
    { id:'e1', title:'Solar Narratives - An Exhibition', venue:'City Art Hall', date:'2025-11-13', time:'4:00 PM', curator: { name:'R. Sen', photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=60' }, items:['art1','art3'] },
    { id:'e2', title:'Weave & Pattern', venue:'Studio 12', date:'2025-11-29', time:'6:00 PM', curator: { name:'Leena Gupta', photo:'https://images.unsplash.com/photo-1545996124-1b4b9ba6fdb4?auto=format&fit=crop&w=100&q=60' }, items:['art2'] }
  ]
};

/* ====== Persistence ====== */
const STORAGE_KEY = 'fedf_ps16_store_v1';
const CURRENT_USER_KEY = 'fedf_ps16_currentUser';

export function loadStore() {
  if (typeof window === 'undefined') return { users:[], artists:[], artworks:[], events:[], cart:[] };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initStore();
  }
  try { return JSON.parse(raw); } catch(e) { localStorage.removeItem(STORAGE_KEY); return initStore(); }
}

export function saveStore(s) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function initStore() {
  const init = { users: seed.users.slice(), artists: seed.artists.slice(), artworks: seed.artworks.slice(), events: seed.events.slice(), cart: [] };
  saveStore(init);
  return init;
}

// Ensure seeded entries exist in store (useful when localStorage was created before adding new seeds)
export function ensureSeedMerged() {
  let store = loadStore();
  let changed = false;
  // users by email
  seed.users.forEach(su => {
    if (!store.users.some(u => u.email === su.email)) { store.users.push(su); changed = true; }
  });
  // artists by id
  seed.artists.forEach(sa => {
    if (!store.artists.some(a => a.id === sa.id)) { store.artists.push(sa); changed = true; }
  });
  // artworks by id
  seed.artworks.forEach(sa => {
    if (!store.artworks.some(a => a.id === sa.id)) { store.artworks.push(sa); changed = true; }
  });
  // events by id
  seed.events.forEach(se => {
    if (!store.events.some(e => e.id === se.id)) { store.events.push(se); changed = true; }
  });
  if (changed) saveStore(store);
}

export function loadCurrentUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY)); } catch(e){ return null; }
}

export function saveCurrentUser(user) {
  if (typeof window === 'undefined') return;
  if (user) sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(CURRENT_USER_KEY);
}

export function artistById(store, id) { return store.artists.find(a=>a.id===id); }
export function artById(store, id) { return store.artworks.find(a=>a.id===id); }

export function searchData(query) {
  const store = loadStore();
  const q = (query || '').trim().toLowerCase();
  if (!q) return { artworks: [], artists: [] };

  const artworks = store.artworks.filter(a => {
    const artText = (((a.title||'') + ' ' + (a.description||'')).toLowerCase());
    if (artText.indexOf(q) !== -1) return true;
    const artArtist = artistById(store, a.artistId);
    const artistText = artArtist ? (((artArtist.name||'') + ' ' + (artArtist.bio||'')).toLowerCase()) : '';
    if (artistText.indexOf(q) !== -1) return true;
    return false;
  });

  const artists = store.artists.filter(a => (((a.name||'') + ' ' + (a.bio||'')).toLowerCase().indexOf(q) !== -1));

  return { artworks, artists };
}
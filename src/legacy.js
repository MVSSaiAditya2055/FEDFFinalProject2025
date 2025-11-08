// Legacy app initializer: re-uses the original DOM-based app logic.
// We wrap the original script in a function and export initLegacyApp()
export function initLegacyApp() {
  try {
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
    function loadStore() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const init = { users: seed.users.slice(), artists: seed.artists.slice(), artworks: seed.artworks.slice(), events: seed.events.slice(), cart: [] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        return init;
      }
      try { return JSON.parse(raw); } catch(e) { localStorage.removeItem(STORAGE_KEY); return loadStore(); }
    }
    function saveStore(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

    let store = loadStore();
    let currentUser = loadCurrentUser();

    // Ensure seeded entries exist in store (useful when localStorage was created before adding new seeds)
    (function ensureSeedMerged(){
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
    })();

    function saveCurrentUser() {
      if (currentUser) sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      else sessionStorage.removeItem(CURRENT_USER_KEY);
    }
    function loadCurrentUser() { try { return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY)); } catch(e){ return null; } }

    /* ====== Router helpers ====== */
    function navigateTo(hash) { location.hash = hash; }

    /* ====== Header controls and cart ====== */
    const greetingEl = document.getElementById('greeting');
    const loginBtn = document.getElementById('loginBtn');
    const cartBtn = document.getElementById('cartBtn');

    function updateHeader() {
      const cartCount = store.cart ? store.cart.length : 0;
      if (cartBtn) cartBtn.textContent = `Cart (${cartCount})`;
      if (currentUser) {
        if (greetingEl) greetingEl.textContent = `Hi, ${currentUser.name} (${currentUser.role})`;
        if (loginBtn) loginBtn.textContent = 'Account';
      } else {
        if (greetingEl) greetingEl.textContent = '';
        if (loginBtn) loginBtn.textContent = 'Login / Register';
      }
    }
    if (loginBtn) loginBtn.addEventListener('click', () => navigateTo('#login'));
    if (cartBtn) cartBtn.addEventListener('click', () => navigateTo('#cart'));

    /* ====== Carousel (avoid duplicate intervals) ====== */
    const carouselStage = document.getElementById('carouselStage');
    let carouselTimer = null;
    const CAROUSEL_INTERVAL_MS = 5000;
    function renderCarousel() {
      clearInterval(carouselTimer);
      const featured = store.artworks.filter(a=>a.featured);
      if (!carouselStage) return;
      carouselStage.innerHTML = '';
      if (featured.length === 0) {
        carouselStage.innerHTML = '<div style="padding:24px">No featured artworks yet.</div>';
        return;
      }
      let idx = 0;
      function show(i) {
        const art = featured[i];
        carouselStage.innerHTML = '';
        const img = document.createElement('img');
        img.src = art.image;
        img.alt = art.title;
        img.style.cursor = 'pointer';
        img.addEventListener('click', ()=> navigateTo('#art-'+art.id));
        carouselStage.appendChild(img);
        const caption = document.createElement('div');
        caption.className = 'carousel-caption';
        caption.textContent = art.title + ' — ' + (artistById(art.artistId)?.name || 'Unknown');
        carouselStage.appendChild(caption);
      }
      show(idx);
      carouselTimer = setInterval(()=> { idx = (idx+1) % featured.length; show(idx); }, CAROUSEL_INTERVAL_MS);
    }

    function artistById(id) { return store.artists.find(a=>a.id===id); }
    function artById(id) { return store.artworks.find(a=>a.id===id); }

    /* ====== Recent list ====== */
    function renderRecentList() {
      const recent = store.artworks.slice(0,6);
      const container = document.getElementById('recentList');
      if (!container) return;
      container.innerHTML = '';
      if (!recent.length) { container.innerHTML = '<div class="muted">No artworks yet.</div>'; return; }
      recent.forEach(art=>{
        const row = document.createElement('div');
        row.className='list-row';
        row.innerHTML = `
      <div class="thumb"><img src="${art.image}" alt="${escapeHtml(art.title)}"></div>
      <div class="meta"><strong><a href="#art-${art.id}">${escapeHtml(art.title)}</a></strong><div class="muted">by <a href="#artist-${art.artistId}">${escapeHtml(artistById(art.artistId)?.name||'Unknown')}</a></div></div>
      <div style="min-width:90px;text-align:right"><div class="muted">₹${art.price}</div></div>
    `;
        container.appendChild(row);
      });
    }

    // Reusable upload function so multiple buttons can call it
    function uploadArtworkPrompt(artistId) {
      const artist = store.artists.find(a => a.id === artistId);
      if (!artist) return alert('Artist profile not found for upload.');
      const title = prompt('Artwork title:');
      if (!title) return alert('Upload cancelled: title is required.');
      const image = prompt('Image URL (or leave blank for placeholder):') || '';
      const description = prompt('Short description:') || '';
      const priceStr = prompt('Price (number, e.g. 450):') || '0';
      const price = Number(priceStr) || 0;
      const featuredAns = prompt('Feature this artwork on the carousel? (yes/no):') || 'no';
      const featured = String(featuredAns).toLowerCase().startsWith('y');

      const id = 'art_'+Date.now();
      const newArt = { id, title: title.trim(), artistId: artist.id, description: description.trim(), image: image.trim() || '', price, featured, videos: [] };
      store.artworks.push(newArt);
      saveStore(store);
      alert('Artwork uploaded (saved to localStorage).');
      // Refresh UI widgets
      renderCarousel();
      renderRecentList();
      // If currently viewing this artist, re-render that page
      if (location.hash.startsWith('#artist-') && location.hash.includes(artist.id)) renderArtistPage(artist.id);
    }

    /* ====== Calendar ====== */
    let calDate = new Date();
    function renderCalendar() {
      const calMonthTitle = document.getElementById('calMonthTitle');
      const calendarGrid = document.getElementById('calendarGrid');
      const upcomingEventsList = document.getElementById('upcomingEventsList');
      if (!calMonthTitle || !calendarGrid || !upcomingEventsList) return;

      const year = calDate.getFullYear();
      const month = calDate.getMonth();
      calMonthTitle.textContent = calDate.toLocaleString(undefined, { month:'long', year:'numeric' });

      calendarGrid.innerHTML = '';
      const firstDay = new Date(year, month, 1);
      const startDay = firstDay.getDay();
      const daysInMonth = new Date(year, month+1, 0).getDate();

      for (let i=0;i<startDay;i++) {
        const blank = document.createElement('div'); blank.className='cal-day'; blank.innerHTML=''; calendarGrid.appendChild(blank);
      }

      const eventsByDate = {};
      store.events.forEach(ev => {
        eventsByDate[ev.date] = eventsByDate[ev.date] || [];
        eventsByDate[ev.date].push(ev);
      });

      for (let d=1; d<=daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = document.createElement('div');
        cell.className='cal-day';
        cell.textContent = d;
        if (eventsByDate[dateStr]) {
          cell.classList.add('highlight');
          cell.title = eventsByDate[dateStr].map(e=>e.title).join('; ');
          cell.addEventListener('click', ()=> navigateTo('#event-'+eventsByDate[dateStr][0].id));
        }
        calendarGrid.appendChild(cell);
      }

      upcomingEventsList.innerHTML='';
      const upcoming = store.events.slice().sort((a,b)=> new Date(a.date) - new Date(b.date)).slice(0,4);
      upcoming.forEach(ev=>{
        const r = document.createElement('div'); r.className='list-row';
        r.innerHTML = `
      <div class="thumb"><img src="${ev.items && ev.items[0] ? (artById(ev.items[0])?.image||'') : ''}" alt=""></div>
      <div class="meta"><strong><a href="#event-${ev.id}">${escapeHtml(ev.title)}</a></strong><div class="muted">${ev.date} • ${ev.time}</div></div>
    `;
        upcomingEventsList.appendChild(r);
      });
    }

    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.addEventListener('click', ()=> { calDate.setMonth(calDate.getMonth()-1); renderCalendar(); });
    if (nextBtn) nextBtn.addEventListener('click', ()=> { calDate.setMonth(calDate.getMonth()+1); renderCalendar(); });

    /* ====== Search ====== */
    // Use delegated handlers and read the input element at runtime so listeners remain valid
    function doSearch() {
      const inputEl = document.getElementById('searchInput');
      const q = (inputEl && (inputEl.value || '').trim()) || '';
      if (!q) { /* empty search -> go home */ navigateTo('#home'); return; }
      doSearchWithQ(q);
      navigateTo('#search-'+encodeURIComponent(q));
    }

    // Delegated click for search button (works even if the button node is recreated)
    document.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!target) return;
      if (target.id === 'searchBtn' || (target.closest && target.closest('#searchBtn'))) {
        doSearch();
      }
    });

    // Also attach a direct listener to the search button if present so React-rendered
    // header buttons respond immediately (this avoids edge cases where delegated clicks
    // may not feel responsive in some UIs).
    const _searchBtn = document.getElementById('searchBtn');
    if (_searchBtn) {
      _searchBtn.addEventListener('click', (e) => { e.preventDefault(); doSearch(); });
    }

    // Global key listener: Enter inside the search input runs search
    document.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (e.key === 'Enter' && active && active.id === 'searchInput') {
        e.preventDefault();
        doSearch();
      }
    });

    function doSearchWithQ(rawQ) {
      const q = (rawQ||'').trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);

      // helper: does text contain any token?
      const containsAny = (text) => {
        if (!tokens.length) return false;
        const t = (text||'').toLowerCase();
        return tokens.some(tok => t.indexOf(tok) !== -1);
      };

      // artworks that match title/description or artist fields
      const byText = store.artworks.filter(a => containsAny((a.title||'') + ' ' + (a.description||'')));

      // artists that match name/bio
      const artistResults = store.artists.filter(a => containsAny((a.name||'') + ' ' + (a.bio||'')));

      // include artworks whose artist matches the tokens
      const byArtistMatch = store.artworks.filter(a => {
        const artArtist = artistById(a.artistId);
        if (!artArtist) return false;
        return containsAny((artArtist.name||'') + ' ' + (artArtist.bio||''));
      });

      // merge and dedupe artwork results (include both matches)
      const mergedArtsMap = {};
      byText.concat(byArtistMatch).forEach(a => { if (a && a.id) mergedArtsMap[a.id] = a; });
      const artResults = Object.keys(mergedArtsMap).map(k => mergedArtsMap[k]);

      renderTemplateSearch(artResults, artistResults, rawQ);
      const si = document.getElementById('searchInput'); if (si) si.value = rawQ;
    }

    // Expose a minimal JS API so React components can invoke search reliably
    try {
      if (typeof window !== 'undefined') {
        window.fedfDoSearch = doSearch;
        window.fedfDoSearchWithQ = doSearchWithQ;
      }
    } catch (e) { /* ignore */ }

    function renderTemplateSearch(arts, artists, rawQ) {
      const template = document.getElementById('searchResultsTemplate');
      if (!template) return;
      const clone = template.content.cloneNode(true);
      const heading = clone.querySelector('h3');
      if (heading) heading.textContent = rawQ ? `Search Results for "${rawQ}"` : 'Search Results';
      const artResults = clone.querySelector('#artResults');
      const artistResults = clone.querySelector('#artistResults');

      artResults.innerHTML = arts.length ? arts.map(a => `
    <div class="list-row">
      <div class="thumb"><img src="${a.image}" alt=""></div>
      <div class="meta"><strong><a href="#art-${a.id}">${escapeHtml(a.title)}</a></strong><div class="muted">by <a href="#artist-${a.artistId}">${escapeHtml(artistById(a.artistId)?.name||'Unknown')}</a></div></div>
      <div style="min-width:90px;text-align:right"><div class="muted">₹${a.price}</div></div>
    </div>`).join('') : '<div class="muted">No art pieces match your search.</div>';

      artistResults.innerHTML = artists.length ? artists.map(a=>`
    <div class="list-row">
      <div class="thumb"><img src="${a.photo}" alt=""></div>
      <div class="meta"><strong><a href="#artist-${a.id}">${escapeHtml(a.name)}</a></strong><div class="muted">${escapeHtml(a.bio||'')}</div></div>
    </div>`).join('') : '<div class="muted">No artists match your search.</div>';

      const content = document.getElementById('pageContent');
      if (!content) return;
      content.innerHTML = '';
      content.appendChild(clone);
    }

    /* ====== Routing & page renderers ====== */
    window.addEventListener('hashchange', renderRoute);
    function renderRoute() {
      const hash = location.hash || '#home';
      updateHeader();
      if (hash.startsWith('#home')) {
        renderHome();
      } else if (hash.startsWith('#search-')) {
        const q = decodeURIComponent(hash.slice('#search-'.length));
        if (q) doSearchWithQ(q);
      } else if (hash.startsWith('#artist-')) {
        const id = hash.split('-').slice(1).join('-');
        renderArtistPage(id);
      } else if (hash.startsWith('#art-')) {
        const id = hash.split('-').slice(1).join('-');
        renderArtPage(id);
      } else if (hash === '#login') {
        renderLoginPage();
      } else if (hash.startsWith('#register')) {
        renderRegisterPage();
      } else if (hash.startsWith('#event-')) {
        const id = hash.split('-').slice(1).join('-');
        renderEventPage(id);
      } else if (hash === '#cart') {
        renderCartPage();
      } else if (hash === '#admin') {
        renderAdminPanel();
      } else if (hash === '#curator') {
        renderCuratorPanel();
      } else {
        renderHome();
      }
    }

    function renderHome() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;
        // Base home HTML
        pageContent.innerHTML = `
      <h3>Welcome to the Virtual Art Gallery</h3>
      <p class="muted">Explore artworks, learn cultural histories, join virtual tours and attend exhibitions. Use the search bar above to find art pieces or artists — example search term: <code>Sun</code>.</p>
      <div style="margin-top:12px;">
        <h4>Recent Art Pieces</h4>
        <div id="recentList"></div>
      </div>
    `;
        renderRecentList(); renderCarousel(); renderCalendar();

        // If logged in as an artist, show upload button at bottom of home page
        if (currentUser && currentUser.role === 'artist' && currentUser.artistId) {
          const uploadWrap = document.createElement('div');
          uploadWrap.style.marginTop = '14px';
          uploadWrap.innerHTML = `<button id="uploadArtBtnHome" class="btn">Upload New Artwork</button>`;
          pageContent.appendChild(uploadWrap);
          const btn = document.getElementById('uploadArtBtnHome');
          if (btn) btn.addEventListener('click', () => uploadArtworkPrompt(currentUser.artistId));
        }
    }

    function renderArtistPage(id) {
      const artist = store.artists.find(x=>x.id===id);
      const content = document.getElementById('pageContent');
      if (!content) return;
      if (!artist) { content.innerHTML = '<div class="muted">Artist not found.</div>'; return; }
      const artistArts = store.artworks.filter(a=>a.artistId===id);
      content.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="width:120px;height:120px;border-radius:8px;overflow:hidden;"><img src="${artist.photo}" alt="${escapeHtml(artist.name)}"></div>
      <div>
        <h2>${escapeHtml(artist.name)}</h2>
        <p class="muted">${escapeHtml(artist.bio||'')}</p>
        <div style="margin-top:8px;">
          ${currentUser && currentUser.role==='artist' && currentUser.artistId===artist.id ? '<button id="uploadArtBtn" class="btn">Upload New Artwork</button>' : ''}
        </div>
      </div>
    </div>
    <div style="margin-top:12px;">
      <h4>Artworks by ${escapeHtml(artist.name)}</h4>
      <div id="artistArtList"></div>
    </div>
  `;
      const list = document.getElementById('artistArtList');
      artistArts.forEach(a=>{
        const r = document.createElement('div'); r.className='list-row';
        // show delete button to artist owner next to price
        const delBtnHtml = (currentUser && currentUser.role==='artist' && currentUser.artistId===artist.id) ? `<button class="btn secondary" data-artid="${a.id}">Delete</button>` : '';
        r.innerHTML = `<div class="thumb"><img src="${a.image}" alt=""></div>
      <div class="meta"><strong><a href="#art-${a.id}">${escapeHtml(a.title)}</a></strong><div class="muted">${escapeHtml((a.description||'').substring(0,120))}...</div></div>
      <div style="min-width:140px;text-align:right"><div class="muted">₹${a.price}</div><div style="margin-top:6px">${delBtnHtml}</div></div>`;
        list.appendChild(r);
      });

      // Attach delegated handler for delete buttons inside the artist list
      if (list) {
        list.addEventListener('click', (ev) => {
          const btn = ev.target.closest && ev.target.closest('button[data-artid]');
          if (btn) {
            const aid = btn.getAttribute('data-artid');
            const ok = confirm('Delete this artwork? This action cannot be undone.');
            if (!ok) return;
            deleteArtworkById(aid);
            // re-render artist page to reflect change
            renderArtistPage(artist.id);
          }
        });
      }

      // Attach handler for uploading new artwork (visible only to the artist owner)
      const uploadBtn = document.getElementById('uploadArtBtn');
      if (uploadBtn) {
        uploadBtn.addEventListener('click', () => uploadArtworkPrompt(artist.id));
      }
    }

    // Home button handler: reset to initial view (clear search, go to #home, reset calendar)
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
  // Navigate to home and reset key UI pieces
  navigateTo('#home');
  try { const _si = document.getElementById('searchInput'); if (_si) _si.value = ''; } catch(e){}
        calDate = new Date();
        renderCalendar();
        renderCarousel();
        renderRecentList();
        // ensure route renders home content
        renderRoute();
      });
    }

    function renderArtPage(id) {
      const art = store.artworks.find(x=>x.id===id);
      const content = document.getElementById('pageContent');
      if (!content) return;
      if (!art) { content.innerHTML = '<div class="muted">Artwork not found.</div>'; return; }
      const artist = artistById(art.artistId);
      content.innerHTML = `
    <div class="art-hero">
      <img src="${art.image}" alt="${escapeHtml(art.title)}">
      <div class="details">
        <h2>${escapeHtml(art.title)}</h2>
        <div class="muted">by <a href="#artist-${artist?.id}">${escapeHtml(artist?.name || 'Unknown')}</a></div>
        <h3 style="margin-top:10px">₹${art.price}</h3>
        <p style="margin-top:12px">${escapeHtml(art.description)}</p>
        <div style="margin-top:12px;display:flex;gap:8px;align-items:center;">
          <button id="addToCartBtn" class="btn">Add to Cart</button>
          <button id="buyNowBtn" class="btn secondary">Buy Now</button>
        </div>
        <div style="margin-top:12px" class="muted">Cultural history: ${escapeHtml(art.description)}</div>

        <div style="margin-top:18px;">
          <strong>Media</strong>
          <div id="mediaArea" style="margin-top:8px;"></div>
        </div>
      </div>
    </div>
  `;

      const mediaArea = document.getElementById('mediaArea');
      if (art.videos && art.videos.length) {
        art.videos.forEach(src=>{
          const vid = document.createElement('video'); vid.controls=true; vid.style.maxWidth='100%'; vid.src = src;
          mediaArea.appendChild(vid);
        });
      } else {
        if (mediaArea) mediaArea.innerHTML = '<div class="muted">No videos. You can insert interview clips or synthesis videos here.</div>';
      }

      const addToCartBtn = document.getElementById('addToCartBtn');
      const buyNowBtn = document.getElementById('buyNowBtn');
      if (addToCartBtn) addToCartBtn.addEventListener('click', ()=> {
        if (!ensureLoggedIn()) return;
        if (currentUser.role === 'artist') { alert('Artist accounts cannot buy items. Please use a visitor account.'); return; }
        store.cart = store.cart || [];
        store.cart.push({ artId: art.id, title: art.title, price: art.price });
        saveStore(store); updateHeader();
        alert('Added to cart (dummy).');
      });
      if (buyNowBtn) buyNowBtn.addEventListener('click', ()=> {
        if (!ensureLoggedIn()) return;
        if (currentUser.role === 'artist') { alert('Artist accounts cannot buy items. Please use a visitor account.'); return; }
        alert('Purchase simulated (dummy). Thank you!'); store.cart = []; saveStore(store); updateHeader();
      });
    }

    function renderEventPage(id) {
      const ev = store.events.find(x=>x.id===id);
      const content = document.getElementById('pageContent');
      if (!content) return;
      if (!ev) { content.innerHTML = '<div class="muted">Event not found.</div>'; return; }
      content.innerHTML = `
    <div style="display:flex;gap:18px;align-items:center;">
      <div style="width:220px"><img src="${ev.items && ev.items[0] ? (artById(ev.items[0])?.image||'') : ''}" alt="${escapeHtml(ev.title)}" style="width:100%;border-radius:8px"></div>
      <div>
        <h2>${escapeHtml(ev.title)}</h2>
        <div class="muted">${escapeHtml(ev.venue)} • ${ev.date} • ${ev.time}</div>
        <div style="margin-top:12px;display:flex;gap:12px;align-items:center;">
          <div class="curator-circle"><img src="${ev.curator.photo}" alt="${escapeHtml(ev.curator.name)}" style="width:100%;height:100%;object-fit:cover"></div>
          <div><strong>${escapeHtml(ev.curator.name)}</strong><div class="muted">Curator</div></div>
        </div>
      </div>
    </div>
    <div style="margin-top:16px;">
      <h4>Items on display</h4>
      <div id="eventItemsList"></div>
    </div>
  `;
      const list = document.getElementById('eventItemsList');
      ev.items.forEach(itemId => {
        const art = artById(itemId);
        const row = document.createElement('div'); row.className='list-row';
        row.innerHTML = `<div class="thumb"><img src="${art?.image||''}" alt=""></div>
      <div class="meta"><strong><a href="#art-${art?.id}">${escapeHtml(art?.title||'')}</a></strong><div class="muted">${escapeHtml(artistById(art?.artistId)?.name||'')}</div></div>`;
        list.appendChild(row);
      });
    }

    function renderLoginPage() {
      const content = document.getElementById('pageContent');
      if (!content) return;
      content.innerHTML = `
    <h3>Login</h3>
    <p class="muted">Choose your account type and login.</p>
    <div class="two-col" style="margin-top:12px">
      <div class="section">
        <h4>Visitor / Admin Login</h4>
        <form id="visitorLoginForm" class="form" onsubmit="return false;">
          <input id="v_email" placeholder="Email" required>
          <input id="v_pass" type="password" placeholder="Password" required>
          <div style="display:flex;gap:8px">
            <button id="vLoginBtn" class="btn">Login</button>
            <button id="vRegBtn" class="btn secondary">Register</button>
          </div>
        </form>
      </div>
      <div class="section">
        <h4>Artist Login</h4>
        <form id="artistLoginForm" class="form" onsubmit="return false;">
          <input id="a_email" placeholder="Email" required>
          <input id="a_pass" type="password" placeholder="Password" required>
          <div style="display:flex;gap:8px">
            <button id="aLoginBtn" class="btn">Login</button>
            <button id="aRegBtn" class="btn secondary">Register</button>
          </div>
        </form>
      </div>
      <div class="section">
        <h4>Curator Login</h4>
        <form id="curatorLoginForm" class="form" onsubmit="return false;">
          <input id="c_email" placeholder="Email" required>
          <input id="c_pass" type="password" placeholder="Password" required>
          <div style="display:flex;gap:8px">
            <button id="cLoginBtn" class="btn">Login</button>
            <button id="cRegBtn" class="btn secondary">Register</button>
          </div>
        </form>
      </div>
    </div>
    <div style="margin-top:12px" class="muted">To verify artist & curator accounts, admin must approve registrations. Admin panel: <a href="#admin">Admin</a> • Curator panel: <a href="#curator">Curator</a></div>
  `;

      const vLoginBtn = document.getElementById('vLoginBtn');
      const aLoginBtn = document.getElementById('aLoginBtn');
      const vRegBtn = document.getElementById('vRegBtn');
      const aRegBtn = document.getElementById('aRegBtn');

      if (vLoginBtn) vLoginBtn.addEventListener('click', ()=> {
        const email = document.getElementById('v_email').value.trim();
        const pass = document.getElementById('v_pass').value;
        const user = store.users.find(u=>u.email===email && u.password===pass && (u.role==='visitor' || u.role==='admin' || u.role==='curator'));
        if (user) { currentUser = user; saveCurrentUser(); alert(user.role==='admin'? 'Admin logged in.' : (user.role==='curator' ? 'Curator logged in.' : 'Visitor logged in.')); updateHeader(); navigateTo('#home'); }
        else alert('Invalid visitor/admin/curator credentials or account not found.');
      });

      if (aLoginBtn) aLoginBtn.addEventListener('click', ()=> {
        const email = document.getElementById('a_email').value.trim();
        const pass = document.getElementById('a_pass').value;
        const user = store.users.find(u=>u.email===email && u.password===pass && u.role==='artist');
        if (user) {
          const artistProfile = store.artists.find(a => a.email===email || a.id===user.artistId);
          if (artistProfile && artistProfile.verified) {
            currentUser = user; saveCurrentUser(); alert('Artist logged in.'); updateHeader(); navigateTo('#home');
          } else {
            alert('Artist account pending verification by admin.');
          }
        } else {
          alert('Invalid artist credentials or account not found.');
        }
      });

      const cLoginBtnEl = document.getElementById('cLoginBtn');
      const cRegBtnEl = document.getElementById('cRegBtn');
      if (cLoginBtnEl) cLoginBtnEl.addEventListener('click', ()=> {
        const email = document.getElementById('c_email').value.trim();
        const pass = document.getElementById('c_pass').value;
        const user = store.users.find(u=>u.email===email && u.password===pass && u.role==='curator');
        if (user) {
          if (user.verified) {
            currentUser = user; saveCurrentUser(); alert('Curator logged in.'); updateHeader(); navigateTo('#curator');
          } else {
            alert('Curator account pending verification by admin.');
          }
        } else {
          alert('Invalid curator credentials or account not found.');
        }
      });
      if (cRegBtnEl) cRegBtnEl.addEventListener('click', ()=> navigateTo('#register?role=curator'));

      if (vRegBtn) vRegBtn.addEventListener('click', ()=> navigateTo('#register?role=visitor'));
      if (aRegBtn) aRegBtn.addEventListener('click', ()=> navigateTo('#register?role=artist'));
    }

    function renderRegisterPage() {
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      const role = params.get('role') || 'visitor';
      const content = document.getElementById('pageContent');
      if (!content) return;
      content.innerHTML = `
    <h3>Register (${role})</h3>
    <form id="regForm" class="form">
      <input id="reg_name" placeholder="Full name" required>
      <input id="reg_email" placeholder="Email" required>
      <input id="reg_password" type="password" placeholder="Password" required>
      ${role==='artist' ? '<input id="reg_bio" placeholder="Short artist bio (for approvals)">' : ''}
      ${role==='curator' ? '<input id="reg_bio" placeholder="Short curator bio (for approvals)"><input id="reg_photo" placeholder="Photo URL (optional)">' : ''}
      <div style="display:flex;gap:8px">
        <button class="btn" id="doRegister">${role==='artist' ? 'Register as Artist' : (role==='curator' ? 'Register as Curator' : 'Register as Visitor')}</button>
        <button class="btn secondary" id="cancelReg">Cancel</button>
      </div>
    </form>
    <div style="margin-top:8px" class="muted">${role==='visitor' ? 'Visitor accounts are active immediately.' : 'Accounts require admin verification. After registering, please inform your admin to verify your account.'}</div>
  `;
      const cancel = document.getElementById('cancelReg');
      const doRegister = document.getElementById('doRegister');
      if (cancel) cancel.addEventListener('click', ()=> navigateTo('#login'));
      if (doRegister) doRegister.addEventListener('click', ()=> {
        const name = document.getElementById('reg_name').value.trim();
        const email = document.getElementById('reg_email').value.trim();
        const password = document.getElementById('reg_password').value;
        if (!name || !email || !password) { alert('Fill required fields'); return; }
        if (store.users.some(u=>u.email===email)) { alert('Email already registered'); return; }
        if (role==='visitor') {
          const id = 'u_'+Date.now();
          const newUser = { id, name, email, password, role:'visitor', verified:true };
          store.users.push(newUser);
          saveStore(store);
          currentUser = newUser; saveCurrentUser(); updateHeader(); alert('Visitor registered and signed in.'); navigateTo('#home');
        } else if (role==='artist') {
          const artistId = 'a_'+Date.now();
          const newArtist = { id: artistId, name, bio: (document.getElementById('reg_bio')?.value||''), verified:false, photo:'' , email };
          store.artists.push(newArtist);
          const userId = 'u_'+Date.now();
          const userRec = { id:userId, name, email, password, role:'artist', artistId, verified:false };
          store.users.push(userRec);
          saveStore(store);
          alert('Artist registered. Await admin verification.');
          navigateTo('#login');
        } else if (role==='curator') {
          const bio = document.getElementById('reg_bio')?.value||'';
          const photo = document.getElementById('reg_photo')?.value||'';
          const userId = 'u_'+Date.now();
          const userRec = { id:userId, name, email, password, role:'curator', verified:false, bio, photo };
          store.users.push(userRec);
          saveStore(store);
          alert('Curator registered. Await admin verification.');
          navigateTo('#login');
        }
      });
    }

    function renderCartPage() {
      const content = document.getElementById('pageContent');
      if (!content) return;
      const cart = store.cart || [];
      if (!cart.length) { content.innerHTML = '<h3>Your Cart</h3><div class="muted">Your cart is empty.</div>'; return; }
      content.innerHTML = `<h3>Your Cart</h3><div id="cartList"></div><div style="margin-top:12px"><button id="checkoutBtn" class="btn">Checkout (dummy)</button></div>`;
      const cartList = document.getElementById('cartList');
      cart.forEach((c,i)=>{
        const art = artById(c.artId) || { title:c.title };
        const r = document.createElement('div'); r.className='list-row';
        r.innerHTML = `<div class="thumb"><img src="${art.image||''}" alt=""></div>
      <div class="meta"><strong>${escapeHtml(art.title)}</strong><div class="muted">Qty: 1</div></div>
      <div style="min-width:90px;text-align:right"><div class="muted">₹${c.price}</div></div>`;
        cartList.appendChild(r);
      });
      const checkoutBtn = document.getElementById('checkoutBtn');
      if (checkoutBtn) checkoutBtn.addEventListener('click', ()=> {
        if (!ensureLoggedIn()) return;
        if (currentUser.role === 'artist') { alert('Artists cannot buy.'); return; }
        alert('Checkout simulated (dummy). Order placed.'); store.cart = []; saveStore(store); updateHeader(); renderCartPage();
      });
    }

    function renderAdminPanel() {
      if (!ensureAdmin()) { alert('Admin login required.'); navigateTo('#login'); return; }
      const content = document.getElementById('pageContent');
      if (!content) return;
      // Admin handles artist verifications and now curator verifications as well.
      content.innerHTML = `<h3>Admin Panel</h3>
        <div class="admin-grid">
          <div class="section"><h4>Artist Verifications</h4><div id="artistVerifications"></div></div>
          <div class="section"><h4>Curator Verifications</h4><div id="curatorVerifications"></div></div>
        </div>`;

      // --- Artist verifications ---
      const artistList = document.getElementById('artistVerifications');
      const pendingArtists = store.artists.filter(a=>!a.verified);
      if (!pendingArtists.length) artistList.innerHTML = '<div class="muted">No pending artist verifications.</div>';
      pendingArtists.forEach(a=>{
        const r = document.createElement('div'); r.className='list-row';
        r.innerHTML = `<div class="thumb"><img src="${a.photo||'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=60'}" alt=""></div>
      <div class="meta"><strong>${escapeHtml(a.name)}</strong><div class="muted">${escapeHtml(a.bio||'')}</div></div>
      <div><button class="btn" data-id="${a.id}">Approve</button></div>`;
        artistList.appendChild(r);
      });

      artistList.addEventListener('click', (ev)=>{
        if (ev.target.matches('button[data-id]')) {
          const id = ev.target.getAttribute('data-id'); approveArtistById(id);
        }
      });

      // --- Curator verifications ---
      const curatorList = document.getElementById('curatorVerifications');
      const pendingCurators = store.users.filter(u=>u.role==='curator' && !u.verified);
      if (!pendingCurators.length) curatorList.innerHTML = '<div class="muted">No pending curator verifications.</div>';
      pendingCurators.forEach(u=>{
        const r = document.createElement('div'); r.className='list-row';
        r.innerHTML = `<div class="thumb"><img src="${u.photo||'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=60'}" alt=""></div>
      <div class="meta"><strong>${escapeHtml(u.name)}</strong><div class="muted">${escapeHtml(u.bio||'')}</div></div>
      <div><button class="btn" data-curator-id="${u.id}">Approve</button></div>`;
        curatorList.appendChild(r);
      });

      curatorList.addEventListener('click', (ev)=>{
        if (ev.target.matches('button[data-curator-id]')) {
          const id = ev.target.getAttribute('data-curator-id'); approveCuratorById(id);
        }
      });
    }

    // Curator panel: create and remove events
    function renderCuratorPanel() {
      if (!ensureCurator()) { alert('Curator login required.'); navigateTo('#login'); return; }
      const content = document.getElementById('pageContent');
      if (!content) return;
      content.innerHTML = `<h3>Curator Panel</h3><div class="section"><h4>Events</h4><div id="curatorEvents"></div><div style="margin-top:8px"><button id="createEventBtn" class="btn">Create Event</button></div></div>`;

      const curatorEvents = document.getElementById('curatorEvents');
      if (!store.events.length) curatorEvents.innerHTML = '<div class="muted">No events yet.</div>';
      store.events.forEach(ev=>{
        const r = document.createElement('div'); r.className='list-row';
        r.innerHTML = `<div class="thumb"><img src="${ev.items && ev.items[0] ? (artById(ev.items[0])?.image||'') : ''}" alt=""></div>
      <div class="meta"><strong>${escapeHtml(ev.title)}</strong><div class="muted">${ev.date} • ${ev.time} • ${escapeHtml(ev.venue)}</div></div>
      <div style="min-width:90px;text-align:right"><button class="btn secondary" data-delete="${ev.id}">Delete</button></div>`;
        curatorEvents.appendChild(r);
      });

      curatorEvents.addEventListener('click', (ev)=>{ if (ev.target.matches('button[data-delete]')) deleteEventById(ev.target.getAttribute('data-delete')); });

      const createEventBtn = document.getElementById('createEventBtn');
      if (createEventBtn) createEventBtn.addEventListener('click', ()=> {
        const title = prompt('Event title:'); if (!title) return;
        const date = prompt('Date (YYYY-MM-DD):'); if (!date) return;
        const time = prompt('Time (e.g. 6:00 PM):') || '';
        const venue = prompt('Venue:') || '';
        const curatorName = currentUser ? currentUser.name : (prompt('Curator name:')||'');
        const curatorPhoto = prompt('Curator photo URL (optional):') || '';

        // Ask how many artworks to add and collect their titles & image URLs
        const numStr = prompt('How many artworks would you like to add to this event? (enter a number)') || '0';
        const num = Math.max(0, parseInt(numStr, 10) || 0);

        // ensure a curator artist profile exists to associate uploaded works
        const curatorArtistId = 'a_curator_'+(currentUser ? currentUser.id : ('anon_'+Date.now()));
        if (!store.artists.find(a=>a.id===curatorArtistId)) {
          store.artists.push({ id: curatorArtistId, name: curatorName, bio: 'Works added by curator', verified:true, photo: curatorPhoto || '' });
        }

        const items = [];
        for (let i=0;i<num;i++) {
          const atitle = prompt(`Artwork #${i+1} title:`) || '';
          if (!atitle) continue;
          const aimg = prompt(`Artwork #${i+1} image URL:`) || '';
          const adesc = prompt(`Artwork #${i+1} short description (optional):`) || '';
          const aprice = Number(prompt(`Artwork #${i+1} price (number):`) || '0') || 0;
          const aid = 'art_'+Date.now() + '_' + i;
          const newArt = { id: aid, title: atitle.trim(), artistId: curatorArtistId, description: adesc.trim(), image: aimg.trim() || '', price: aprice, featured:false, videos:[] };
          store.artworks.push(newArt);
          items.push(aid);
        }

        const id = 'e_'+Date.now();
        store.events.push({ id, title, venue, date, time, curator:{ name:curatorName, photo:curatorPhoto }, items });
        saveStore(store); alert('Event created.'); renderCuratorPanel(); renderCalendar();
      });
    }

    function approveArtistById(id) {
      const artist = store.artists.find(a=>a.id===id); if (!artist) return alert('Artist not found');
      artist.verified = true;
      store.users.filter(u=>u.role==='artist' && u.artistId===id).forEach(u=>u.verified=true);
      saveStore(store); alert('Artist approved.'); renderAdminPanel();
    }
    
    function approveCuratorById(id) {
      const user = store.users.find(u=>u.id===id);
      if (!user) return alert('Curator not found');
      user.verified = true;
      saveStore(store);
      alert('Curator approved.');
      renderAdminPanel();
    }
        function deleteEventById(id) { store.events = store.events.filter(e=>e.id!==id); saveStore(store); alert('Event removed'); renderAdminPanel(); renderCalendar(); }

        function deleteArtworkById(id) {
          const art = store.artworks.find(a=>a.id===id);
          if (!art) return alert('Artwork not found');
          store.artworks = store.artworks.filter(a=>a.id!==id);
          // remove from any events that referenced it
          store.events = store.events.map(ev => ({ ...ev, items: (ev.items || []).filter(i => i !== id) }));
          saveStore(store);
          alert('Artwork removed.');
          // update widgets
          updateHeader(); renderCarousel(); renderRecentList(); renderCalendar();
          // if current route included this art, navigate home
          if (location.hash && location.hash.includes(id)) navigateTo('#home');
        }

    function escapeHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function ensureLoggedIn() { if (currentUser) return true; alert('Please login first.'); navigateTo('#login'); return false; }
  function ensureAdmin() { return currentUser && currentUser.role==='admin'; }
  function ensureCurator() { return currentUser && currentUser.role==='curator'; }

    function initApp() {
      store.cart = store.cart || [];
      updateHeader(); renderCarousel(); renderRecentList(); renderCalendar();
      if (!location.hash) location.hash = '#home';
      renderRoute();
    }
    initApp();

    if (greetingEl) greetingEl.addEventListener('click', ()=> {
      if (!currentUser) return;
      const ok = confirm('Sign out?');
      if (ok) { currentUser = null; saveCurrentUser(); updateHeader(); alert('Signed out.'); navigateTo('#home'); }
    });
  } catch (err) {
    // Avoid breaking the React app if legacy init fails
    // eslint-disable-next-line no-console
    console.error('Legacy app initialization failed:', err);
  }
}

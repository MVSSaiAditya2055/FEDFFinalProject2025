# FEDF — Virtual Art Gallery (React + Vite)

This is a lightweight migration of the original prototype into a React + Vite scaffold.

What I added
- Vite-based React scaffold (package.json + index.html)
- `src/App.jsx` — main React component rendering the original markup (converted to JSX)
- `src/App.css` — copied/adapted CSS from the original `stylesprot.css`
- `src/legacy.js` — wraps the original inline script and initializes it after the React mount (preserves behavior)

How to run locally
1. Open a terminal in the project folder.
2. Install dependencies:

```powershell
npm install
```

3. Start the dev server:

```powershell
npm run dev
```

Notes & next steps
- The current approach preserves the original app behavior by running the legacy DOM-based script after the React DOM mounts. This keeps the conversion minimal and quick.
- For a full React migration, the legacy logic in `src/legacy.js` should be refactored into React components and hooks. I can do that next (recommended: convert routing and the store to React state/context).

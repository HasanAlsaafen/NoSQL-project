# Frontend (Vite + React + TypeScript)

Commands (PowerShell):

```powershell
cd frontend
npm install
npm run dev
```

This project proxies `/api` and `/profile` to `http://localhost:3000` (see `vite.config.ts`).

Notes:
- Replace the placeholder DB calls in the backend with real queries.
- If you prefer CORS instead of a proxy, enable CORS in the backend.

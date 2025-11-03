## Deploy to Vercel (frontend) and Render (backend)

### 1) Backend on Render
- Connect repository in Render and choose "Docker" for the service.
- Render will use `backend/Dockerfile`. We updated it to honor `$PORT`.
- Use `render.yaml` in repo (auto-detected) or create service manually with:
  - Environment: `Docker`
  - Health check path: `/health`
  - Disk: 10GB at `/var/data/models` (to cache the model)
  - Env vars:
    - `HOST=0.0.0.0`
    - `PORT=8000` (Render sets `$PORT`; image also defaults to 8000)
    - `MODEL_PATH=/var/data/models/natural-sql-7b`
    - `LOG_LEVEL=info`
    - `CORS_ORIGINS=https://your-vercel-app.vercel.app` (set to your Vercel URL)

Wait for the first deploy. Note the Render URL, e.g. `https://dash-wiz-backend.onrender.com`.

### 2) Frontend on Vercel
- Import the Git repo in Vercel. Framework preset: Vite (auto).
- Set build-time env var:
  - `VITE_API_BASE_URL=https://YOUR-RENDER-BACKEND.onrender.com`
- Optional runtime vars:
  - `VITE_API_DEBUG=false`
  - `VITE_API_TIMEOUT=30000`
- Build command (auto): `npm run build`; Output: `dist`.

Deploy, then open the Vercel domain. The app will call the Render backend.

### 3) Local override (optional)
For local dev against Render backend, create `.env` in project root:
```
VITE_API_BASE_URL=https://YOUR-RENDER-BACKEND.onrender.com
```

### Notes
- First model warmup may take 5–15s. Subsequent calls are faster.
- If model files aren’t present, backend downloads to the mounted disk.
- Update `CORS_ORIGINS` on Render whenever your Vercel domain changes.



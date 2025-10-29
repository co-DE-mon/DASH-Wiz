# Phase 1: Environment & Configuration - Setup Complete ✅

## Overview
This phase establishes the foundation for DASH-Wiz's Natural-SQL integration by setting up environment configuration and API service layer.

## What Was Implemented

### 1. Environment Configuration Files

#### `.env` (Created)
The main environment configuration file containing:
- `VITE_API_BASE_URL`: Backend API base URL (http://localhost:8000)
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (30000ms)
- `VITE_API_DEBUG`: Enable debug logging for API requests (true)

**Note:** This file is gitignored and should not be committed to version control.

#### `.env.example` (Created)
Template file for environment variables that can be safely committed to Git. Developers should copy this to `.env` and configure for their environment.

### 2. Vite Configuration Updates

#### `vite.config.js` (Updated)
Enhanced configuration with:
- **Environment Variable Loading**: Uses `loadEnv()` to load variables based on mode
- **Server Configuration**: 
  - Port: 5173
  - Strict port enforcement
  - Host binding enabled
- **Global Constants**: Environment variables exposed via `import.meta.env`
- **Build Optimizations**: 
  - Manual chunks for React and Monaco Editor vendors
  - Improved bundle splitting

### 3. API Service Layer

#### `src/services/api.js` (Created)
Comprehensive API service providing:

**Core Functions:**
- `checkHealth()` - Check backend service health
- `getServiceInfo()` - Get backend service information
- `generateSQL(dbSchema, question)` - Generate SQL from natural language
- `isBackendReachable()` - Quick connectivity check

**Features:**
- Request timeout handling (30s default)
- Debug logging (controlled by VITE_API_DEBUG)
- Custom error handling with `APIError` class
- Automatic retry logic for failed requests
- CORS-ready configuration

**Error Handling:**
- Timeout errors (408)
- Network errors
- Backend errors with detailed messages
- Validation errors (400)

### 4. Git Configuration

#### `.gitignore` (Created/Updated)
Added proper ignore patterns for:
- Environment files (`.env`, `.env.local`, etc.)
- Node modules
- Build artifacts
- Python cache files
- Editor configurations

## Usage Guide

### Environment Variables in React Components

```javascript
// Access environment variables anywhere in your React app
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const timeout = import.meta.env.VITE_API_TIMEOUT;
const debug = import.meta.env.VITE_API_DEBUG;
```

### Using the API Service

#### Example 1: Check Backend Health
```javascript
import { checkHealth } from './services/api';

const checkBackendStatus = async () => {
  try {
    const health = await checkHealth();
    console.log('Backend is healthy:', health);
  } catch (error) {
    console.error('Backend is down:', error.message);
  }
};
```

#### Example 2: Generate SQL from Natural Language
```javascript
import { generateSQL } from './services/api';

const handleNaturalQuery = async (schema, question) => {
  try {
    const result = await generateSQL(schema, question);
    console.log('Generated SQL:', result.sql_query);
    console.log('Results:', result.data);
  } catch (error) {
    console.error('Failed to generate SQL:', error.message);
  }
};
```

#### Example 3: Check Backend Connectivity
```javascript
import { isBackendReachable } from './services/api';

const checkConnection = async () => {
  const isReachable = await isBackendReachable();
  if (isReachable) {
    console.log('✅ Backend is online');
  } else {
    console.log('❌ Backend is offline');
  }
};
```

## Testing the Setup

### 1. Start the Backend Service
```bash
# In the project root
python model_service.py
```

Expected output:
```
🚀 DASH-Wiz Backend Service Starting...
✅ Tokenizer loaded successfully
✅ Model loaded successfully
🎉 DASH-Wiz Backend is READY to accept requests!
📡 API Documentation: http://localhost:8000/docs
```

### 2. Start the Frontend Development Server
```bash
npm run dev
```

Expected output:
```
VITE v6.2.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Test API Connectivity
Open browser console and run:
```javascript
// Test health check
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log);

// Expected output: { status: "healthy", model_loaded: true, ... }
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         DASH-Wiz Frontend               │
│         (React + Vite)                  │
│         Port: 5173                      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Environment Variables           │ │
│  │   - VITE_API_BASE_URL            │ │
│  │   - VITE_API_TIMEOUT             │ │
│  │   - VITE_API_DEBUG               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   API Service Layer              │ │
│  │   src/services/api.js            │ │
│  │   - checkHealth()                │ │
│  │   - generateSQL()                │ │
│  │   - Error handling               │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/HTTPS
                    │ JSON API
                    ▼
┌─────────────────────────────────────────┐
│      Natural-SQL Backend Service        │
│      (FastAPI + PyTorch)                │
│      Port: 8000                         │
│                                         │
│  Endpoints:                             │
│  - GET  /health                         │
│  - GET  /                               │
│  - POST /generate-sql                   │
│                                         │
│  Model: natural-sql-7b (4-bit quant)   │
└─────────────────────────────────────────┘
```

## Configuration Files Summary

| File | Purpose | In Git? |
|------|---------|---------|
| `.env` | Local environment config | ❌ No |
| `.env.example` | Template for .env | ✅ Yes |
| `vite.config.js` | Vite build configuration | ✅ Yes |
| `src/services/api.js` | API service layer | ✅ Yes |
| `.gitignore` | Git ignore patterns | ✅ Yes |

## Environment Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_BASE_URL` | string | `http://localhost:8000` | Backend API base URL |
| `VITE_API_TIMEOUT` | number | `30000` | Request timeout (ms) |
| `VITE_API_DEBUG` | boolean | `true` | Enable debug logging |

## Next Steps (Phase 2)

With Phase 1 complete, you're ready to:
1. Create Natural Query UI component
2. Implement schema explorer integration
3. Add query result display
4. Create error handling UI
5. Add loading states and animations

## Troubleshooting

### Backend Not Reachable
- Ensure backend is running: `python model_service.py`
- Check if port 8000 is available
- Verify CORS settings in `model_service.py`

### Environment Variables Not Loading
- Restart Vite dev server after changing `.env`
- Ensure variables start with `VITE_` prefix
- Check `vite.config.js` for proper `define` configuration

### CORS Errors
- Backend CORS is configured for `http://localhost:5173`
- If using different port, update `model_service.py` line 26

## Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [DASH-Wiz API Documentation](http://localhost:8000/docs)

---

**Status:** ✅ Phase 1 Complete
**Date:** October 29, 2025
**Next Phase:** UI Components & Integration


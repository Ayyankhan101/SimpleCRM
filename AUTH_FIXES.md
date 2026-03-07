# Authentication Fixes Summary

## Problems Found & Fixed

### 1. **API Base URL Configuration** ❌ → ✅
**File:** `frontend/src/utils/api.js`

**Problem:** `baseURL` was empty, causing all API requests to fail.

**Fix:** Changed to use `/api` with Vite proxy (not direct URL to avoid CORS issues):
```javascript
const api = axios.create({
  baseURL: '/api',  // Uses Vite proxy
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 2. **Doubled API Paths** ❌ → ✅
**Files:** `frontend/src/context/AuthContext.jsx`, `pages/*.jsx`

**Problem:** API calls used `/api/auth/login` but axios baseURL was already `/api`, resulting in `/api/api/auth/login` (404 errors).

**Fix:** Changed all API calls to use relative paths without `/api` prefix:
```javascript
// Before
api.get('/api/auth/me')
api.post('/api/auth/login')

// After
api.get('/auth/me')
api.post('/auth/login')
```

### 3. **Session-based Authentication Mismatch** ❌ → ✅
**File:** `frontend/src/context/AuthContext.jsx`

**Problem:** Frontend was storing a fake token in localStorage, but backend uses Flask-Login sessions (cookies).

**Fix:** Removed localStorage token logic. Session cookies now handle authentication automatically:
```javascript
const checkAuth = async () => {
  try {
    const response = await api.get('/auth/me')
    setUser(response.data.user)
  } catch (error) {
    setUser(null)
  } finally {
    setLoading(false)
  }
}
```

### 4. **CORS Configuration** ❌ → ✅
**File:** `backend/app/__init__.py`

**Problem:** CORS wasn't properly configured for cookie-based authentication.

**Fix:** Added `expose_headers` and `max_age` for better cookie handling:
```python
CORS(app,
     origins=["http://localhost:5173", "http://localhost:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type"],
     max_age=600)
```

### 5. **Vite Proxy Configuration** ❌ → ✅
**File:** `frontend/vite.config.js`

**Problem:** Proxy wasn't preserving cookies in requests.

**Fix:** Added proxy configuration to preserve cookies:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
    ws: true,
    configure: (proxy, options) => {
      proxy.on('proxyReq', (proxyReq, req, res) => {
        proxyReq.setHeader('cookie', req.headers.cookie || '')
      })
    }
  }
}
```

### 6. **Python Path in package.json** ❌ → ✅
**File:** `package.json`

**Problem:** Hardcoded incorrect Python path.

**Fix:** Use virtual environment properly:
```json
"backend": "cd backend && source venv/bin/activate && python run.py"
```

---

## How to Run

### Option 1: Run Both Servers (Recommended)
```bash
cd /home/ayyan/project/Data-Analysis-App
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Testing Authentication

### 1. Open your browser to: http://localhost:5173

### 2. Login with demo credentials:
- **Email:** `demo@example.com`
- **Password:** `demo123`

### 3. You should be redirected to the Dashboard

### 4. Verify in browser DevTools:
- Open Network tab
- Login request should show a `Set-Cookie` header with `session=...`
- Subsequent requests should automatically include the session cookie

---

## Google OAuth Setup (Optional)

Google OAuth requires additional configuration:

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"

### 2. Create OAuth Credentials
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Set authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
3. Copy the Client ID and Client Secret

### 3. Update Backend `.env`
```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 4. Restart Backend
```bash
cd backend
source venv/bin/activate
python run.py
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Logout (clears session) |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/auth/google` | Start Google OAuth flow |

### Test with curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  -c cookies.txt

# Get current user
curl http://localhost:5000/api/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

---

## Troubleshooting

### Login fails with "Network Error"
- Check both backend and frontend are running
- Verify backend is on port 5000, frontend on 5173

### "Invalid email or password"
- Demo credentials: `demo@example.com` / `demo123`
- Or register a new account

### Cookies not being set
- Clear browser cookies for localhost
- Check browser console for CORS errors
- Ensure `withCredentials: true` in API config

### Session not persisting
- Verify Vite proxy is configured correctly
- Check Network tab for `Set-Cookie` header in login response

---

## Files Changed

1. `frontend/src/utils/api.js` - Fixed API base URL and removed token logic
2. `frontend/src/context/AuthContext.jsx` - Removed localStorage, uses sessions, fixed API paths
3. `frontend/src/pages/Login.jsx` - Fixed Google OAuth fetch URL, improved error messages
4. `frontend/src/pages/Dashboard.jsx` - Fixed API paths (removed `/api` prefix)
5. `frontend/src/pages/DataEntries.jsx` - Fixed API paths (removed `/api` prefix)
6. `frontend/src/pages/Categories.jsx` - Fixed API paths (removed `/api` prefix)
7. `frontend/vite.config.js` - Enhanced proxy configuration for cookies
8. `backend/app/__init__.py` - Improved CORS configuration
9. `package.json` - Fixed Python path for backend script

---

## Next Steps

1. ✅ Email/Password authentication is working
2. ⚠️ Google OAuth needs credentials configured (see setup above)
3. 📊 Test the dashboard and data features
4. 🚀 Deploy when ready

---

**Status:** ✅ Email/Password authentication is now fully functional!

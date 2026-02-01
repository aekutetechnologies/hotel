# Deployment Notes

## Error: CSS MIME type 'text/html'

If you see in the browser console:

```
Refused to apply style from 'https://hsquareliving.com/_next/static/css/....css' because its MIME type ('text/html') is not a supported stylesheet MIME type
```

**Cause:** The server is returning an HTML page (e.g. 404 or `index.html`) for requests to `/_next/static/css/*.css` instead of the actual CSS file. Browsers then reject it because HTML is not valid CSS.

**Fix:** Ensure `/_next/static/*` is served as real static files from your build output, not through an SPA fallback.

### Option 1: Run Next.js in Node (recommended)

Use the built-in server so it serves static files correctly:

```bash
cd frontend
npm run build
npm run start
```

Then put a reverse proxy (nginx, Caddy, etc.) in front that **proxies** to this Node process. Do **not** serve the app by pointing nginx at a static `index.html` for all routes.

### Option 2: Nginx in front of Next.js

If Next.js runs on e.g. port 3000, proxy to it and let Next.js serve `_next`:

```nginx
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Do **not** use a single `try_files $uri /index.html` for the whole site; that makes every request (including `/_next/static/css/...`) return HTML.

### Option 3: Static export (e.g. `out/`)

If you use `next export` or `output: 'export'`:

1. Upload the entire `out/` (or `build/`) directory, including `_next/`.
2. Configure the host so that `/_next/static/*` is served as **static files** from that directory, with correct MIME types (e.g. `.css` → `text/css`).  
   Do **not** configure a catch-all that serves `index.html` for `/_next/static/...`.

### Option 4: Rebuild and redeploy

The hash in the filename (e.g. `0c6c2d7ab3b8605f.css`) changes every build. If the server has an old deploy, the new HTML may reference a CSS file that doesn’t exist on the server; the server then returns 404 (as HTML). Fix by deploying the **full new build** so that the new `_next/static/` files (with new hashes) are present.

---

**Summary:** The app expects `/_next/static/*` to be real static files. Ensure your server or reverse proxy serves them from the Next.js build output (or proxies to `next start`) and does not return HTML for those paths.

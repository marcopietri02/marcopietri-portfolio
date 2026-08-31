# Repository Architecture & Guidelines

## Stack & Environment
- **Hosting & Edge:** Cloudflare Pages (Static Site Deployment via GitHub Integration)
- **Domain:** Configured via Cloudflare DNS with universal SSL/TLS.
- **Languages:** HTML5, Vanilla JavaScript, CSS3 (or relevant frontend stack).
- **Version Control:** Git workflow with automatic CI/CD deployment on push to the `main` branch.

## Project Structure & Routing
- Pure static folder-based routing:
  - `/` -> Root homepage (`index.html`)
  - `/project-name/` -> Subpage for individual projects (`project-name/index.html`)
- Assets (CSS, JS, images) are mapped relative to the root or sub-directories.

## Development Rules for AI Agents
1. **Security First:** Never hardcode API keys, tokens, personal identification data, or private communication links into the codebase. Use environment variables or configuration placeholders where applicable.
2. **Semantic Cleanliness:** Write clean, modular, and accessible HTML/CSS/JS without unnecessary heavy frameworks unless explicitly required by the user.
3. **SEO & Performance:** Keep markup semantically structured (proper use of H1, H2, meta tags) to ensure high performance and optimal crawler indexing.
4. **Build Integrity:** Ensure all paths and links remain relative or correctly absolute to prevent broken routing upon deployment.
5. **Cache-Busting Integrity:** Whenever modifying CSS (`style.css`) or JS (`main.js`), increment the cache-busting query parameter (`?v=X.X`) across all HTML files (`/assets/css/style.css?v=...`, `/assets/js/main.js?v=...`) and ensure `_headers` enforces short stale-while-revalidate caching so users and crawlers receive fresh visual styles immediately.
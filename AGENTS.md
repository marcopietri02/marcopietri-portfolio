# Repository Architecture & Guidelines for Humans and AI Agents

## Stack & Environment
- **Hosting & Edge:** Cloudflare Pages (Static Site Deployment via GitHub Integration)
- **Domain:** Configured via Cloudflare DNS with universal SSL/TLS.
- **Languages:** HTML5 Semantico, Vanilla JavaScript (ES6+), CSS3 puro (Bespoke Editorial Design System).
- **Version Control:** Git workflow with automatic CI/CD deployment on push to the `main` branch.
- **Current Baseline Version:** `v8.2.0` (Data: `2026-09-13`)

## Project Structure & Routing
- Pure static folder-based routing:
  - `/` -> Root homepage (`index.html`)
  - `/cass/` -> Subpage for CASS case study (`cass/index.html`)
  - `/eklisso/` -> Subpage for Eklisso platform (`eklisso/index.html`)
  - `/spectra/` -> Subpage for Spectra Vision 360° showcase (`spectra/index.html`)
  - `/certificazioni/` -> Subpage for credentials & CV (`certificazioni/index.html`)
- Assets (CSS, JS, images, videos) are mapped relative to the root or sub-directories.

---

## 📌 Standard di Versionamento Semantico (VX.Y.Z) e Commit Git

Tutti gli sviluppatori umani e gli agenti AI devono aderire alla convenzione di versionamento e formato commit:

### 1. Architettura dei Versionamenti (Allineati vs Disaccoppiati):
- **Sincronizzati ad ogni commit (`vX.Y.Z`):**
  1. Badge visibile nel footer HTML (`<span class="footer-version-tag">vX.Y.Z</span>`).
  2. Query string di cache-busting per gli asset (`style.css?v=X.Y.Z`, `main.js?v=X.Y.Z`).
  3. Badge nella Command Palette in `main.js` (`vX.Y.Z`).
  4. Specifiche per Crawler AI in `llms.txt` (`Specification Version: X.Y.Z | Last Modified: YYYY-MM-DD`).
  5. Schema.org JSON-LD nelle pagine HTML (`"version": "X.Y.Z"`, `"dateModified": "YYYY-MM-DD"`).
  6. Timestamp di aggiornamento sitemap in `sitemap.xml` (`<lastmod>YYYY-MM-DD</lastmod>`).
- **Disaccoppiati (Autonomi):**
  1. Librerie terze (es. `pannellum.js?v=3.2`).
  2. Singoli paper scientifici e progetti autonomi (es. DOI Zenodo CASS, HW/FW miPAGO).
  3. Standard W3C (`<?xml version="1.0"?>`).

### 2. Legenda Versionamento (X.Y.Z):
- **`X` (MAJOR):** Modifiche architetturali profonde, riscrittura del Design System o breaking changes.
- **`Y` (MINOR):** Nuove funzionalità, nuove pagine o sezioni complete in modo retrocompatibile.
- **`Z` (PATCH):** Bug fix, correzione refusi, ottimizzazioni CSS/JS, modifiche metadati o aggiustamenti grafici minori.

### 3. Formato dei Messaggi di Commit:
```text
VX.Y.Z | [Titolo sintetico in italiano di ciò che è cambiato]

[Spiegazione dettagliata e minuziosa in italiano di ciò che è stato modificato, dei file impattati e delle motivazioni tecniche]
```

### 4. Regole di Buona Programmazione per Agenti AI e Umani:
1. **Security First:** Non inserire mai API key, token, dati personali sensibili o link di comunicazione privata.
2. **Semantic & Vanilla Cleanliness:** Scrivere HTML5 semantico, CSS3 puro e Vanilla JS ad alte prestazioni (60 FPS) senza framework pesanti non richiesti.
3. **SEO & AI Entity Integrity:** Mantenere aggiornati i dati strutturati Schema.org JSON-LD, i file `llms.txt`, `sitemap.xml` e `robots.txt`.
4. **Cache-Busting & Footer Badge Integrity:** Ad ogni commit/incremento di versione `VX.Y.Z`, aggiornare all'unisono tutti gli elementi sincronizzati.
5. **Supporto Bilingue Dichiarativo:** Qualsiasi testo aggiunto nell'interfaccia deve avere `data-i18n="chiave"` con traduzione italiana ed inglese registrata in `I18N_DICTIONARY` (`main.js`).
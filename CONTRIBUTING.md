# 📘 Linee Guida di Sviluppo, Standard di Codice e Convenzioni di Commit

Questo documento definisce l'architettura dei versionamenti, gli standard architetturali, le regole di buona programmazione e la convenzione obbligatoria per i messaggi di commit del repository del portfolio di **Marco Pietri**. Il codice è manutenuto ed esteso in modalità collaborativa da **sviluppatori umani** e **agenti AI**.

Versione di riferimento corrente della build sincronizzata: **`v8.1.0`** (Data: `2026-09-13`).

---

## 1. Architettura dei Versionamenti: Allineati vs Disaccoppiati

Nel repository coesistono elementi che **devono essere rigorosamente sincronizzati ad ogni rilascio** ed elementi che **devono rimanere indipendenti** per ragioni architetturali o di terze parti.

### 🟢 Versionamenti Sincronizzati & Allineati (`vX.Y.Z`):
Questi componenti condividono all'unisono lo stesso numero di versione semantico e la stessa data:

1. **Badge UI nel Footer:**  
   `<span class="footer-version-tag" title="Versione Corrente Build"><span class="footer-version-dot"></span>vX.Y.Z</span>` presente in fondo a tutti i file HTML (`index.html`, `cass/index.html`, `eklisso/index.html`, `spectra/index.html`, `certificazioni/index.html`).
2. **Parametri di Cache-Busting degli Asset Core:**  
   I tag di caricamento delle risorse globali:
   - `<link rel="stylesheet" href="/assets/css/style.css?v=X.Y.Z">`
   - `<script src="/assets/js/main.js?v=X.Y.Z"></script>`
3. **Command Palette / Quick Terminal:**  
   L'indicatore di build presente nella barra di stato della Command Palette in `assets/js/main.js`:  
   `<span>Marco Pietri CLI vX.Y.Z</span>`
4. **Specifiche per Modelli AI / LLM (`llms.txt`):**  
   L'intestazione per i crawler AI (GPTBot, ClaudeBot, PerplexityBot):  
   `> **Specification Version:** X.Y.Z | **Last Modified:** YYYY-MM-DD`
5. **Dati Strutturati Schema.org (JSON-LD):**  
   I blocchi semantici `@graph` nelle pagine HTML con le proprietà `"version": "X.Y.Z"` e `"dateModified": "YYYY-MM-DD"`.
6. **Sitemap dei Motori di Ricerca (`sitemap.xml`):**  
   Il tag `<lastmod>YYYY-MM-DD</lastmod>` per ciascun URL indicizzato.

---

### 🔴 Versionamenti Disaccoppiati (Autonomi):
Questi componenti NON devono essere sincronizzati con la versione del portfolio:

1. **Librerie di Terze Parti:**  
   Es. `pannellum.js?v=3.2` (identifica la release open source del visualizzatore 360° Pannellum).
2. **Versioni dei Singoli Progetti Scientifici / Moduli Software:**  
   Es. Il paper scientifico **CASS** ha un identificativo DOI Zenodo dedicato (`DOI: 10.5281/zenodo.18593717`) e una versione algoritmica propria; **miPAGO** ha release firmware e architetture token NFC indipendenti.
3. **Standard Internazionali W3C:**  
   Es. `<?xml version="1.0" encoding="UTF-8"?>` in `sitemap.xml`.

---

## 2. Convenzione Semantica di Versionamento (VX.Y.Z)

Ogni commit o rilascio deve valutare l'impatto delle modifiche apportate e incrementare il contatore **VX.Y.Z** secondo la legenda:

### 📖 Legenda del Versionamento:
- **`X` (MAJOR):**
  - Incrementare quando vengono introdotte modifiche strutturali profonde o breaking changes.
  - *Esempi:* riscrittura completa del Design System CSS, migrazione globale del layout, cambio radicale della navigazione.
- **`Y` (MINOR):**
  - Incrementare quando vengono aggiunte nuove funzionalità, pagine o sezioni complete in modo retrocompatibile.
  - *Esempi:* aggiunta della Command Palette (`Cmd+K`), introduzione del supporto bilingue IT/EN, sincronizzazione crawler AI, nuova sottopagina di progetto (es. `/mipago/`).
- **`Z` (PATCH):**
  - Incrementare per correzioni di bug, fix di refusi testuali, micro-ottimizzazioni CSS/JS, modifiche a metadati SEO o ritocchi grafici puntuali.

---

## 3. Formato Obbligatorio dei Messaggi di Commit Git

Tutti i commit nel repository Git devono seguire rigorosamente la seguente struttura in **lingua italiana**:

```text
VX.Y.Z | [Titolo sintetico in italiano di ciò che è cambiato]

[Spiegazione dettagliata e minuziosa in italiano di ciò che è stato modificato, dei file impattati e delle motivazioni tecniche]
```

### 💡 Esempi di Commit Conformi:

#### Esempio Patch (Fix o ritocco minore):
```text
V8.1.1 | Correzione traduzioni bilingue e padding mobile della Command Palette

- Risolto il mancato switch in lingua inglese di alcune etichette nella Command Palette.
- Aggiustato il padding verticale su viewport inferiori a 640px in style.css.
- Incrementati i token di cache-busting nei file HTML.
```

#### Esempio Minor (Nuova funzionalità o allineamento):
```text
V8.1.0 | Allineamento sistemico dei versionamenti verso crawler AI e motore di ricerca

- Sincronizzati i metadati di versione e data di modifica in llms.txt, sitemap.xml e Schema.org JSON-LD.
- Aggiornati all'unisono i footer version badge e i token di cache-busting di tutti i file HTML.
- Allineata la stringa di versione della Command Palette CLI in main.js.
```

#### Esempio Major (Riprogettazione strutturale):
```text
V9.0.0 | Riprogettazione completa del Design System editoriale e transizioni WebGL

- Riscritto l'intero sistema di variabili CSS per un'estetica obsidian con accenti violetti.
- Aggiornata la pipeline di rendering dei canvas a 60 FPS con supporto View Transitions nativo.
```

---

## 4. Regole di Buona Programmazione (per Umani & Agenti AI)

1. **Zero Framework Inutili (Pure Vanilla Stack):**
   - Utilizzare solo HTML5 semantico, CSS3 moderno e Vanilla JavaScript ES6+.
   - Evitare librerie o framework pesanti (React, Vue, Tailwind, Bootstrap) a meno che non sia esplicitamente concordato.
2. **Accessibilità & Interattività Fluida (60 FPS):**
   - Garantire navigabilità da tastiera (`Tab`, `Enter`, `Escape`, `Arrow keys`), contrasti cromatici conformi a WCAG AA e layout responsive da mobile (320px) a desktop ultra-wide.
   - Utilizzare `requestAnimationFrame` e listener passivi per le animazioni al canvas e allo scroll.
3. **Supporto Bilingue Dichiarativo:**
   - Qualsiasi nuovo testo introdotto nell'interfaccia deve avere un corrispondente attributo `data-i18n="chiave"` e le traduzioni valorizzate sia in `it` che in `en` dentro `I18N_DICTIONARY` in `main.js`.
4. **Sicurezza e Privacy First:**
   - Non inserire mai API key, token segreti, dati personali non pubblici o link di comunicazioni private nel codice sorgente.
5. **SEO, LLM Crawlers & Semantic Web Readiness:**
   - Mantenere sempre allineati i dati strutturati Schema.org JSON-LD (`version`, `dateModified`), i file `llms.txt`, `sitemap.xml` (`lastmod`) e i metatag OpenGraph/Twitter Card su ogni pagina.

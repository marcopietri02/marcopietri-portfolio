/**
 * Marco Pietri — Native Vanilla JS Engine
 * Scrollytelling Layered Deck, Timeline Laser Tracker & Ambient Interactions
 * 60 FPS · Zero External Dependencies · Accessible
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Drawer Toggle
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      navToggle.textContent = isExpanded ? '✕ Chiudi' : '☰ Menu';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰ Menu';
      }
    });

    // Close menu on link click
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰ Menu';
      });
    });
  }

  // 2. FAQ Accordion Handling
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        // Close other items in same group
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('open');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('open', !isOpen);
        questionBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    }
  });

  // 3. Scroll-Driven Reveal Animations (Elements & Sections)
  const revealElements = document.querySelectorAll('.scroll-reveal, .partner-card, .testimonial-card, .competence-item, .stat-kpi-card');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // 3.1 Dynamic Metrics & Progress Bar Viewport Animation Engine
  function initDynamicMetrics() {
    const progressBars = document.querySelectorAll('.telemetry-graph-fill, [data-progress-bar]');
    const counterElements = document.querySelectorAll('.stat-kpi-value, .telemetry-value, [data-counter]');

    // 1. Initialize Progress Bars at 0 width and remember target
    progressBars.forEach((bar) => {
      const inlineWidth = bar.style.width || bar.getAttribute('data-target-width') || '100%';
      bar.dataset.targetWidth = inlineWidth;
      bar.style.width = '0%';
    });

    // Helper: Parse numerical formats for smooth counting
    function parseNumberTarget(text) {
      const raw = text.trim();
      let prefix = '';
      let suffix = '';
      let numStr = raw;

      // Extract optional prefix (e.g. + or $)
      const pMatch = numStr.match(/^[^\d\-\+]+/);
      if (pMatch) {
        prefix = pMatch[0];
        numStr = numStr.slice(prefix.length);
      }

      // Extract optional suffix (e.g. %, +, k+, k, M, M+)
      const sMatch = numStr.match(/([^\d\.,]+)$/);
      if (sMatch) {
        suffix = sMatch[0];
        numStr = numStr.slice(0, -suffix.length);
      }

      // Check if remainder is a pure single numeric value
      let isThousandDot = false;
      let isCommaDecimal = false;
      let isDotDecimal = false;
      let decimals = 0;
      let targetNum = 0;

      if (/^\d{1,3}(\.\d{3})+$/.test(numStr)) {
        isThousandDot = true;
        targetNum = parseInt(numStr.replace(/\./g, ''), 10);
      } else if (/^\d+,\d+$/.test(numStr)) {
        isCommaDecimal = true;
        decimals = numStr.split(',')[1].length;
        targetNum = parseFloat(numStr.replace(',', '.'));
      } else if (/^\d+\.\d+$/.test(numStr)) {
        isDotDecimal = true;
        decimals = numStr.split('.')[1].length;
        targetNum = parseFloat(numStr);
      } else if (/^\d+$/.test(numStr)) {
        targetNum = parseInt(numStr, 10);
      } else {
        return null; // Not a single numeric counter (e.g. sentences or multi-token strings)
      }

      return {
        prefix,
        suffix,
        targetNum,
        format: (val) => {
          if (isThousandDot) {
            return prefix + Math.round(val).toLocaleString('it-IT') + suffix;
          } else if (isCommaDecimal) {
            return prefix + val.toFixed(decimals).replace('.', ',') + suffix;
          } else if (isDotDecimal) {
            return prefix + val.toFixed(decimals) + suffix;
          } else {
            return prefix + Math.round(val).toString() + suffix;
          }
        }
      };
    }

    // Helper: Smooth counter animation with cubic-bezier easing
    function animateCounter(el) {
      if (el.dataset.counterAnimated === 'true') return;
      const originalText = el.textContent.trim();
      const parsed = parseNumberTarget(originalText);
      if (!parsed) return;

      el.dataset.counterAnimated = 'true';
      const duration = 1500;
      const startTime = performance.now();

      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = parsed.targetNum * ease;

        el.textContent = parsed.format(currentVal);

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = originalText;
        }
      }

      requestAnimationFrame(frame);
    }

    // Helper: Animate Progress Bar Fill
    function animateProgressBar(bar) {
      if (bar.dataset.barAnimated === 'true') return;
      bar.dataset.barAnimated = 'true';
      const targetWidth = bar.dataset.targetWidth || '100%';
      requestAnimationFrame(() => {
        bar.style.width = targetWidth;
      });
    }

    if ('IntersectionObserver' in window) {
      const metricContainers = document.querySelectorAll(
        '.deck-card, .deck-telemetry-board, .stat-kpi-card, .stat-kpi-grid'
      );

      const metricObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target;

            // Trigger progress bars inside
            const bars = container.querySelectorAll('.telemetry-graph-fill, [data-progress-bar]');
            bars.forEach((bar) => animateProgressBar(bar));

            // Trigger counters inside
            const counters = container.querySelectorAll('.stat-kpi-value, .telemetry-value, [data-counter]');
            counters.forEach((cnt) => animateCounter(cnt));

            // If the element itself is a target
            if (container.classList.contains('telemetry-graph-fill')) animateProgressBar(container);
            if (container.classList.contains('stat-kpi-value') || container.classList.contains('telemetry-value')) animateCounter(container);

            observer.unobserve(container);
          }
        });
      }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      });

      metricContainers.forEach((c) => metricObserver.observe(c));

      // Observe isolated counters or bars
      counterElements.forEach((el) => {
        if (!el.closest('.deck-card') && !el.closest('.deck-telemetry-board') && !el.closest('.stat-kpi-card') && !el.closest('.stat-kpi-grid')) {
          metricObserver.observe(el);
        }
      });
      progressBars.forEach((bar) => {
        if (!bar.closest('.deck-card') && !bar.closest('.deck-telemetry-board')) {
          metricObserver.observe(bar);
        }
      });
    } else {
      // Fallback
      progressBars.forEach((bar) => {
        bar.style.width = bar.dataset.targetWidth || '100%';
      });
    }
  }

  initDynamicMetrics();

  // 4. Interactive Scrollytelling: Layered Deck Stacking Engine
  const deckCards = document.querySelectorAll('.deck-card');
  const projectDeck = document.getElementById('project-deck');

  function updateDeckStacking() {
    if (!projectDeck || deckCards.length === 0 || window.innerWidth <= 920) return;

    deckCards.forEach((card, idx) => {
      const nextCard = deckCards[idx + 1];
      if (nextCard) {
        const nextRect = nextCard.getBoundingClientRect();
        const triggerPoint = window.innerHeight * 0.45;

        if (nextRect.top < triggerPoint) {
          // Calculate how far the next card has overlapped
          const progress = Math.min(1, Math.max(0, (triggerPoint - nextRect.top) / 300));
          const scale = 1 - progress * 0.05;
          const brightness = 1 - progress * 0.25;
          card.style.transform = `scale(${scale})`;
          card.style.filter = `brightness(${brightness})`;
        } else {
          card.style.transform = 'scale(1)';
          card.style.filter = 'brightness(1)';
        }
      }
    });
  }

  // 5. Interactive Timeline Laser Tracker
  const timelineLaser = document.getElementById('timeline-laser');
  const timelineList = document.getElementById('timeline-list');
  const timelineEntries = document.querySelectorAll('.timeline-entry');

  function updateTimelineLaser() {
    if (!timelineLaser || !timelineList) return;

    const listRect = timelineList.getBoundingClientRect();
    const windowH = window.innerHeight;
    const triggerY = windowH * 0.72; // Trigger threshold

    if (listRect.top > triggerY) {
      // User is above the timeline
      timelineLaser.style.height = '0%';
      timelineEntries.forEach((entry) => entry.classList.remove('active-node'));
    } else {
      // Timeline is active or passed
      const totalH = listRect.height || 1;
      const scrolled = triggerY - listRect.top;
      const progressPercent = Math.min(100, Math.max(0, (scrolled / totalH) * 100));
      timelineLaser.style.height = `${progressPercent}%`;

      // Highlight active timeline nodes
      timelineEntries.forEach((entry) => {
        const entryRect = entry.getBoundingClientRect();
        if (entryRect.top <= triggerY + 20) {
          entry.classList.add('active-node');
        } else {
          entry.classList.remove('active-node');
        }
      });
    }
  }

  // RequestAnimationFrame Scroll Loop for Silky 60fps Performance
  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateDeckStacking();
        updateTimelineLaser();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateDeckStacking();
    updateTimelineLaser();
  });

  // Initial calculation
  setTimeout(() => {
    updateDeckStacking();
    updateTimelineLaser();
  }, 100);

  // 7. Global Geometric Network Engine (Desktop Proximity Satellites + Scroll Parallax Dynamics)
  const globalCanvas = document.getElementById('global-geometric-canvas');

  if (globalCanvas) {
    const ctx = globalCanvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;
    let bgPoints = [];
    let mouse = { x: -1000, y: -1000, active: false };
    let animationFrameId = null;

    // Scroll-driven Parallax Momentum
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let scrollVelocityY = 0;

    let interactiveElements = [];
    let closestRect = null;
    let targetProximity = 0; // 0.0 (violet) -> 1.0 (emerald green)
    let currentProximity = 0;

    // Geometric Satellites Engine (Desktop Mouse Orbit)
    const BASE_SATELLITE_DEFS = [
      { type: 'triangle', size: 9, orbitR: 28, speed: 0.045, phase: 0 },
      { type: 'diamond', size: 8, orbitR: 36, speed: -0.038, phase: 1.05 },
      { type: 'hexagon', size: 9, orbitR: 42, speed: 0.032, phase: 2.1 },
      { type: 'crosshair', size: 10, orbitR: 30, speed: -0.042, phase: 3.14 },
      { type: 'circle', size: 5, orbitR: 46, speed: 0.028, phase: 4.2 },
      { type: 'square', size: 8, orbitR: 34, speed: -0.035, phase: 5.25 }
    ];

    // 2 Distinct Golden Vector Figures active in Gold Edition
    const GOLD_SATELLITE_DEFS = [
      { type: 'gold-octahedron', size: 11, orbitR: 52, speed: 0.026, phase: 0.85, isGold: true },
      { type: 'gold-star', size: 10, orbitR: 58, speed: -0.024, phase: 3.75, isGold: true }
    ];

    // Golden Constellation Points & Vector Polygons (Easter Egg)
    let goldPoints = [];
    let isGoldUnlocked = false;
    let satellites = [];

    function updateSatellitesList() {
      const defs = isGoldUnlocked 
        ? [...BASE_SATELLITE_DEFS, ...GOLD_SATELLITE_DEFS]
        : BASE_SATELLITE_DEFS;

      satellites = defs.map((def, idx) => {
        const existing = satellites[idx];
        return {
          ...def,
          x: existing ? existing.x : mouse.active ? mouse.x : width / 2,
          y: existing ? existing.y : mouse.active ? mouse.y : height / 2,
          targetX: existing ? existing.targetX : width / 2,
          targetY: existing ? existing.targetY : height / 2,
          currentAngle: existing ? existing.currentAngle : def.phase,
          colorR: def.isGold ? 251 : 167,
          colorG: def.isGold ? 191 : 139,
          colorB: def.isGold ? 36 : 250
        };
      });
    }

    updateSatellitesList();

    function initGoldConstellation() {
      goldPoints = [];
      const count = window.innerWidth <= 768 ? 8 : 14;
      const shapes = ['gold-triangle', 'gold-diamond', 'gold-ring', 'gold-star'];
      for (let i = 0; i < count; i++) {
        goldPoints.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2 + 1.8,
          shape: shapes[i % shapes.length],
          size: Math.random() * 6 + 7,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.025,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    window.toggleGoldEasterEgg = function(forceState) {
      if (typeof forceState === 'boolean') {
        isGoldUnlocked = forceState;
      } else {
        isGoldUnlocked = true; // Always activate on click
      }

      updateSatellitesList();

      if (isGoldUnlocked) {
        initGoldConstellation();
        document.querySelectorAll('.footer-version-tag').forEach(el => el.classList.add('is-gold-unlocked'));
        if (typeof window.showGoldInspectorModal === 'function') {
          window.showGoldInspectorModal();
        }
      } else {
        goldPoints = [];
        document.querySelectorAll('.footer-version-tag').forEach(el => el.classList.remove('is-gold-unlocked'));
      }
    };

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      globalCanvas.width = width * dpr;
      globalCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initBackground() {
      bgPoints = [];
      const isMobile = window.innerWidth <= 768;
      const count = isMobile ? 22 : 36;

      for (let i = 0; i < count; i++) {
        bgPoints.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 1.2,
          basePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function updateInteractiveElements() {
      interactiveElements = Array.from(
        document.querySelectorAll(
          'a, button, [role="button"], input, textarea, .card, .deck-card, .partner-card, .team-card, .social-link, .btn, .cross-nav-card, .media-cat-card, .pano-item-card, .filter-chip'
        )
      );
    }

    function distToRect(px, py, r) {
      const dx = Math.max(r.left - px, 0, px - r.right);
      const dy = Math.max(r.top - py, 0, py - r.bottom);
      return Math.hypot(dx, dy);
    }

    // Proximity Detection for Desktop (Cursor Driven)
    function checkDesktopProximity() {
      if (!mouse.active || mouse.x < 0 || mouse.y < 0) {
        targetProximity = 0;
        closestRect = null;
        return;
      }

      let minDist = Infinity;
      let bestRect = null;
      const attractionRadius = 240;

      for (let i = 0; i < interactiveElements.length; i++) {
        const el = interactiveElements[i];
        const r = el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > height + 40 || r.right < -40 || r.left > width + 40) continue;
        if (r.width === 0 || r.height === 0) continue;

        const d = distToRect(mouse.x, mouse.y, r);
        if (d < minDist) {
          minDist = d;
          bestRect = r;
        }
      }

      if (minDist < attractionRadius && bestRect) {
        closestRect = bestRect;
        const rawProx = 1 - (minDist / attractionRadius);
        targetProximity = Math.pow(rawProx, 1.35);
      } else {
        targetProximity = 0;
        closestRect = null;
      }
    }

    let time = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      time += 0.012;

      const isMobile = window.innerWidth <= 768;
      const maxDist = isMobile ? 125 : 160;

      // Dampen scroll momentum velocity smoothly
      scrollVelocityY *= 0.92;
      if (Math.abs(scrollVelocityY) < 0.001) scrollVelocityY = 0;

      // =========================================================================
      // 1. Global Viewport Intersecting Background Mesh (with Scroll Parallax Flow)
      // =========================================================================
      for (let i = 0; i < bgPoints.length; i++) {
        const p = bgPoints[i];
        p.x += p.vx + Math.sin(time + p.basePhase) * 0.15;
        // Scroll parallax: scrolling down moves nodes upwards, scrolling up moves nodes downwards
        p.y += p.vy + Math.cos(time + p.basePhase) * 0.15 - scrollVelocityY * 0.45;

        // Infinite Cyclic Toroidal Wrapping
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        if (!isMobile && mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const force = (130 - dist) / 130;
            p.x -= (dx / dist) * force * 0.8;
            p.y -= (dy / dist) * force * 0.8;
          }
        }
      }

      // Draw connecting lines and triangulations
      for (let i = 0; i < bgPoints.length; i++) {
        for (let j = i + 1; j < bgPoints.length; j++) {
          const p1 = bgPoints[i];
          const p2 = bgPoints[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();

            for (let k = j + 1; k < bgPoints.length; k++) {
              const p3 = bgPoints[k];
              const d2 = Math.hypot(p3.x - p1.x, p3.y - p1.y);
              const d3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
              if (d2 < maxDist * 0.85 && d3 < maxDist * 0.85) {
                const polyAlpha = Math.min(alpha, (1 - d2 / maxDist) * 0.04);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.closePath();
                ctx.fillStyle = `rgba(99, 102, 241, ${polyAlpha})`;
                ctx.fill();
              }
            }
          }
        }

        const p = bgPoints[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.75)';
        ctx.fill();
      }

      // =========================================================================
      // 1.5. Golden Constellation Geometric Mesh (Easter Egg)
      // =========================================================================
      if (isGoldUnlocked && goldPoints.length > 0) {
        const goldMaxDist = isMobile ? 135 : 175;
        
        for (let i = 0; i < goldPoints.length; i++) {
          const gp = goldPoints[i];
          gp.x += gp.vx + Math.sin(time + gp.phase) * 0.18;
          gp.y += gp.vy + Math.cos(time + gp.phase) * 0.18 - scrollVelocityY * 0.45;
          gp.rot += gp.rotSpeed;

          if (gp.x < -30) gp.x = width + 30;
          if (gp.x > width + 30) gp.x = -30;
          if (gp.y < -30) gp.y = height + 30;
          if (gp.y > height + 30) gp.y = -30;
        }

        // Gold-to-gold connecting lines
        for (let i = 0; i < goldPoints.length; i++) {
          const gp1 = goldPoints[i];
          for (let j = i + 1; j < goldPoints.length; j++) {
            const gp2 = goldPoints[j];
            const dist = Math.hypot(gp2.x - gp1.x, gp2.y - gp1.y);

            if (dist < goldMaxDist) {
              const alpha = (1 - dist / goldMaxDist) * 0.42;
              ctx.beginPath();
              ctx.moveTo(gp1.x, gp1.y);
              ctx.lineTo(gp2.x, gp2.y);
              ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
              ctx.lineWidth = 0.85;
              ctx.stroke();

              // Gold micro-triangles
              for (let k = j + 1; k < goldPoints.length; k++) {
                const gp3 = goldPoints[k];
                const d2 = Math.hypot(gp3.x - gp1.x, gp3.y - gp1.y);
                const d3 = Math.hypot(gp3.x - gp2.x, gp3.y - gp2.y);
                if (d2 < goldMaxDist * 0.85 && d3 < goldMaxDist * 0.85) {
                  const polyAlpha = Math.min(alpha, (1 - d2 / goldMaxDist) * 0.07);
                  ctx.beginPath();
                  ctx.moveTo(gp1.x, gp1.y);
                  ctx.lineTo(gp2.x, gp2.y);
                  ctx.lineTo(gp3.x, gp3.y);
                  ctx.closePath();
                  ctx.fillStyle = `rgba(251, 191, 36, ${polyAlpha})`;
                  ctx.fill();
                }
              }
            }
          }

          // Draw vector gold shapes
          ctx.save();
          ctx.translate(gp1.x, gp1.y);
          ctx.rotate(gp1.rot);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
          ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
          ctx.lineWidth = 1.2;
          const gs = gp1.size;

          ctx.beginPath();
          if (gp1.shape === 'gold-triangle') {
            ctx.moveTo(0, -gs);
            ctx.lineTo(gs * 0.86, gs * 0.5);
            ctx.lineTo(-gs * 0.86, gs * 0.5);
          } else if (gp1.shape === 'gold-diamond') {
            ctx.moveTo(0, -gs);
            ctx.lineTo(gs * 0.7, 0);
            ctx.lineTo(0, gs);
            ctx.lineTo(-gs * 0.7, 0);
          } else if (gp1.shape === 'gold-ring') {
            ctx.arc(0, 0, gs * 0.5, 0, Math.PI * 2);
          } else {
            // Gold star / cross
            ctx.moveTo(-gs * 0.6, 0);
            ctx.lineTo(gs * 0.6, 0);
            ctx.moveTo(0, -gs * 0.6);
            ctx.lineTo(0, gs * 0.6);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Gold center glowing dot
          ctx.beginPath();
          ctx.arc(0, 0, gp1.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }

      // =========================================================================
      // 2. Cursor Satellites (Desktop Only - Proximity Magnetic Snap)
      // =========================================================================
      if (!isMobile && mouse.active) {
        checkDesktopProximity();
        currentProximity += (targetProximity - currentProximity) * 0.14;

        satellites.forEach((sat, idx) => {
          sat.currentAngle += sat.speed;

          const freeTargetX = mouse.x + Math.cos(sat.currentAngle) * sat.orbitR;
          const freeTargetY = mouse.y + Math.sin(sat.currentAngle) * sat.orbitR;

          if (closestRect && currentProximity > 0.01) {
            const pad = 4;
            const r = closestRect;
            const corners = [
              { x: r.left - pad, y: r.top - pad },
              { x: r.right + pad, y: r.top - pad },
              { x: r.right + pad, y: r.bottom + pad },
              { x: r.left - pad, y: r.bottom + pad },
              { x: r.left + r.width * 0.5, y: r.top - pad },
              { x: r.left + r.width * 0.5, y: r.bottom + pad }
            ];
            const lockedTarget = corners[idx % corners.length];

            sat.targetX = freeTargetX + (lockedTarget.x - freeTargetX) * currentProximity;
            sat.targetY = freeTargetY + (lockedTarget.y - freeTargetY) * currentProximity;
          } else {
            sat.targetX = freeTargetX;
            sat.targetY = freeTargetY;
          }

          sat.x += (sat.targetX - sat.x) * 0.18;
          sat.y += (sat.targetY - sat.y) * 0.18;

          if (sat.isGold) {
            sat.colorR = 251;
            sat.colorG = 191;
            sat.colorB = 36;
          } else {
            sat.colorR = Math.round(167 + (52 - 167) * currentProximity);
            sat.colorG = Math.round(139 + (211 - 139) * currentProximity);
            sat.colorB = Math.round(250 + (153 - 250) * currentProximity);
          }
        });

        // Laser Reticle Frame around acquired target
        if (currentProximity > 0.25 && closestRect) {
          ctx.save();
          const r = closestRect;
          const pad = 4;
          const alpha = (currentProximity - 0.25) / 0.75;
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.55})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.strokeRect(r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2);
          ctx.restore();
        }

        // Tether lines on desktop free space
        if (currentProximity < 0.8) {
          const tetherAlpha = (1 - currentProximity) * 0.22;
          satellites.forEach((sat) => {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(sat.x, sat.y);
            if (sat.isGold) {
              ctx.strokeStyle = `rgba(251, 191, 36, ${tetherAlpha * 1.6})`;
              ctx.lineWidth = 0.75;
            } else {
              ctx.strokeStyle = `rgba(${Math.round(sat.colorR)}, ${Math.round(sat.colorG)}, ${Math.round(sat.colorB)}, ${tetherAlpha})`;
              ctx.lineWidth = 0.5;
            }
            ctx.stroke();
          });
        }

        // Draw Satellites
        satellites.forEach((sat, idx) => {
          ctx.save();
          ctx.translate(sat.x, sat.y);
          ctx.rotate(time * (idx % 2 === 0 ? 1 : -1) + idx);

          const rCol = Math.round(sat.colorR);
          const gCol = Math.round(sat.colorG);
          const bCol = Math.round(sat.colorB);

          if (sat.isGold) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.95)';
            ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
            ctx.lineWidth = 1.4;
            ctx.shadowColor = 'rgba(251, 191, 36, 0.85)';
            ctx.shadowBlur = 10;
          } else {
            ctx.strokeStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
            ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, 0.22)`;
            ctx.lineWidth = 1.3;

            if (currentProximity > 0.15) {
              ctx.shadowColor = `rgba(16, 185, 129, ${currentProximity * 0.9})`;
              ctx.shadowBlur = 12 * currentProximity;
            }
          }

          const s = sat.size;
          ctx.beginPath();

          if (sat.type === 'gold-octahedron') {
            // Faceted Golden Octahedron / Diamond
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.75, 0);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.75, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Inner facet lines
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(0, s);
            ctx.moveTo(-s * 0.75, 0);
            ctx.lineTo(s * 0.75, 0);
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          } else if (sat.type === 'gold-star') {
            // 8-Point Vector Golden Star
            const inner = s * 0.42;
            const outer = s;
            for (let sp = 0; sp < 8; sp++) {
              const a = (sp / 8) * Math.PI * 2;
              const rad = sp % 2 === 0 ? outer : inner;
              const px = Math.cos(a) * rad;
              const py = Math.sin(a) * rad;
              if (sp === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (sat.type === 'triangle') {
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.86, s * 0.5);
            ctx.lineTo(-s * 0.86, s * 0.5);
          } else if (sat.type === 'diamond') {
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.7, 0);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.7, 0);
          } else if (sat.type === 'hexagon') {
            for (let h = 0; h < 6; h++) {
              const hAngle = (h / 6) * Math.PI * 2;
              const hx = Math.cos(hAngle) * s * 0.75;
              const hy = Math.sin(hAngle) * s * 0.75;
              if (h === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
          } else if (sat.type === 'crosshair') {
            ctx.moveTo(-s * 0.7, 0);
            ctx.lineTo(s * 0.7, 0);
            ctx.moveTo(0, -s * 0.7);
            ctx.lineTo(0, s * 0.7);
          } else if (sat.type === 'circle') {
            ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
          } else if (sat.type === 'square') {
            ctx.rect(-s * 0.5, -s * 0.5, s, s);
          }

          if (sat.type !== 'gold-octahedron' && sat.type !== 'gold-star') {
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    // Event Listeners: Mouse (Desktop)
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
      targetProximity = 0;
      closestRect = null;
    });

    // Event Listeners: Scroll Velocity Parallax Tracker (Mobile & Desktop)
    window.addEventListener('scroll', () => {
      const curScrollY = window.scrollY || window.pageYOffset || 0;
      const delta = curScrollY - lastScrollY;
      lastScrollY = curScrollY;

      // Clamp delta to prevent sudden jump on fast touch flicks
      scrollVelocityY = Math.max(-40, Math.min(40, delta));

      const isDesktop = window.innerWidth > 768;
      if (isDesktop && mouse.active) {
        checkDesktopProximity();
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      resize();
      initBackground();
      updateInteractiveElements();
    });

    resize();
    initBackground();
    updateInteractiveElements();
    animationFrameId = requestAnimationFrame(draw);
  }

  // =========================================================================
  // 6. Complete Bilingual I18n Engine (IT / EN) & View Transitions Integration
  // =========================================================================
  const I18N_DICTIONARY = {
    it: {
      // Header & Nav
      nav_home: "Home",
      nav_projects: "Progetti",
      nav_certifications: "Certificazioni",
      nav_contact: "Contatti",
      nav_case_studies: "Casi Studio",
      cmd_k_hint: "Cerca o Comandi",
      
      // Hero Section
      hero_eyebrow: "IT Strategy · AI Automations · Intelligent Systems",
      hero_subtitle: "IT Strategist & AI Automation Engineer",
      hero_lead: "Progetto architetture software, automazioni avanzate e sistemi intelligenti basati su intelligenza artificiale per efficientare processi complessi. Focalizzato su affidabilità computazionale, sicurezza strutturale e impatto strategico misurabile.",
      hero_btn_projects: "Vedi i Progetti",
      hero_btn_cert: "Certificazioni & CV",
      hero_btn_contact: "Contattami",
      
      // Section 01: About & Method
      sec_01_tag: "01 / Percorso & Visione",
      sec_01_title: "Metodo & Esperienza",
      sec_01_desc: "Unisco rigore ingegneristico e visione strategica. Coordino lo sviluppo di sistemi intelligenti e automazioni, con un approccio pragmatico: architetture manutenibili, processi scalabili e sicurezza strutturale.",
      sec_01_spec_title: "Aree di Specializzazione",
      sec_01_spec_desc: "Traduco la complessità analitica in strumenti software immediati e resilienti. Quando non sono davanti a un terminale a ottimizzare un flusso, mi trovi a pilotare droni in operazioni tecniche autorizzate o a sperimentare su nuovi paradigmi algoritmici.",
      
      comp_1_title: "Machine Learning & Explainable AI",
      comp_1_desc: "Sistemi ibridi di selezione contestuale algoritmi (CASS), data analysis e classificazione.",
      comp_2_title: "Fintech Architecture & Automations",
      comp_2_desc: "Riconciliazione contabile, ottimizzazione flussi transazionali e integrazioni software.",
      comp_3_title: "Cybersecurity & Threat Defense",
      comp_3_desc: "Sicurezza applicativa, conformità GDPR, analisi delle vulnerabilità e protezione dei dati.",
      comp_4_title: "Operazioni UAS & Rilievi Aerei (ENAC / EASA)",
      comp_4_desc: "Pilota attestato Open A1-A3 per ispezioni tecniche, perizie fotogrammetriche e riprese DJI 4K.",
      
      timeline_title: "Esperienza Professionale",
      timeline_exp_present: "Presente",
      timeline_role_mipago: "R&D & IT Strategist",
      timeline_desc_mipago: "Strategia tecnologica, R&D fintech, automazione dei processi di riconciliazione contabile e sicurezza.",
      timeline_role_franchi: "Docente Esperto",
      timeline_desc_franchi: "Formazione avanzata su programmazione, architetture digitali e innovazione software.",
      timeline_role_cass: "AI Researcher & Developer",
      timeline_desc_cass: "Progettazione dell'architettura decisionale ibrida CASS e validazione su dataset industriali critici.",
      timeline_role_eklisso: "Founder",
      timeline_desc_eklisso: "Piattaforma community di annunci, supporto e connessione locale con moderazione automatica.",
      timeline_role_mw: "Sales & Tech Support",
      timeline_desc_mw: "Consulenza tecnica, diagnostica hardware/software e supporto specialistico.",

      // Section 02: Projects
      sec_02_tag: "02 / Progetti Selezionati",
      sec_02_title: "Progetti & Ricerca",
      sec_02_desc: "Casi studio e sistemi sviluppati per risolvere esigenze concrete: dal machine learning per decisioni industriali alle piattaforme comunitarie, fino alle riprese aeree professionali.",
      
      proj_cass_sub: "Contextual-aware Selection System (Tesi UniFI)",
      proj_cass_body: "Architettura ibrida ispirata ai modelli cognitivi umani (Sistema 1 vs Sistema 2). Seleziona dinamicamente il modello ottimale in tempo reale per garantire affidabilità, trasparenza e spiegabilità algoritmica su processi critici ad alto rischio.",
      proj_cass_btn: "Esplora Caso Studio & Architettura",
      
      proj_eklisso_sub: "La rete locale a portata di click",
      proj_eklisso_body: "Piattaforma e bacheca digitale concepita per connettere persone, studenti e realtà territoriali in tempo reale. Combina flussi di automazione social, moderazione automatizzata e massima tutela della privacy conforme al GDPR.",
      proj_eklisso_btn: "Scopri la Piattaforma Eklisso",
      
      proj_spectra_sub: "Riprese aeree e ispezioni tecniche con droni DJI",
      proj_spectra_body: "Operazioni aeree professionali per ispezioni tecniche di tetti e impianti fotovoltaici, perizie assicurative post-evento meteo, rilievi territoriali e storytelling multimediale in 4K con conformità ENAC/EASA.",
      proj_spectra_btn: "Entra nello Showcase 360°",

      // Telemetry Labels
      tel_cog_paradigm: "Paradigma Cognitivo",
      tel_val_sistema12: "Sistema 1 + Sistema 2",
      tel_val_dataset: "Dataset Validazione",
      tel_interpretability: "Interpretabilità",
      tel_val_spiegabile: "Nativamente Spiegabile",
      tel_comp_efficiency: "Efficienza Computazionale",
      tel_total_views: "Visualizzazioni Totali",
      tel_privacy: "Tutela Privacy",
      tel_feed_mod: "Moderazione Feed",
      tel_resp_rate: "Tasso di Risposta Community",
      tel_uas_license: "Licenza Aeronautica",
      tel_sensor_res: "Risoluzione Sensore",
      tel_viewer_360: "Viewer 360°",
      tel_viewer_360_val: "Visuale Aerea Interattiva",
      tel_safety_comp: "Sicurezza & Conformità Normativa",

      // Section 03: Partners
      sec_03_tag: "03 / Ecosistema & Partner",
      sec_03_title: "Aziende & Collaborazioni",
      sec_03_desc: "Organizzazioni, istituti e realtà con cui collaboro nello sviluppo tecnologico, strategico e di ricerca.",
      partner_mipago_role: "Fintech · R&D & IT Strategy",
      partner_mipago_desc: "Sviluppo di architetture di pagamento digitale, sicurezza dei flussi transazionali e automazione dei processi di riconciliazione contabile.",
      partner_mipago_link: "Sito ufficiale",
      partner_pnrr_role: "PNRR · Scuola 4.0 & Competenze Digitali",
      partner_pnrr_desc: "Laboratori innovativi e percorsi didattici per la transizione digitale promossi dal Ministero dell'Istruzione e del Merito.",
      partner_pnrr_link: "Portale PNRR",
      partner_franchi_role: "Education · Docenza Informatica",
      partner_franchi_desc: "Attività di docenza specialistica su linguaggi di programmazione, architetture web e metodologie di sviluppo software.",
      partner_franchi_link: "Sito Franchi",
      partner_eklisso_role: "Venture · Community Platform",
      partner_eklisso_desc: "Iniziativa digitale per il supporto territoriale, moderazione automatizzata e gestione sicura delle comunicazioni locali.",
      partner_eklisso_link: "Scheda Progetto",
      partner_mw_role: "Tech Support · Consulenza Sistemi",
      partner_mw_desc: "Supporto tecnico sistemistico, consulenza hardware e diagnostica rapida per privati e professionisti.",
      partner_mw_link: "Sito MediaWorld",
      partner_bip_role: "Cybersecurity · Talent Week",
      partner_bip_desc: "Simulazioni pratiche di threat analysis, strategie difensive perimetrali e sicurezza dei sistemi enterprise.",
      partner_bip_link: "Sito BIP Group",
      partner_unifi_role: "Formazione Accademica · Laurea in Informatica",
      partner_unifi_desc: "Percorso triennale in scienze informatiche con focus su algoritmi, machine learning e sistemi distribuiti.",
      partner_unifi_link: "Portale UniFI",

      // Section 04: Testimonials
      sec_04_tag: "04 / Referenze & Feedback",
      sec_04_title: "Cosa Dicono di Me",
      sec_04_desc: "Testimonianze dirette di colleghi e collaboratori sulle modalità di lavoro, precisione e approccio ai problemi.",
      test_1_quote: "Preciso, metodico, puntuale, paziente, dedito e riflessivo. Queste sono le parole che descrivono meglio Marco nella sfera professionale. Sono molto contenta di poter collaborare con lui all'interno del team miPAGO.",
      test_1_role: "Copywriter & PR · miPAGO",
      test_2_quote: "Marco è giovane, scattante e orientato all’obiettivo. Una volta ricevuto un input entra subito in azione con precisione e grande senso pratico. Ha una mente analitica che lo porta dritto al punto, senza trascurare i dettagli critici.",
      test_2_role: "Content Strategist · miPAGO",
      test_3_quote: "Marco è brillante, affidabile e curioso, con un mix di creatività e rigore analitico. Unisce competenze tecniche solide a una visione sempre orientata all’innovazione. È un team player che cura la qualità e i dettagli con grande etica.",
      test_3_role: "Community Moderator · Eklisso",
      test_4_quote: "Lavorare con Marco significa mettere ordine al caos. Il suo approccio è chirurgico: riflette quanto basta per non sbagliare la direzione e agisce con rapidità. Ottimizza il flusso di lavoro di tutto il team con soluzioni durature.",
      test_4_role: "Marketing & Operations · miPAGO",

      // Contact & Footer
      contact_title: "Vuoi discutere un progetto o una consulenza?",
      contact_desc: "Disponibile per collaborazioni software, implementazioni di Machine Learning, ottimizzazione processi e missioni autorizzate con droni.",
      contact_btn_email: "Scrivi via Email",
      contact_btn_copy: "Copia Email",
      contact_copied: "Email Copiata!",
      footer_copy: "© 2026 Marco Pietri • Firenze, Italia",
      footer_sub: "IT Strategy, AI Automations & Software Architecture",
      
      // Generic & Subpages
      breadcrumb_home: "Home",
      breadcrumb_cert: "Certificazioni",
      breadcrumb_cass: "CASS",
      breadcrumb_eklisso: "Eklisso",
      breadcrumb_spectra: "Spectra Vision",
      btn_back_home: "Torna alla Home",
      btn_view_cert: "Visualizza Attestato Ufficiale",
      btn_download_cv: "Scarica CV Completo (PDF)",
      cmd_placeholder: "Cerca progetti, sezioni o digita un comando (es: 'whoami', 'stack', 'cv')..."
    },
    en: {
      // Header & Nav
      nav_home: "Home",
      nav_projects: "Projects",
      nav_certifications: "Certifications",
      nav_contact: "Contact",
      nav_case_studies: "Case Studies",
      cmd_k_hint: "Search or Commands",
      
      // Hero Section
      hero_eyebrow: "IT Strategy · AI Automations · Intelligent Systems",
      hero_subtitle: "IT Strategist & AI Automation Engineer",
      hero_lead: "I design scalable software architectures, advanced automations, and intelligent AI-driven systems to optimize complex business processes. Focused on computational reliability, structural cybersecurity, and measurable strategic ROI.",
      hero_btn_projects: "View Projects",
      hero_btn_cert: "Certifications & CV",
      hero_btn_contact: "Get in Touch",
      
      // Section 01: About & Method
      sec_01_tag: "01 / Background & Vision",
      sec_01_title: "Method & Experience",
      sec_01_desc: "Combining engineering rigor with strategic advisory. I direct the development of intelligent systems and enterprise automations with a pragmatic mindset: maintainable architectures, scalable workflows, and defense-in-depth security.",
      sec_01_spec_title: "Core Specializations",
      sec_01_spec_desc: "Translating complex analytical challenges into immediate, resilient software tools. When I'm not optimizing automation pipelines at the terminal, I operate authorized UAS drone missions or research hybrid algorithmic paradigms.",
      
      comp_1_title: "Machine Learning & Explainable AI",
      comp_1_desc: "Hybrid contextual algorithm selection systems (CASS), data analysis, and predictive classification.",
      comp_2_title: "Fintech Architecture & Automations",
      comp_2_desc: "Automated payment reconciliation, transactional workflow optimization, and resilient API integrations.",
      comp_3_title: "Cybersecurity & Threat Defense",
      comp_3_desc: "Application security, GDPR compliance, vulnerability assessments, and enterprise data hardening.",
      comp_4_title: "UAS Drone Operations (ENAC / EASA)",
      comp_4_desc: "Certified Open A1-A3 pilot for technical inspections, photogrammetric surveys, and 4K DJI aerial storytelling.",
      
      timeline_title: "Professional Experience",
      timeline_exp_present: "Present",
      timeline_role_mipago: "R&D & IT Strategist",
      timeline_desc_mipago: "Technology strategy, fintech R&D, automated payment reconciliation pipelines, and system security.",
      timeline_role_franchi: "Expert Lecturer",
      timeline_desc_franchi: "Advanced training in software programming, modern web architectures, and digital innovation.",
      timeline_role_cass: "AI Researcher & Developer",
      timeline_desc_cass: "Architected the CASS hybrid cognitive decision framework and validated it on critical industrial datasets.",
      timeline_role_eklisso: "Founder",
      timeline_desc_eklisso: "Local bulletin board and community platform in Florence with real-time automated moderation.",
      timeline_role_mw: "Sales & Tech Support",
      timeline_desc_mw: "Technical advisory, hardware/software system diagnostics, and specialized customer consulting.",

      // Section 02: Projects
      sec_02_tag: "02 / Featured Projects",
      sec_02_title: "Projects & Research",
      sec_02_desc: "Engineered case studies and systems addressing concrete challenges: from industrial machine learning to community hubs and professional aerial operations.",
      
      proj_cass_sub: "Contextual-aware Selection System (UniFI Thesis)",
      proj_cass_body: "Hybrid architecture inspired by human dual-process cognitive models (System 1 vs System 2). Dynamically selects optimal algorithms in real-time to ensure computational efficiency, transparency, and explainable AI in high-risk environments.",
      proj_cass_btn: "Explore Case Study & Architecture",
      
      proj_eklisso_sub: "Local community network at your fingertips",
      proj_eklisso_body: "Digital community platform designed to connect residents, students, and local businesses in Florence. Combines automated social pipelines, intelligent moderation, and strict GDPR privacy safeguards.",
      proj_eklisso_btn: "Discover Eklisso Platform",
      
      proj_spectra_sub: "Aerial operations and technical inspections with DJI drones",
      proj_spectra_body: "Professional UAS aerial operations for structural roof/solar inspections, post-weather insurance surveys, territorial mapping, and 4K storytelling fully compliant with ENAC/EASA standards.",
      proj_spectra_btn: "Enter 360° Interactive Showcase",

      // Telemetry Labels
      tel_cog_paradigm: "Cognitive Paradigm",
      tel_val_sistema12: "System 1 + System 2",
      tel_val_dataset: "Validation Dataset",
      tel_interpretability: "Interpretability",
      tel_val_spiegabile: "Natively Explainable",
      tel_comp_efficiency: "Computational Efficiency",
      tel_total_views: "Total Views",
      tel_privacy: "Privacy Protection",
      tel_feed_mod: "Feed Moderation",
      tel_resp_rate: "Community Response Rate",
      tel_uas_license: "Aviation License",
      tel_sensor_res: "Sensor Resolution",
      tel_viewer_360: "360° Viewer",
      tel_viewer_360_val: "Interactive Aerial View",
      tel_safety_comp: "Safety & Regulatory Compliance",

      // Section 03: Partners
      sec_03_tag: "03 / Ecosystem & Partners",
      sec_03_title: "Companies & Collaborations",
      sec_03_desc: "Organizations, educational institutions, and ventures I collaborate with across technology, strategy, and R&D.",
      partner_mipago_role: "Fintech · R&D & IT Strategy",
      partner_mipago_desc: "Digital payment architectures, transactional security, and automated accounting reconciliation pipelines.",
      partner_mipago_link: "Official Website",
      partner_pnrr_role: "PNRR · School 4.0 & Digital Skills",
      partner_pnrr_desc: "Innovative laboratories and educational programs for digital transition sponsored by the Ministry of Education.",
      partner_pnrr_link: "PNRR Portal",
      partner_franchi_role: "Education · Computer Science Lecturer",
      partner_franchi_desc: "Advanced lecturing on programming languages, modern web systems, and software engineering methodologies.",
      partner_franchi_link: "Franchi Website",
      partner_eklisso_role: "Venture · Community Platform",
      partner_eklisso_desc: "Digital initiative for local community networking, real-time automated moderation, and secure communication.",
      partner_eklisso_link: "Case Study",
      partner_mw_role: "Tech Support · Systems Advisory",
      partner_mw_desc: "System technical support, hardware consulting, and rapid diagnostic solutions for professionals.",
      partner_mw_link: "MediaWorld Site",
      partner_bip_role: "Cybersecurity · Talent Week",
      partner_bip_desc: "Practical hands-on threat modeling, defensive perimeter strategies, and enterprise systems security.",
      partner_bip_link: "BIP Group Site",
      partner_unifi_role: "Academic Education · B.Sc. Computer Science",
      partner_unifi_desc: "Three-year degree in computer science focusing on algorithms, machine learning, and distributed architectures.",
      partner_unifi_link: "UniFI Portal",

      // Section 04: Testimonials
      sec_04_tag: "04 / References & Feedback",
      sec_04_title: "What People Say",
      sec_04_desc: "Direct feedback from colleagues and team members on methodology, work ethic, and problem-solving precision.",
      test_1_quote: "Precise, methodical, punctual, patient, dedicated, and thoughtful. These are the words that best describe Marco professionally. I am very glad to collaborate with him within the miPAGO team.",
      test_1_role: "Copywriter & PR · miPAGO",
      test_2_quote: "Marco is young, swift, and highly goal-oriented. As soon as he receives an input, he jumps into action with practical precision. He has an analytical mind that cuts straight to the core without missing critical details.",
      test_2_role: "Content Strategist · miPAGO",
      test_3_quote: "Marco is brilliant, reliable, and curious, blending creative innovation with analytical rigor. He brings solid technical foundations alongside forward-looking vision. A true team player with great ethics.",
      test_3_role: "Community Moderator · Eklisso",
      test_4_quote: "Working with Marco brings instant order to chaos. His approach is surgical: deliberate enough to never miss the mark, yet extremely fast to execute. He elevates the entire team's workflow.",
      test_4_role: "Marketing & Operations · miPAGO",

      // Contact & Footer
      contact_title: "Ready to discuss a project or advisory role?",
      contact_desc: "Available for custom software architectures, Machine Learning implementations, business process automation, and certified drone missions.",
      contact_btn_email: "Send an Email",
      contact_btn_copy: "Copy Email",
      contact_copied: "Email Copied!",
      footer_copy: "© 2026 Marco Pietri • Florence, Italy",
      footer_sub: "IT Strategy, AI Automations & Software Architecture",
      
      // Generic & Subpages
      breadcrumb_home: "Home",
      breadcrumb_cert: "Certifications",
      breadcrumb_cass: "CASS",
      breadcrumb_eklisso: "Eklisso",
      breadcrumb_spectra: "Spectra Vision",
      btn_back_home: "Back to Home",
      btn_view_cert: "View Official Credential",
      btn_download_cv: "Download Full CV (PDF)",
      cmd_placeholder: "Search projects, sections or type a command (e.g. 'whoami', 'stack', 'cv')..."
    }
  };

  let currentLang = localStorage.getItem('mp_lang') || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'it');

  function applyLanguage(lang, animate = true) {
    currentLang = lang;
    localStorage.setItem('mp_lang', lang);
    document.documentElement.lang = lang;

    const updateDOM = () => {
      const dict = I18N_DICTIONARY[lang] || I18N_DICTIONARY.it;
      
      // 1. Update elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          el.innerHTML = dict[key];
        }
      });

      // 2. Update placeholders with data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
          el.setAttribute('placeholder', dict[key]);
        }
      });

      // 3. Update active state on language toggle buttons
      document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
        const itOpt = btn.querySelector('[data-lang-val="it"]');
        const enOpt = btn.querySelector('[data-lang-val="en"]');
        if (itOpt && enOpt) {
          itOpt.classList.toggle('is-active', lang === 'it');
          enOpt.classList.toggle('is-active', lang === 'en');
        }
      });

      // 4. Update command palette if initialized
      if (typeof window.updateCommandPaletteLanguage === 'function') {
        window.updateCommandPaletteLanguage(lang);
      }
    };

    if (animate && document.startViewTransition) {
      document.startViewTransition(updateDOM);
    } else {
      updateDOM();
    }
  }

  function initI18n() {
    // Attach listener to any language toggle buttons
    document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetLang = currentLang === 'it' ? 'en' : 'it';
        applyLanguage(targetLang, true);
      });
    });

    // Apply language on initial load without transition
    applyLanguage(currentLang, false);
  }

  // =========================================================================
  // 7. Command Palette & Quick Terminal HUD Engine (Cmd+K / Ctrl+K)
  // =========================================================================
  function initCommandPalette() {
    // 1. Create Modal Markup if not present
    let backdrop = document.getElementById('cmd-palette-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'cmd-palette-backdrop';
      backdrop.className = 'cmd-palette-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      const isEn = currentLang === 'en';
      backdrop.innerHTML = `
        <div class="cmd-palette-modal" role="dialog" aria-modal="true" aria-label="Command Palette">
          <div class="cmd-palette-header">
            <svg class="cmd-palette-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              class="cmd-palette-input" 
              id="cmd-palette-input" 
              placeholder="${isEn ? "Search projects, sections or type a command (e.g. 'whoami', 'stack', 'cv')..." : "Cerca progetti, sezioni o digita un comando (es: 'whoami', 'stack', 'cv')..."}" 
              autocomplete="off" 
              spellcheck="false"
            />
            <span class="cmd-mode-badge" id="cmd-mode-badge">${isEn ? 'NAV &amp; SEARCH' : 'NAV &amp; COMANDI'}</span>
          </div>
          <div class="cmd-palette-body" id="cmd-palette-body">
            <!-- Dynamic Items or Terminal View -->
          </div>
          <div class="cmd-palette-footer">
            <div class="cmd-shortcuts-legend">
              ${isEn 
                ? `<span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span> <span><kbd>↵</kbd> Select</span> <span><kbd>ESC</kbd> Close</span>` 
                : `<span><kbd>↑</kbd><kbd>↓</kbd> Naviga</span> <span><kbd>↵</kbd> Seleziona</span> <span><kbd>ESC</kbd> Chiudi</span>`
              }
            </div>
            <div>
              <span>v8.2.2</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    const input = document.getElementById('cmd-palette-input');
    const body = document.getElementById('cmd-palette-body');
    const badge = document.getElementById('cmd-mode-badge');
    let selectedIndex = 0;
    let currentItems = [];
    let isTerminalMode = false;

    const getSearchCatalog = (lang) => {
      if (lang === 'en') {
        return [
          // Navigation (EN)
          { type: 'nav', title: 'Home', subtitle: 'Return to top', href: '/', icon: '🏠', tags: 'home top start intro' },
          { type: 'nav', title: 'Projects & Research', subtitle: 'Featured Projects Section', href: '/#projects', icon: '📂', tags: 'projects research portfolio thesis work' },
          { type: 'nav', title: 'CASS — Contextual-aware Selection System', subtitle: 'Machine Learning & Explainable AI', href: '/cass/', icon: '🧠', tags: 'cass ml machine learning thesis unifi python kahneman' },
          { type: 'nav', title: 'Eklisso Community Platform', subtitle: 'Digital Community & Local Hub', href: '/eklisso/', icon: '🌐', tags: 'eklisso social platform florence community bulletin' },
          { type: 'nav', title: 'Spectra Vision — 4K Aerial Operations', subtitle: 'UAS Drone Surveys & 360° Showcase', href: '/spectra/', icon: '🚁', tags: 'spectra drones uas dji 4k 360 aerial surveys inspections photogrammetry' },
          { type: 'nav', title: 'Certifications & CV', subtitle: 'B.Sc. CS, Google Gemini, BIP, ENAC', href: '/certificazioni/', icon: '📜', tags: 'certifications cv credentials google gemini bip enac unifi degree' },
          { type: 'nav', title: 'Companies & Collaborations', subtitle: 'Partners, miPAGO, UniFI, Franchi', href: '/#partners', icon: '🤝', tags: 'partners companies mipago franchi mediaworld unifi pnrr' },
          { type: 'nav', title: 'What People Say', subtitle: 'Colleagues Testimonials & References', href: '/#testimonials', icon: '💬', tags: 'testimonials feedback references colleagues' },
          { type: 'nav', title: 'Contact', subtitle: 'Email & Advisory Availability', href: '/#contact', icon: '✉️', tags: 'contact email message advisory' },
          
          // Direct Actions (EN)
          { type: 'action', title: 'Copy Email Address', subtitle: 'mpietri82@gmail.com', action: 'copy_email', icon: '📋', tags: 'copy email mail write' },
          { type: 'action', title: 'Download Curriculum Vitae (PDF)', subtitle: 'Official Google Drive PDF', action: 'open_cv', icon: '📄', tags: 'cv curriculum pdf download resume' },
          { type: 'action', title: 'Switch Language (IT / EN)', subtitle: 'Toggle Italian / English', action: 'toggle_lang', icon: '🌍', tags: 'language lingua english italiano it en' },
          { type: 'action', title: 'Open GitHub Profile', subtitle: 'github.com/marcopietri02', action: 'open_github', icon: '💻', tags: 'github git repo code source' },
          { type: 'action', title: 'Open LinkedIn Profile', subtitle: 'linkedin.com/in/marco-pietri', action: 'open_linkedin', icon: '💼', tags: 'linkedin network career profile' },
          { type: 'action', title: 'CASS Scientific Paper on Zenodo', subtitle: 'DOI: 10.5281/zenodo.18593717', action: 'open_zenodo', icon: '🔬', tags: 'paper zenodo research thesis publication' }
        ];
      }

      return [
        // Navigation (IT)
        { type: 'nav', title: 'Home', subtitle: 'Torna all\'inizio', href: '/', icon: '🏠', tags: 'home inizio top' },
        { type: 'nav', title: 'Progetti & Ricerca', subtitle: 'Sezione Progetti', href: '/#projects', icon: '📂', tags: 'progetti research portfolio tesi' },
        { type: 'nav', title: 'CASS — Contextual-aware Selection System', subtitle: 'Machine Learning & Spiegabilità', href: '/cass/', icon: '🧠', tags: 'cass ml machine learning tesi unifi python kahneman' },
        { type: 'nav', title: 'Eklisso Community Platform', subtitle: 'Piattaforma & Bacheca Digitale', href: '/eklisso/', icon: '🌐', tags: 'eklisso social platform bacheca firenze community' },
        { type: 'nav', title: 'Spectra Vision — Riprese Aeree 4K', subtitle: 'Operazioni Droni & Showcase 360°', href: '/spectra/', icon: '🚁', tags: 'spectra droni uas dji 4k 360 riprese ispezioni fotogrammetria' },
        { type: 'nav', title: 'Certificazioni & CV', subtitle: 'Laurea, Google Gemini, BIP, ENAC', href: '/certificazioni/', icon: '📜', tags: 'certificazioni cv attestati google gemini bip enac unifi laurea' },
        { type: 'nav', title: 'Aziende & Collaborazioni', subtitle: 'Partner, miPAGO, UniFI, Franchi', href: '/#partners', icon: '🤝', tags: 'partner aziende mipago franchi mediaworld unifi pnrr' },
        { type: 'nav', title: 'Cosa Dicono di Me', subtitle: 'Testimonianze & Referenze', href: '/#testimonials', icon: '💬', tags: 'testimonianze feedback referenze colleghi' },
        { type: 'nav', title: 'Contatti', subtitle: 'Email e disponibilità', href: '/#contact', icon: '✉️', tags: 'contatti email telefono messaggio' },
        
        // Direct Actions (IT)
        { type: 'action', title: 'Copia Indirizzo Email', subtitle: 'mpietri82@gmail.com', action: 'copy_email', icon: '📋', tags: 'copia email mail write' },
        { type: 'action', title: 'Scarica Curriculum Vitae (PDF)', subtitle: 'Google Drive PDF Ufficiale', action: 'open_cv', icon: '📄', tags: 'cv curriculum pdf download resume' },
        { type: 'action', title: 'Cambia Lingua / Switch Language (IT / EN)', subtitle: 'Toggle Italiano / English', action: 'toggle_lang', icon: '🌍', tags: 'lingua language english italiano it en' },
        { type: 'action', title: 'Apri Profilo GitHub', subtitle: 'github.com/marcopietri02', action: 'open_github', icon: '💻', tags: 'github git repo code codice' },
        { type: 'action', title: 'Apri Profilo LinkedIn', subtitle: 'linkedin.com/in/marco-pietri', action: 'open_linkedin', icon: '💼', tags: 'linkedin lavoro network social' },
        { type: 'action', title: 'Paper Scientifico CASS su Zenodo', subtitle: 'DOI: 10.5281/zenodo.18593717', action: 'open_zenodo', icon: '🔬', tags: 'paper zenodo ricerca tesi tesi' }
      ];
    };

    const cliCommands = {
      help: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-cmd">Available CLI Commands:</span></div>
            <div class="term-line">  <span class="term-highlight">whoami</span>       - Profile bio of Marco Pietri</div>
            <div class="term-line">  <span class="term-highlight">stack</span>        - Engineering tech stack & architectures</div>
            <div class="term-line">  <span class="term-highlight">projects</span>     - List of featured projects</div>
            <div class="term-line">  <span class="term-highlight">cass</span>         - Details on CASS thesis & paper</div>
            <div class="term-line">  <span class="term-highlight">eklisso</span>       - Details on Eklisso platform</div>
            <div class="term-line">  <span class="term-highlight">spectra</span>       - Details on Spectra UAS operations</div>
            <div class="term-line">  <span class="term-highlight">cert</span>         - Overview of official credentials</div>
            <div class="term-line">  <span class="term-highlight">contact</span>      - Contact channels</div>
            <div class="term-line">  <span class="term-highlight">cv</span>           - Open Official CV PDF</div>
            <div class="term-line">  <span class="term-highlight">lang &lt;it|en&gt;</span>  - Switch site language</div>
            <div class="term-line">  <span class="term-highlight">date</span>         - Current local date and time in Florence</div>
            <div class="term-line">  <span class="term-highlight">clear</span>        - Clear terminal output</div>
            <div class="term-line">  <span class="term-highlight">exit</span>         - Close Command Palette</div>
          `;
        }
        return `
          <div class="term-line"><span class="term-cmd">Comandi Disponibili / Available Commands:</span></div>
          <div class="term-line">  <span class="term-highlight">whoami</span>       - Profilo e bio di Marco Pietri</div>
          <div class="term-line">  <span class="term-highlight">stack</span>        - Stack tecnologico e architetture</div>
          <div class="term-line">  <span class="term-highlight">projects</span>     - Lista progetti principali</div>
          <div class="term-line">  <span class="term-highlight">cass</span>         - Dettagli tesi e paper CASS</div>
          <div class="term-line">  <span class="term-highlight">eklisso</span>       - Dettagli piattaforma Eklisso</div>
          <div class="term-line">  <span class="term-highlight">spectra</span>       - Dettagli operazioni droni Spectra</div>
          <div class="term-line">  <span class="term-highlight">cert</span>         - Panoramica certificazioni e titoli</div>
          <div class="term-line">  <span class="term-highlight">contact</span>      - Informazioni di contatto</div>
          <div class="term-line">  <span class="term-highlight">cv</span>           - Apri Curriculum Vitae PDF</div>
          <div class="term-line">  <span class="term-highlight">lang &lt;it|en&gt;</span>  - Cambia lingua del sito</div>
          <div class="term-line">  <span class="term-highlight">date</span>         - Data e ora locale a Firenze</div>
          <div class="term-line">  <span class="term-highlight">clear</span>        - Pulisce il terminale</div>
          <div class="term-line">  <span class="term-highlight">exit</span>         - Chiude la Command Palette</div>
        `;
      },
      whoami: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-success">Marco Pietri</span> — IT Strategist &amp; AI Automation Engineer</div>
            <div class="term-line">Specialized in autonomous AI agent architectures, fintech reconciliation pipelines (miPAGO),</div>
            <div class="term-line">hybrid cognitive decision systems (CASS, UniFI), and UAS drone operations (ENAC Open A1-A3).</div>
            <div class="term-line"><span class="term-dim">📍 Florence, Tuscany, Italy</span></div>
          `;
        }
        return `
          <div class="term-line"><span class="term-success">Marco Pietri</span> — IT Strategist &amp; AI Automation Engineer</div>
          <div class="term-line">Specializzato in architetture ad agenti AI, riconciliazione contabile fintech (miPAGO),</div>
          <div class="term-line">sistemi ibridi decisionali (CASS, UniFI) e operazioni tecniche con droni (ENAC Open A1-A3).</div>
          <div class="term-line"><span class="term-dim">📍 Firenze, Toscana, Italia</span></div>
        `;
      },
      stack: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-cmd">⚡ Tech Stack &amp; Architectures:</span></div>
            <div class="term-line">  • <span class="term-highlight">AI &amp; ML:</span> Python, Scikit-Learn, LangGraph, RAG, Ollama, Vector DBs</div>
            <div class="term-line">  • <span class="term-highlight">Fintech &amp; HW:</span> NFC Passive Tokenization, EMVCo specs, POS APIs</div>
            <div class="term-line">  • <span class="term-highlight">Frontend &amp; Edge:</span> Vanilla Modern JS, CSS3 Design Systems, Cloudflare Pages</div>
            <div class="term-line">  • <span class="term-highlight">Aviation:</span> DJI 4K HDR, ENAC/EASA Open A1-A3, Photogrammetry</div>
          `;
        }
        return `
          <div class="term-line"><span class="term-cmd">⚡ Tech Stack &amp; Architetture:</span></div>
          <div class="term-line">  • <span class="term-highlight">AI &amp; ML:</span> Python, Scikit-Learn, LangGraph, RAG, Ollama, Vector DBs</div>
          <div class="term-line">  • <span class="term-highlight">Fintech &amp; HW:</span> NFC Passive Tokenization, EMVCo specs, POS APIs</div>
          <div class="term-line">  • <span class="term-highlight">Frontend &amp; Edge:</span> Vanilla Modern JS, CSS3 Design Systems, Cloudflare Pages</div>
          <div class="term-line">  • <span class="term-highlight">Aviation:</span> DJI 4K HDR, ENAC/EASA Open A1-A3, Fotogrammetria</div>
        `;
      },
      projects: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-cmd">📁 Featured Projects:</span></div>
            <div class="term-line">  1. <a href="/cass/" style="color:#a78bfa; text-decoration:underline;">CASS</a> - Contextual-aware Selection System (Thesis &amp; Paper)</div>
            <div class="term-line">  2. <a href="/eklisso/" style="color:#a78bfa; text-decoration:underline;">Eklisso</a> - Digital Community &amp; Local Bulletin (750k+ views)</div>
            <div class="term-line">  3. <a href="/spectra/" style="color:#a78bfa; text-decoration:underline;">Spectra Vision</a> - UAS Technical Inspections &amp; 360° Aerial Viewer</div>
            <div class="term-line">  4. <a href="https://mipago.it/" target="_blank" style="color:#a78bfa; text-decoration:underline;">miPAGO</a> - Contactless NFC Tokenization &amp; Reconciliation</div>
          `;
        }
        return `
          <div class="term-line"><span class="term-cmd">📁 Progetti Principali:</span></div>
          <div class="term-line">  1. <a href="/cass/" style="color:#a78bfa; text-decoration:underline;">CASS</a> - Contextual-aware Selection System (Tesi &amp; Paper)</div>
          <div class="term-line">  2. <a href="/eklisso/" style="color:#a78bfa; text-decoration:underline;">Eklisso</a> - Digital Community &amp; Local Bulletin (750k+ views)</div>
          <div class="term-line">  3. <a href="/spectra/" style="color:#a78bfa; text-decoration:underline;">Spectra Vision</a> - UAS Technical Inspections &amp; 360° Aerial Viewer</div>
          <div class="term-line">  4. <a href="https://mipago.it/" target="_blank" style="color:#a78bfa; text-decoration:underline;">miPAGO</a> - Contactless NFC Tokenization &amp; Reconciliation</div>
        `;
      },
      cass: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-success">CASS (Contextual-aware Selection System)</span></div>
            <div class="term-line">Hybrid cognitive decision model: System 1 (heuristic) + System 2 (deep tree).</div>
            <div class="term-line">Validated on the Scania industrial APS dataset. Paper on Zenodo (DOI: 10.5281/zenodo.18593717).</div>
            <div class="term-line"><a href="/cass/" style="color:#34d399; text-decoration:underline;">👉 Go to CASS Case Study</a></div>
          `;
        }
        return `
          <div class="term-line"><span class="term-success">CASS (Contextual-aware Selection System)</span></div>
          <div class="term-line">Modello ibrido decisionale Sistema 1 (euristico) + Sistema 2 (albero profondo).</div>
          <div class="term-line">Validato sul dataset industriale Scania APS. Paper su Zenodo (DOI: 10.5281/zenodo.18593717).</div>
          <div class="term-line"><a href="/cass/" style="color:#34d399; text-decoration:underline;">👉 Vai alla pagina CASS</a></div>
        `;
      },
      eklisso: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-success">Eklisso</span> — Digital community platform founded in Florence.</div>
            <div class="term-line">750k+ impressions, automated real-time moderation, full GDPR privacy compliance.</div>
            <div class="term-line"><a href="/eklisso/" style="color:#34d399; text-decoration:underline;">👉 Go to Eklisso Platform</a></div>
          `;
        }
        return `
          <div class="term-line"><span class="term-success">Eklisso</span> — Piattaforma comunitaria fondata a Firenze.</div>
          <div class="term-line">750k+ visualizzazioni, moderazione automatica in tempo reale, piena conformità GDPR.</div>
          <div class="term-line"><a href="/eklisso/" style="color:#34d399; text-decoration:underline;">👉 Vai alla pagina Eklisso</a></div>
        `;
      },
      spectra: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-success">Spectra Vision</span> — Technical aerial inspections and 4K surveys.</div>
            <div class="term-line">Certified ENAC / EASA Open A1-A3 pilot. Interactive 360° aerial viewer.</div>
            <div class="term-line"><a href="/spectra/" style="color:#34d399; text-decoration:underline;">👉 Go to Spectra Showcase</a></div>
          `;
        }
        return `
          <div class="term-line"><span class="term-success">Spectra Vision</span> — Ispezioni aeree tecniche e rilievi 4K.</div>
          <div class="term-line">Pilota attestato ENAC / EASA Open A1-A3. Viewer 360° interattivo aereo.</div>
          <div class="term-line"><a href="/spectra/" style="color:#34d399; text-decoration:underline;">👉 Vai allo Showcase Spectra</a></div>
        `;
      },
      cert: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-cmd">📜 Official Credentials:</span></div>
            <div class="term-line">  • B.Sc. Computer Science — University of Florence</div>
            <div class="term-line">  • Google Gemini for Education — Official Google Credential</div>
            <div class="term-line">  • BIP CyberSec — Threat Analysis &amp; Defensive Perimeter</div>
            <div class="term-line">  • Cisco Networking Essentials — Cybersecurity &amp; Protocols</div>
            <div class="term-line">  • UAS Drone Pilot A1-A3 — ENAC / EASA</div>
            <div class="term-line"><a href="/certificazioni/" style="color:#34d399; text-decoration:underline;">👉 Go to Certifications Page</a></div>
          `;
        }
        return `
          <div class="term-line"><span class="term-cmd">📜 Certificazioni Ufficiali:</span></div>
          <div class="term-line">  • Laurea in Informatica — Università degli Studi di Firenze</div>
          <div class="term-line">  • Google Gemini for Education — Credenziale Ufficiale Google</div>
          <div class="term-line">  • BIP CyberSec — Threat Analysis &amp; Perimeter Defense</div>
          <div class="term-line">  • Cisco Networking Essentials — Cybersecurity &amp; Protocols</div>
          <div class="term-line">  • Pilota Droni UAS A1-A3 — ENAC / EASA</div>
          <div class="term-line"><a href="/certificazioni/" style="color:#34d399; text-decoration:underline;">👉 Vai alla pagina Certificazioni</a></div>
        `;
      },
      contact: () => {
        if (currentLang === 'en') {
          return `
            <div class="term-line"><span class="term-success">✉️ Contact Channels:</span></div>
            <div class="term-line">  • Email: <a href="mailto:mpietri82@gmail.com" style="color:#a78bfa;">mpietri82@gmail.com</a></div>
            <div class="term-line">  • LinkedIn: <a href="https://www.linkedin.com/in/marco-pietri-561a33306/" target="_blank" style="color:#a78bfa;">linkedin.com/in/marco-pietri</a></div>
            <div class="term-line">  • GitHub: <a href="https://github.com/marcopietri02" target="_blank" style="color:#a78bfa;">github.com/marcopietri02</a></div>
          `;
        }
        return `
          <div class="term-line"><span class="term-success">✉️ Canali di Contatto:</span></div>
          <div class="term-line">  • Email: <a href="mailto:mpietri82@gmail.com" style="color:#a78bfa;">mpietri82@gmail.com</a></div>
          <div class="term-line">  • LinkedIn: <a href="https://www.linkedin.com/in/marco-pietri-561a33306/" target="_blank" style="color:#a78bfa;">linkedin.com/in/marco-pietri</a></div>
          <div class="term-line">  • GitHub: <a href="https://github.com/marcopietri02" target="_blank" style="color:#a78bfa;">github.com/marcopietri02</a></div>
        `;
      },
      cv: () => {
        window.open('https://drive.google.com/file/d/1fuXuN6e4lGd1CrBtd-lQeoXlnenA6BhV/view?usp=sharing', '_blank');
        return `<div class="term-line term-success">✓ ${currentLang === 'en' ? 'Opening Official CV PDF...' : 'Apertura Curriculum Vitae PDF in corso...'}</div>`;
      },
      date: () => {
        const now = new Date();
        const loc = currentLang === 'en' ? 'en-US' : 'it-IT';
        return `<div class="term-line term-highlight">🕒 Florence (CET/CEST): ${now.toLocaleDateString(loc)} — ${now.toLocaleTimeString(loc)}</div>`;
      },
      sudo: () => {
        if (currentLang === 'en') {
          return `<div class="term-line" style="color: #ef4444;">⚠️ Permission Denied: You already have full root access to Marco Pietri's portfolio! 😉</div>`;
        }
        return `<div class="term-line" style="color: #ef4444;">⚠️ Accesso Negato: sei già nell'infrastruttura di Marco Pietri. Non serve il comando sudo! 😉</div>`;
      }
    };

    function executeAction(actionKey) {
      if (actionKey === 'copy_email') {
        navigator.clipboard.writeText('mpietri82@gmail.com').then(() => {
          showToast(currentLang === 'en' ? 'Email mpietri82@gmail.com copied to clipboard!' : 'Email mpietri82@gmail.com copiata negli appunti!');
          closePalette();
        });
      } else if (actionKey === 'open_cv') {
        window.open('https://drive.google.com/file/d/1fuXuN6e4lGd1CrBtd-lQeoXlnenA6BhV/view?usp=sharing', '_blank');
        closePalette();
      } else if (actionKey === 'toggle_lang') {
        const next = currentLang === 'it' ? 'en' : 'it';
        applyLanguage(next, true);
        showToast(next === 'it' ? 'Lingua impostata: Italiano' : 'Language set: English');
        closePalette();
      } else if (actionKey === 'open_github') {
        window.open('https://github.com/marcopietri02', '_blank');
        closePalette();
      } else if (actionKey === 'open_linkedin') {
        window.open('https://www.linkedin.com/in/marco-pietri-561a33306/', '_blank');
        closePalette();
      } else if (actionKey === 'open_zenodo') {
        window.open('https://zenodo.org/records/18593717', '_blank');
        closePalette();
      }
    }

    function renderResults(query = '') {
      const q = query.trim().toLowerCase();
      const searchCatalog = getSearchCatalog(currentLang);
      
      // Check if command mode is triggered
      if (q.startsWith('>') || q.startsWith(':')) {
        isTerminalMode = true;
        badge.textContent = 'CLI TERMINAL';
        const cmdName = q.slice(1).trim();
        renderTerminalHelp(cmdName);
        return;
      }

      // Check if pure CLI command typed
      if (cliCommands[q]) {
        badge.textContent = 'CLI COMMAND MATCH';
      } else {
        badge.textContent = currentLang === 'en' ? 'NAV & SEARCH' : 'NAV & COMANDI';
      }

      isTerminalMode = false;
      const filtered = searchCatalog.filter((item) => {
        if (!q) return true;
        return item.title.toLowerCase().includes(q) ||
               item.subtitle.toLowerCase().includes(q) ||
               item.tags.toLowerCase().includes(q);
      });

      currentItems = filtered;
      selectedIndex = 0;

      if (filtered.length === 0) {
        body.innerHTML = `
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-dim); font-family: var(--font-mono); font-size: 0.88rem;">
            ${currentLang === 'en' ? `No results found for "<strong>${query}</strong>"` : `Nessun risultato per "<strong>${query}</strong>"`}<br>
            <span style="font-size: 0.78rem; opacity: 0.7; margin-top: 0.4rem; display: block;">
              ${currentLang === 'en' ? `Press <kbd style="background: rgba(255,255,255,0.08); padding: 0.1rem 0.3rem; border-radius: 3px;">Tab</kbd> or type <kbd style="background: rgba(255,255,255,0.08); padding: 0.1rem 0.3rem; border-radius: 3px;">help</kbd> for CLI commands.` : `Premi <kbd style="background: rgba(255,255,255,0.08); padding: 0.1rem 0.3rem; border-radius: 3px;">Tab</kbd> o digita <kbd style="background: rgba(255,255,255,0.08); padding: 0.1rem 0.3rem; border-radius: 3px;">help</kbd> per visualizzare i comandi CLI.`}
            </span>
          </div>
        `;
        return;
      }

      let html = '';
      let currentType = '';

      filtered.forEach((item, idx) => {
        if (item.type !== currentType) {
          currentType = item.type;
          const groupLabel = currentType === 'nav' 
            ? (currentLang === 'en' ? 'Pages & Sections' : 'Pagine & Sezioni') 
            : (currentLang === 'en' ? 'Quick Actions & Links' : 'Azioni Rapide & Link');
          html += `<div class="cmd-group-title">${groupLabel}</div>`;
        }

        const isSelected = idx === selectedIndex ? 'is-selected' : '';
        const actionHint = item.type === 'nav' 
          ? (currentLang === 'en' ? 'Jump ↵' : 'Salta ↵') 
          : (currentLang === 'en' ? 'Run ↵' : 'Esegui ↵');

        html += `
          <div class="cmd-item ${isSelected}" data-index="${idx}">
            <div class="cmd-item-left">
              <span class="cmd-item-icon">${item.icon}</span>
              <div>
                <span class="cmd-item-title">${item.title}</span>
                <span class="cmd-item-subtitle">${item.subtitle}</span>
              </div>
            </div>
            <span class="cmd-item-shortcut">${actionHint}</span>
          </div>
        `;
      });

      body.innerHTML = html;

      // Add click listeners to items
      body.querySelectorAll('.cmd-item').forEach((el) => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-index'), 10);
          selectItem(idx);
        });
      });
    }

    function renderTerminalHelp(cmdName = '') {
      body.innerHTML = `
        <div class="cmd-terminal-panel">
          <div class="term-line"><span class="term-dim">${currentLang === 'en' ? '// Terminal Mode Active — Type a command and press Enter' : '// Modalità Terminale Attiva — Digita un comando e premi Invio'}</span></div>
          ${cliCommands.help()}
        </div>
      `;
    }

    function executeTerminalCommand(cmdString) {
      const clean = cmdString.replace(/^[>:]/, '').trim();
      const parts = clean.split(' ');
      const mainCmd = parts[0].toLowerCase();
      const arg = parts[1] ? parts[1].toLowerCase() : '';

      if (mainCmd === 'clear') {
        input.value = '';
        renderResults('');
        return;
      }

      if (mainCmd === 'exit') {
        closePalette();
        return;
      }

      if (mainCmd === 'lang') {
        if (arg === 'it' || arg === 'en') {
          applyLanguage(arg, true);
          body.innerHTML = `
            <div class="cmd-terminal-panel">
              <div class="term-line term-success">✓ ${arg === 'en' ? 'Language successfully updated to: <strong>ENGLISH</strong>' : 'Lingua aggiornata con successo a: <strong>ITALIANO</strong>'}</div>
            </div>
          `;
          return;
        } else {
          body.innerHTML = `
            <div class="cmd-terminal-panel">
              <div class="term-line" style="color:#ef4444;">Usage: lang &lt;it|en&gt;</div>
            </div>
          `;
          return;
        }
      }

      if (cliCommands[mainCmd]) {
        const out = cliCommands[mainCmd]();
        body.innerHTML = `
          <div class="cmd-terminal-panel">
            <div class="term-line"><span class="term-dim">$ ${clean}</span></div>
            ${out}
          </div>
        `;
      } else {
        body.innerHTML = `
          <div class="cmd-terminal-panel">
            <div class="term-line" style="color: #ef4444;">${currentLang === 'en' ? `Unknown command: "<strong>${mainCmd}</strong>"` : `Comando sconosciuto: "<strong>${mainCmd}</strong>"`}</div>
            <div class="term-line term-dim">${currentLang === 'en' ? `Type <span class="term-highlight">help</span> to view supported commands.` : `Digita <span class="term-highlight">help</span> per visualizzare i comandi supportati.`}</div>
          </div>
        `;
      }
    }

    function selectItem(idx) {
      if (idx < 0 || idx >= currentItems.length) return;
      const item = currentItems[idx];
      if (item.type === 'nav') {
        if (item.href.startsWith('/#')) {
          if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            const target = document.querySelector(item.href.replace('/', ''));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = item.href;
          }
        } else {
          window.location.href = item.href;
        }
        closePalette();
      } else if (item.type === 'action') {
        executeAction(item.action);
      }
    }

    function updateSelection(newIndex) {
      if (currentItems.length === 0) return;
      if (newIndex < 0) newIndex = currentItems.length - 1;
      if (newIndex >= currentItems.length) newIndex = 0;
      selectedIndex = newIndex;

      const domItems = body.querySelectorAll('.cmd-item');
      domItems.forEach((el, idx) => {
        el.classList.toggle('is-selected', idx === selectedIndex);
        if (idx === selectedIndex) {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    const updateCommandPaletteLanguage = (lang) => {
      if (!input || !backdrop) return;
      input.placeholder = lang === 'en' 
        ? "Search projects, sections or type a command (e.g. 'whoami', 'stack', 'cv')..." 
        : "Cerca progetti, sezioni o digita un comando (es: 'whoami', 'stack', 'cv')...";
      
      if (!isTerminalMode && badge) {
        badge.textContent = lang === 'en' ? 'NAV & SEARCH' : 'NAV & COMANDI';
      }

      const footerLegend = backdrop.querySelector('.cmd-shortcuts-legend');
      if (footerLegend) {
        footerLegend.innerHTML = lang === 'en'
          ? `<span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span> <span><kbd>↵</kbd> Select</span> <span><kbd>ESC</kbd> Close</span>`
          : `<span><kbd>↑</kbd><kbd>↓</kbd> Naviga</span> <span><kbd>↵</kbd> Seleziona</span> <span><kbd>ESC</kbd> Chiudi</span>`;
      }

      if (backdrop.classList.contains('is-open')) {
        renderResults(input.value);
      }
    };
    window.updateCommandPaletteLanguage = updateCommandPaletteLanguage;

    function openPalette() {
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      input.value = '';
      updateCommandPaletteLanguage(currentLang);
      renderResults('');
      setTimeout(() => input.focus(), 50);
      document.body.style.overflow = 'hidden';
    }

    function closePalette() {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      input.blur();
    }

    // Keyboard navigation within modal
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSelection(selectedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSelection(selectedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const raw = input.value.trim();

        if (window.isInjectionAttempt && window.isInjectionAttempt(raw)) {
          window.triggerSecurityHoneypot(raw, () => {
            input.value = '';
            closePalette();
          });
          return;
        }

        const parts = raw.split(' ');
        const first = parts[0].toLowerCase().replace(/^[>:]/, '');
        
        if (cliCommands[first] || first === 'clear' || first === 'exit' || first === 'lang') {
          executeTerminalCommand(raw);
        } else if (currentItems.length > 0) {
          selectItem(selectedIndex);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });

    input.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    // Close on click outside modal
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closePalette();
      }
    });

    // Global keyboard triggers (Cmd+K / Ctrl+K / Slash)
    window.addEventListener('keydown', (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

      if (isCmdK || isSlash) {
        e.preventDefault();
        if (backdrop.classList.contains('is-open')) {
          closePalette();
        } else {
          openPalette();
        }
      }
    });

    // Attach trigger to any buttons in page
    document.querySelectorAll('.cmd-palette-trigger, [data-open-cmd]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPalette();
      });
    });
  }

  // Helper: Temporary Toast Notification
  function showToast(msg) {
    let toast = document.getElementById('mp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mp-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #111118;
        border: 1px solid rgba(139, 92, 246, 0.4);
        color: #f3f4f6;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        z-index: 10000;
        opacity: 0;
        transform: translateY(12px);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
    }, 2800);
  }

  // =========================================================================
  // 8. Native View Transitions Link Interceptor for Smooth Cross-Page Nav
  // =========================================================================
  function initViewTransitions() {
    // Only enhance internal static links if View Transitions API is supported
    if (!document.startViewTransition) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;

      // Check if internal HTML page navigation
      const isInternal = (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) && 
                         !href.startsWith('//') && 
                         !href.startsWith('mailto:') && 
                         !href.startsWith('tel:') && 
                         !href.includes('#') &&
                         link.target !== '_blank';

      if (isInternal) {
        // Allow native cross-page view transition via standard navigation,
        // supported via @view-transition { navigation: auto; } in modern browsers
      }
    });
  }

  // =========================================================================
  // 9. Security Honeypot & Simulated Exploit Neutralizer (Anti-XSS Trappola)
  // =========================================================================
  function initSecurityHoneypot() {
    const injectionRegex = /(<script[\s\S]*?>|alert\s*\(|javascript:|onerror\s*=|onload\s*=|document\.cookie|<img[\s\S]*?onerror|<svg[\s\S]*?>|union\s+select|'\s*OR\s+1\s*=\s*1|DROP\s+TABLE)/i;

    let alertBackdrop = document.getElementById('fake-alert-backdrop');
    if (!alertBackdrop) {
      alertBackdrop = document.createElement('div');
      alertBackdrop.id = 'fake-alert-backdrop';
      alertBackdrop.className = 'fake-alert-backdrop';
      alertBackdrop.setAttribute('aria-hidden', 'true');
      alertBackdrop.innerHTML = `
        <div class="fake-alert-box" id="fake-alert-box" role="dialog" aria-modal="true">
          <div class="fake-alert-header" id="fake-alert-header">
            <svg class="fake-alert-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span id="fake-alert-domain">https://marcopietri.com</span>
          </div>
          <div class="fake-alert-body" id="fake-alert-body">1</div>
          <div class="fake-alert-actions">
            <button class="fake-alert-btn" id="fake-alert-btn">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(alertBackdrop);
    }

    const box = document.getElementById('fake-alert-box');
    const domainSpan = document.getElementById('fake-alert-domain');
    const body = document.getElementById('fake-alert-body');
    const btn = document.getElementById('fake-alert-btn');

    let glitchTimer = null;
    let scrambleInterval = null;

    function triggerHoneypot(rawPayload, onDismiss) {
      const isEn = currentLang === 'en';
      
      // Extract alert content if format alert(...) or script alert(...)
      let extracted = '1';
      const alertMatch = rawPayload.match(/alert\s*\(\s*['"`]?([^'"`)]*)['"`]?\s*\)/i);
      if (alertMatch && alertMatch[1]) {
        extracted = alertMatch[1];
      } else {
        extracted = rawPayload.length > 35 ? rawPayload.slice(0, 35) + '...' : rawPayload;
      }

      // 1. Initial State: Realistic Browser Alert
      box.className = 'fake-alert-box';
      domainSpan.textContent = isEn ? 'https://marcopietri.com says' : 'https://marcopietri.com dice';
      body.textContent = extracted;
      btn.textContent = 'OK';
      alertBackdrop.classList.add('is-open');
      alertBackdrop.setAttribute('aria-hidden', 'false');

      // 2. After 2.0s -> Initiate Glitch & Meltdown
      clearTimeout(glitchTimer);
      clearInterval(scrambleInterval);

      glitchTimer = setTimeout(() => {
        box.classList.add('is-glitching');
        const glitchChars = '!<>-_\\/[]{}—=+*^?#01010x8F§∆';
        let frame = 0;
        const totalFrames = 18;

        scrambleInterval = setInterval(() => {
          frame++;
          let scrambled = '';
          for (let i = 0; i < 16; i++) {
            scrambled += glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          body.textContent = scrambled;

          if (frame >= totalFrames) {
            clearInterval(scrambleInterval);
            // 3. Reveal simple "Nice try" state
            box.classList.remove('is-glitching');
            box.classList.add('is-nice-try');
            domainSpan.textContent = isEn ? 'https://marcopietri.com says' : 'https://marcopietri.com dice';
            body.innerHTML = `
              <div style="font-size: 1.25rem; font-weight: 700; color: #34d399; margin-bottom: 0.35rem; letter-spacing: 0.02em;">Nice try, script kiddie.</div>
              <div style="font-size: 0.88rem; color: #d1d5db; font-family: var(--font-sans); font-weight: 400;">
                ${isEn ? 'Be good and return to normal.' : 'Fai il bravo e torna alla normalità.'}
              </div>
            `;
            btn.textContent = isEn ? 'Be good & Restart' : 'Fai il bravo & Restart';
          }
        }, 65);
      }, 2000);

      // Handle Dismiss / Restart
      btn.onclick = () => {
        clearTimeout(glitchTimer);
        clearInterval(scrambleInterval);
        alertBackdrop.classList.remove('is-open');
        alertBackdrop.setAttribute('aria-hidden', 'true');
        box.className = 'fake-alert-box';
        if (typeof onDismiss === 'function') onDismiss();
      };
    }

    window.triggerSecurityHoneypot = triggerHoneypot;
    window.isInjectionAttempt = (str) => injectionRegex.test(str);
  }

  // =========================================================================
  // 10. Golden Build & Integrity Inspector (Easter Egg Modal)
  // =========================================================================
  function initGoldInspectorModal() {
    let modal = document.getElementById('gold-inspector-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'gold-inspector-modal';
      modal.className = 'gold-inspector-backdrop';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="gold-inspector-card" role="dialog" aria-modal="true">
          <div class="gold-inspector-top">
            <span class="gold-inspector-badge">✨ GOLD EDITION · BUILD STATUS</span>
            <button class="gold-close-btn" id="gold-inspector-close" aria-label="Chiudi">&times;</button>
          </div>
          <h2 class="gold-inspector-title">Marco Pietri — Build &amp; Integrity</h2>
          <p class="gold-inspector-subtitle">
            Costellazione geometrica vettoriale sbloccata. Diagnostica di runtime verificata con policy zero-trust.
          </p>
          <div class="gold-telemetry-grid">
            <div class="gold-telemetry-box">
              <div class="gold-telemetry-label">Versione Build</div>
              <div class="gold-telemetry-val accent-gold">v8.2.2</div>
            </div>
            <div class="gold-telemetry-box">
              <div class="gold-telemetry-label">Edge Network</div>
              <div class="gold-telemetry-val">Cloudflare Pages</div>
            </div>
            <div class="gold-telemetry-box">
              <div class="gold-telemetry-label">Stack Runtime</div>
              <div class="gold-telemetry-val">Pure Vanilla 60 FPS</div>
            </div>
            <div class="gold-telemetry-box">
              <div class="gold-telemetry-label">Security Shield</div>
              <div class="gold-telemetry-val accent-gold">Zero-Trust Armed</div>
            </div>
          </div>
          <div class="gold-inspector-note">
            Tutti i moduli (CASS, Eklisso, Spectra, Certificazioni) sono sincronizzati con timestamp 2026-09-13.
          </div>
          <button class="gold-action-btn" id="gold-inspector-ok">Chiudi &amp; Mantieni Costellazione</button>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = document.getElementById('gold-inspector-close');
      const okBtn = document.getElementById('gold-inspector-ok');

      const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      };

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (okBtn) okBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    function showGoldInspectorModal() {
      const modalEl = document.getElementById('gold-inspector-modal') || modal;
      if (!modalEl) return;
      const isEn = currentLang === 'en';
      const badge = modalEl.querySelector('.gold-inspector-badge');
      const sub = modalEl.querySelector('.gold-inspector-subtitle');
      const note = modalEl.querySelector('.gold-inspector-note');
      const okBtn = document.getElementById('gold-inspector-ok');

      if (badge) badge.textContent = isEn ? '✨ GOLD EDITION · BUILD STATUS' : '✨ GOLD EDITION · STATO BUILD';
      if (sub) sub.textContent = isEn 
        ? 'Vector geometric constellation unlocked. Real-time runtime diagnostics verified with zero-trust policy.' 
        : 'Costellazione geometrica vettoriale sbloccata. Diagnostica di runtime verificata con policy zero-trust.';
      if (note) note.textContent = isEn
        ? 'All modules (CASS, Eklisso, Spectra, Certifications) are synchronized with timestamp 2026-09-13.'
        : 'Tutti i moduli (CASS, Eklisso, Spectra, Certificazioni) sono sincronizzati con timestamp 2026-09-13.';
      if (okBtn) okBtn.textContent = isEn ? 'Close & Keep Constellation' : 'Chiudi & Mantieni Costellazione';

      modalEl.classList.add('is-open');
      modalEl.setAttribute('aria-hidden', 'false');
    }

    window.showGoldInspectorModal = showGoldInspectorModal;

    // Attach click to all footer version tags
    document.querySelectorAll('.footer-version-tag').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.toggleGoldEasterEgg) {
          window.toggleGoldEasterEgg(true);
        } else if (window.showGoldInspectorModal) {
          window.showGoldInspectorModal();
        }
      });
    });
  }

  // Run new core subsystems
  initI18n();
  initCommandPalette();
  initViewTransitions();
  initSecurityHoneypot();
  initGoldInspectorModal();
});


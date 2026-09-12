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

    // 6 Geometric Satellites (Active on Desktop with Mouse)
    const SATELLITE_DEFS = [
      { type: 'triangle', size: 9, orbitR: 28, speed: 0.045, phase: 0 },
      { type: 'diamond', size: 8, orbitR: 36, speed: -0.038, phase: 1.05 },
      { type: 'hexagon', size: 9, orbitR: 42, speed: 0.032, phase: 2.1 },
      { type: 'crosshair', size: 10, orbitR: 30, speed: -0.042, phase: 3.14 },
      { type: 'circle', size: 5, orbitR: 46, speed: 0.028, phase: 4.2 },
      { type: 'square', size: 8, orbitR: 34, speed: -0.035, phase: 5.25 }
    ];

    let satellites = SATELLITE_DEFS.map((def) => ({
      ...def,
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      currentAngle: def.phase,
      colorR: 167,
      colorG: 139,
      colorB: 250
    }));

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

          sat.colorR = Math.round(167 + (52 - 167) * currentProximity);
          sat.colorG = Math.round(139 + (211 - 139) * currentProximity);
          sat.colorB = Math.round(250 + (153 - 250) * currentProximity);
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
            ctx.strokeStyle = `rgba(${Math.round(sat.colorR)}, ${Math.round(sat.colorG)}, ${Math.round(sat.colorB)}, ${tetherAlpha})`;
            ctx.lineWidth = 0.5;
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

          ctx.strokeStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
          ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, 0.22)`;
          ctx.lineWidth = 1.3;

          if (currentProximity > 0.15) {
            ctx.shadowColor = `rgba(16, 185, 129, ${currentProximity * 0.9})`;
            ctx.shadowBlur = 12 * currentProximity;
          }

          const s = sat.size;
          ctx.beginPath();

          if (sat.type === 'triangle') {
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

          ctx.closePath();
          ctx.fill();
          ctx.stroke();
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
});

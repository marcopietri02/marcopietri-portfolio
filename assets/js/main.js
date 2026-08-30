/**
 * Marco Pietri — Native Vanilla JS Engine
 * Zero external dependencies. Ultra-fast, accessible, and lightweight.
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

  // 3. Scroll-Driven Reveal Animations (Timeline & Cards)
  const revealElements = document.querySelectorAll('.scroll-reveal, .timeline-item, .partner-card, .testimonial-card');
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
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // 4. Copy to Clipboard Utility (for Email / URI)
  const copyBtns = document.querySelectorAll('[data-copy-text]');
  copyBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy-text');
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span>✓ Copiato!</span>';
        btn.style.borderColor = 'var(--emerald-glow)';
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.borderColor = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });
  });
});

/**
 * Marco Pietri — Native Vanilla JS Engine
 * Zero external dependencies. Ultra-fast and accessible.
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
  }

  // 2. FAQ Accordion Handling
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        // Optional: close other items in same group
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

  // 3. Copy to Clipboard Utility (for Email / URI)
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

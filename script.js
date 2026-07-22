/* ============================================================
   SHREE INTERIOR ELEMENT — script.js
   Interactions: Header, Scroll, Brands Tabs, Form
   ============================================================ */

'use strict';

/* ── Utility: debounce ── */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ── Footer year ── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ══════════════════════════════════════════════
   1. STICKY HEADER — requestAnimationFrame scroll optimization
══════════════════════════════════════════════ */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeader(); // run on load
})();


/* ══════════════════════════════════════════════
   2. MOBILE HAMBURGER MENU
══════════════════════════════════════════════ */
(function initMobileNav() {
  const btn     = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!btn || !mobileNav) return;

  function close() {
    btn.classList.remove('open');
    mobileNav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on any nav link click
  mobileNav.querySelectorAll('.nav-link, .header-cta').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !mobileNav.contains(e.target)) {
      close();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();


/* ══════════════════════════════════════════════
   3. SMOOTH SCROLL — for all anchor links
══════════════════════════════════════════════ */
(function initSmoothScroll() {
  const headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '76',
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════
   4. HERO SLIDESHOW — auto-advance with dot controls
══════════════════════════════════════════════ */
(function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.slide, 10));
      startTimer();
    });
  });

  startTimer();
})();


/* ══════════════════════════════════════════════
   5. SCROLL REVEAL — Intersection Observer
══════════════════════════════════════════════ */
(function initReveal() {
  const classes   = ['reveal', 'reveal-left', 'reveal-right'];
  const selectors = classes.map(c => '.' + c).join(', ');
  const elements  = document.querySelectorAll(selectors);
  if (!elements.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════════════
   6. BRANDS TABS
══════════════════════════════════════════════ */
(function initBrandTabs() {
  const tabs   = document.querySelectorAll('.brand-tab[data-tab]');
  const panels = document.querySelectorAll('.brands-panel');
  if (!tabs.length) return;

  function switchTab(selectedTab) {
    const targetId = 'tab-' + selectedTab.dataset.tab;

    tabs.forEach(tab => {
      const isActive = tab === selectedTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach(panel => {
      const isActive = panel.id === targetId;
      panel.classList.toggle('active', isActive);
      // Trigger reveal for newly visible items
      if (isActive) {
        panel.querySelectorAll('.brand-logo-item').forEach((item, i) => {
          item.style.animationDelay = (i * 0.03) + 's';
        });
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));

    // Keyboard arrow navigation
    tab.addEventListener('keydown', (e) => {
      const tabList = [...tabs];
      const idx = tabList.indexOf(tab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = tabList[(idx + 1) % tabList.length];
        next.focus();
        switchTab(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = tabList[(idx - 1 + tabList.length) % tabList.length];
        prev.focus();
        switchTab(prev);
      }
    });
  });
})();


/* ══════════════════════════════════════════════
   7. CONTACT FORM — validation + success state
══════════════════════════════════════════════ */
(function initContactForm() {
  const form       = document.getElementById('inquiry-form');
  const successBox = document.getElementById('form-success');
  if (!form) return;

  /* ── Field helpers ── */
  function setError(field, msg) {
    field.style.borderColor = '#c0392b';
    let err = field.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      err.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:0.25rem;display:block;';
      err.setAttribute('role', 'alert');
      field.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearError(field) {
    field.style.borderColor = '';
    const err = field.parentElement.querySelector('.field-error');
    if (err) err.remove();
  }

  function validatePhone(val) {
    // Accept Indian format: 10 digits, optionally with +91 or 0
    return /^(?:\+91|0)?[6-9]\d{9}$/.test(val.replace(/[\s\-()]/g, ''));
  }

  function validate() {
    let valid = true;

    const name    = document.getElementById('form-name');
    const company = document.getElementById('form-company');
    const phone   = document.getElementById('form-phone');

    if (!name.value.trim()) {
      setError(name, 'Please enter your name.');
      valid = false;
    } else {
      clearError(name);
    }

    if (!company.value.trim()) {
      setError(company, 'Please enter your company name.');
      valid = false;
    } else {
      clearError(company);
    }

    if (!phone.value.trim()) {
      setError(phone, 'Please enter your phone number.');
      valid = false;
    } else if (!validatePhone(phone.value.trim())) {
      setError(phone, 'Please enter a valid Indian mobile number.');
      valid = false;
    } else {
      clearError(phone);
    }

    return valid;
  }

  /* ── Live validation on blur ── */
  ['form-name', 'form-company', 'form-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', validate);
      el.addEventListener('input', () => clearError(el));
    }
  });

  /* ── Submit ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    const name        = document.getElementById('form-name').value.trim();
    const company     = document.getElementById('form-company').value.trim();
    const phone       = document.getElementById('form-phone').value.trim();
    const requirement = document.getElementById('form-requirement').value || 'Not specified';
    const message     = document.getElementById('form-message').value.trim() || 'N/A';

    const subject = encodeURIComponent(`Material Inquiry from ${name} (${company})`);
    const body = encodeURIComponent(
`Hello Shree Interior Element,

I would like to inquire about your interior materials. Here are my details:

• Name: ${name}
• Company / Firm: ${company}
• Phone: ${phone}
• Product Category: ${requirement}

• Project Details / Message:
${message}

Thank you!`
    );

    // Open user's email client / Gmail pre-filled
    window.location.href = `mailto:shreeinteriorelement@gmail.com?subject=${subject}&body=${body}`;

    // Show success message on page
    form.style.display = 'none';
    if (successBox) successBox.classList.add('visible');
  });
})();


/* ══════════════════════════════════════════════
   8. LAZY-LOAD IMAGES via Intersection Observer
══════════════════════════════════════════════ */
(function initLazyImages() {
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  lazyImgs.forEach(img => {
    // If the image is already fully loaded (e.g. from cache), show it instantly
    if (img.complete) {
      img.style.opacity = '1';
      return;
    }

    // Otherwise, set initial opacity to 0 and fade in smoothly when loaded
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';

    img.addEventListener('load', () => {
      img.style.opacity = '1';
    }, { once: true });

    img.addEventListener('error', () => {
      img.style.opacity = '1';
    }, { once: true });
  });
})();


/* ══════════════════════════════════════════════
   9. ACTIVE NAV HIGHLIGHT — on scroll
══════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = ['hero', 'about', 'why-choose', 'our-strength', 'products', 'clients', 'contact'];
  const navLinks = document.querySelectorAll('.header-nav .nav-link');
  if (!navLinks.length) return;

  const sectionEls = sections
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const headerHeight = 76;

  function onScroll() {
    const scrollY = window.scrollY + headerHeight + 60;
    let current = 'hero';

    sectionEls.forEach(sec => {
      if (sec.offsetTop <= scrollY) {
        current = sec.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      const isActive = href === current ||
        (href === 'why-choose' && current === 'our-strength');
      link.style.color = isActive ? 'var(--clr-primary-dark)' : '';
      link.style.fontWeight = isActive ? '600' : '';
    });
  }

  window.addEventListener('scroll', debounce(onScroll, 50), { passive: true });
  onScroll();
})();

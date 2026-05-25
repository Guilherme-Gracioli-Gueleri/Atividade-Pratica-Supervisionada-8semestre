'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

(function initTheme() {
  const STORAGE_KEY = 'renovarte-theme';
  const btn = $('#btn-theme');
  const icon = $('#theme-icon');
  const html = document.documentElement;


  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    btn.setAttribute('title', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    btn.setAttribute('aria-label', btn.getAttribute('title'));
    localStorage.setItem(STORAGE_KEY, theme);
  }


  const saved = localStorage.getItem(STORAGE_KEY);
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || prefer);


  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });


  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

(function initMobileMenu() {
  const btn = $('#btn-hamburger');
  const nav = $('#mobile-nav');
  const mobileLinks = $$('.mobile-link');

  function toggleMenu(open) {
    btn.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    nav.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    toggleMenu(!isOpen);
  });


  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });


  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.classList.contains('open')) toggleMenu(false);
  });


  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && btn.classList.contains('open')) toggleMenu(false);
  });
})();

(function initHeaderScroll() {
  const header = $('#site-header');
  const THRESHOLD = 50;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > THRESHOLD);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function initBackToTop() {
  const btn = $('#btn-back-top');
  const THRESHOLD = 400;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > THRESHOLD);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(function initScrollReveal() {
  const elements = $$('.reveal-up');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

(function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;


  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }


  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString('pt-BR');

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

(function initProgressBars() {
  const bars = $$('.bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => observer.observe(bar));
})();

(function initCardToggle() {
  const toggleBtns = $$('.card-toggle');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.energy-card');
      const details = $('.card-details', card);
      const isOpen = btn.getAttribute('aria-expanded') === 'true';


      $$('.card-details.open').forEach(d => {
        if (d !== details) {
          d.classList.remove('open');
          const siblingBtn = d.closest('.energy-card').querySelector('.card-toggle');
          if (siblingBtn) {
            siblingBtn.setAttribute('aria-expanded', 'false');
            siblingBtn.innerHTML = 'Saiba mais <i class="ph ph-caret-down"></i>';
          }
        }
      });


      if (isOpen) {
        details.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = 'Saiba mais <i class="ph ph-caret-down"></i>';
      } else {
        details.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        btn.innerHTML = 'Ver menos <i class="ph ph-caret-down"></i>';


        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
      }
    });
  });
})();

(function initActiveNav() {
  const navLinks = $$('.main-nav a');
  if (!navLinks.length) return;


  const linkMap = {};
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) linkMap[href.slice(1)] = link;
  });

  const sectionIds = Object.keys(linkMap);
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {

        navLinks.forEach(l => l.classList.remove('active'));

        const link = linkMap[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, {
    rootMargin: '-30% 0px -65% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
})();

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

(function initHeroParallax() {
  const hero = $('.hero');
  const heroBg = $('.hero-bg');
  if (!hero || !heroBg) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.innerWidth > 900) {
          const scrollY = window.scrollY;
          const heroH = hero.offsetHeight;
          if (scrollY <= heroH) {
            heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
          }
        } else {
          heroBg.style.transform = '';
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

(function initRipple() {
  $$('.btn-primary').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      Object.assign(ripple.style, {
        position: 'absolute',
        width: size + 'px',
        height: size + 'px',
        left: x + 'px',
        top: y + 'px',
        background: 'rgba(255,255,255,0.25)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'ripple-anim 0.55s linear',
        pointerEvents: 'none',
      });


      if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
          @keyframes ripple-anim {
            to { transform: scale(1); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

(function initCustomCursor() {

  if (window.innerWidth <= 900 || window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'fixed',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--clr-green)',
    pointerEvents: 'none',
    zIndex: '9999',
    transition: 'opacity 0.3s, transform 0.15s',
    transform: 'translate(-50%, -50%)',
    top: '0',
    left: '0',
    opacity: '0',
    mixBlendMode: 'multiply',
  });
  document.body.appendChild(dot);

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;
  let active = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!active) { dot.style.opacity = '0.7'; active = true; }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    active = false;
  });


  $$('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => dot.style.transform = 'translate(-50%, -50%) scale(2.5)');
    el.addEventListener('mouseleave', () => dot.style.transform = 'translate(-50%, -50%) scale(1)');
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateCursor() {
    curX = lerp(curX, mouseX, 0.18);
    curY = lerp(curY, mouseY, 0.18);
    dot.style.left = curX + 'px';
    dot.style.top = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

(function initFooterYear() {
  const yearEl = document.querySelector('.footer-bottom .footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

(function () {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(
      '%c🌱 RenovArte — Energias Renováveis',
      'color: #2d7a3a; font-size: 1.1rem; font-weight: bold;'
    );
    console.log('%cTodos os módulos JS carregados com sucesso.', 'color: #4caf61;');
  }
})();
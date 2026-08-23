/* STUDIQOO v3 — Single-page site JS */

// ── Mobile Menu (slide-in drawer) ────────────────────────
const hamburger     = document.getElementById('hamburger');
const mobileNav     = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose   = document.getElementById('mobileClose');

function resetMenuUI() {
  if (!mobileNav) return;
  mobileNav.classList.remove('open');
  if (mobileOverlay) mobileOverlay.classList.remove('open');
  const i = hamburger && hamburger.querySelector('i');
  if (i) i.className = 'fa-solid fa-bars';
  document.body.style.overflow = '';
}

function openMenu() {
  if (!mobileNav) return;
  mobileNav.classList.add('open');
  if (mobileOverlay) mobileOverlay.classList.add('open');
  const i = hamburger && hamburger.querySelector('i');
  if (i) i.className = 'fa-solid fa-xmark';
  document.body.style.overflow = 'hidden';
  // Push a history entry so the phone/browser "back" button closes
  // the drawer first, instead of leaving the page or doing nothing.
  history.pushState({ mobileMenu: true }, '', location.href);
}

function closeMenu() {
  // Explicit close (X button, overlay tap, hamburger toggle): unwind
  // the history entry we pushed on open, so back doesn't need a 2nd press.
  const hadPushedState = history.state && history.state.mobileMenu;
  resetMenuUI();
  if (hadPushedState) history.back();
}

function closeMenuForNavigation() {
  // A nav link was tapped — reset the UI and quietly drop our pushed
  // history marker (without adding a navigation) so back behaves normally.
  resetMenuUI();
  if (history.state && history.state.mobileMenu) {
    history.replaceState(null, '', location.href);
  }
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenuForNavigation));
}

// Phone/browser back button (or swipe-back gesture) while drawer is open
// closes the drawer instead of leaving the page or appearing to do nothing.
window.addEventListener('popstate', () => {
  if (mobileNav && mobileNav.classList.contains('open')) resetMenuUI();
});

// ── Navbar glass + shrink on scroll ──────────────────────
const navbar = document.getElementById('navbar');
function updateNavbarScroll() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', updateNavbarScroll, { passive: true });
updateNavbarScroll();

// ── Always reset menu state on page display ──────────────
// Fixes a drawer stuck open when a page is restored from the
// browser's back/forward cache instead of freshly loaded.
window.addEventListener('pageshow', () => {
  resetMenuUI();
});


// ── Newsletter signup ──────────────────────────────────────
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const msg = document.getElementById('newsletterMsg');
    const btn = newsletterForm.querySelector('button');
    const email = input.value.trim();
    if (!email) return;
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Subscribing...';
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        if (msg) msg.textContent = "You're in! Check your inbox.";
        input.value = '';
      } else {
        const data = await res.json().catch(() => ({}));
        if (msg) msg.textContent = data.error || 'Something went wrong. Try again.';
      }
    } catch {
      if (msg) msg.textContent = 'Network error — please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}


// ── Scroll Reveal ─────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// ── Smooth Scroll (core to a single-page site) ─────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', href);
    }
  });
});


// ── FAQ ───────────────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const ans   = btn.nextElementSibling;
    const open  = ans.style.display === 'block';
    ans.style.display = open ? 'none' : 'block';
    btn.classList.toggle('open', !open);
  });
});


// ── Contact Form ──────────────────────────────────────────
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…'; btn.disabled = true;
    const payload = {
      fullName: (form.fullName  || {value:''}).value.trim(),
      email:    (form.email     || {value:''}).value.trim(),
      phone:    (form.phone     || {value:''}).value.trim(),
      service:  (form.service   || {value:''}).value,
      message:  (form.message   || {value:''}).value.trim(),
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      alert('Thank you! We\'ll be in touch within 24 hours.');
      form.reset();
    } catch {
      alert('Something went wrong. Please email us at teamstudiqoo@gmail.com');
    } finally {
      btn.textContent = orig; btn.disabled = false;
    }
  });
}


// ── "How We Work" — Continuous Journey (GSAP ScrollTrigger) ─
(function () {
  const rail = document.getElementById('workflowRail');
  const traveler = document.getElementById('wfTraveler');
  if (!rail || !traveler || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const steps = Array.from(rail.querySelectorAll('.wf-step'));
  if (!steps.length) return;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReduced) {
    // No motion: just mark every step as reached, statically.
    steps.forEach(s => s.classList.add('done'));
    return;
  }

  function isMobileRail() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  let activeIndex = -1;
  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
      s.classList.toggle('done', i < index);
    });
  }

  // The traveler is positioned with plain CSS (left/top set once, statically)
  // and moved purely via a GPU-composited transform — never left/top on
  // every scroll tick, which is what was causing the stutter.
  function travelerTarget(progress) {
    const mobile = isMobileRail();
    const railBox = rail.getBoundingClientRect();
    if (mobile) {
      return { x: 0, y: railBox.height * progress };
    }
    const usable = railBox.width * 0.84; // matches the rail line's 8%/92% inset
    return { x: usable * progress, y: 0 };
  }

  rail.classList.add('journey-ready');
  gsap.set(traveler, travelerTarget(0));
  setActive(0);

  ScrollTrigger.create({
    trigger: rail,
    start: 'top 80%',
    end: 'bottom 60%',
    scrub: 1.1, // a touch more lag = reads as fluid rather than snapping to the scrollbar
    onUpdate: (self) => {
      const progress = self.progress;
      const target = travelerTarget(progress);
      // A short, overlapping tween per update keeps the dot gliding between
      // scroll ticks instead of teleporting on every event.
      gsap.to(traveler, { x: target.x, y: target.y, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
      const idx = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      setActive(idx);
    },
    onLeaveBack: () => { setActive(0); gsap.to(traveler, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' }); },
  });

  window.addEventListener('resize', () => {
    const st = ScrollTrigger.getAll().find(s => s.trigger === rail);
    gsap.set(traveler, travelerTarget(st ? st.progress : 0));
  });
})();


// ── Hero glow — subtle mouse-follow drift (desktop only) ────
(function () {
  const ring = document.querySelector('.hero-glow-ring');
  const hero = document.querySelector('.hero');
  if (!ring || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return; // skip touch devices

  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let raf = null;

  function loop() {
    curX += (targetX - curX) * 0.06;
    curY += (targetY - curY) * 0.06;
    ring.style.transform = `translate(calc(-50% + ${curX.toFixed(1)}px), calc(-50% + ${curY.toFixed(1)}px))`;
    raf = requestAnimationFrame(loop);
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    const MAX = 22; // px — kept subtle on purpose
    targetX = relX * MAX * 2;
    targetY = relY * MAX;
  });
  hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  raf = requestAnimationFrame(loop);
})();


// ── Hero flowing background — smooth JS-driven blobs (not CSS keyframes) ──
(function () {
  const canvas = document.getElementById('heroFlowBg');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let running = false;
  let raf = null;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  let w = 0, h = 0;
  let start = performance.now();

  // Blob definitions: each drifts along its own slow, independent sine path
  // so the motion never repeats in an obviously mechanical loop.
  const blobs = [
    { cx: .18, cy: .28, r: .38, hue: '--teal',  ax: .05, ay: .04, fx: .00021, fy: .00017, phase: 0 },
    { cx: .82, cy: .22, r: .34, hue: '--royal', ax: .04, ay: .05, fx: .00016, fy: .00023, phase: 2 },
    { cx: .50, cy: .85, r: .42, hue: '--purple',ax: .05, ay: .03, fx: .00019, fy: .00014, phase: 4 },
    { cx: .90, cy: .80, r: .28, hue: '--teal',  ax: .03, ay: .04, fx: .00024, fy: .00020, phase: 1 },
  ];

  function themeColor(varName, alpha) {
    const hex = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    // hex like #22D3EE — convert to rgba with our own alpha for blending control
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    if (Number.isNaN(r)) return `rgba(100,140,255,${alpha})`;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function size() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = rect.width; h = rect.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  function draw(now) {
    if (!running) return;
    const t = now - start;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const alpha = window.matchMedia('(max-width: 768px)').matches ? .5 : .8;
    blobs.forEach(b => {
      const x = (b.cx + Math.sin(t * b.fx + b.phase) * b.ax) * w;
      const y = (b.cy + Math.cos(t * b.fy + b.phase) * b.ay) * h;
      const r = b.r * Math.max(w, h);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, themeColor(b.hue, alpha * .55));
      grad.addColorStop(1, themeColor(b.hue, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }

  function start_() { if (!running) { running = true; raf = requestAnimationFrame(draw); } }
  function stop_() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  size();
  start_();

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? start_() : stop_()));
  }, { threshold: 0.01 });
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop_(); else if (hero.getBoundingClientRect().bottom > 0) start_();
  });

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 200); });
})();


// ── Hero Particles (very light, canvas-based, hero-only) ──
(function () {
  const canvas = document.getElementById('heroParticles');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // Skip entirely — respect the user's motion preference.

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf = null;
  let running = false;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const COLORS = ['61,123,255', '34,211,238', '159,107,255'];
  const COUNT_PER_PX = 1 / 18000; // density scales gently with hero area
  const MAX_PARTICLES = 55;

  function sizeCanvas() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    return rect;
  }

  function makeParticle(rect, randomY) {
    return {
      x: Math.random() * rect.width,
      y: randomY ? Math.random() * rect.height : rect.height + Math.random() * 40,
      r: Math.random() * 1.6 + .6,
      speed: Math.random() * .25 + .08,
      drift: (Math.random() - .5) * .12,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: Math.random() * .35 + .12,
      twinkleSpeed: Math.random() * .015 + .005,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    const rect = sizeCanvas();
    const count = Math.min(MAX_PARTICLES, Math.max(18, Math.round(rect.width * rect.height * COUNT_PER_PX)));
    particles = Array.from({ length: count }, () => makeParticle(rect, true));
  }

  function step(t) {
    if (!running) return;
    const rect = { width: canvas.width / dpr, height: canvas.height / dpr };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      const twinkle = (Math.sin(t * p.twinkleSpeed + p.twinklePhase) + 1) / 2;
      if (p.y < -10) Object.assign(p, makeParticle(rect, false));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${(p.alpha * (0.5 + 0.5 * twinkle)).toFixed(3)})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  init();

  // Only animate while the hero is actually visible (scroll + tab visibility).
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => (e.isIntersecting ? start() : stop()));
  }, { threshold: 0.01 });
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (hero.getBoundingClientRect().bottom > 0) start();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
})();


// ── "Who We Help" selector — smooth fade transition on navigate ──
(function () {
  const links = document.querySelectorAll('[data-selector-link]');
  const overlay = document.getElementById('pageTransition');
  if (!links.length || !overlay) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || prefersReduced) return; // let it navigate immediately
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 380);
    });
  });
})();


// ── Back to Top ───────────────────────────────────────────
const topBtn = document.getElementById('topBtn');
if (topBtn) {
  window.addEventListener('scroll', () => {
    topBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}


// ── Theme Toggle (dark/light, persisted) ───────────────────
(function () {
  const THEME_KEY = 'studiqoo-theme';
  const root = document.documentElement;
  const navLogo = document.getElementById('navLogo');
  const mobileNavLogo = document.getElementById('mobileNavLogo');
  const toggles = [
    document.getElementById('themeToggle'),
    document.getElementById('mobThemeToggle')
  ].filter(Boolean);

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyLogos(theme) {
    // White logo reads on the dark theme; the original dark logo reads on light.
    const src = theme === 'light' ? 'assets/logo.png' : 'assets/logo-white.png';
    if (navLogo) navLogo.src = src;
    if (mobileNavLogo) mobileNavLogo.src = src;
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    applyLogos(theme);
    toggles.forEach(t => t.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false'));
    if (persist) storeTheme(theme);
  }

  // Initialize: respect a saved choice; otherwise keep the default (dark).
  const saved = getStoredTheme();
  setTheme(saved === 'light' || saved === 'dark' ? saved : currentTheme(), false);

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light', true);
    });
  });
})();

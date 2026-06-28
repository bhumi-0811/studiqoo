/* STUDIQOO v2 — Main JS */

// ── Mobile Menu ──────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

function openMenu() {
  mobileNav.classList.add('open');
  const i = hamburger.querySelector('i');
  if (i) i.className = 'fa-solid fa-xmark';
  document.body.style.overflow = '';
}

function closeMenu() {
  mobileNav.classList.remove('open');
  const i = hamburger.querySelector('i');
  if (i) i.className = 'fa-solid fa-bars';
  document.body.style.overflow = '';
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on any link click
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
  });

  // Close on scroll
  window.addEventListener('scroll', closeMenu, { passive: true });
}


// ── Navbar shadow on scroll ───────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.style.boxShadow = window.scrollY > 12
    ? '0 2px 20px rgba(14,47,118,.09)'
    : 'none';
}, { passive: true });


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


// ── Smooth Scroll ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
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


// ── Back to Top ───────────────────────────────────────────
const topBtn = document.getElementById('topBtn');
if (topBtn) {
  window.addEventListener('scroll', () => {
    topBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}
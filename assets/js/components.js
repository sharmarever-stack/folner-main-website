/**
 * Folner — Global Components
 * Single source of truth for Header, Footer, and Announce Bar.
 * Include this script on every page and these elements are injected automatically.
 *
 * Usage: <script src="assets/js/components.js"></script>
 * Place near </body> on every page.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     CSS — injected once into <head>
     All pages share these styles regardless of their own stylesheet.
  ───────────────────────────────────────────────────────────────── */
  var GLOBAL_CSS = `
/* ═══════════════════════════════════════
   FOLNER GLOBAL COMPONENTS — v1.0
   Header · Footer · Announce Bar
═══════════════════════════════════════ */

/* ── Announce Bar ── */
.folner-announce-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 9px 48px 9px 20px;
  background: rgba(3, 88, 247, 0.18);
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  border-bottom: 1px solid rgba(3, 88, 247, 0.3);
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.01em;
  height: 40px;
  transition: transform 300ms cubic-bezier(0.22,1,0.36,1), opacity 300ms ease;
}
.folner-announce-bar.hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}
.folner-announce-bar.announce--scrolled {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}
.folner-announce-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #56C2FF;
  box-shadow: 0 0 8px rgba(86, 194, 255, 0.8);
  flex-shrink: 0;
  animation: folnerAnnouncePulse 2s ease-in-out infinite;
}
@keyframes folnerAnnouncePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(86,194,255,0.8); }
  50%       { opacity: 0.6; box-shadow: 0 0 16px rgba(86,194,255,0.4); }
}
.folner-announce-text { flex: 1; text-align: center; }
.folner-announce-link {
  color: #56C2FF;
  text-decoration: none;
  font-weight: 600;
  transition: color 150ms ease;
}
.folner-announce-link:hover { color: #fff; }
.folner-announce-close {
  position: absolute;
  right: 14px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
  padding: 4px;
  line-height: 1;
  transition: color 150ms ease;
}
.folner-announce-close:hover { color: rgba(255, 255, 255, 0.9); }

/* ── Site Header ── */
.folner-site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 20px 28px;
  transition: top 300ms cubic-bezier(0.22,1,0.36,1),
              background 400ms ease,
              backdrop-filter 400ms ease,
              opacity 400ms ease,
              transform 400ms cubic-bezier(0.22,1,0.36,1);
  will-change: transform, opacity;
}
.folner-site-header.scrolled {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
}
.folner-site-header.header--hidden {
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
}
body.announce-visible .folner-site-header {
  top: 40px;
}
.folner-header-icon {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  text-decoration: none;
}
.folner-header-icon img {
  height: 28px;
  width: auto;
  display: block;
  object-fit: contain;
}
.folner-header-wordmark {
  display: inline-flex;
  align-items: center;
  justify-self: center;
  text-decoration: none;
}
.folner-header-wordmark img {
  height: 22px;
  width: auto;
  display: block;
  object-fit: contain;
}
.folner-burger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  justify-self: end;
  width: 32px; height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  outline: none;
}
.folner-burger-btn:focus-visible {
  outline: 1px solid rgba(255,255,255,0.3);
  outline-offset: 2px;
}
.folner-burger-btn span {
  display: block;
  width: 22px; height: 1.5px;
  background: #fff;
  border-radius: 999px;
  transform-origin: center;
  transition: transform 300ms cubic-bezier(0.22,1,0.36,1),
              opacity 200ms ease,
              width 300ms ease;
}
.folner-burger-btn[aria-expanded="true"] span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.folner-burger-btn[aria-expanded="true"] span:nth-child(2) {
  opacity: 0; width: 0;
}
.folner-burger-btn[aria-expanded="true"] span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* ── Menu Overlay ── */
.folner-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 18;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.96);
  backdrop-filter: blur(40px) saturate(1.4);
  -webkit-backdrop-filter: blur(40px) saturate(1.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 400ms cubic-bezier(0.22,1,0.36,1);
  will-change: opacity;
}
.folner-menu-overlay.open {
  opacity: 1;
  pointer-events: all;
}
.folner-menu-overlay::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; height: 1px;
  background: linear-gradient(90deg, transparent,
    rgba(198,121,196,0.4) 20%,
    rgba(86,194,255,0.35) 50%,
    rgba(89,212,153,0.3) 80%,
    transparent);
  opacity: 0;
  transition: opacity 600ms ease 300ms;
  pointer-events: none;
  margin-top: 180px;
}
.folner-menu-overlay.open::before { opacity: 1; }
.folner-menu-overlay::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center,
    rgba(198,121,196,0.04) 0%, transparent 70%);
  pointer-events: none;
}
.folner-menu-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  position: relative;
  z-index: 1;
}
.folner-menu-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 700;
  letter-spacing: -0.03em;
  transform: translateY(24px);
  opacity: 0;
  transition: transform 500ms cubic-bezier(0.22,1,0.36,1),
              opacity 500ms cubic-bezier(0.22,1,0.36,1),
              color 200ms ease,
              text-shadow 200ms ease;
}
.folner-menu-overlay.open .folner-menu-link {
  transform: translateY(0);
  opacity: 1;
}
.folner-menu-overlay.open .folner-menu-link:nth-child(1) { transition-delay: 80ms; }
.folner-menu-overlay.open .folner-menu-link:nth-child(2) { transition-delay: 140ms; }
.folner-menu-overlay.open .folner-menu-link:nth-child(3) { transition-delay: 200ms; }
.folner-menu-overlay.open .folner-menu-link:nth-child(4) { transition-delay: 260ms; }
.folner-menu-overlay.open .folner-menu-link:nth-child(5) { transition-delay: 320ms; }
.folner-menu-link:hover {
  color: #fff;
  text-shadow: 0 0 20px rgba(198,121,196,0.5), 0 0 40px rgba(198,121,196,0.2);
}

/* ── Site Footer ── */
.folner-site-footer {
  position: relative;
  z-index: 3;
  overflow: hidden;
  background: #000;
}
.folner-footer-canvas {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
}
.folner-footer-prism-bar {
  position: relative;
  z-index: 2;
  width: 100%; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(198,121,196,0.55) 12%,
    rgba(250,61,29,0.50) 28%,
    rgba(255,176,5,0.50) 50%,
    rgba(225,225,254,0.40) 68%,
    rgba(3,88,247,0.50) 85%,
    transparent 100%);
}
.folner-footer-inner {
  position: relative;
  z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 64px 52px;
}
.folner-footer-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 48px;
}
.folner-footer-wordmark-logo {
  height: 32px;
  width: auto;
  max-width: 200px;
  object-fit: contain;
  display: block;
  opacity: 0.85;
  transition: opacity 300ms ease;
}
.folner-footer-wordmark-logo:hover { opacity: 1; }
.folner-footer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-bottom: 64px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  text-align: center;
}
.folner-footer-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.72);
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  white-space: nowrap;
  transition: background 220ms ease, border-color 220ms ease, color 220ms ease;
}
.folner-footer-cta svg { width: 13px; height: 13px; flex-shrink: 0; }
.folner-footer-cta:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.22);
  color: #fff;
}
.folner-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 36px;
  gap: 24px;
  flex-wrap: wrap;
}
.folner-footer-nav-row {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}
.folner-footer-link {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.62);
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: color 150ms ease;
}
.folner-footer-link:hover { color: #fff; }
.folner-footer-nav-sep {
  width: 1px; height: 12px;
  background: rgba(255,255,255,0.18);
}
.folner-footer-copy {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.50);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .folner-footer-inner { padding: 60px 28px 40px; }
  .folner-footer-bottom { flex-direction: column; align-items: flex-start; gap: 16px; }
  .folner-footer-nav-row { gap: 18px; }
  .folner-site-header { padding: 16px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .folner-announce-dot { animation: none; }
  .folner-menu-link { transition: none; }
  .folner-site-header { transition: none; }
}
`;

  /* ─────────────────────────────────────────────────────────────────
     HTML TEMPLATES
  ───────────────────────────────────────────────────────────────── */

  var ANNOUNCE_BAR_HTML = `
<div class="folner-announce-bar" id="announceBar" role="complementary" aria-label="Announcement">
  <span class="folner-announce-dot" aria-hidden="true"></span>
  <span class="folner-announce-text">Folner is now hiring — we are building something remarkable — <a href="folner-careers-2.html" class="folner-announce-link">See open roles →</a></span>
  <button class="folner-announce-close" id="announceClose" aria-label="Dismiss announcement">✕</button>
</div>`;

  var HEADER_HTML = `
<header class="folner-site-header" id="siteHeader">
  <a class="folner-header-icon" href="index.html" aria-label="Folner home">
    <img src="assets/images/Folner_Icon_Dark_Logo-final.png" alt="Folner icon" fetchpriority="high" decoding="async">
  </a>
  <a class="folner-header-wordmark" href="index.html" aria-label="Folner">
    <img src="assets/images/Folner_Wordmark_Dark_Logo-final.png" alt="Folner" fetchpriority="high" decoding="async">
  </a>
  <button class="folner-burger-btn" id="burgerBtn" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</header>
<div class="folner-menu-overlay" id="menuOverlay" aria-hidden="true">
  <nav class="folner-menu-nav" aria-label="Site navigation">
    <a href="index.html" class="folner-menu-link">Home</a>
    <a href="folner-about-us.html" class="folner-menu-link">About</a>
    <a href="platforms-protocols.html" class="folner-menu-link">Platforms</a>
    <a href="folner-careers-2.html" class="folner-menu-link">Careers</a>
    <a href="folner-contact.html" class="folner-menu-link">Contact</a>
  </nav>
</div>`;

  var FOOTER_HTML = `
<footer class="folner-site-footer" id="siteFooter">
  <canvas class="folner-footer-canvas" id="footerCanvas" aria-hidden="true"></canvas>
  <div class="folner-footer-prism-bar" aria-hidden="true"></div>
  <div class="folner-footer-inner">
    <div class="folner-footer-logo-wrap">
      <img src="assets/images/Folner_Wordmark_Dark_Logo-final.png" alt="Folner" class="folner-footer-wordmark-logo" loading="lazy" decoding="async">
    </div>
    <div class="folner-footer-center">
      <a href="folner-careers-2.html" class="folner-footer-cta">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h8M7 3l4 4-4 4"/></svg>
        See open roles
      </a>
    </div>
    <div class="folner-footer-bottom">
      <nav class="folner-footer-nav-row" aria-label="Footer navigation">
        <a href="folner-about-us.html" class="folner-footer-link">About</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="platforms-protocols.html" class="folner-footer-link">Platforms</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="folner-careers-2.html" class="folner-footer-link">Careers</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="folner-contact.html" class="folner-footer-link">Contact</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="privacy.html" class="folner-footer-link">Privacy</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="terms.html" class="folner-footer-link">Terms</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="cookies.html" class="folner-footer-link">Cookies</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="security.html" class="folner-footer-link">Security</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="eula.html" class="folner-footer-link">EULA</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="gdpr.html" class="folner-footer-link">GDPR</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="data-deletion.html" class="folner-footer-link">Data Deletion</a>
        <div class="folner-footer-nav-sep" aria-hidden="true"></div>
        <a href="support.html" class="folner-footer-link">Support</a>
      </nav>
      <p class="folner-footer-copy">&copy; 2026 Folner, Inc. All rights reserved.</p>
    </div>
  </div>
</footer>`;

  /* ─────────────────────────────────────────────────────────────────
     INJECT CSS
  ───────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('folner-global-components-css')) return;
    var style = document.createElement('style');
    style.id = 'folner-global-components-css';
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────────────────────────
     INJECT HTML
     Note: Header and announce bar are in the HTML directly on all pages.
     components.js only injects the FOOTER (if missing) and wires interactions.
  ───────────────────────────────────────────────────────────────── */
  function injectComponents() {
    var body = document.body;

    // ── Footer only — inject if not already present ──
    if (!document.getElementById('siteFooter')) {
      var footerWrapper = document.createElement('div');
      footerWrapper.innerHTML = FOOTER_HTML.trim();
      body.appendChild(footerWrapper.firstElementChild);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     WIRE UP INTERACTIONS
  ───────────────────────────────────────────────────────────────── */
  function wireInteractions() {
    var header   = document.getElementById('siteHeader');
    var burger   = document.getElementById('burgerBtn');
    var overlay  = document.getElementById('menuOverlay');
    var announce = document.getElementById('announceBar');
    var announcClose = document.getElementById('announceClose');

    // ── Announce bar dismiss ──
    if (announcClose && announce) {
      announcClose.addEventListener('click', function () {
        announce.classList.add('hidden');
        if (header) {
          header.style.top = '0';
          body_removeAnnounceClass();
        }
        try { sessionStorage.setItem('folner_announce_dismissed', '1'); } catch(e) {}
      });
      // Restore dismissed state
      try {
        if (sessionStorage.getItem('folner_announce_dismissed') === '1') {
          announce.classList.add('hidden');
        } else {
          document.body.classList.add('announce-visible');
        }
      } catch(e) {
        document.body.classList.add('announce-visible');
      }
    }

    function body_removeAnnounceClass() {
      document.body.classList.remove('announce-visible');
    }

    // ── Header scroll behaviour ──
    if (header) {
      var lastScrollY = 0;
      window.addEventListener('scroll', function () {
        var sy = window.scrollY;
        // Add blur/background after scroll
        header.classList.toggle('scrolled', sy > 40);
        lastScrollY = sy;
      }, { passive: true });
    }

    // ── Burger / menu overlay ──
    if (burger && overlay) {
      burger.addEventListener('click', function () {
        var open = overlay.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
        overlay.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
      });

      overlay.querySelectorAll('.folner-menu-link').forEach(function (link) {
        link.addEventListener('click', function () {
          overlay.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
          overlay.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    }

    // ── Footer neural canvas ──
    var footerCanvas = document.getElementById('footerCanvas');
    if (footerCanvas) {
      animateFooterCanvas(footerCanvas);
    }

    // ── Highlight active nav link ──
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.folner-footer-link, .folner-menu-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.style.color = '#ffffff';
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     FOOTER NEURAL CANVAS (ambient neural network animation)
  ───────────────────────────────────────────────────────────────── */
  function animateFooterCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, nodes = [];
    var COLORS = [[198,121,196],[86,194,255],[89,212,153],[255,176,5]];

    function resize() {
      W = canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
      if (!nodes.length) init();
    }

    function init() {
      nodes = [];
      for (var i = 0; i < 40; i++) {
        var c = COLORS[Math.floor(Math.random() * COLORS.length)];
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.2 + 0.3,
          color: c
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx*dx + dy*dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(' + a.color[0] + ',' + a.color[1] + ',' + a.color[2] + ',' + (1 - d/120) * 0.12 + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + a.color[0] + ',' + a.color[1] + ',' + a.color[2] + ',0.35)';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    new ResizeObserver(resize).observe(canvas.parentElement || canvas);
    resize();
    draw();
  }

  /* ─────────────────────────────────────────────────────────────────
     INIT — run on DOMContentLoaded
  ───────────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    injectComponents();
    wireInteractions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

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

/* ── Visual Menu Overlay ── */
.folner-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: grid;
  grid-template-columns: 1fr 420px;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 380ms cubic-bezier(0.22,1,0.36,1);
  will-change: opacity;
  overflow: hidden;
}
.folner-menu-overlay.open {
  opacity: 1;
  pointer-events: all;
}
/* Left panel — navigation */
.folner-menu-left {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 72px;
  border-right: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}
/* Atmospheric glow behind nav */
.folner-menu-left::before {
  content: '';
  position: absolute;
  top: 50%; left: -100px;
  transform: translateY(-50%);
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center,
    rgba(198,121,196,0.08) 0%,
    rgba(86,194,255,0.04) 40%,
    transparent 70%);
  pointer-events: none;
}
/* Right panel — visual canvas */
.folner-menu-right {
  position: relative;
  background: #07080a;
  overflow: hidden;
}
.folner-menu-canvas {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  display: block;
}
/* Close button */
.folner-menu-close {
  position: absolute;
  top: 28px; right: 28px;
  z-index: 10;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.55);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 180ms, border-color 180ms, color 180ms;
}
.folner-menu-close:hover {
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.28);
  color: #fff;
}
/* Eyebrow */
.folner-menu-eyebrow {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.20);
  margin-bottom: 48px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 400ms ease, transform 400ms ease;
}
.folner-menu-overlay.open .folner-menu-eyebrow {
  opacity: 1; transform: translateY(0);
  transition-delay: 60ms;
}
/* Primary nav items */
.folner-menu-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 56px;
}
.folner-menu-item {
  display: block;
  text-decoration: none;
  padding: 14px 0;
  border-top: 1px solid rgba(255,255,255,0.04);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-32px);
  transition: opacity 500ms cubic-bezier(0.34,1.56,0.64,1),
              transform 500ms cubic-bezier(0.34,1.56,0.64,1);
  cursor: pointer;
}
.folner-menu-item:last-child { border-bottom: 1px solid rgba(255,255,255,0.04); }
.folner-menu-overlay.open .folner-menu-item { opacity: 1; transform: translateX(0); }
.folner-menu-overlay.open .folner-menu-item:nth-child(1) { transition-delay: 100ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(2) { transition-delay: 150ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(3) { transition-delay: 200ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(4) { transition-delay: 250ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(5) { transition-delay: 300ms; }
/* Hover sweep */
.folner-menu-item::before {
  content: '';
  position: absolute;
  left: -100%; top: 0; bottom: 0;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(198,121,196,0.04), transparent);
  transition: left 400ms ease;
}
.folner-menu-item:hover::before { left: 100%; }
/* Prism left edge on hover */
.folner-menu-item::after {
  content: '';
  position: absolute;
  left: -3px; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg,#C679C4,#56C2FF,#59D499,#FFB005);
  opacity: 0;
  transform: scaleY(0);
  transform-origin: top;
  transition: opacity 200ms, transform 300ms cubic-bezier(0.34,1.56,0.64,1);
}
.folner-menu-item:hover::after { opacity: 1; transform: scaleY(1); }
.folner-menu-item-label {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: clamp(28px, 4.5vw, 52px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: rgba(255,255,255,0.65);
  transition: color 180ms ease;
  display: block;
}
.folner-menu-item:hover .folner-menu-item-label { color: #fff; }
.folner-menu-item-desc {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 11.5px;
  color: rgba(255,255,255,0.22);
  margin-top: 4px;
  transition: color 180ms ease;
  display: block;
  letter-spacing: 0.01em;
}
.folner-menu-item:hover .folner-menu-item-desc { color: rgba(255,255,255,0.45); }
/* Bottom utility row */
.folner-menu-bottom {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 400ms ease, transform 400ms ease;
}
.folner-menu-overlay.open .folner-menu-bottom {
  opacity: 1; transform: translateY(0);
  transition-delay: 380ms;
}
.folner-menu-util-link {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.28);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 150ms;
}
.folner-menu-util-link:hover { color: rgba(255,255,255,0.65); }
.folner-menu-util-sep {
  width: 1px; height: 10px;
  background: rgba(255,255,255,0.12);
}
/* Right panel content */
.folner-menu-right-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 40px;
}
.folner-menu-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.50);
  margin-bottom: 16px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 400ms ease, transform 400ms ease;
}
.folner-menu-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: conic-gradient(#C679C4,#56C2FF,#59D499,#FFB005,#C679C4);
  animation: cDotSpin 4s linear infinite;
  flex-shrink: 0;
}
@keyframes cDotSpin { to { transform: rotate(360deg); } }
.folner-menu-overlay.open .folner-menu-badge {
  opacity: 1; transform: translateY(0);
  transition-delay: 340ms;
}
.folner-menu-right-label {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: rgba(255,255,255,0.70);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 400ms ease, transform 400ms ease;
}
.folner-menu-overlay.open .folner-menu-right-label {
  opacity: 1; transform: translateY(0);
  transition-delay: 380ms;
}
/* Responsive */
@media (max-width: 768px) {
  .folner-menu-overlay { grid-template-columns: 1fr; }
  .folner-menu-right { display: none; }
  .folner-menu-left { padding: 80px 32px 60px; }
  .folner-menu-close { top: 20px; right: 20px; }
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
/* ── Footer Multi-Column Layout ── */
.folner-footer-top {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 80px;
  align-items: start;
  padding-bottom: 64px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 36px;
}
.folner-footer-brand {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.folner-footer-tagline {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.32);
  line-height: 1.65;
  max-width: 220px;
}
.folner-footer-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}
.folner-footer-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.folner-footer-col-label {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.22);
  margin-bottom: 4px;
}
.folner-footer-link {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.50);
  text-decoration: none;
  letter-spacing: -0.005em;
  transition: color 150ms ease;
  width: fit-content;
}
.folner-footer-link:hover { color: rgba(255,255,255,0.90); }
.folner-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.folner-footer-copy {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.50);
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.folner-footer-legal-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.folner-footer-legal-link {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.30);
  text-decoration: none;
  transition: color 150ms ease;
}
.folner-footer-legal-link:hover { color: rgba(255,255,255,0.65); }
.folner-footer-dot {
  width: 2px; height: 2px;
  border-radius: 50%;
  background: rgba(255,255,255,0.20);
  display: inline-block;
}
@media (max-width: 900px) {
  .folner-footer-top { grid-template-columns: 1fr; gap: 48px; }
  .folner-footer-cols { grid-template-columns: repeat(2, 1fr); gap: 32px; }
}
@media (max-width: 600px) {
  .folner-footer-cols { grid-template-columns: 1fr 1fr; gap: 24px; }
  .folner-footer-inner { padding: 40px 24px 32px; }
}

@media (max-width: 768px) {
  .folner-site-header { padding: 16px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .folner-announce-dot { animation: none; }
  .folner-menu-item { transition: none; }
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
<div class="folner-menu-overlay" id="menuOverlay" role="dialog" aria-modal="true" aria-label="Site navigation" aria-hidden="true">
  <!-- Left: Navigation -->
  <div class="folner-menu-left">
    <button class="folner-menu-close" id="menuClose" aria-label="Close menu">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
      </svg>
    </button>
    <p class="folner-menu-eyebrow">Folner Navigation</p>
    <nav class="folner-menu-nav" aria-label="Site navigation">
      <a href="index.html" class="folner-menu-item">
        <span class="folner-menu-item-label">Home</span>
        <span class="folner-menu-item-desc">What if everything worked better?</span>
      </a>
      <a href="folner-about-us.html" class="folner-menu-item">
        <span class="folner-menu-item-label">About</span>
        <span class="folner-menu-item-desc">A small team with unreasonably high standards</span>
      </a>
      <a href="platforms-protocols.html" class="folner-menu-item">
        <span class="folner-menu-item-label">Platforms</span>
        <span class="folner-menu-item-desc">Every environment. Every standard.</span>
      </a>
      <a href="folner-careers-2.html" class="folner-menu-item">
        <span class="folner-menu-item-label">Careers</span>
        <span class="folner-menu-item-desc">We hire for impact, very carefully</span>
      </a>
      <a href="folner-contact.html" class="folner-menu-item">
        <span class="folner-menu-item-label">Contact</span>
        <span class="folner-menu-item-desc">We read every message personally</span>
      </a>
    </nav>
    <div class="folner-menu-bottom">
      <a href="privacy.html" class="folner-menu-util-link">Privacy</a>
      <span class="folner-menu-util-sep" aria-hidden="true"></span>
      <a href="terms.html" class="folner-menu-util-link">Terms</a>
      <span class="folner-menu-util-sep" aria-hidden="true"></span>
      <a href="support.html" class="folner-menu-util-link">Support</a>
      <span class="folner-menu-util-sep" aria-hidden="true"></span>
      <a href="gdpr.html" class="folner-menu-util-link">GDPR</a>
      <span class="folner-menu-util-sep" aria-hidden="true"></span>
      <a href="data-deletion.html" class="folner-menu-util-link">Data Deletion</a>
    </div>
  </div>
  <!-- Right: Visual panel -->
  <div class="folner-menu-right" aria-hidden="true">
    <canvas class="folner-menu-canvas" id="menuCanvas"></canvas>
    <div class="folner-menu-right-inner">
      <div class="folner-menu-badge">
        <span class="folner-menu-badge-dot"></span>
        Folner is hiring
      </div>
      <p class="folner-menu-right-label">Building software<br>that feels alive.</p>
    </div>
  </div>
</div>`;

  var FOOTER_HTML = `
<footer class="folner-site-footer" id="siteFooter">
  <canvas class="folner-footer-canvas" id="footerCanvas" aria-hidden="true"></canvas>
  <div class="folner-footer-prism-bar" aria-hidden="true"></div>
  <div class="folner-footer-inner">
    <div class="folner-footer-top">
      <!-- Brand column -->
      <div class="folner-footer-brand">
        <img src="assets/images/Folner_Wordmark_Dark_Logo-final.png" alt="Folner" class="folner-footer-wordmark-logo" loading="lazy" decoding="async">
        <p class="folner-footer-tagline">Challenging the status quo of digital product design.</p>
        <a href="folner-careers-2.html" class="folner-footer-cta">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h8M7 3l4 4-4 4"/></svg>
          See open roles
        </a>
      </div>
      <!-- Nav columns -->
      <div class="folner-footer-cols">
        <div class="folner-footer-col">
          <p class="folner-footer-col-label">Company</p>
          <a href="index.html" class="folner-footer-link">Home</a>
          <a href="folner-about-us.html" class="folner-footer-link">About</a>
          <a href="platforms-protocols.html" class="folner-footer-link">Platforms</a>
          <a href="folner-careers-2.html" class="folner-footer-link">Careers</a>
          <a href="folner-contact.html" class="folner-footer-link">Contact</a>
        </div>
        <div class="folner-footer-col">
          <p class="folner-footer-col-label">Legal</p>
          <a href="privacy.html" class="folner-footer-link">Privacy Policy</a>
          <a href="terms.html" class="folner-footer-link">Terms of Service</a>
          <a href="cookies.html" class="folner-footer-link">Cookie Policy</a>
          <a href="security.html" class="folner-footer-link">Security</a>
          <a href="eula.html" class="folner-footer-link">EULA</a>
        </div>
        <div class="folner-footer-col">
          <p class="folner-footer-col-label">Compliance</p>
          <a href="gdpr.html" class="folner-footer-link">GDPR</a>
          <a href="data-deletion.html" class="folner-footer-link">Data Deletion</a>
          <a href="support.html" class="folner-footer-link">Support</a>
        </div>
      </div>
    </div>
    <div class="folner-footer-bottom">
      <p class="folner-footer-copy">&copy; 2026 Folner, Inc. All rights reserved.</p>
      <div class="folner-footer-legal-row">
        <a href="privacy.html" class="folner-footer-legal-link">Privacy</a>
        <span class="folner-footer-dot" aria-hidden="true"></span>
        <a href="terms.html" class="folner-footer-legal-link">Terms</a>
        <span class="folner-footer-dot" aria-hidden="true"></span>
        <a href="support.html" class="folner-footer-legal-link">Support</a>
      </div>
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

      // Wire close button
      var closeBtn = document.getElementById('menuClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          overlay.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      }

      // Close on nav item click
      overlay.querySelectorAll('.folner-menu-item').forEach(function (link) {
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

      // Animate menu canvas
      var menuCanvas = document.getElementById('menuCanvas');
      if (menuCanvas) {
        animateMenuCanvas(menuCanvas);
      }
    }

    // ── Footer neural canvas ──
    var footerCanvas = document.getElementById('footerCanvas');
    if (footerCanvas) {
      animateFooterCanvas(footerCanvas);
    }

    // ── Highlight active nav link ──
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.folner-footer-link, .folner-menu-item').forEach(function (link) {
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
     MENU NEURAL CANVAS (ambient neural network animation for menu panel)
  ───────────────────────────────────────────────────────────────── */
  function animateMenuCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, nodes = [], t = 0;
    var COLORS = [[198,121,196],[86,194,255],[89,212,153],[255,176,5],[160,80,255]];

    function resize() {
      W = canvas.width  = canvas.offsetWidth  || 420;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
      if (!nodes.length) init();
    }

    function init() {
      nodes = [];
      for (var i = 0; i < 55; i++) {
        var c = COLORS[Math.floor(Math.random() * COLORS.length)];
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.8 + 0.5,
          p: Math.random() * Math.PI * 2,
          ps: Math.random() * 0.012 + 0.006,
          color: c
        });
      }
    }

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);
      // Atmospheric gradient
      var grd = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.4, W*0.8);
      grd.addColorStop(0, 'rgba(198,121,196,0.06)');
      grd.addColorStop(0.5, 'rgba(86,194,255,0.03)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      nodes.forEach(function(n) {
        n.x += n.vx; n.y += n.vy; n.p += n.ps;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      for (var i = 0; i < nodes.length; i++) {
        for (var j = i+1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x-b.x, dy = a.y-b.y, d = Math.sqrt(dx*dx+dy*dy);
          if (d < 130) {
            var alpha = (1 - d/130) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba('+a.color[0]+','+a.color[1]+','+a.color[2]+','+alpha+')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(function(n) {
        var pulse = 0.5 + 0.5*Math.sin(n.p);
        var alpha = 0.3 + 0.4*pulse;
        var r = n.r * (1 + 0.3*pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba('+n.color[0]+','+n.color[1]+','+n.color[2]+','+alpha+')';
        ctx.fill();
      });

      // Traveling orbs
      var orbs = [
        {cx: W*0.3, cy: H*0.25, r: 180, c: '198,121,196'},
        {cx: W*0.7, cy: H*0.65, r: 220, c: '86,194,255'},
        {cx: W*0.5, cy: H*0.5,  r: 160, c: '160,80,255'}
      ];
      orbs.forEach(function(o, i) {
        var ox = o.cx + Math.sin(t/300 + i*1.8)*60;
        var oy = o.cy + Math.cos(t/400 + i*1.4)*40;
        var breathe = 0.10 + 0.06*Math.sin(t/200 + i);
        var og = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        og.addColorStop(0, 'rgba('+o.c+','+breathe+')');
        og.addColorStop(0.5, 'rgba('+o.c+','+(breathe*0.4)+')');
        og.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI*2);
        ctx.fillStyle = og;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    new ResizeObserver(resize).observe(canvas.parentElement || canvas);
    resize();
    draw();
  }

  /* ─────────────────────────────────────────────────────────────────
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

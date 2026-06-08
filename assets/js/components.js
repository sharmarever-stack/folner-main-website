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
   FOLNER GLOBAL COMPONENTS — v2.0
   Header · Sidebar Drawer Menu · Footer · Announce Bar
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

/* ── Sidebar Drawer Menu ── */
.folner-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 498;
  background: rgba(0,0,0,0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  pointer-events: none;
  transition: background 420ms ease, backdrop-filter 420ms ease;
}
.folner-menu-backdrop.open {
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: all;
}
.folner-menu-overlay {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 440px;
  max-width: 100vw;
  z-index: 499;
  background: #05060a;
  border-left: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 420ms cubic-bezier(0.22,1,0.36,1);
  will-change: transform;
  overflow: hidden;
}
.folner-menu-overlay.open {
  transform: translateX(0);
}
/* Neural canvas fills the drawer */
.folner-menu-canvas {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  display: block;
  pointer-events: none;
  z-index: 0;
}
/* Prism top accent */
.folner-menu-prism {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1.5px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(198,121,196,0.60) 20%,
    rgba(86,194,255,0.55) 50%,
    rgba(89,212,153,0.50) 80%,
    transparent 100%);
  z-index: 2;
}
/* Scrollable inner content */
.folner-menu-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow-y: auto;
  scrollbar-width: none;
}
.folner-menu-inner::-webkit-scrollbar { display: none; }
/* Top bar: wordmark + close */
.folner-menu-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}
.folner-menu-topbar-wordmark {
  height: 18px;
  width: auto;
  opacity: 0.75;
  display: block;
  object-fit: contain;
}
.folner-menu-close {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.55);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 180ms, border-color 180ms, color 180ms;
  flex-shrink: 0;
}
.folner-menu-close:hover {
  background: rgba(255,255,255,0.09);
  border-color: rgba(255,255,255,0.22);
  color: #fff;
}
/* Nav section */
.folner-menu-nav-section {
  padding: 32px 28px 24px;
  flex-shrink: 0;
}
.folner-menu-section-label {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.18);
  margin-bottom: 16px;
  display: block;
}
.folner-menu-nav {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.folner-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateX(24px);
  transition: opacity 450ms cubic-bezier(0.34,1.56,0.64,1),
              transform 450ms cubic-bezier(0.34,1.56,0.64,1);
  cursor: pointer;
  gap: 12px;
}
.folner-menu-item:first-child { border-top: 1px solid rgba(255,255,255,0.04); }
.folner-menu-overlay.open .folner-menu-item { opacity: 1; transform: translateX(0); }
.folner-menu-overlay.open .folner-menu-item:nth-child(1) { transition-delay: 80ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(2) { transition-delay: 130ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(3) { transition-delay: 180ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(4) { transition-delay: 230ms; }
.folner-menu-overlay.open .folner-menu-item:nth-child(5) { transition-delay: 280ms; }
/* Left prism accent bar on hover */
.folner-menu-item::before {
  content: '';
  position: absolute;
  left: -3px; top: 8px; bottom: 8px;
  width: 3px;
  background: linear-gradient(180deg,#C679C4,#56C2FF,#59D499);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center;
  transition: opacity 200ms, transform 280ms cubic-bezier(0.34,1.56,0.64,1);
}
.folner-menu-item:hover::before { opacity: 1; transform: scaleY(1); }
.folner-menu-item-text { flex: 1; }
.folner-menu-item-label {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: rgba(255,255,255,0.65);
  transition: color 160ms ease;
  display: block;
  line-height: 1.2;
}
.folner-menu-item:hover .folner-menu-item-label { color: #fff; }
.folner-menu-item-desc {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.22);
  margin-top: 2px;
  display: block;
  transition: color 160ms ease;
}
.folner-menu-item:hover .folner-menu-item-desc { color: rgba(255,255,255,0.42); }
/* Arrow indicator */
.folner-menu-item-arrow {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.20);
  flex-shrink: 0;
  transition: border-color 160ms, color 160ms, transform 200ms;
}
.folner-menu-item:hover .folner-menu-item-arrow {
  border-color: rgba(255,255,255,0.20);
  color: rgba(255,255,255,0.65);
  transform: translate(2px,-2px);
}
/* Divider */
.folner-menu-divider {
  margin: 4px 28px;
  height: 1px;
  background: rgba(255,255,255,0.05);
  flex-shrink: 0;
}
/* Legal links section */
.folner-menu-legal {
  padding: 16px 28px 20px;
  flex-shrink: 0;
}
.folner-menu-legal-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.folner-menu-legal-link {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.24);
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 150ms;
}
.folner-menu-legal-link:hover { color: rgba(255,255,255,0.60); }
/* Bottom badge */
.folner-menu-footer {
  margin-top: auto;
  padding: 20px 28px 28px;
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 400ms ease, transform 400ms ease;
}
.folner-menu-overlay.open .folner-menu-footer {
  opacity: 1; transform: translateY(0);
  transition-delay: 360ms;
}
.folner-menu-footer-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: conic-gradient(#C679C4,#56C2FF,#59D499,#FFB005,#C679C4);
  animation: folnerMenuDotSpin 4s linear infinite;
  flex-shrink: 0;
}
@keyframes folnerMenuDotSpin { to { filter: hue-rotate(360deg); } }
.folner-menu-footer-text {
  font-family: 'Inter', ui-sans-serif, sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.28);
  letter-spacing: 0.01em;
}
@media (max-width: 480px) {
  .folner-menu-overlay { width: 100%; border-left: none; }
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

/* ── Footer Improved ── */
.folner-footer-inner {
  position: relative;
  z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 72px 64px 48px;
}
.folner-footer-statement-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 56px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 52px;
}
.folner-footer-brand {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 340px;
}
.folner-footer-wordmark-logo {
  height: 26px;
  width: auto;
  max-width: 160px;
  object-fit: contain;
  display: block;
  opacity: 0.80;
  transition: opacity 300ms ease;
}
.folner-footer-wordmark-logo:hover { opacity: 1; }
.folner-footer-tagline {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.28);
  line-height: 1.72;
}
.folner-footer-cta-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}
.folner-footer-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: background 220ms ease, border-color 220ms ease, color 220ms ease;
}
.folner-footer-cta svg { width: 12px; height: 12px; flex-shrink: 0; }
.folner-footer-cta--primary {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.85);
}
.folner-footer-cta--primary:hover {
  background: rgba(255,255,255,0.13);
  border-color: rgba(255,255,255,0.25);
  color: #fff;
}
.folner-footer-cta--ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.40);
}
.folner-footer-cta--ghost:hover {
  border-color: rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.70);
}
.folner-footer-cols-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 48px;
}
.folner-footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.folner-footer-col-label {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.18);
  margin-bottom: 4px;
}
.folner-footer-link {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.42);
  text-decoration: none;
  letter-spacing: -0.005em;
  transition: color 140ms ease;
  width: fit-content;
}
.folner-footer-link:hover { color: rgba(255,255,255,0.85); }
.folner-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.05);
  gap: 16px;
  flex-wrap: wrap;
}
.folner-footer-copy {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.01em;
}
.folner-footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 12px;
}
.folner-footer-bottom-link {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.22);
  text-decoration: none;
  transition: color 140ms ease;
}
.folner-footer-bottom-link:hover { color: rgba(255,255,255,0.55); }
.folner-footer-bottom-sep {
  width: 2px; height: 2px;
  border-radius: 50%;
  background: rgba(255,255,255,0.16);
  display: inline-block;
}
@media (max-width: 900px) {
  .folner-footer-statement-row { flex-direction: column; gap: 32px; }
  .folner-footer-cta-group { align-items: flex-start; }
  .folner-footer-cols-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .folner-footer-inner { padding: 56px 32px 40px; }
}
@media (max-width: 600px) {
  .folner-footer-cols-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
  .folner-footer-inner { padding: 44px 20px 32px; }
  .folner-footer-bottom { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 768px) {
  .folner-site-header { padding: 16px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .folner-announce-dot { animation: none; }
  .folner-menu-item { transition: none; }
  .folner-site-header { transition: none; }
  .folner-menu-footer-dot { animation: none; }
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
<div class="folner-menu-backdrop" id="menuBackdrop" aria-hidden="true"></div>
<div class="folner-menu-overlay" id="menuOverlay" role="dialog" aria-modal="true" aria-label="Site navigation" aria-hidden="true">
  <canvas class="folner-menu-canvas" id="menuCanvas" aria-hidden="true"></canvas>
  <div class="folner-menu-prism" aria-hidden="true"></div>
  <div class="folner-menu-inner">
    <!-- Top bar -->
    <div class="folner-menu-topbar">
      <img src="assets/images/Folner_Wordmark_Dark_Logo-final.png" alt="Folner" class="folner-menu-topbar-wordmark">
      <button class="folner-menu-close" id="menuClose" aria-label="Close menu">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
        </svg>
      </button>
    </div>
    <!-- Main nav -->
    <div class="folner-menu-nav-section">
      <span class="folner-menu-section-label">Navigation</span>
      <nav class="folner-menu-nav" aria-label="Site navigation">
        <a href="index.html" class="folner-menu-item">
          <div class="folner-menu-item-text">
            <span class="folner-menu-item-label">Home</span>
            <span class="folner-menu-item-desc">What if everything worked better?</span>
          </div>
          <span class="folner-menu-item-arrow" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l6-6M4 2h4v4"/></svg>
          </span>
        </a>
        <a href="folner-about-us.html" class="folner-menu-item">
          <div class="folner-menu-item-text">
            <span class="folner-menu-item-label">About</span>
            <span class="folner-menu-item-desc">A small team. Unreasonably high standards.</span>
          </div>
          <span class="folner-menu-item-arrow" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l6-6M4 2h4v4"/></svg>
          </span>
        </a>
        <a href="platforms-protocols.html" class="folner-menu-item">
          <div class="folner-menu-item-text">
            <span class="folner-menu-item-label">Platforms</span>
            <span class="folner-menu-item-desc">Every environment. Every standard.</span>
          </div>
          <span class="folner-menu-item-arrow" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l6-6M4 2h4v4"/></svg>
          </span>
        </a>
        <a href="folner-careers-2.html" class="folner-menu-item">
          <div class="folner-menu-item-text">
            <span class="folner-menu-item-label">Careers</span>
            <span class="folner-menu-item-desc">We hire for impact. Very carefully.</span>
          </div>
          <span class="folner-menu-item-arrow" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l6-6M4 2h4v4"/></svg>
          </span>
        </a>
        <a href="folner-contact.html" class="folner-menu-item">
          <div class="folner-menu-item-text">
            <span class="folner-menu-item-label">Contact</span>
            <span class="folner-menu-item-desc">We read every message personally.</span>
          </div>
          <span class="folner-menu-item-arrow" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l6-6M4 2h4v4"/></svg>
          </span>
        </a>
      </nav>
    </div>
    <!-- Divider -->
    <div class="folner-menu-divider" aria-hidden="true"></div>
    <!-- Legal links -->
    <div class="folner-menu-legal">
      <span class="folner-menu-section-label">Legal &amp; Compliance</span>
      <div class="folner-menu-legal-grid">
        <a href="privacy.html" class="folner-menu-legal-link">Privacy</a>
        <a href="terms.html" class="folner-menu-legal-link">Terms</a>
        <a href="cookies.html" class="folner-menu-legal-link">Cookies</a>
        <a href="security.html" class="folner-menu-legal-link">Security</a>
        <a href="eula.html" class="folner-menu-legal-link">EULA</a>
        <a href="gdpr.html" class="folner-menu-legal-link">GDPR</a>
        <a href="data-deletion.html" class="folner-menu-legal-link">Data Deletion</a>
        <a href="support.html" class="folner-menu-legal-link">Support</a>
      </div>
    </div>
    <!-- Bottom badge -->
    <div class="folner-menu-footer">
      <span class="folner-menu-footer-dot"></span>
      <span class="folner-menu-footer-text">Folner is now hiring. We are building something remarkable.</span>
    </div>
  </div>
</div>`;

  var FOOTER_HTML = `
<footer class="folner-site-footer" id="siteFooter">
  <canvas class="folner-footer-canvas" id="footerCanvas" aria-hidden="true"></canvas>
  <div class="folner-footer-prism-bar" aria-hidden="true"></div>
  <div class="folner-footer-inner">
    <!-- Statement row -->
    <div class="folner-footer-statement-row">
      <div class="folner-footer-brand">
        <img src="assets/images/Folner_Wordmark_Dark_Logo-final.png" alt="Folner" class="folner-footer-wordmark-logo" loading="lazy" decoding="async">
        <p class="folner-footer-tagline">Challenging the status quo of digital product design. What if everything worked better?</p>
      </div>
      <div class="folner-footer-cta-group">
        <a href="folner-careers-2.html" class="folner-footer-cta folner-footer-cta--primary">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h8M7 3l4 4-4 4"/></svg>
          See open roles
        </a>
        <a href="folner-contact.html" class="folner-footer-cta folner-footer-cta--ghost">
          Get in touch
        </a>
      </div>
    </div>
    <!-- Column grid -->
    <div class="folner-footer-cols-grid">
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
    <!-- Bottom bar -->
    <div class="folner-footer-bottom">
      <p class="folner-footer-copy">&copy; 2026 Folner, Inc. All rights reserved.</p>
      <div class="folner-footer-bottom-links">
        <a href="privacy.html" class="folner-footer-bottom-link">Privacy</a>
        <span class="folner-footer-bottom-sep" aria-hidden="true"></span>
        <a href="terms.html" class="folner-footer-bottom-link">Terms</a>
        <span class="folner-footer-bottom-sep" aria-hidden="true"></span>
        <a href="support.html" class="folner-footer-bottom-link">Support</a>
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
     Footer is injected if missing. Old inline footers (.site-footer)
     are replaced so all pages render the unified component footer.
  ───────────────────────────────────────────────────────────────── */
  function injectComponents() {
    var body = document.body;

    // Remove old inline footer styles if present (they used .site-footer not .folner-site-footer)
    var oldFooter = document.querySelector('.site-footer:not(.folner-site-footer)');
    if (oldFooter) { oldFooter.remove(); }
    // Also remove any footer with id="siteFooter" that is NOT the component footer
    var oldById = document.getElementById('siteFooter');
    if (oldById && !oldById.classList.contains('folner-site-footer')) { oldById.remove(); }

    // Inject footer if not already present
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
    var header       = document.getElementById('siteHeader');
    var burger       = document.getElementById('burgerBtn');
    var overlay      = document.getElementById('menuOverlay');
    var announce     = document.getElementById('announceBar');
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
      window.addEventListener('scroll', function () {
        var sy = window.scrollY;
        header.classList.toggle('scrolled', sy > 40);
      }, { passive: true });
    }

    // ── Burger / sidebar menu ──
    if (burger && overlay) {
      var backdrop = document.getElementById('menuBackdrop');

      function openMenu() {
        overlay.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        burger.setAttribute('aria-expanded', 'true');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeMenu() {
        overlay.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      burger.addEventListener('click', function () {
        if (overlay.classList.contains('open')) { closeMenu(); } else { openMenu(); }
      });

      if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
      }

      var closeBtn = document.getElementById('menuClose');
      if (closeBtn) { closeBtn.addEventListener('click', closeMenu); }

      overlay.querySelectorAll('.folner-menu-item').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) { closeMenu(); }
      });

      // Animate menu canvas
      var menuCanvas = document.getElementById('menuCanvas');
      if (menuCanvas) { animateMenuCanvas(menuCanvas); }
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
     MENU NEURAL CANVAS (ambient neural network animation for drawer)
  ───────────────────────────────────────────────────────────────── */
  function animateMenuCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, nodes = [], t = 0;
    var COLORS = [[198,121,196],[86,194,255],[89,212,153],[255,176,5],[160,80,255]];

    function resize() {
      W = canvas.width  = canvas.offsetWidth  || 440;
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
     INIT
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

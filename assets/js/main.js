// ════════════════════════════════════════════════════════════════════════════
// FOLNER — Cinematic Canvas Architecture
// One continuous visual journey, never stops, never toggles
// ════════════════════════════════════════════════════════════════════════════

// ── Global Scroll Progress ─────────────────────────────────────────────────
window._folnerScrollProgress = 0;
(function () {
  'use strict';
  function updateScroll() {
    var max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    window._folnerScrollProgress = Math.max(0, Math.min(1, window.scrollY / max));
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
})();

// ── Shared utilities ───────────────────────────────────────────────────────
window._folnerUtil = {
  smoothstep: function (lo, hi, x) {
    var t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
    return t * t * (3 - 2 * t);
  },
  lerp: function (a, b, t) { return a + (b - a) * t; },
  easeOut3: function (t) { return 1 - Math.pow(1 - t, 3); },
  easeInOut: function (t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
};

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL NEURAL CANVAS — Single persistent WebGL2 background for entire page
// Morphs continuously based on scroll progress (u_scroll 0→1)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var canvas = document.getElementById('globalNeural');
  if (!canvas) return;

  var GLOBAL_VS = '#version 300 es\nin vec2 a_pos;\nvoid main(){ gl_Position = vec4(a_pos,0.0,1.0); }';

  var GLOBAL_FS = [
    '#version 300 es',
    'precision highp float;',
    'uniform vec2  u_res;',
    'uniform float u_time;',
    'uniform float u_scroll;',
    'uniform vec2  u_mouse;',
    'uniform float u_active;',
    'out vec4 fragColor;',
    '',
    'vec3 m289(vec3 x){ return x-floor(x*(1.0/289.0))*289.0; }',
    'vec4 m289v(vec4 x){ return x-floor(x*(1.0/289.0))*289.0; }',
    'vec4 perm(vec4 x){ return m289v(((x*34.0)+1.0)*x); }',
    'vec4 tiSq(vec4 r){ return 1.79284291400159-0.85373472095314*r; }',
    'float snoise(vec3 v){',
    '  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);',
    '  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);',
    '  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;',
    '  vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);',
    '  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;',
    '  i=m289(i);',
    '  vec4 p=perm(perm(perm(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));',
    '  vec3 ns=(1.0/7.0)*D.wyz-D.xzx;',
    '  vec4 j=p-49.0*floor(p*ns.z*ns.z);',
    '  vec4 xv=floor(j*ns.z);vec4 yv=floor(j-7.0*xv);',
    '  xv=xv*ns.x+ns.yyyy;yv=yv*ns.x+ns.yyyy;vec4 h=1.0-abs(xv)-abs(yv);',
    '  vec4 b0=vec4(xv.xy,yv.xy);vec4 b1=vec4(xv.zw,yv.zw);',
    '  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;',
    '  vec4 sh=-step(h,vec4(0.0));',
    '  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
    '  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);',
    '  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);',
    '  vec4 norm=tiSq(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
    '  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;',
    '  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);',
    '  m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
    '}',
    '',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_res; uv.y=1.0-uv.y;',
    '  float t=u_time*0.28;',
    '  float s=u_scroll;',
    '',
    '  // Brand palette — design system tokens',
    '  vec3 black  = vec3(0.000,0.000,0.000);',
    '  vec3 rose   = vec3(0.776,0.475,0.769);',
    '  vec3 blue   = vec3(0.012,0.533,0.969);',
    '  vec3 mint   = vec3(0.349,0.831,0.600);',
    '  vec3 amber  = vec3(1.000,0.690,0.020);',
    '  vec3 cyan   = vec3(0.337,0.761,1.000);',
    '  vec3 purple = vec3(0.627,0.314,1.000);',
    '',
    '  vec3 col = black;',
    '',
    '  // Organic flowing bands — center path curves through 2D noise, not straight lines',
    '  float md = length(uv - u_mouse);',
    '  float warp = u_active * exp(-md*md*8.0) * 0.10;',
    '',
    '  // Each band has a curved center: base y + large-scale noise displacement along x',
    '  float cA = 0.14 + snoise(vec3(uv.x*0.9 + t*0.14, t*0.07, 0.0))*0.18 + sin(t*0.11)*0.06 + warp;',
    '  float cB = 0.32 + snoise(vec3(uv.x*1.1 - t*0.11, t*0.08, 1.2))*0.20 + sin(t*0.09+1.2)*0.07 + warp*0.8;',
    '  float cC = 0.52 + snoise(vec3(uv.x*0.8 + t*0.16, t*0.10, 2.4))*0.16 + sin(t*0.13+2.4)*0.07 + warp*0.6;',
    '  float cD = 0.70 + snoise(vec3(uv.x*1.3 - t*0.13, t*0.06, 0.8))*0.14 + sin(t*0.10+0.8)*0.06 + warp*0.4;',
    '  float cE = 0.86 + snoise(vec3(uv.x*1.0 + t*0.12, t*0.09, 3.1))*0.10 + sin(t*0.12+3.1)*0.04;',
    '',
    '  float bwA=0.072; float bwB=0.060; float bwC=0.068; float bwD=0.052; float bwE=0.058;',
    '',
    '  // Width also modulated by noise — bands breathe and pinch as they curve',
    '  float nA = snoise(vec3(uv.x*2.4+t*0.18, uv.y*0.8, t*0.09));',
    '  float nB = snoise(vec3(uv.x*3.1-t*0.14, uv.y*0.9, t*0.11));',
    '  float nC = snoise(vec3(uv.x*1.8+t*0.21, uv.y*1.0, t*0.07));',
    '  float nD = snoise(vec3(uv.x*2.7+t*0.16, uv.y*0.7, t*0.10));',
    '  float nE = snoise(vec3(uv.x*2.0-t*0.19, uv.y*0.9, t*0.08));',
    '',
    '  float dy = uv.y;',
    '  float bandA = exp(-(dy-cA)*(dy-cA)/(bwA*bwA*(1.0+nA*0.45))) * 0.46;',
    '  float bandB = exp(-(dy-cB)*(dy-cB)/(bwB*bwB*(1.0+nB*0.50))) * 0.40;',
    '  float bandC = exp(-(dy-cC)*(dy-cC)/(bwC*bwC*(1.0+nC*0.40))) * 0.44;',
    '  float bandD = exp(-(dy-cD)*(dy-cD)/(bwD*bwD*(1.0+nD*0.48))) * 0.38;',
    '  float bandE = exp(-(dy-cE)*(dy-cE)/(bwE*bwE*(1.0+nE*0.42))) * 0.36;',
    '',
    '  // Rich multi-color band mixing',
    '  col += rose   * bandA * 0.80;',
    '  col += purple * bandA * 0.40;',
    '  col += purple * bandB * 0.72;',
    '  col += blue   * bandB * 0.36;',
    '  col += cyan   * bandC * 0.60;',
    '  col += mint   * bandC * 0.44;',
    '  col += amber  * bandD * 0.56;',
    '  col += rose   * bandD * 0.28;',
    '  col += blue   * bandE * 0.52;',
    '  col += cyan   * bandE * 0.30;',
    '',
    '  // Diffuse ambient color field',
    '  float field  = snoise(vec3(uv.x*1.1+t*0.06, uv.y*0.9+t*0.04, t*0.05))*0.5+0.5;',
    '  float field2 = snoise(vec3(uv.x*0.8-t*0.05, uv.y*1.3+t*0.03, t*0.04))*0.5+0.5;',
    '  col += purple * pow(field,2.5)  * 0.14;',
    '  col += blue   * pow(field,3.5)  * 0.10;',
    '  col += rose   * pow(field2,3.0) * 0.10;',
    '  col += mint   * pow(field2,4.0) * 0.07;',
    '',
    '  // Cursor ripple — animated color ring, not brightness',
    '  float ripple = u_active * exp(-md*md*14.0) * sin(md*28.0 - t*6.0) * 0.14;',
    '  col += cyan   * ripple * 0.8;',
    '  col += purple * ripple * 0.5;',
    '  col += cyan * u_active * exp(-md*md*22.0) * 0.10;',
    '',
    '  // Filmic tone map — prevents harsh blown-out values',
    '  col = col / (col + vec3(0.52)) * 1.54;',
    '',
    '  // Vignette',
    '  float vig = 1.0 - smoothstep(0.18,0.85,length((uv-vec2(0.5))*vec2(1.0,0.90))*1.5);',
    '  col *= 0.12 + vig * 0.88;',
    '',
    '  // Subtle grain',
    '  col += snoise(vec3(gl_FragCoord.xy*0.50, t*10.0)) * 0.006;',
    '',
    '  // Fade on scroll',
    '  col = mix(col, black, smoothstep(0.08,0.26,s) * 0.94);',
    '',
    '  fragColor = vec4(clamp(col,0.0,1.0),1.0);',
    '}',
  ].join('\n');



  var gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  if (!gl) {
    canvas.style.background = 'radial-gradient(ellipse at 50% 40%, #321145 0%, #040506 70%)';
    return;
  }

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, GLOBAL_VS);
  var fs = compile(gl.FRAGMENT_SHADER, GLOBAL_FS);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    return;
  }
  gl.useProgram(prog);

  var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  var ap = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(ap);
  gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

  var uRes    = gl.getUniformLocation(prog, 'u_res');
  var uTime   = gl.getUniformLocation(prog, 'u_time');
  var uScroll = gl.getUniformLocation(prog, 'u_scroll');
  var uMouse  = gl.getUniformLocation(prog, 'u_mouse');
  var uActive = gl.getUniformLocation(prog, 'u_active');

  var smx = 0.5, smy = 0.5, act = 0;
  var ptr = { x: 0.5, y: 0.5, active: false };
  window.addEventListener('mousemove', function (e) {
    ptr.x = e.clientX / window.innerWidth;
    ptr.y = e.clientY / window.innerHeight;
    ptr.active = true;
  });
  window.addEventListener('mouseleave', function () { ptr.active = false; });

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(window.innerWidth  * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();
function frame(now) {
    smx += (ptr.x - smx) * 0.07;
    smy += (ptr.y - smy) * 0.07;
    act += ((ptr.active ? 1 : 0) - act) * 0.06;

    gl.uniform2f(uRes,    canvas.width, canvas.height);
    gl.uniform1f(uTime,   now * 0.001);
    gl.uniform1f(uScroll, window._folnerScrollProgress);
    gl.uniform2f(uMouse,  smx, smy);
    gl.uniform1f(uActive, act);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Hero: Burger Menu, Page Loader, Typing, Balloons, Hero WebGL
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ─── Burger Menu ─────────────────────────────────────────────────────────
  var burgerBtn   = document.getElementById('burgerBtn');
  var menuOverlay = document.getElementById('menuOverlay');
  document.querySelectorAll('.menu-link').forEach(function (l) {
    l.addEventListener('click', function () { toggleMenu(false); });
  });
  function toggleMenu(open) {
    var isOpen = open !== undefined ? open : burgerBtn.getAttribute('aria-expanded') !== 'true';
    burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuOverlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    menuOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  burgerBtn.addEventListener('click', function () { toggleMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleMenu(false); });

  // ─── Page Loader ─────────────────────────────────────────────────────────
  var pageLoader = document.getElementById('pageLoader');
  function dismissLoader() {
    if (!pageLoader || pageLoader.classList.contains('loaded')) return;
    pageLoader.classList.add('loaded');
    setTimeout(function () { pageLoader.style.display = 'none'; }, 1600);
  }
  // Fire on load; fallback fires 800ms after DOM ready so iframes/previews never get stuck
  window.addEventListener('load', function () { setTimeout(dismissLoader, 240); });
  setTimeout(dismissLoader, 800);

  // ─── Typing Effect ────────────────────────────────────────────────────────
  var typedEl     = document.getElementById('typedText');
  var bubbleLayer = document.getElementById('bubbleLayer');
  var phrases = [
    "Products don't feel outdated.",
    "Workflows don't create friction.",
    "Software didn't feel dead.",
    "Technology felt human.",
    "Tools didn't get in the way.",
    "Design improved understanding.",
    "Products didn't feel unfinished."
  ];
  var discoveryWords = [
    'Felt Alive','Made Sense','Moved Forward','More Clarity',
    'Less Friction','Built Better','Stay Focused','Quality Matters',
    'Purpose First','Worth Using','Designed To Flow','Built To Last'
  ];
  var visibleBubbleWords = new Set();
  var phraseIdx = 0, charIdx = 0, isDeleting = false, lastBubble = 0;

  function typeLoop() {
    var cur = phrases[phraseIdx];
    if (!isDeleting) {
      charIdx++;
      typedEl.textContent = cur.slice(0, charIdx);
      if (charIdx === cur.length) {
        setTimeout(function () { isDeleting = true; typeLoop(); }, 2100);
        return;
      }
      setTimeout(typeLoop, 52 + Math.random() * 18);
    } else {
      charIdx--;
      typedEl.textContent = cur.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeLoop, 420);
        return;
      }
      setTimeout(typeLoop, 26);
    }
  }

  // ─── Balloon Physics ─────────────────────────────────────────────────────
  var TINTS = [
    [198,121,196],[250,61,29],[255,176,5],[225,225,254],
    [3,88,247],[86,194,255],[89,212,153],[253,2,245]
  ];
  var tintIdx = 0;
  var balloons = [];

  function spawnBalloon(ox, oy) {
    if (balloons.length >= 5) return;
    var candidates = discoveryWords.filter(function (w) { return !visibleBubbleWords.has(w); });
    if (!candidates.length) return;
    var word = candidates[Math.floor(Math.random() * candidates.length)];
    visibleBubbleWords.add(word);
    var exW = Math.min(window.innerWidth * 0.38, 440);
    var exH = Math.min(window.innerHeight * 0.20, 180);
    var cxL = (window.innerWidth - exW) * 0.5;
    var cxT = (window.innerHeight - exH) * 0.5;
    var sx = ox, sy = oy;
    for (var i = 0; i < 12; i++) {
      var a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 90;
      sx = Math.min(Math.max(ox + Math.cos(a) * d, 16), window.innerWidth - 180);
      sy = Math.min(Math.max(oy + Math.sin(a) * d, 20), window.innerHeight - 70);
      if (!(sx > cxL && sx < cxL + exW && sy > cxT && sy < cxT + exH)) break;
    }
    var rise  = 120 + Math.random() * 140;
    var drift = (Math.random() < 0.5 ? 1 : -1) * (20 + Math.random() * 50);
    var P0 = { x: sx, y: sy };
    var P2 = { x: sx + drift, y: sy - rise };
    var P1 = { x: sx + drift * 0.35 + (Math.random() - 0.5) * 20, y: sy - rise * 0.55 + (Math.random() - 0.5) * 20 };
    var tint = TINTS[tintIdx % TINTS.length]; tintIdx++;
    var life = 3200 + Math.random() * 1600;
    var el = document.createElement('div');
    el.className = 'discovery-bubble';
    el.textContent = word;
    el.style.setProperty('--tr', tint[0]);
    el.style.setProperty('--tg', tint[1]);
    el.style.setProperty('--tb', tint[2]);
    el.style.transform = 'translate3d(' + sx + 'px,' + sy + 'px,0) scale(0.72)';
    el.style.opacity = '0';
    bubbleLayer.appendChild(el);
    balloons.push({ el: el, word: word, P0: P0, P1: P1, P2: P2, life: life, startTime: performance.now(), popping: false, done: false });
  }

  function bez(P0, P1, P2, t) {
    var mt = 1 - t;
    return { x: mt*mt*P0.x + 2*mt*t*P1.x + t*t*P2.x, y: mt*mt*P0.y + 2*mt*t*P1.y + t*t*P2.y };
  }
  function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOut4(t) { return 1 - Math.pow(1 - t, 4); }

  function tickBalloons(now) {
    for (var i = balloons.length - 1; i >= 0; i--) {
      var b = balloons[i];
      if (b.done) { balloons.splice(i, 1); continue; }
      var t = Math.min((now - b.startTime) / b.life, 1);
      if (t < 0.88) {
        var pos = bez(b.P0, b.P1, b.P2, easeOut3(t));
        var sc  = t < 0.08 ? 0.72 + 0.30 * (t / 0.08) : 1.02;
        var op  = t < 0.08 ? t / 0.08 : 1.0;
        b.el.style.transform = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0) scale(' + sc + ')';
        b.el.style.opacity   = op;
        b.el.style.filter    = 'blur(0px)';
      } else {
        if (!b.popping) { b.popping = true; b.popStart = now; b.popPos = bez(b.P0, b.P1, b.P2, easeOut3(0.88)); }
        var pt = Math.min((now - b.popStart) / 320, 1);
        var pe = easeOut4(pt);
        b.el.style.transform = 'translate3d(' + b.popPos.x + 'px,' + b.popPos.y + 'px,0) scale(' + (1.02 + 0.70 * pe) + ')';
        b.el.style.opacity   = 1 - pe;
        b.el.style.filter    = 'blur(' + (pe * 8) + 'px)';
        if (pt >= 1) {
          b.done = true;
          visibleBubbleWords.delete(b.word);
          if (b.el.parentNode) b.el.parentNode.removeChild(b.el);
        }
      }
    }
  }

  // ─── Pointer State ────────────────────────────────────────────────────────
  var ptr = { x: 0.5, y: 0.5, active: false };
  window.addEventListener('mousemove', function (e) {
    ptr.x = e.clientX / window.innerWidth;
    ptr.y = e.clientY / window.innerHeight;
    ptr.active = true;
    var now = performance.now();
    if (now - lastBubble > 400 && Math.random() < 0.50) {
      spawnBalloon(e.clientX, e.clientY);
      lastBubble = now;
    }
  });
  window.addEventListener('mouseleave', function () { ptr.active = false; });
  window.addEventListener('touchmove', function (e) {
    var touch = e.touches[0];
    ptr.x = touch.clientX / window.innerWidth;
    ptr.y = touch.clientY / window.innerHeight;
    ptr.active = true;
  }, { passive: true });

  // ─── Hero Wave Canvas (draws wave bands on top of global neural) ──────────
  var canvas = document.getElementById('neuralSurface');
  var smx = 0.5, smy = 0.5, act = 0;

  // Hero canvas: GLSL draws wave bands only (no solid background fill)
  var HERO_VS = '#version 300 es\nin vec2 a_pos;\nvoid main(){ gl_Position = vec4(a_pos,0.0,1.0); }';
  var HERO_FS = [
    '#version 300 es',
    'precision highp float;',
    'uniform vec2  u_res;',
    'uniform float u_time;',
    'uniform vec2  u_mouse;',
    'uniform float u_active;',
    'out vec4 fragColor;',
    'vec3 m289(vec3 x){ return x-floor(x*(1.0/289.0))*289.0; }',
    'vec4 m289v(vec4 x){ return x-floor(x*(1.0/289.0))*289.0; }',
    'vec4 perm(vec4 x){ return m289v(((x*34.0)+1.0)*x); }',
    'vec4 tiSq(vec4 r){ return 1.79284291400159-0.85373472095314*r; }',
    'float snoise(vec3 v){',
    '  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);',
    '  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);',
    '  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;',
    '  vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);',
    '  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;',
    '  i=m289(i);',
    '  vec4 p=perm(perm(perm(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));',
    '  vec3 ns=(1.0/7.0)*D.wyz-D.xzx;',
    '  vec4 j=p-49.0*floor(p*ns.z*ns.z);',
    '  vec4 xv=floor(j*ns.z);vec4 yv=floor(j-7.0*xv);',
    '  xv=xv*ns.x+ns.yyyy;yv=yv*ns.x+ns.yyyy;vec4 h=1.0-abs(xv)-abs(yv);',
    '  vec4 b0=vec4(xv.xy,yv.xy);vec4 b1=vec4(xv.zw,yv.zw);',
    '  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;',
    '  vec4 sh=-step(h,vec4(0.0));',
    '  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
    '  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);',
    '  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);',
    '  vec4 norm=tiSq(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
    '  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;',
    '  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);',
    '  m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
    '}',
    'float bnd(float y,float cy,float tk){ return exp(-0.5*pow((y-cy)/max(tk,0.001),2.0)); }',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_res; uv.y=1.0-uv.y;',
    '  float t=u_time*0.15;',
    '  vec3 rose=vec3(0.776,0.475,0.769);',
    '  vec3 flare=vec3(0.980,0.239,0.114);',
    '  vec3 amber=vec3(1.000,0.690,0.020);',
    '  vec3 ice=vec3(0.882,0.882,0.996);',
    '  vec3 signal=vec3(0.012,0.345,0.969);',
    '  vec3 cyan_c=vec3(0.337,0.761,1.000);',
    '  vec3 mint_c=vec3(0.349,0.831,0.600);',
    '  vec3 violet=vec3(0.322,0.188,0.569);',
    '  // Transparent base — global canvas shows through',
    '  vec3 col=vec3(0.0);',
    '  float alpha=0.0;',
    '  float pLift=u_active*(u_mouse.y-0.5)*0.055;',
    '  // Band 1 — rose/violet',
    '  float ph1=t*1.10+1.2+uv.x*8.4;',
    '  float pI1=u_active*exp(-pow((uv.x-u_mouse.x)/0.22,2.0))*(u_mouse.y-0.5)*0.08;',
    '  float wy1=0.19+sin(ph1)*0.08+cos(ph1*1.80)*0.022+pLift+pI1;',
    '  float b1=bnd(uv.y,wy1,0.064);',
    '  col+=mix(rose,violet,sin(ph1*0.28)*0.5+0.5)*b1*0.32;',
    '  alpha+=b1*0.32;',
    '  // Band 2 — flare/amber',
    '  float ph2=t*0.78+2.7+uv.x*7.8;',
    '  float wy2=0.34+sin(ph2)*0.07+cos(ph2*2.1+0.8)*0.018+pLift*0.6;',
    '  float b2=bnd(uv.y,wy2,0.042);',
    '  col+=mix(flare,amber,sin(ph2*0.35+0.5)*0.5+0.5)*b2*0.24;',
    '  alpha+=b2*0.24;',
    '  // Band 3 — amber/ice',
    '  float ph3=t*0.92+3.8+uv.x*8.4;',
    '  float pI3=u_active*exp(-pow((uv.x-u_mouse.x)/0.22,2.0))*(u_mouse.y-0.5)*0.08;',
    '  float wy3=0.47+sin(ph3)*0.10+cos(ph3*1.80+1.0)*0.026+pLift+pI3;',
    '  float b3=bnd(uv.y,wy3,0.072);',
    '  col+=mix(amber,ice,sin(ph3*0.40+1.0)*0.5+0.5)*b3*0.28;',
    '  alpha+=b3*0.28;',
    '  // Band 4 — signal/cyan',
    '  float ph4=t*1.02+5.1+uv.x*8.4;',
    '  float pI4=u_active*exp(-pow((uv.x-u_mouse.x)/0.22,2.0))*(u_mouse.y-0.5)*0.08;',
    '  float wy4=0.63+sin(ph4)*0.09+cos(ph4*1.80+2.1)*0.022+pLift+pI4;',
    '  float b4=bnd(uv.y,wy4,0.058);',
    '  col+=mix(signal,cyan_c,sin(ph4*0.30+2.0)*0.5+0.5)*b4*0.26;',
    '  alpha+=b4*0.26;',
    '  // Band 5 — mint/rose',
    '  float ph5=t*0.85+0.6+uv.x*7.0;',
    '  float wy5=0.77+sin(ph5)*0.08+cos(ph5*1.50+1.5)*0.020+pLift*0.5;',
    '  float b5=bnd(uv.y,wy5,0.052);',
    '  col+=mix(mint_c,rose,sin(ph5*0.25+3.0)*0.5+0.5)*b5*0.20;',
    '  alpha+=b5*0.20;',
    '  // Cursor glow',
    '  float md=length(uv-u_mouse);',
    '  float glow=mix(0.0,0.28,u_active)*exp(-md*md*7.0);',
    '  col+=mix(rose,ice,0.4)*u_active*exp(-md*md*7.0);',
    '  alpha+=glow;',
    '  // Noise grain',
    '  col+=snoise(vec3(gl_FragCoord.xy*0.55,t*11.0))*0.016;',
    '  alpha=clamp(alpha,0.0,0.9);',
    '  if(alpha<0.005) discard;',
    '  fragColor=vec4(col/max(alpha,0.001),alpha);',
    '}'
  ].join('\n');

  function initHeroWebGL() {
    var gl2 = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance', premultipliedAlpha: false, alpha: true });
    if (!gl2) {
      canvas.style.background = 'transparent';
      return;
    }
    gl2.enable(gl2.BLEND);
    gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA);

    function c(type, src) {
      var sh = gl2.createShader(type);
      gl2.shaderSource(sh, src); gl2.compileShader(sh);
      if (!gl2.getShaderParameter(sh, gl2.COMPILE_STATUS)) { return null; }
      return sh;
    }
    var hVs = c(gl2.VERTEX_SHADER, HERO_VS);
    var hFs = c(gl2.FRAGMENT_SHADER, HERO_FS);
    if (!hVs || !hFs) return;
    var hProg = gl2.createProgram();
    gl2.attachShader(hProg, hVs); gl2.attachShader(hProg, hFs);
    gl2.linkProgram(hProg);
    if (!gl2.getProgramParameter(hProg, gl2.LINK_STATUS)) { return; }
    gl2.useProgram(hProg);
    var vao = gl2.createVertexArray(); gl2.bindVertexArray(vao);
    var buf = gl2.createBuffer(); gl2.bindBuffer(gl2.ARRAY_BUFFER, buf);
    gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl2.STATIC_DRAW);
    var ap = gl2.getAttribLocation(hProg, 'a_pos');
    gl2.enableVertexAttribArray(ap); gl2.vertexAttribPointer(ap, 2, gl2.FLOAT, false, 0, 0);
    var uRes   = gl2.getUniformLocation(hProg, 'u_res');
    var uTime  = gl2.getUniformLocation(hProg, 'u_time');
    var uMouse = gl2.getUniformLocation(hProg, 'u_mouse');
    var uAct   = gl2.getUniformLocation(hProg, 'u_active');

    function heroResize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(window.innerWidth  * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl2.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', heroResize); heroResize();

    function heroFrame(now) {
      smx += (ptr.x - smx) * 0.07;
      smy += (ptr.y - smy) * 0.07;
      act += ((ptr.active ? 1 : 0) - act) * 0.06;
      gl2.clearColor(0, 0, 0, 0);
      gl2.clear(gl2.COLOR_BUFFER_BIT);
      gl2.uniform2f(uRes, canvas.width, canvas.height);
      gl2.uniform1f(uTime, now * 0.001);
      gl2.uniform2f(uMouse, smx, smy);
      gl2.uniform1f(uAct, act);
      gl2.drawArrays(gl2.TRIANGLE_STRIP, 0, 4);
      tickBalloons(now);
      requestAnimationFrame(heroFrame);
    }
    requestAnimationFrame(heroFrame);
  }

  typedEl.textContent = '';
  setTimeout(typeLoop, 900);
  setTimeout(function () {
    spawnBalloon(window.innerWidth * 0.18, window.innerHeight * 0.42);
    spawnBalloon(window.innerWidth * 0.80, window.innerHeight * 0.60);
  }, 1400);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroWebGL);
  } else {
    initHeroWebGL();
  }
})();


// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Scroll driver (no private neural canvas — global canvas handles bg)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var sec2   = document.getElementById('section2');
  var panel1 = document.getElementById('s2p1');
  var panel2 = document.getElementById('s2p2');
  var panel3 = document.getElementById('s2p3');
  var s2exit = document.getElementById('s2exit');
  if (!sec2) return;

  function setS2Height() {
    sec2.style.height = (window.innerHeight * 3.2) + 'px';
  }
  setS2Height();
  window.addEventListener('resize', setS2Height);

  function revealWords(panel, delay) {
    panel.querySelectorAll('.s2-word').forEach(function (w, i) {
      setTimeout(function () { w.classList.add('visible'); }, delay + i * 80);
    });
  }
  function hideWords(panel) {
    panel.querySelectorAll('.s2-word').forEach(function (w) { w.classList.remove('visible'); });
  }
  function smoothstep(lo, hi, x) {
    var t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
    return t * t * (3 - 2 * t);
  }

  var stageActive = 0;
  var s2Sticky = document.querySelector('.s2-sticky');

  function onScroll() {
    var rect  = sec2.getBoundingClientRect();
    var secH  = sec2.offsetHeight;
    var vh    = window.innerHeight;
    var inSection = rect.top <= 0 && rect.bottom >= vh;
    if (s2Sticky) s2Sticky.style.visibility = inSection ? 'visible' : 'hidden';

    var scrolled = Math.max(0, -rect.top);
    var p = Math.max(0, Math.min(1, scrolled / (secH - vh)));

    // Panel opacities with cross-fade overlap
    panel1.style.opacity = smoothstep(0.02, 0.18, p) * (1 - smoothstep(0.42, 0.52, p));
    panel2.style.opacity = smoothstep(0.50, 0.62, p) * (1 - smoothstep(0.70, 0.78, p));
    panel3.style.opacity = smoothstep(0.76, 0.88, p) * (1 - smoothstep(0.93, 0.98, p));
    s2exit.style.opacity = smoothstep(0.95, 1.00, p);

    if (p >= 0.02 && stageActive < 1) {
      stageActive = 1;
      panel1.setAttribute('aria-hidden', 'false');
      revealWords(panel1, 100);
    }
    if (p >= 0.50 && stageActive < 2) {
      stageActive = 2;
      panel2.setAttribute('aria-hidden', 'false');
      revealWords(panel2, 0);
      panel2.classList.add('drifting');
    }
    if (p >= 0.76 && stageActive < 3) {
      stageActive = 3;
      panel3.setAttribute('aria-hidden', 'false');
      revealWords(panel3, 0);
      panel2.classList.remove('drifting');
    }
    if (p < 0.01 && stageActive > 0) {
      stageActive = 0;
      [panel1, panel2, panel3].forEach(function (pn) {
        hideWords(pn); pn.setAttribute('aria-hidden', 'true');
      });
      panel2.classList.remove('drifting');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ════════════════════════════════════════════════════════════════════════════
// ACT III — Transformation Engine (transparent canvas — no bg fill)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var sec    = document.getElementById('section3');
  var canvas = document.getElementById('s3Canvas');
  var sticky = document.getElementById('s3Sticky');
  var labelEl = document.getElementById('s3Label');
  var fromEl  = document.getElementById('s3LabelFrom');
  var toEl    = document.getElementById('s3LabelTo');
  if (!sec || !canvas) return;

  var ss = window._folnerUtil.smoothstep;
  var scenes = [
    { from: 'Outdated',    to: 'Timeless'   },
    { from: 'Complex',     to: 'Clear'      },
    { from: 'Cold',        to: 'Human'      },
    { from: 'Bloated',     to: 'Focused'    },
    { from: 'Forgettable', to: 'Remarkable' }
  ];
  var NUM_SCENES = scenes.length;
  var ctx, W, H, dpr;
  var initialized = false;
  var curScene = -1;
  var morphT = 0;
  var PRISM_COLORS = ['#C679C4','#FA3D1D','#FFB005','#E1E1FE','#0358F7','#56C2FF'];

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', function () {
    if (!initialized) return;
    ctx.setTransform(1,0,0,1,0,0);
    setup();
  });

  function drawScene0(t) {
    var cx = W/2, cy = H/2;
    var chaos = 1 - t;
    ctx.clearRect(0, 0, W, H);
    // Background radial atmosphere — enhanced opacity range
    var bgGr = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5);
    bgGr.addColorStop(0, 'rgba(198,121,196,' + (0.04 + t * 0.08) + ')');
    bgGr.addColorStop(0.5, 'rgba(3,88,247,' + (0.02 + t * 0.04) + ')');
    bgGr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bgGr; ctx.fillRect(0, 0, W, H);
    // 3 slow-drifting atmospheric blobs
    var blobData = [
      { ox: cx - W*0.18, oy: cy - H*0.15, r: 180, col: [198,121,196] },
      { ox: cx + W*0.20, oy: cy + H*0.12, r: 160, col: [3,88,247] },
      { ox: cx - W*0.05, oy: cy + H*0.22, r: 140, col: [86,194,255] }
    ];
    var blobTime = performance.now() * 0.0004;
    for (var bi = 0; bi < blobData.length; bi++) {
      var bd = blobData[bi];
      var bx = bd.ox + Math.sin(blobTime * 0.7 + bi * 1.3) * 30;
      var by = bd.oy + Math.cos(blobTime * 0.5 + bi * 0.9) * 22;
      var bGr = ctx.createRadialGradient(bx, by, 0, bx, by, bd.r);
      bGr.addColorStop(0, 'rgba('+bd.col[0]+','+bd.col[1]+','+bd.col[2]+','+(0.025 + t*0.04)+')');
      bGr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bGr; ctx.fillRect(0, 0, W, H);
    }
    // Scattered particles
    var numParticles = Math.round(chaos * 60 + 20);
    var rng = mulberry32(42);
    for (var pi = 0; pi < numParticles; pi++) {
      var px = cx + (rng() - 0.5) * W * 0.7 * chaos;
      var py = cy + (rng() - 0.5) * H * 0.7 * chaos;
      var pSize = 1 + rng() * 2.5 * chaos;
      var pCol = PRISM_COLORS[pi % PRISM_COLORS.length];
      ctx.beginPath(); ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(pCol, 0.3 + chaos * 0.4); ctx.fill();
    }
    // Geometric shapes
    var numShapes = Math.round(ss(0, 1, 1 - t) * 18 + 3);
    var rng2 = mulberry32(77);
    for (var i = 0; i < numShapes; i++) {
      var rx = cx + (rng2() - 0.5) * W * 0.5 * chaos;
      var ry = cy + (rng2() - 0.5) * H * 0.5 * chaos;
      var baseR = ss(0, 1, t) * 80 + 20;
      var r = baseR + rng2() * 60 * chaos;
      var sides = Math.round(3 + rng2() * 5 * chaos);
      var alpha = chaos * 0.5 + t * 0.6;
      var col = PRISM_COLORS[i % PRISM_COLORS.length];
      ctx.beginPath();
      polygon(ctx, rx, ry, r, sides + (chaos > 0.5 ? rng2() * 3 : 0), i * 0.3 * chaos);
      ctx.strokeStyle = hexToRgba(col, alpha * 0.7);
      ctx.lineWidth = 1 + chaos;
      ctx.stroke();
    }
    // Radial prism underglow
    if (t > 0.2) {
      var glowA = ss(0.2, 1.0, t) * 0.18;
      var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
      gr.addColorStop(0, 'rgba(198,121,196,' + glowA + ')');
      gr.addColorStop(0.4, 'rgba(3,88,247,' + (glowA * 0.6) + ')');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
    }
    // Bloom at t>0.5
    if (t > 0.5) {
      var bloomA = ss(0.5, 1.0, t) * 0.25;
      var bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      bloom.addColorStop(0, 'rgba(225,225,254,' + bloomA + ')');
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);
    }
    // Converging concentric rings
    var circR = [120, 80, 45, 20];
    for (var j = 0; j < circR.length; j++) {
      ctx.beginPath();
      ctx.arc(cx, cy, circR[j] * (0.2 + t * 0.8), 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba('#E1E1FE', t * 0.6);
      ctx.lineWidth = 0.8 + t * 0.5;
      ctx.stroke();
    }
    // Vignette overlay — cinematic depth
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)');
    vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  function drawScene1(t) {
    var cx = W/2, cy = H/2;
    ctx.clearRect(0, 0, W, H);
    var density = 1 - t;
    // Background nebula
    var bgGr = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.45);
    bgGr.addColorStop(0, 'rgba(86,194,255,' + (0.02 + t * 0.05) + ')');
    bgGr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bgGr; ctx.fillRect(0, 0, W, H);
    // Dense particle field that clears
    var n = Math.round(density * 40 + 5);
    var rng = mulberry32(77);
    for (var i = 0; i < n; i++) {
      var ox = cx + (rng()-0.5) * W * 0.5 * density;
      var oy = cy + (rng()-0.5) * H * 0.5 * density;
      var r = 20 + rng() * 120 * density + t * 80;
      var col = PRISM_COLORS[i % PRISM_COLORS.length];
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI*2);
      ctx.strokeStyle = hexToRgba(col, 0.08 + density * 0.3);
      ctx.lineWidth = 0.8 + density;
      ctx.stroke();
      // Add dots at centers
      ctx.beginPath(); ctx.arc(ox, oy, 2, 0, Math.PI*2);
      ctx.fillStyle = hexToRgba(col, 0.3 + density * 0.3); ctx.fill();
    }
    // Static star field — 50 tiny dots
    var rngStar = mulberry32(314);
    for (var si = 0; si < 50; si++) {
      var sx = rngStar() * W, sy = rngStar() * H;
      var sSize = 0.5 + rngStar() * 1.2;
      var sAlpha = 0.08 + rngStar() * 0.18;
      ctx.beginPath(); ctx.arc(sx, sy, sSize, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(225,225,254,' + sAlpha.toFixed(3) + ')'; ctx.fill();
    }
    // Floating micro-particles
    var rng2 = mulberry32(199);
    for (var k = 0; k < 50; k++) {
      var kx = rng2() * W, ky = rng2() * H;
      ctx.beginPath(); ctx.arc(kx, ky, 0.8 + rng2() * 1.5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(225,225,254,' + (density * 0.25 + 0.05) + ')'; ctx.fill();
    }
    if (t > 0.3) {
      var glowA = ss(0.3, 1.0, t) * 0.14;
      var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      gr.addColorStop(0, 'rgba(86,194,255,' + glowA + ')');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    // Central clarity symbol — increased ring opacity
    var gr2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
    gr2.addColorStop(0, hexToRgba('#E1E1FE', t * 0.22));
    gr2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, 100, 0, Math.PI*2);
    ctx.fillStyle = gr2; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI*2);
    ctx.strokeStyle = hexToRgba('#E1E1FE', t * 0.95);
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI*2);
    ctx.strokeStyle = hexToRgba('#56C2FF', t * 0.6);
    ctx.lineWidth = 1; ctx.stroke();
    // Vignette overlay — cinematic depth
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)');
    vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  function drawScene2(t) {
    var cx = W/2, cy = H/2;
    ctx.clearRect(0, 0, W, H);
    var cold = 1 - t, warm = t;
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var outerR = 140 * cold;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40);
      ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      ctx.strokeStyle = hexToRgba('#56C2FF', cold * 0.5);
      ctx.lineWidth = 1; ctx.stroke();
    }
    var blobR = 80 + t * 30;
    for (var j = 0; j < 5; j++) {
      var bx = cx + Math.cos((j/5)*Math.PI*2) * 60 * warm;
      var by = cy + Math.sin((j/5)*Math.PI*2) * 60 * warm;
      var grad = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
      grad.addColorStop(0, hexToRgba('#FFB005', warm * 0.14));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(bx, by, blobR, 0, Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI*2);
    ctx.strokeStyle = hexToRgba('#FA3D1D', warm * 0.6);
    ctx.lineWidth = 1.5 * warm; ctx.stroke();
    // Vignette overlay
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)');
    vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  function drawScene3(t) {
    var cx = W/2, cy = H/2;
    ctx.clearRect(0, 0, W, H);
    var bloat = 1 - t;
    var rng = mulberry32(13);
    var count = Math.round(bloat * 30 + 1);
    for (var i = 0; i < count; i++) {
      var x = rng() * W, y = rng() * H, r = 4 + rng() * 40;
      var col = PRISM_COLORS[i % PRISM_COLORS.length];
      ctx.beginPath(); ctx.arc(x, y, r * bloat + r * 0.1, 0, Math.PI*2);
      ctx.fillStyle = hexToRgba(col, 0.06 + bloat * 0.08); ctx.fill();
      ctx.strokeStyle = hexToRgba(col, bloat * 0.25);
      ctx.lineWidth = 0.5; ctx.stroke();
    }
    var essR = 8 + t * 72;
    var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, essR * 1.5);
    gr.addColorStop(0, hexToRgba('#0358F7', t * 0.4));
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, essR * 1.5, 0, Math.PI*2);
    ctx.fillStyle = gr; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, essR, 0, Math.PI*2);
    ctx.strokeStyle = hexToRgba('#56C2FF', t * 0.9);
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2);
    ctx.fillStyle = hexToRgba('#fff', t * 0.9); ctx.fill();
    // Vignette overlay
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)');
    vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  function drawScene4(t) {
    var cx = W/2, cy = H/2;
    ctx.clearRect(0, 0, W, H);
    var mundane = 1 - t;
    for (var i = 0; i < 4; i++) {
      var a = (i/4)*Math.PI*2;
      var bx = cx + Math.cos(a) * 100, by = cy + Math.sin(a) * 100;
      var gr = ctx.createRadialGradient(bx, by, 0, bx, by, 80);
      gr.addColorStop(0, hexToRgba(PRISM_COLORS[i], mundane * 0.06 + t * 0.18));
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(bx, by, 80, 0, Math.PI*2);
      ctx.fillStyle = gr; ctx.fill();
    }
    var rings = [120, 80, 44];
    for (var j = 0; j < rings.length; j++) {
      ctx.beginPath(); ctx.arc(cx, cy, rings[j], 0, Math.PI*2);
      ctx.strokeStyle = hexToRgba(PRISM_COLORS[j], mundane * 0.08 + t * 0.55);
      ctx.lineWidth = 1 + t * 1.5; ctx.stroke();
    }
    if (t > 0.3) {
      var arcT = ss(0.3, 1, t);
      var grad = ctx.createLinearGradient(cx - 120, cy, cx + 120, cy);
      grad.addColorStop(0, '#C679C4'); grad.addColorStop(0.25, '#FA3D1D');
      grad.addColorStop(0.5, '#FFB005'); grad.addColorStop(0.75, '#E1E1FE');
      grad.addColorStop(1, '#0358F7');
      // Glow pass — wide soft stroke first
      ctx.beginPath();
      ctx.arc(cx, cy, 120, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * arcT);
      ctx.strokeStyle = grad; ctx.lineWidth = 12;
      ctx.globalAlpha = arcT * 0.08; ctx.stroke();
      // Main arc
      ctx.beginPath();
      ctx.arc(cx, cy, 120, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * arcT);
      ctx.strokeStyle = grad; ctx.lineWidth = 3.5;
      ctx.globalAlpha = arcT; ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Vignette overlay
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)');
    vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  var drawFns = [drawScene0, drawScene1, drawScene2, drawScene3, drawScene4];
  var targetMorphT = 0, currentMorphT = 0;

  function frame() {
    currentMorphT += (targetMorphT - currentMorphT) * 0.06;
    if (curScene >= 0 && curScene < drawFns.length) drawFns[curScene](currentMorphT);
    requestAnimationFrame(frame);
  }

  function onScroll() {
    var rect = sec.getBoundingClientRect();
    var secH = sec.offsetHeight, vh = window.innerHeight;
    var inSection = rect.top < vh && rect.bottom > 0;
    if (sticky) sticky.style.visibility = (inSection && rect.top <= 0 && rect.bottom >= vh) ? 'visible' : 'hidden';
    if (!inSection) { canvas.style.opacity = '0'; return; }
    if (!initialized) { initialized = true; setup(); frame(); }
    canvas.style.opacity = '1';

    var p = Math.max(0, Math.min(1, (-rect.top) / (secH - vh)));
    var sceneF = p * NUM_SCENES;
    var sceneIdx = Math.min(Math.floor(sceneF), NUM_SCENES - 1);
    var sceneT = sceneF - Math.floor(sceneF);
    if (sceneIdx !== curScene) {
      curScene = sceneIdx;
      fromEl.textContent = scenes[sceneIdx].from;
      toEl.textContent   = scenes[sceneIdx].to;
      labelEl.classList.remove('visible');
      setTimeout(function () { labelEl.classList.add('visible'); }, 60);
    }
    targetMorphT = sceneT;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function polygon(ctx2, cx, cy, r, sides, rotation) {
    var s = Math.max(3, Math.round(sides));
    for (var i = 0; i <= s; i++) {
      var a = (i / s) * Math.PI * 2 + rotation;
      if (i === 0) ctx2.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
      else         ctx2.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
    }
    ctx2.closePath();
  }
  function hexToRgba(hex, a) {
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a.toFixed(3)+')';
  }
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      var t = Math.imul(s ^ s>>>15, 1|s);
      t ^= t + Math.imul(t ^ t>>>7, 61|t);
      return ((t ^ t>>>14) >>> 0) / 4294967296;
    };
  }
  window._folnerHexToRgba = hexToRgba;
})();


// ════════════════════════════════════════════════════════════════════════════
// ACT IV — Craft: Particle Intelligence (transparent canvas, micro sparks, glow ring)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var sec       = document.getElementById('section4');
  var canvas    = document.getElementById('s4Canvas');
  var sticky    = document.getElementById('s4Sticky');
  var statement = document.getElementById('s4Statement');
  if (!sec || !canvas) return;

  var ss = window._folnerUtil.smoothstep;
  var N = 5500;
  var N_SPARKS = 1200;
  var ctx, W, H, dpr;
  var initialized = false;
  var particles = [];
  var sparks = [];
  var mouseX = -9999, mouseY = -9999;

  function buildTargets() {
    var cx = W / 2, cy = H / 2;
    var targets = [];
    var rings = [0, 40, 80, 120, 160, 200, 240];
    var idx = 0;
    targets.push({ x: cx, y: cy }); idx++;
    for (var ri = 1; ri < rings.length && idx < N; ri++) {
      var r = rings[ri];
      var count = Math.round(2 * Math.PI * r / 14);
      for (var j = 0; j < count && idx < N; j++) {
        var a = (j / count) * Math.PI * 2 - Math.PI / 2;
        targets.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        idx++;
      }
    }
    while (idx < N) {
      var a2 = (idx / N) * Math.PI * 2;
      var r2 = 260 + (idx % 40) * 1.5;
      targets.push({ x: cx + Math.cos(a2) * r2, y: cy + Math.sin(a2) * r2 });
      idx++;
    }
    return targets;
  }

  var PRISM = ['#C679C4','#FA3D1D','#FFB005','#E1E1FE','#0358F7','#56C2FF','#59D499'];

  function init() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var targets = buildTargets();
    particles = [];
    for (var i = 0; i < N; i++) {
      var t = targets[i];
      particles.push({ x: Math.random()*W, y: Math.random()*H, tx: t.x, ty: t.y,
        vx: 0, vy: 0, col: PRISM[i % PRISM.length], size: 0.8 + Math.random() * 1.2 });
    }
    // Micro sparks — drift at outer edges
    sparks = [];
    for (var k = 0; k < N_SPARKS; k++) {
      var edge = Math.floor(Math.random() * 4);
      var sx, sy;
      if (edge === 0) { sx = Math.random() * W; sy = Math.random() * H * 0.12; }
      else if (edge === 1) { sx = Math.random() * W; sy = H * 0.88 + Math.random() * H * 0.12; }
      else if (edge === 2) { sx = Math.random() * W * 0.08; sy = Math.random() * H; }
      else { sx = W * 0.92 + Math.random() * W * 0.08; sy = Math.random() * H; }
      sparks.push({ x: sx, y: sy,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
        col: PRISM[k % PRISM.length], size: 0.4 + Math.random() * 0.8,
        alpha: 0.1 + Math.random() * 0.3 });
    }
  }

  window.addEventListener('resize', function () {
    if (!initialized) return;
    ctx.setTransform(1,0,0,1,0,0); init();
  });
  window.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });

  var convergence = 0, targetConvergence = 0, statementShown = false;

  function hexAlpha(hex, a) {
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+(a).toFixed(3)+')';
  }

  function frame(now) {
    convergence += (targetConvergence - convergence) * 0.025;
    ctx.clearRect(0, 0, W, H);
    // NO background fill — transparent

    for (var i = 0; i < N; i++) {
      var p = particles[i];
      var fx = (p.tx - p.x) * 0.04 * convergence;
      var fy = (p.ty - p.y) * 0.04 * convergence;
      var dx = p.x - mouseX, dy = p.y - mouseY;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 60) {
        var force = (1 - dist/60) * 2;
        fx += dx / (dist+0.1) * force;
        fy += dy / (dist+0.1) * force;
      }
      p.vx = p.vx * 0.88 + fx;
      p.vy = p.vy * 0.88 + fy;
      if (convergence < 0.98) {
        p.vx += (Math.random() - 0.5) * 0.3 * (1 - convergence);
        p.vy += (Math.random() - 0.5) * 0.3 * (1 - convergence);
      }
      p.x += p.vx; p.y += p.vy;
      var alpha = 0.3 + convergence * 0.65;
      var sz = p.size * (0.7 + convergence * 0.5);
      ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI*2);
      ctx.fillStyle = hexAlpha(p.col, alpha); ctx.fill();
    }

    // Micro sparks (always drifting at edges)
    for (var k = 0; k < sparks.length; k++) {
      var sp = sparks[k];
      sp.x += sp.vx; sp.y += sp.vy;
      // Wrap at edges
      if (sp.x < -10) sp.x = W + 10;
      if (sp.x > W + 10) sp.x = -10;
      if (sp.y < -10) sp.y = H + 10;
      if (sp.y > H + 10) sp.y = -10;
      var a = sp.alpha * (0.6 + 0.4 * Math.sin(now * 0.002 + k * 0.4));
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI*2);
      ctx.fillStyle = hexAlpha(sp.col, a); ctx.fill();
    }

    // Glow rings at convergence
    if (convergence > 0.5) {
      var gA = (convergence - 0.5) * 2;
      var gr = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 280);
      gr.addColorStop(0, 'rgba(86,194,255,' + (gA * 0.05) + ')');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }

    // Prism rings — inner cyan, outer rose
    var innerR = 200 + 15 * Math.sin(now * 0.0012);
    var outerR = 300 + 25 * Math.sin(now * 0.0008);
    ctx.beginPath(); ctx.arc(W/2, H/2, innerR, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(86,194,255,' + (convergence * 0.3).toFixed(3) + ')';
    ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, outerR, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(198,121,196,' + (convergence * 0.15).toFixed(3) + ')';
    ctx.lineWidth = 1; ctx.stroke();

    // Prism bloom at high convergence
    if (convergence > 0.85) {
      var bloomA = (convergence - 0.85) / 0.15 * 0.12;
      var bloomGr = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 320);
      bloomGr.addColorStop(0, 'rgba(225,225,254,' + bloomA + ')');
      bloomGr.addColorStop(0.5, 'rgba(86,194,255,' + (bloomA * 0.5) + ')');
      bloomGr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloomGr;
      ctx.fillRect(0, 0, W, H);
    }

    // Central glow ring pulse
    var ringR = 260 + 20 * Math.sin(now * 0.001);
    ctx.beginPath(); ctx.arc(W/2, H/2, ringR, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(86,194,255,' + (convergence * 0.18).toFixed(3) + ')';
    ctx.lineWidth = 1; ctx.stroke();

    requestAnimationFrame(frame);
  }

  function onScroll() {
    var rect = sec.getBoundingClientRect();
    var secH = sec.offsetHeight, vh = window.innerHeight;
    var inSection = rect.top < vh && rect.bottom > 0;
    if (sticky) sticky.style.visibility = (inSection && rect.top <= 0 && rect.bottom >= vh) ? 'visible' : 'hidden';
    if (!inSection) { canvas.style.opacity = '0'; return; }
    if (!initialized) { initialized = true; init(); requestAnimationFrame(frame); }
    canvas.style.opacity = '1';

    var p = Math.max(0, Math.min(1, (-rect.top) / (secH - vh)));
    targetConvergence = ss(0.05, 0.75, p);
    if (p > 0.7 && !statementShown) { statementShown = true; if (statement) statement.classList.add('revealed'); }
    if (p < 0.5 && statementShown) { statementShown = false; if (statement) statement.classList.remove('revealed'); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ════════════════════════════════════════════════════════════════════════════
// ACT V — Process: Living Mechanical Grid (transparent, with pulse lines)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var sec    = document.getElementById('section5');
  var canvas = document.getElementById('s5Canvas');
  var sticky = document.getElementById('s5Sticky');
  var stageEl  = document.getElementById('s5Stage');
  var numEl    = document.getElementById('s5Num');
  var labelEl  = document.getElementById('s5StageLabel');
  if (!sec || !canvas) return;

  var ss = window._folnerUtil.smoothstep;
  var stages = [
    { num: '01', label: 'Question Everything' },
    { num: '02', label: 'Remove Complexity'   },
    { num: '03', label: 'Create Clarity'       },
    { num: '04', label: 'Refine Relentlessly'  },
    { num: '05', label: 'Raise The Standard'   }
  ];
  var NUM_STAGES = stages.length;
  var ctx, W, H, dpr;
  var initialized = false;
  var curStage = -1;
  var gridClarity = 0, targetClarity = 0;
  var timeStart;
  // Secondary neural layer nodes
  var neuralNodes = [];
  var NUM_NEURAL = 8;

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    timeStart = performance.now();
    // Build secondary neural nodes
    neuralNodes = [];
    for (var ni = 0; ni < NUM_NEURAL; ni++) {
      neuralNodes.push({
        x: W * (0.1 + Math.random() * 0.8),
        y: H * (0.1 + Math.random() * 0.8),
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04
      });
    }
  }

  window.addEventListener('resize', function () {
    if (!initialized) return;
    ctx.setTransform(1,0,0,1,0,0); setup();
  });

  function prismColor(f, a) {
    var stops = [[198,121,196],[250,61,29],[255,176,5],[225,225,254],[3,88,247]];
    var fi = f * (stops.length - 1);
    var lo = Math.floor(fi), hi = Math.min(lo+1, stops.length-1), t2 = fi - lo;
    var c = stops[lo], d = stops[hi];
    return 'rgba('+Math.round(c[0]+(d[0]-c[0])*t2)+','+Math.round(c[1]+(d[1]-c[1])*t2)+','+Math.round(c[2]+(d[2]-c[2])*t2)+','+a.toFixed(3)+')';
  }

  function drawGrid(t, now) {
    ctx.clearRect(0, 0, W, H);
    // NO background fill
    var elapsed = (now - timeStart) * 0.001;
    var noiseAmt = 1 - t;
    var cellSize = 40 + t * 20;
    var cols = Math.ceil(W / cellSize) + 2;
    var rows = Math.ceil(H / cellSize) + 2;

    // Secondary neural layer — 8 softly glowing nodes
    for (var ni = 0; ni < neuralNodes.length; ni++) {
      var nn = neuralNodes[ni];
      nn.x += nn.vx; nn.y += nn.vy;
      if (nn.x < 0 || nn.x > W) nn.vx *= -1;
      if (nn.y < 0 || nn.y > H) nn.vy *= -1;
    }
    // Draw neural connections
    for (var na = 0; na < neuralNodes.length; na++) {
      for (var nb2 = na + 1; nb2 < neuralNodes.length; nb2++) {
        var ndx = neuralNodes[na].x - neuralNodes[nb2].x;
        var ndy = neuralNodes[na].y - neuralNodes[nb2].y;
        var ndist = Math.sqrt(ndx*ndx + ndy*ndy);
        if (ndist < 250) {
          var nStr = (1 - ndist/250) * 0.06;
          ctx.beginPath();
          ctx.moveTo(neuralNodes[na].x, neuralNodes[na].y);
          ctx.lineTo(neuralNodes[nb2].x, neuralNodes[nb2].y);
          ctx.strokeStyle = 'rgba(86,194,255,' + nStr.toFixed(3) + ')';
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    // Draw neural nodes
    for (var ni2 = 0; ni2 < neuralNodes.length; ni2++) {
      var nn2 = neuralNodes[ni2];
      ctx.beginPath(); ctx.arc(nn2.x, nn2.y, 2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(86,194,255,0.12)'; ctx.fill();
    }

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var bx = c * cellSize, by = r * cellSize;
        var nx = noiseAmt * 18 * Math.sin(bx * 0.04 + elapsed * 0.7 + r * 0.3);
        var ny = noiseAmt * 18 * Math.cos(by * 0.04 + elapsed * 0.5 + c * 0.25);
        var x = bx + nx, y = by + ny;
        var alpha = 0.06 + t * 0.18;
        ctx.beginPath(); ctx.arc(x, y, 1 + (1-t)*1.5, 0, Math.PI*2);
        ctx.fillStyle = prismColor(((c + r) / (cols + rows)) % 1, alpha);
        ctx.fill();
      }
    }

    if (t > 0.2) {
      var lineAlpha = ss(0.2, 1, t) * 0.12;
      ctx.strokeStyle = 'rgba(225,225,254,' + lineAlpha.toFixed(3) + ')';
      ctx.lineWidth = 0.5;
      for (var ci = 0; ci <= cols; ci++) {
        ctx.beginPath(); ctx.moveTo(ci * cellSize, 0); ctx.lineTo(ci * cellSize, H); ctx.stroke();
      }
      for (var ri2 = 0; ri2 <= rows; ri2++) {
        ctx.beginPath(); ctx.moveTo(0, ri2 * cellSize); ctx.lineTo(W, ri2 * cellSize); ctx.stroke();
      }
    }

    // 5 horizontal pulse lines
    var pulseLines = [
      { y: H * 0.30, speed: 0.12, col: 'rgba(86,194,255,' },
      { y: H * 0.52, speed: 0.08, col: 'rgba(225,225,254,' },
      { y: H * 0.74, speed: 0.16, col: 'rgba(198,121,196,' },
      { y: H * 0.16, speed: 0.10, col: 'rgba(255,176,5,' },
      { y: H * 0.86, speed: 0.14, col: 'rgba(89,212,153,' }
    ];
    for (var pi = 0; pi < 5; pi++) {
      var pl = pulseLines[pi];
      var pX = ((elapsed * pl.speed) % 1) * (W + 200) - 100;
      var pulseA = (0.25 + t * 0.35) * ss(0.2, 1, t);
      var grad = ctx.createLinearGradient(pX - 80, 0, pX + 80, 0);
      grad.addColorStop(0, pl.col + '0)');
      grad.addColorStop(0.5, pl.col + pulseA.toFixed(3) + ')');
      grad.addColorStop(1, pl.col + '0)');
      ctx.beginPath();
      ctx.moveTo(pX - 80, pl.y);
      ctx.lineTo(pX + 80, pl.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (t > 0.5) {
      var crystA = ss(0.5, 1, t);
      var cx2 = W/2, cy2 = H/2, cr = crystA * 80;
      var grr = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr);
      grr.addColorStop(0, 'rgba(86,194,255,' + (crystA * 0.15) + ')');
      grr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grr; ctx.fillRect(cx2 - cr, cy2 - cr, cr*2, cr*2);
      ctx.strokeStyle = 'rgba(225,225,254,' + (crystA * 0.6) + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx2 - cr, cy2); ctx.lineTo(cx2 + cr, cy2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx2, cy2 - cr); ctx.lineTo(cx2, cy2 + cr); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx2, cy2, cr * 0.4, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(86,194,255,' + (crystA * 0.6) + ')'; ctx.stroke();
    }

    // Crosshair at high clarity
    if (gridClarity > 0.8) {
      var chA = (gridClarity - 0.8) / 0.2 * 0.4;
      ctx.strokeStyle = 'rgba(86,194,255,' + chA + ')';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(W/2 - 40, H/2); ctx.lineTo(W/2 + 40, H/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W/2, H/2 - 40); ctx.lineTo(W/2, H/2 + 40); ctx.stroke();
      ctx.beginPath(); ctx.arc(W/2, H/2, 15, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(86,194,255,' + (chA * 0.6) + ')'; ctx.stroke();
    }
  }

  function frame(now) {
    gridClarity += (targetClarity - gridClarity) * 0.04;
    drawGrid(gridClarity, now);
    requestAnimationFrame(frame);
  }

  function onScroll() {
    var rect = sec.getBoundingClientRect();
    var secH = sec.offsetHeight, vh = window.innerHeight;
    var inSection = rect.top < vh && rect.bottom > 0;
    if (sticky) sticky.style.visibility = (inSection && rect.top <= 0 && rect.bottom >= vh) ? 'visible' : 'hidden';
    if (!inSection) { canvas.style.opacity = '0'; return; }
    if (!initialized) { initialized = true; setup(); requestAnimationFrame(frame); }
    canvas.style.opacity = '1';

    var p = Math.max(0, Math.min(1, (-rect.top) / (secH - vh)));
    var stageF = p * NUM_STAGES;
    var stageIdx = Math.min(Math.floor(stageF), NUM_STAGES - 1);
    targetClarity = stageIdx / (NUM_STAGES - 1);

    if (stageIdx !== curStage) {
      curStage = stageIdx;
      var s = stages[stageIdx];
      if (numEl) numEl.textContent = s.num;
      if (labelEl) labelEl.textContent = s.label;
      if (stageEl) {
        stageEl.classList.remove('visible');
        setTimeout(function () { stageEl.classList.add('visible'); }, 40);
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ════════════════════════════════════════════════════════════════════════════
// ACT VI — Principles (transparent, enhanced per-principle environments)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var sec         = document.getElementById('section6');
  var canvas      = document.getElementById('s6Canvas');
  var sticky      = document.getElementById('s6Sticky');
  var principleEl = document.getElementById('s6Principle');
  var wordEl      = document.getElementById('s6Word');
  if (!sec || !canvas) return;

  var ss = window._folnerUtil.smoothstep;
  var principles = [
    { word: 'Alive',      render: renderAlive      },
    { word: 'Beautiful',  render: renderBeautiful  },
    { word: 'Intuitive',  render: renderIntuitive  },
    { word: 'Human',      render: renderHuman      },
    { word: 'Thoughtful', render: renderThoughtful },
    { word: 'Modern',     render: renderModern     }
  ];
  var NUM_P = principles.length;
  var ctx, W, H, dpr;
  var initialized = false;
  var curP = -1, targetP = 0, smoothP = 0;
  var timeStart;
  var mouseX = 0.5, mouseY = 0.5;

  // Sonar rings state for "Alive"
  var sonarRings = [];
  var lastSonarTime = 0;

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    timeStart = performance.now();
  }

  window.addEventListener('resize', function () {
    if (!initialized) return;
    ctx.setTransform(1,0,0,1,0,0); setup();
  });

  // Principle 1: Alive — pulsing particles + sonar rings
  function renderAlive(t, now) {
    var cx = W/2, cy = H/2;
    var elapsed = (now - timeStart) * 0.001;
    // Spawn sonar ring every 1.2s (faster)
    if (now - lastSonarTime > 1200) {
      lastSonarTime = now;
      sonarRings.push({ r: 0, born: now, cx: cx, cy: cy });
      // Second smaller sonar
      sonarRings.push({ r: 0, born: now, cx: cx + W*0.15, cy: cy - H*0.1 });
    }
    // Draw sonar rings
    for (var ri = sonarRings.length - 1; ri >= 0; ri--) {
      var ring = sonarRings[ri];
      var age = (now - ring.born) * 0.001;
      ring.r = age * 200;
      var rAlpha = Math.max(0, 0.45 - age * 0.22);
      if (rAlpha <= 0) { sonarRings.splice(ri, 1); continue; }
      ctx.beginPath(); ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(86,194,255,' + rAlpha.toFixed(3) + ')';
      ctx.lineWidth = 1.5; ctx.stroke();
    }
    var N = 120;
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2;
      var pulse = 1 + 0.18 * Math.sin(elapsed * 2.4 + i * 0.4);
      var r = 80 + i * 1.1 * pulse;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      var alpha2 = 0.25 + 0.25 * Math.sin(elapsed * 1.8 + i * 0.3);
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(86,194,255,' + alpha2.toFixed(3) + ')'; ctx.fill();
    }
    var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 + 20*Math.sin(elapsed));
    gr.addColorStop(0, 'rgba(86,194,255,' + (0.08 + 0.04*Math.sin(elapsed*1.5)) + ')');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    // Vignette
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)'); vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  // Principle 2: Beautiful — prism glow + slow-rotating prism arc
  function renderBeautiful(t, now) {
    var cx = W/2, cy = H/2;
    var elapsed = (now - timeStart) * 0.001;
    var stops = [[198,121,196],[250,61,29],[255,176,5],[225,225,254],[3,88,247],[86,194,255]];
    for (var i = 0; i < stops.length; i++) {
      var a = (i / stops.length) * Math.PI * 2 + elapsed * 0.2;
      var r = 60 + i * 22;
      var bx = cx + Math.cos(a) * r * 0.8, by = cy + Math.sin(a) * r * 0.6;
      var gr = ctx.createRadialGradient(bx, by, 0, bx, by, 90 + i * 12);
      var c = stops[i];
      gr.addColorStop(0, 'rgba('+c[0]+','+c[1]+','+c[2]+','+(0.10 + t*0.18)+')');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
    }
    for (var j = 3; j > 0; j--) {
      ctx.beginPath(); ctx.arc(cx, cy, j * 70, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(225,225,254,' + (0.04 + t * 0.08) + ')';
      ctx.lineWidth = 0.5; ctx.stroke();
    }
    // Slow-rotating full 360° prism arc (12s), opacity 0.5*t, radius 180
    var arcAngle = (elapsed / 12) * Math.PI * 2;
    var arcR = 180;
    var grad = ctx.createLinearGradient(cx - arcR, cy, cx + arcR, cy);
    grad.addColorStop(0, '#C679C4'); grad.addColorStop(0.2, '#FA3D1D');
    grad.addColorStop(0.4, '#FFB005'); grad.addColorStop(0.6, '#E1E1FE');
    grad.addColorStop(0.8, '#0358F7'); grad.addColorStop(1, '#C679C4');
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(arcAngle); ctx.translate(-cx, -cy);
    ctx.beginPath(); ctx.arc(cx, cy, arcR, 0, Math.PI * 2);
    ctx.strokeStyle = grad; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.5 * t; ctx.stroke();
    ctx.globalAlpha = 1; ctx.restore();
    // Vignette
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)'); vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  // Principle 3: Intuitive — grid self-organizes, nodes grow connection lines
  function renderIntuitive(t, now) {
    var elapsed = (now - timeStart) * 0.001;
    var cellSz = 48;
    var cols = Math.ceil(W / cellSz) + 1;
    var rows = Math.ceil(H / cellSz) + 1;
    var organise = ss(0, 1, t) * Math.min(1, elapsed / 3);
    var nodeAlpha = 0.06 + organise * 0.14;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var tx = c * cellSz, ty = r * cellSz;
        var noiseX = (1 - organise) * 16 * Math.sin(tx * 0.06 + elapsed * 0.5);
        var noiseY = (1 - organise) * 16 * Math.cos(ty * 0.06 + elapsed * 0.4);
        var px = tx + noiseX, py = ty + noiseY;
        ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(225,225,254,' + nodeAlpha.toFixed(3) + ')'; ctx.fill();
        // Connection lines to right and bottom neighbors (only when organized)
        if (organise > 0.4 && c < cols - 1 && r < rows - 1) {
          var connA = (organise - 0.4) * 0.25;
          var rx = (c+1) * cellSz, ry = (r+1) * cellSz;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(rx + noiseX * 0.5, py);
          ctx.strokeStyle = 'rgba(225,225,254,' + connA.toFixed(3) + ')';
          ctx.lineWidth = 0.4; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ry + noiseY * 0.5);
          ctx.stroke();
        }
      }
    }
    var lineA = organise * 0.15;
    ctx.strokeStyle = 'rgba(225,225,254,' + lineA.toFixed(3) + ')';
    ctx.lineWidth = 0.5;
    for (var ci = 0; ci <= cols; ci++) {
      ctx.beginPath(); ctx.moveTo(ci * cellSz, 0); ctx.lineTo(ci * cellSz, H); ctx.stroke();
    }
    for (var ri = 0; ri <= rows; ri++) {
      ctx.beginPath(); ctx.moveTo(0, ri * cellSz); ctx.lineTo(W, ri * cellSz); ctx.stroke();
    }
    // Vignette
    var vigCx = W/2, vigCy = H/2;
    var vigGr = ctx.createRadialGradient(vigCx, vigCy, Math.min(W,H)*0.2, vigCx, vigCy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)'); vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  // Principle 4: Human — soft waves, heartbeat amplitude
  function renderHuman(t, now) {
    var elapsed = (now - timeStart) * 0.001;
    var mx = mouseX * W, my = mouseY * H;
    var cx = W/2, cy = H/2;
    // Heartbeat modulation: sin(t * 1.2)
    var heartbeat = 1 + 0.35 * Math.sin(elapsed * 1.2);
    for (var i = 0; i < 5; i++) {
      var wavY = H * (0.2 + i * 0.15) + Math.sin(elapsed * 0.6 + i * 0.8) * 30;
      var wavAmp = (18 + i * 6) * heartbeat;
      ctx.beginPath(); ctx.moveTo(0, wavY);
      for (var x = 0; x <= W; x += 4) {
        var influence = Math.exp(-Math.pow((x - mx) / (W * 0.3), 2));
        var y = wavY + Math.sin((x / W) * Math.PI * 3 + elapsed * 0.7 + i * 1.2) * wavAmp * (1 + influence * 0.5);
        ctx.lineTo(x, y);
      }
      var warmAlpha = 0.06 + t * 0.10;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,176,5,' + warmAlpha.toFixed(3) + ')' : 'rgba(250,61,29,' + warmAlpha.toFixed(3) + ')';
      ctx.lineWidth = 1.2; ctx.stroke();
    }
    // Vignette
    var vigGr = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGr.addColorStop(0, 'rgba(0,0,0,0)'); vigGr.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGr; ctx.fillRect(0, 0, W, H);
  }

  // Principle 5: Thoughtful — micro details + faint fibonacci spiral on mouse proximity
  function renderThoughtful(t, now) {
    var cx = W/2, cy = H/2;
    var elapsed = (now - timeStart) * 0.001;
    var mx = mouseX * W, my = mouseY * H;
    var cellSz = 32;
    var cols = Math.ceil(W / cellSz) + 1;
    var rows = Math.ceil(H / cellSz) + 1;
    ctx.strokeStyle = 'rgba(225,225,254,0.04)'; ctx.lineWidth = 0.4;
    for (var ci = 0; ci <= cols; ci++) {
      ctx.beginPath(); ctx.moveTo(ci*cellSz,0); ctx.lineTo(ci*cellSz,H); ctx.stroke();
    }
    for (var ri = 0; ri <= rows; ri++) {
      ctx.beginPath(); ctx.moveTo(0,ri*cellSz); ctx.lineTo(W,ri*cellSz); ctx.stroke();
    }
    var revealR = 150;
    var colPalette = ['#C679C4','#FA3D1D','#FFB005','#E1E1FE','#0358F7','#56C2FF'];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var px = c * cellSz, py = r * cellSz;
        var dx2 = px - mx, dy2 = py - my;
        var dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
        var nearness = 1 - Math.min(1, dist2 / revealR);
        var colIdx = (c + r) % colPalette.length;
        var colHex = colPalette[colIdx];
        var rr = parseInt(colHex.slice(1,3),16), gg = parseInt(colHex.slice(3,5),16), bb = parseInt(colHex.slice(5,7),16);
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba('+rr+','+gg+','+bb+','+(nearness * 0.6 + 0.02).toFixed(3)+')';
        ctx.fill();
      }
    }
    // Fibonacci spiral appears near mouse
    var mouseDist = Math.sqrt(Math.pow(mouseX * W - cx, 2) + Math.pow(mouseY * H - cy, 2));
    var spiralReveal = Math.max(0, 1 - mouseDist / (W * 0.4));
    if (spiralReveal > 0.05) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.globalAlpha = spiralReveal * 0.35;
      ctx.strokeStyle = 'rgba(86,194,255,1)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      var phi = 1.6180339887;
      var rFib = 3;
      for (var fi = 0; fi < 800; fi++) {
        var angle = fi * 0.1;
        var rr2 = rFib * Math.pow(phi, angle * 2 / (2 * Math.PI));
        if (rr2 > 200) break;
        var xx = Math.cos(angle + elapsed * 0.1) * rr2;
        var yy = Math.sin(angle + elapsed * 0.1) * rr2;
        if (fi === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    if (t > 0.3) {
      var revA = ss(0.3, 1, t);
      for (var ri3 = 1; ri3 <= 3; ri3++) {
        ctx.beginPath(); ctx.arc(cx, cy, ri3 * 55, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(86,194,255,' + (revA * 0.12) + ')';
        ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
    // Vignette
    var vigGrT = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGrT.addColorStop(0, 'rgba(0,0,0,0)'); vigGrT.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGrT; ctx.fillRect(0, 0, W, H);
  }

  // Principle 6: Modern — precision crosshair animates stroke-dashoffset
  function renderModern(t, now) {
    var cx = W/2, cy = H/2;
    var elapsed = (now - timeStart) * 0.001;
    var cellSz = 60;
    var cols = Math.ceil(W / cellSz) + 1;
    var rows = Math.ceil(H / cellSz) + 1;
    ctx.strokeStyle = 'rgba(225,225,254,0.10)'; ctx.lineWidth = 0.5;
    for (var ci = 0; ci <= cols; ci++) {
      ctx.beginPath(); ctx.moveTo(ci*cellSz,0); ctx.lineTo(ci*cellSz,H); ctx.stroke();
    }
    for (var ri = 0; ri <= rows; ri++) {
      ctx.beginPath(); ctx.moveTo(0,ri*cellSz); ctx.lineTo(W,ri*cellSz); ctx.stroke();
    }
    var sqSz = 40 + t * 120;
    for (var s = 0; s < 4; s++) {
      var sz = sqSz * (1 + s * 0.55);
      var alpha = (0.08 + t * 0.12) * (1 - s * 0.2);
      ctx.beginPath(); ctx.rect(cx - sz/2, cy - sz/2, sz, sz);
      ctx.strokeStyle = 'rgba(225,225,254,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1 - s * 0.18; ctx.stroke();
    }
    // Animated crosshair drawing using dash progress
    var crossR = 80;
    var progress = Math.min(1, (elapsed % 4) / 2); // redraws every 4s
    ctx.save();
    ctx.strokeStyle = 'rgba(225,225,254,' + (t * 0.7).toFixed(3) + ')';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([crossR * 2 * progress, crossR * 2 * (1 - progress)]);
    ctx.lineDashOffset = 0;
    ctx.beginPath(); ctx.moveTo(cx - crossR, cy); ctx.lineTo(cx + crossR, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - crossR); ctx.lineTo(cx, cy + crossR); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    gr.addColorStop(0, 'rgba(225,225,254,' + (t * 0.25) + ')');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,' + t + ')'; ctx.fill();
    // Vignette
    var vigGrM = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.2, cx, cy, Math.max(W,H)*0.75);
    vigGrM.addColorStop(0, 'rgba(0,0,0,0)'); vigGrM.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vigGrM; ctx.fillRect(0, 0, W, H);
  }

  var renderFns = [renderAlive, renderBeautiful, renderIntuitive, renderHuman, renderThoughtful, renderModern];

  function frame(now) {
    ctx.clearRect(0, 0, W, H);
    // NO background fill
    smoothP += (targetP - smoothP) * 0.04;
    var pIdx = Math.min(Math.floor(smoothP * NUM_P), NUM_P - 1);
    var pT = (smoothP * NUM_P) - pIdx;
    if (renderFns[pIdx]) renderFns[pIdx](pT, now);
    requestAnimationFrame(frame);
  }

  function onScroll() {
    var rect = sec.getBoundingClientRect();
    var secH = sec.offsetHeight, vh = window.innerHeight;
    var inSection = rect.top < vh && rect.bottom > 0;
    if (sticky) sticky.style.visibility = (inSection && rect.top <= 0 && rect.bottom >= vh) ? 'visible' : 'hidden';
    if (!inSection) { canvas.style.opacity = '0'; return; }
    if (!initialized) { initialized = true; setup(); requestAnimationFrame(frame); }
    canvas.style.opacity = '1';

    var p = Math.max(0, Math.min(1, (-rect.top) / (secH - vh)));
    targetP = p;
    var pIdx = Math.min(Math.floor(p * NUM_P), NUM_P - 1);
    if (pIdx !== curP) {
      curP = pIdx;
      var pr = principles[pIdx];
      if (wordEl) wordEl.textContent = pr.word;
      if (principleEl) {
        principleEl.classList.remove('visible');
        setTimeout(function () { principleEl.classList.add('visible'); }, 40);
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ════════════════════════════════════════════════════════════════════════════
// ACT VII — Product Universe: Glass objects + Particle Threads + Parallax
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var sec          = document.getElementById('section7');
  var scene        = document.getElementById('s7Scene');
  var threadsCanvas = document.getElementById('s7Threads');
  if (!sec || !scene) return;

  var ctx, W, H, dpr;
  var initialized = false;
  var timeStart;
  var objects = [];

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    if (threadsCanvas) {
      threadsCanvas.width  = Math.round(W * dpr);
      threadsCanvas.height = Math.round(H * dpr);
      threadsCanvas.style.width  = W + 'px';
      threadsCanvas.style.height = H + 'px';
      ctx = threadsCanvas.getContext('2d');
      ctx.scale(dpr, dpr);
    }
    timeStart = performance.now();
    objects = [
      { x: W/2 - 220 + 140, y: H/2, depth: 1.0   },
      { x: W/2 + 80  + 90,  y: H/2, depth: 0.7   },
      { x: W/2 + 260 + 80,  y: H/2 - 160 + 80, depth: 1.3 },
      { x: W/2 - 400 + 60,  y: H/2 + 60  + 100, depth: 0.5 },
      { x: W/2 - 60,        y: H/2 - 250, depth: 1.5 },
      { x: W/2 + 320,       y: H/2 + 80,  depth: 0.8 }
    ];
  }

  window.addEventListener('resize', function () {
    if (!initialized) return;
    if (ctx) ctx.setTransform(1,0,0,1,0,0);
    setup();
    if (objects.length > 1) buildThreads();
  });

  var threads = [];
  var NUM_THREADS = 140;
  function buildThreads() {
    threads = [];
    for (var i = 0; i < NUM_THREADS; i++) {
      var from = objects[Math.floor(Math.random() * objects.length)];
      var to   = objects[Math.floor(Math.random() * objects.length)];
      threads.push({ x: from.x, y: from.y, tx: to.x, ty: to.y, t: Math.random(), speed: 0.003 + Math.random() * 0.003 });
    }
  }

  function frame() {
    if (ctx) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < threads.length; i++) {
        var th = threads[i];
        th.t += th.speed;
        if (th.t > 1) {
          th.t = 0;
          var from = objects[Math.floor(Math.random() * objects.length)];
          var to   = objects[Math.floor(Math.random() * objects.length)];
          th.x = from.x; th.y = from.y; th.tx = to.x; th.ty = to.y;
        }
        var px = th.x + (th.tx - th.x) * th.t;
        var py = th.y + (th.ty - th.y) * th.t;
        var alpha = Math.sin(th.t * Math.PI) * 0.35;
        ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(86,194,255,' + alpha.toFixed(3) + ')'; ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }

  function onScroll() {
    var rect = sec.getBoundingClientRect();
    var secH = sec.offsetHeight, vh = window.innerHeight;
    var inSection = rect.top <= 0 && rect.bottom >= vh;
    scene.style.visibility = inSection ? 'visible' : 'hidden';
    if (!inSection) return;
    if (!initialized) {
      initialized = true;
      setup();
      if (objects.length > 1) buildThreads();
      requestAnimationFrame(frame);
    }
    var p = Math.max(0, Math.min(1, (-rect.top) / (secH - vh)));
    // Parallax: each object depth controls how much it shifts
    var depthShifts = [0, 28, -18, 12, -24, 16];
    var objs = sec.querySelectorAll('.s7-object');
    objs.forEach(function (el, i) {
      var depth = objects[i] ? objects[i].depth : 1.0;
      var shift = (depthShifts[i] || 0) * p * depth;
      // Preserve CSS base transforms via data attribute trick
      var base = el.dataset.baseTY || '0';
      el.style.transform = el.style.transform.replace(/translateY\([^)]+\)\s*$/,'') + ' translateY(' + (parseFloat(base) + shift) + 'px)';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ════════════════════════════════════════════════════════════════════════════
// ACT VIII — Future: Particle Drift + Nebula Blobs (uses global canvas bg)
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var sec           = document.getElementById('section8');
  var particleCanvas = document.getElementById('s8Particles');
  var words          = document.querySelectorAll('#section8 .s8-word');
  if (!sec) return;

  var initialized = false;
  var ctx2d, W, H, dpr;
  var particles = [];
  var nebulas = [];
  var N_DRIFT = 600;
  var N_NEBULA = 18;
  var timeStart;

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    if (particleCanvas) {
      particleCanvas.width  = Math.round(W * dpr);
      particleCanvas.height = Math.round(H * dpr);
      particleCanvas.style.width  = W + 'px';
      particleCanvas.style.height = H + 'px';
      ctx2d = particleCanvas.getContext('2d');
      ctx2d.scale(dpr, dpr);
    }
    particles = [];
    for (var i = 0; i < N_DRIFT; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H + H * 0.1,
        vx: (Math.random() - 0.5) * 0.3, vy: -(0.2 + Math.random() * 0.5),
        alpha: 0.1 + Math.random() * 0.4, size: 0.6 + Math.random() * 1.4
      });
    }
    // Nebula blobs: large slow-moving color blobs that drift upward
    nebulas = [];
    var nebColors = [
      [198,121,196],[86,194,255],[3,88,247],[225,225,254],[89,212,153],[250,61,29]
    ];
    for (var n = 0; n < N_NEBULA; n++) {
      nebulas.push({
        x: Math.random() * W,
        y: Math.random() * H + H * 0.2,
        vy: -(0.08 + Math.random() * 0.14),
        vx: (Math.random() - 0.5) * 0.06,
        r: 100 + Math.random() * 200,
        col: nebColors[n % nebColors.length],
        alpha: 0.035 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
    timeStart = performance.now();
  }

  window.addEventListener('resize', function () {
    if (!initialized) return;
    if (ctx2d) ctx2d.setTransform(1,0,0,1,0,0);
    setup();
  });

  function frame(now) {
    if (ctx2d) {
      ctx2d.clearRect(0, 0, W, H);

      // Nebula blobs
      for (var n = 0; n < nebulas.length; n++) {
        var nb = nebulas[n];
        nb.x += nb.vx; nb.y += nb.vy;
        if (nb.y < -nb.r * 2) { nb.y = H + nb.r; nb.x = Math.random() * W; }
        var c = nb.col;
        var gr = ctx2d.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.r);
        gr.addColorStop(0, 'rgba('+c[0]+','+c[1]+','+c[2]+','+nb.alpha+')');
        gr.addColorStop(1, 'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
        ctx2d.fillStyle = gr;
        ctx2d.beginPath(); ctx2d.arc(nb.x, nb.y, nb.r, 0, Math.PI*2);
        ctx2d.fill();
      }

      // Fine particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy -= 0.001;
        if (p.y < -10) { p.y = H + 5; p.x = Math.random() * W; p.vy = -(0.2 + Math.random() * 0.5); }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        var a = p.alpha * (0.5 + 0.5 * Math.sin(now * 0.001 + i));
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx2d.fillStyle = 'rgba(225,225,254,' + a.toFixed(3) + ')'; ctx2d.fill();
      }
    }
    requestAnimationFrame(frame);
  }

  var wordsShown = false;
  function onScroll() {
    var rect = sec.getBoundingClientRect();
    var inSection = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inSection) return;
    if (!initialized) {
      initialized = true;
      setup();
      requestAnimationFrame(frame);
    }
    if (!wordsShown && rect.top < window.innerHeight * 0.85) {
      wordsShown = true;
      words.forEach(function (w, i) {
        setTimeout(function () { w.classList.add('visible'); }, 200 + i * 130);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR — dismiss + push header down
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var bar    = document.getElementById('announceBar');
  var close  = document.getElementById('announceClose');
  var header = document.getElementById('siteHeader');
  if (!bar) return;

  // Only show if not previously dismissed this session
  if (sessionStorage.getItem('announceDismissed')) {
    bar.classList.add('hidden');
  } else {
    document.body.classList.add('announce-visible');
  }

  close.addEventListener('click', function () {
    bar.classList.add('hidden');
    document.body.classList.remove('announce-visible');
    sessionStorage.setItem('announceDismissed', '1');
  });
})();

// ════════════════════════════════════════════════════════════════════════════
// HEADER + ANNOUNCE BAR — hide after hero, show inside hero
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var header  = document.getElementById('siteHeader');
  var announce = document.getElementById('announceBar');
  if (!header) return;

  function onScroll() {
    var pastHero = window.scrollY > window.innerHeight * 0.85;
    header.classList.toggle('header--hidden', pastHero);
    if (announce && !announce.classList.contains('hidden')) {
      announce.classList.toggle('announce--hero-only', pastHero);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ════════════════════════════════════════════════════════════════════════════
// MARQUEE — CSS-driven but ensure duplicate track for seamless loop
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var track = document.getElementById('marqueeTrack');
  if (!track) return;
  // Clone the track content to create a seamless infinite loop
  var clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentNode.appendChild(clone);
})();

// ════════════════════════════════════════════════════════════════════════════
// BLINK STATEMENT — word morphing animation
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var morph1 = document.getElementById('blinkMorph');
  var morph2 = document.getElementById('blinkMorph2');
  if (!morph1 || !morph2) return;

  var words1 = ['crafted', 'considered', 'intentional', 'purposeful', 'alive'];
  var words2 = ['purposeful', 'meaningful', 'resonant', 'lasting', 'human'];
  var idx1 = 0, idx2 = 0;

  function morphWord(el, words, idxRef) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'opacity 300ms ease, transform 300ms ease';
    setTimeout(function () {
      idxRef.val = (idxRef.val + 1) % words.length;
      el.textContent = words[idxRef.val];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 320);
  }

  var ref1 = { val: 0 }, ref2 = { val: 0 };
  morph1.style.transition = 'opacity 300ms ease, transform 300ms ease';
  morph2.style.transition = 'opacity 300ms ease, transform 300ms ease';

  setInterval(function () { morphWord(morph1, words1, ref1); }, 2800);
  setTimeout(function () {
    setInterval(function () { morphWord(morph2, words2, ref2); }, 2800);
  }, 1400);
})();

// ════════════════════════════════════════════════════════════════════════════
// STATS BAR — count-up animation on scroll-into-view
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var bar = document.querySelector('.stats-bar');
  if (!bar) return;

  var values = bar.querySelectorAll('.stat-value');
  var triggered = false;

  function countUp(el) {
    var target = parseInt(el.dataset.target, 10);
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  function onScroll() {
    if (triggered) return;
    var rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      triggered = true;
      values.forEach(function (el, i) {
        setTimeout(function () { countUp(el); }, i * 120);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ════════════════════════════════════════════════════════════════════════════
// PILLARS — scroll-reveal with stagger
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var cards = document.querySelectorAll('.pillar-card');
  if (!cards.length) return;

  function onScroll() {
    cards.forEach(function (card, i) {
      var rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        setTimeout(function () {
          card.classList.add('visible');
        }, i * 80);
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ════════════════════════════════════════════════════════════════════════════
// BLINK STATEMENT — intersection observer reveal
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var section = document.getElementById('blinkStatement');
  if (!section) return;

  section.style.opacity = '0';
  section.style.transform = 'translateY(32px)';
  section.style.transition = 'opacity 900ms cubic-bezier(0.22,1,0.36,1), transform 900ms cubic-bezier(0.22,1,0.36,1)';

  function onScroll() {
    var rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ════════════════════════════════════════════════════════════════════════════
// INNOVATION ENGINEERING — sui.io-style scroll timeline (rebuilt)
// Neural bg + scroll tracker + 8 card canvas animations
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────────────────
  function hexToRgba(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(3) + ')';
  }

  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ── 1. Neural background canvas ────────────────────────────────────────────
  (function initNeural() {
    var canvas = document.getElementById('ie2Neural');
    if (!canvas) return;

    var ctx2d, W, H, dpr;
    var nodes = [];
    var NUM_NODES = 32;
    var PRISM = [
      [198, 121, 196], [82, 48, 145], [86, 194, 255],
      [3, 88, 247],    [89, 212, 153], [255, 176, 5],
      [198, 121, 196], [86, 194, 255]
    ];
    var rng = mulberry32(901);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (ctx2d) {
        ctx2d.setTransform(1, 0, 0, 1, 0, 0);
        ctx2d.scale(dpr, dpr);
      }
    }

    function buildNodes() {
      nodes = [];
      for (var i = 0; i < NUM_NODES; i++) {
        var c = PRISM[i % PRISM.length];
        var tier = i < 8 ? 0 : i < 20 ? 1 : 2; // inner / mid / outer
        nodes.push({
          bx: rng() * W,
          by: rng() * H,
          x: 0, y: 0,
          phase:  rng() * Math.PI * 2,
          phase2: rng() * Math.PI * 2,
          speed:  0.08 + rng() * 0.10,
          amp:    20 + rng() * 40,
          radius: tier === 0 ? 14 + rng() * 10 : tier === 1 ? 8 + rng() * 7 : 4 + rng() * 5,
          r: c[0], g: c[1], b: c[2],
          baseAlpha: tier === 0 ? 0.10 + rng() * 0.08 : tier === 1 ? 0.06 + rng() * 0.06 : 0.04 + rng() * 0.04,
          tier: tier
        });
        nodes[i].x = nodes[i].bx;
        nodes[i].y = nodes[i].by;
      }
    }

    // Two slow-drifting atmospheric radial "pools"
    var pool1 = { x: 0.3, y: 0.25, r: 198, g: 121, b: 196 };
    var pool2 = { x: 0.7, y: 0.65, r: 86,  g: 194, b: 255 };

    function frame(now) {
      if (!ctx2d) return;
      var t = now * 0.001;
      ctx2d.clearRect(0, 0, W, H);

      // Atmospheric pools — very subtle, large, slow
      var p1x = W * (pool1.x + Math.sin(t * 0.04) * 0.06);
      var p1y = H * (pool1.y + Math.cos(t * 0.03) * 0.05);
      var gr1 = ctx2d.createRadialGradient(p1x, p1y, 0, p1x, p1y, Math.min(W, H) * 0.45);
      gr1.addColorStop(0, 'rgba(' + pool1.r + ',' + pool1.g + ',' + pool1.b + ',0.055)');
      gr1.addColorStop(1, 'rgba(' + pool1.r + ',' + pool1.g + ',' + pool1.b + ',0)');
      ctx2d.fillStyle = gr1;
      ctx2d.fillRect(0, 0, W, H);

      var p2x = W * (pool2.x + Math.sin(t * 0.035 + 1.2) * 0.07);
      var p2y = H * (pool2.y + Math.cos(t * 0.028 + 0.8) * 0.06);
      var gr2 = ctx2d.createRadialGradient(p2x, p2y, 0, p2x, p2y, Math.min(W, H) * 0.40);
      gr2.addColorStop(0, 'rgba(' + pool2.r + ',' + pool2.g + ',' + pool2.b + ',0.045)');
      gr2.addColorStop(1, 'rgba(' + pool2.r + ',' + pool2.g + ',' + pool2.b + ',0)');
      ctx2d.fillStyle = gr2;
      ctx2d.fillRect(0, 0, W, H);

      // Update node positions
      for (var i = 0; i < NUM_NODES; i++) {
        var n = nodes[i];
        n.x = n.bx + Math.sin(t * n.speed + n.phase) * n.amp;
        n.y = n.by + Math.cos(t * n.speed * 0.7 + n.phase2) * (n.amp * 0.65);
        // Wrap within bounds
        if (n.x < -60) n.x += W + 60;
        if (n.x > W + 60) n.x -= W + 60;
        if (n.y < -60) n.y += H + 60;
        if (n.y > H + 60) n.y -= H + 60;
      }

      // Connection lines — tiered connection distances
      for (var a = 0; a < NUM_NODES; a++) {
        for (var b = a + 1; b < NUM_NODES; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var maxD = nodes[a].tier === 0 || nodes[b].tier === 0 ? 260 : 160;
          if (dist < maxD) {
            var strength = 1 - dist / maxD;
            // Color blends between the two connected nodes
            var mr = Math.round((nodes[a].r + nodes[b].r) / 2);
            var mg = Math.round((nodes[a].g + nodes[b].g) / 2);
            var mb = Math.round((nodes[a].b + nodes[b].b) / 2);
            var lineAlpha = strength * 0.055;
            ctx2d.beginPath();
            ctx2d.moveTo(nodes[a].x, nodes[a].y);
            ctx2d.lineTo(nodes[b].x, nodes[b].y);
            ctx2d.strokeStyle = 'rgba(' + mr + ',' + mg + ',' + mb + ',' + lineAlpha.toFixed(3) + ')';
            ctx2d.lineWidth = strength * 0.7;
            ctx2d.stroke();
          }
        }
      }

      // Draw nodes — larger inner nodes with stronger glow
      for (var i = 0; i < NUM_NODES; i++) {
        var n = nodes[i];
        var pulse = 1 + 0.18 * Math.sin(t * 0.9 + n.phase);
        var glowR = n.radius * pulse * (n.tier === 0 ? 3.5 : 2.5);
        var coreR = n.tier === 0 ? 2.5 : n.tier === 1 ? 1.8 : 1.2;

        // Outer glow halo
        var gr = ctx2d.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        gr.addColorStop(0, 'rgba(' + n.r + ',' + n.g + ',' + n.b + ',' + (n.baseAlpha * 1.6) + ')');
        gr.addColorStop(0.4, 'rgba(' + n.r + ',' + n.g + ',' + n.b + ',' + (n.baseAlpha * 0.6) + ')');
        gr.addColorStop(1, 'rgba(' + n.r + ',' + n.g + ',' + n.b + ',0)');
        ctx2d.beginPath();
        ctx2d.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx2d.fillStyle = gr;
        ctx2d.fill();

        // Core dot
        ctx2d.beginPath();
        ctx2d.arc(n.x, n.y, coreR * pulse, 0, Math.PI * 2);
        ctx2d.fillStyle = 'rgba(' + n.r + ',' + n.g + ',' + n.b + ',' + (n.baseAlpha * 5) + ')';
        ctx2d.fill();
      }

      requestAnimationFrame(frame);
    }

    function init() {
      ctx2d = canvas.getContext('2d');
      resize();
      ctx2d.scale(dpr, dpr);
      buildNodes();
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () { resize(); buildNodes(); });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();


  // ── 2. Scroll tracker — moves down the dotted spine ───────────────────────
  (function initTracker() {
    var tracker = document.getElementById('ie2Tracker');
    var spine   = document.getElementById('ie2Spine');
    var body    = document.getElementById('ie2Body');
    if (!tracker || !spine || !body) return;

    var targetY = 0, currentY = 0, velocity = 0;

    function getTarget() {
      var bodyRect = body.getBoundingClientRect();
      var spineH   = spine.offsetHeight;
      var viewMid  = window.innerHeight * 0.5;
      var pxPast   = viewMid - bodyRect.top;
      var pct      = Math.max(0, Math.min(1, pxPast / bodyRect.height));
      targetY = pct * spineH;
    }

    function animate() {
      var diff = targetY - currentY;
      velocity += (diff - velocity) * 0.08;
      currentY += velocity * 0.28;
      if (Math.abs(diff) < 0.5) currentY = targetY;
      tracker.style.transform = 'translate(-50%, ' + currentY + 'px)';
      requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', getTarget, { passive: true });
    window.addEventListener('resize', getTarget);
    getTarget();
    animate();
  })();


  // ── 3. Card entrance via IntersectionObserver ──────────────────────────────
  (function initCardReveal() {
    var rows = document.querySelectorAll('[data-ie2-row]');
    if (!rows.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card = entry.target.querySelector('.ie2-card');
          if (card) card.classList.add('ie2-card--visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.20 });

    rows.forEach(function (row) { obs.observe(row); });
  })();


  // ── 4. Card canvas animations ─────────────────────────────────────────────
  // All 8 drawers keyed by data-ie2-canvas value.
  // Signature: drawer(ctx, W, H, t, dpr) — called every frame.

  var drawers = {

    // Card 01: IAM — Layered access gates (rose)
    iam: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var numBars = 7;
      var barH    = 14;
      var spacing = (H - numBars * barH) / (numBars + 1);
      var cycle   = (t * 0.0004) % 1; // 0→1 every ~2.5s

      for (var i = 0; i < numBars; i++) {
        var barY = spacing + i * (barH + spacing);
        // Unlock wave travels left-to-right with offset per bar
        var unlockT = Math.max(0, Math.min(1, cycle * (numBars + 1) - i));
        var unlockEased = 1 - Math.pow(1 - unlockT, 3);

        // Bar width animated: locked = full width, unlocking = splits open
        var fullW = W * 0.72;
        var centerX = W / 2;
        var gapW = unlockEased * fullW * 0.38;

        // Left segment
        var lW = (fullW - gapW) / 2;
        var lX = centerX - fullW / 2;
        // Right segment
        var rX = centerX + gapW / 2;

        var alpha = 0.18 + unlockEased * 0.45;
        var rVal = Math.round(198 + unlockEased * 30);
        var gVal = Math.round(121 + unlockEased * 20);
        var bVal = Math.round(196 + unlockEased * 30);

        // Traveling glow wave
        var waveX = centerX - fullW / 2 + unlockEased * fullW;
        var waveGr = ctx.createRadialGradient(waveX, barY + barH / 2, 0, waveX, barY + barH / 2, 40);
        waveGr.addColorStop(0, 'rgba(' + rVal + ',' + gVal + ',' + bVal + ',' + (unlockEased * 0.35) + ')');
        waveGr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = waveGr;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(' + rVal + ',' + gVal + ',' + bVal + ',' + alpha + ')';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(lX, barY, Math.max(0, lW), barH, 2) : ctx.rect(lX, barY, Math.max(0, lW), barH);
        ctx.fill();

        ctx.fillStyle = 'rgba(' + rVal + ',' + gVal + ',' + bVal + ',' + alpha + ')';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(rX, barY, Math.max(0, lW), barH, 2) : ctx.rect(rX, barY, Math.max(0, lW), barH);
        ctx.fill();

        // Central lock icon in gap (when unlocked, it fades)
        if (unlockT < 0.9) {
          var lockAlpha = (1 - unlockEased) * 0.5;
          ctx.strokeStyle = 'rgba(198,121,196,' + lockAlpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.strokeRect(centerX - 4, barY + 1, 8, barH - 2);
        }
      }
    },

    // Card 02: Real-time Orchestration — Live signal pulses (cyan)
    rto: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var numLines = 5;
      var lineSpacing = H / (numLines + 1);
      var speeds = [0.00028, 0.00022, 0.00034, 0.00018, 0.00030];
      var offsets = [0, 0.2, 0.4, 0.6, 0.8];

      for (var i = 0; i < numLines; i++) {
        var lineY = lineSpacing * (i + 1);
        var amp   = 6 + i * 1.5;
        var freq  = 0.025 + i * 0.005;

        // Draw oscillating base line
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        for (var x = 0; x <= W; x += 2) {
          var wave = amp * Math.sin(x * freq + t * 0.002 + offsets[i] * Math.PI * 2);
          ctx.lineTo(x, lineY + wave);
        }
        ctx.strokeStyle = 'rgba(86,194,255,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Traveling dot on the line
        var dotProgress = ((t * speeds[i] + offsets[i]) % 1);
        var dotX = dotProgress * (W + 40) - 20;
        var dotY = lineY + amp * Math.sin(dotX * freq + t * 0.002 + offsets[i] * Math.PI * 2);

        // Glow trail behind dot
        var trailGr = ctx.createLinearGradient(dotX - 60, 0, dotX + 8, 0);
        trailGr.addColorStop(0, 'rgba(86,194,255,0)');
        trailGr.addColorStop(1, 'rgba(86,194,255,0.18)');
        ctx.strokeStyle = trailGr;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        var trailStart = Math.max(0, dotX - 60);
        ctx.moveTo(trailStart, lineY + amp * Math.sin(trailStart * freq + t * 0.002 + offsets[i] * Math.PI * 2));
        for (var tx = trailStart; tx <= dotX; tx += 2) {
          ctx.lineTo(tx, lineY + amp * Math.sin(tx * freq + t * 0.002 + offsets[i] * Math.PI * 2));
        }
        ctx.stroke();

        // Dot itself
        var dotGr = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
        dotGr.addColorStop(0, 'rgba(86,194,255,0.9)');
        dotGr.addColorStop(1, 'rgba(86,194,255,0)');
        ctx.beginPath();
        ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = dotGr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
      }
    },

    // Card 03: AI Orchestration — Predictive routing tree (violet→cyan)
    aio: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var cx    = W / 2;
      var rootY = H * 0.12;
      var cycle = (t * 0.00025) % 1;
      var levels = 3;
      var levelH = (H * 0.78) / levels;

      // Build tree nodes
      var tree = [
        { x: cx, y: rootY, level: 0, idx: 0, children: [1, 2] },
        { x: cx - W * 0.22, y: rootY + levelH, level: 1, idx: 1, children: [3, 4] },
        { x: cx + W * 0.22, y: rootY + levelH, level: 1, idx: 2, children: [5, 6] },
        { x: cx - W * 0.33, y: rootY + levelH * 2, level: 2, idx: 3, children: [] },
        { x: cx - W * 0.11, y: rootY + levelH * 2, level: 2, idx: 4, children: [] },
        { x: cx + W * 0.11, y: rootY + levelH * 2, level: 2, idx: 5, children: [] },
        { x: cx + W * 0.33, y: rootY + levelH * 2, level: 2, idx: 6, children: [] }
      ];

      // Signal travels root → branch based on cycle
      var activeNodeIdx = Math.floor(cycle * 7);
      var signalT = (cycle * 7) % 1;

      // Draw edges
      for (var i = 0; i < tree.length; i++) {
        var node = tree[i];
        for (var j = 0; j < node.children.length; j++) {
          var child = tree[node.children[j]];
          var edgeActive = (node.idx <= activeNodeIdx);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(child.x, child.y);
          ctx.strokeStyle = edgeActive ? 'rgba(198,121,196,0.35)' : 'rgba(255,255,255,0.08)';
          ctx.lineWidth = edgeActive ? 1.2 : 0.6;
          ctx.stroke();

          // Traveling signal on active edge
          if (node.idx === activeNodeIdx - 1 || (activeNodeIdx === 0 && signalT < 0.5)) {
            var progress = signalT;
            var sx = node.x + (child.x - node.x) * progress;
            var sy = node.y + (child.y - node.y) * progress;
            var tVal = node.level / levels;
            var r2 = Math.round(198 + tVal * (86 - 198));
            var g2 = Math.round(121 + tVal * (194 - 121));
            var b2 = Math.round(196 + tVal * (255 - 196));
            var sigGr = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
            sigGr.addColorStop(0, 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0.8)');
            sigGr.addColorStop(1, 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0)');
            ctx.beginPath();
            ctx.arc(sx, sy, 10, 0, Math.PI * 2);
            ctx.fillStyle = sigGr;
            ctx.fill();
          }
        }
      }

      // Draw nodes
      for (var i = 0; i < tree.length; i++) {
        var n = tree[i];
        var isActive = (n.idx <= activeNodeIdx);
        var tVal = n.level / levels;
        var r2 = Math.round(198 + tVal * (86 - 198));
        var g2 = Math.round(121 + tVal * (194 - 121));
        var b2 = Math.round(196 + tVal * (255 - 196));

        if (isActive) {
          var glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 18);
          glow.addColorStop(0, 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0.25)');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, isActive ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isActive
          ? 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0.9)'
          : 'rgba(255,255,255,0.15)';
        ctx.fill();
      }
    },

    // Card 04: Distributed Architecture — Global connected nodes (signal blue)
    dist: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var rng2 = mulberry32(42);
      var numNodes = 12;
      var positions = [];
      for (var i = 0; i < numNodes; i++) {
        positions.push({
          x: W * 0.08 + rng2() * W * 0.84,
          y: H * 0.10 + rng2() * H * 0.80
        });
      }

      var cycle = (t * 0.0002) % 1;
      var failingNode = Math.floor((t * 0.00008) % numNodes);
      var failCycle   = ((t * 0.0003) % 1);
      var nodeFailing = failCycle > 0.4 && failCycle < 0.75;

      // Draw edges
      for (var a = 0; a < numNodes; a++) {
        for (var b = a + 1; b < numNodes; b++) {
          var dx = positions[a].x - positions[b].x;
          var dy = positions[a].y - positions[b].y;
          var dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < W * 0.38) {
            var aFail = (a === failingNode || b === failingNode) && nodeFailing;
            ctx.beginPath();
            ctx.moveTo(positions[a].x, positions[a].y);
            ctx.lineTo(positions[b].x, positions[b].y);
            ctx.strokeStyle = aFail ? 'rgba(255,50,50,0.08)' : 'rgba(3,88,247,0.18)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Traveling signal on random edges
      var sigIdx = Math.floor((t * 0.00015) % numNodes);
      var sigNext = (sigIdx + 3) % numNodes;
      var sigT = (t * 0.00045) % 1;
      var sx = positions[sigIdx].x + (positions[sigNext].x - positions[sigIdx].x) * sigT;
      var sy = positions[sigIdx].y + (positions[sigNext].y - positions[sigIdx].y) * sigT;
      var sigGr = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
      sigGr.addColorStop(0, 'rgba(3,88,247,0.7)');
      sigGr.addColorStop(1, 'rgba(3,88,247,0)');
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.fillStyle = sigGr;
      ctx.fill();

      // Draw nodes
      for (var i = 0; i < numNodes; i++) {
        var isFailing = (i === failingNode) && nodeFailing;
        var pulse = 1 + 0.2 * Math.sin(t * 0.003 + i * 0.7);
        var nAlpha = isFailing ? 0.15 : 0.7;
        var nColor = isFailing ? 'rgba(255,50,50,' : 'rgba(3,88,247,';

        var ngr = ctx.createRadialGradient(positions[i].x, positions[i].y, 0, positions[i].x, positions[i].y, 16 * pulse);
        ngr.addColorStop(0, nColor + (nAlpha * 0.4) + ')');
        ngr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(positions[i].x, positions[i].y, 16 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = ngr;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(positions[i].x, positions[i].y, 3 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = nColor + nAlpha + ')';
        ctx.fill();
      }
    },

    // Card 05: Workflow Automation — Chaotic to ordered paths (amber)
    wfa: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var cycle  = ((t * 0.00028) % 1);
      var order  = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2; // triangle wave 0→1→0
      var smooth = 1 - Math.pow(1 - order, 3);
      var numPaths = 6;

      for (var i = 0; i < numPaths; i++) {
        var laneY = H * 0.12 + (i / (numPaths - 1)) * H * 0.76;
        var targetY = H * 0.12 + (i / (numPaths - 1)) * H * 0.76;
        var amplitude = (1 - smooth) * 28;
        var freq = 0.018 + i * 0.006;
        var phOff = i * 0.9;

        var alpha = 0.15 + smooth * 0.45;
        var r2 = Math.round(255);
        var g2 = Math.round(176 - smooth * 40);
        var b2 = Math.round(5 + smooth * 10);

        ctx.beginPath();
        ctx.moveTo(0, laneY + amplitude * Math.sin(phOff));
        for (var x = 0; x <= W; x += 3) {
          var chaos = amplitude * Math.sin(x * freq + phOff + t * 0.0015);
          var ordered = 0;
          var y = targetY + chaos * (1 - smooth) + ordered * smooth;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',' + alpha + ')';
        ctx.lineWidth = 1 + smooth * 0.8;
        ctx.stroke();
      }

      // Glow at the "ordered" state peaks
      if (smooth > 0.6) {
        var glowA = (smooth - 0.6) / 0.4 * 0.12;
        var gr = ctx.createLinearGradient(0, 0, W, 0);
        gr.addColorStop(0, 'rgba(255,176,5,0)');
        gr.addColorStop(0.5, 'rgba(255,176,5,' + glowA + ')');
        gr.addColorStop(1, 'rgba(255,176,5,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }
    },

    // Card 06: Event-Driven Systems — Cascading event ripples (mint)
    evd: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var rng3 = mulberry32(77);
      var SPAWN_INTERVAL = 800; // ms between spawns
      var MAX_EVENTS = 6;

      // Build deterministic event list from time
      var events = [];
      for (var i = 0; i < MAX_EVENTS; i++) {
        var spawnTime = i * SPAWN_INTERVAL + rng3() * 200;
        var cycleLen  = MAX_EVENTS * SPAWN_INTERVAL + 400;
        var tMod      = t % cycleLen;
        var age       = tMod - spawnTime;
        if (age < 0) age += cycleLen;
        if (age > 2200) continue;

        var progress = age / 2200;
        var ex = W * 0.15 + rng3() * W * 0.70;
        var ey = H * 0.15 + rng3() * H * 0.70;

        // Draw 3 expanding square ripples per event
        for (var r = 0; r < 3; r++) {
          var rProgress = Math.max(0, progress - r * 0.12);
          if (rProgress <= 0) continue;
          var rAlpha = Math.max(0, (1 - rProgress) * 0.45);
          var rSize  = rProgress * 60 + r * 8;
          ctx.strokeStyle = 'rgba(89,212,153,' + rAlpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.strokeRect(ex - rSize / 2, ey - rSize / 2, rSize, rSize);
        }

        // Center dot
        if (progress < 0.25) {
          var dotA = (1 - progress / 0.25) * 0.8;
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(89,212,153,' + dotA + ')';
          ctx.fill();
        }
      }
    },

    // Card 07: Edge & Cloud Infrastructure — Global node distribution (ice)
    edge: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var arcRX = W * 0.38, arcRY = H * 0.30;

      // Draw world arc (ellipse)
      ctx.beginPath();
      ctx.ellipse(cx, cy, arcRX, arcRY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(225,225,254,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Edge nodes placed around the arc
      var edgeNodes = [];
      var numEdge = 8;
      for (var i = 0; i < numEdge; i++) {
        var angle = (i / numEdge) * Math.PI * 2;
        edgeNodes.push({
          x: cx + Math.cos(angle) * arcRX,
          y: cy + Math.sin(angle) * arcRY
        });
      }

      // Central cloud node
      var cloudNode = { x: cx, y: cy };

      // Draw connections from edge nodes to center
      var signalSpeed = 0.0003;
      var activePair = Math.floor((t * 0.0002) % numEdge);

      for (var i = 0; i < numEdge; i++) {
        var en = edgeNodes[i];
        ctx.beginPath();
        ctx.moveTo(en.x, en.y);
        ctx.lineTo(cloudNode.x, cloudNode.y);
        ctx.strokeStyle = 'rgba(225,225,254,0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Traveling signals
      for (var i = 0; i < 2; i++) {
        var pairIdx  = (activePair + i * 3) % numEdge;
        var sigT2    = ((t * signalSpeed * (1 + i * 0.3)) % 1);
        var reverse  = i % 2 === 1;
        var sT = reverse ? 1 - sigT2 : sigT2;
        var en = edgeNodes[pairIdx];
        var sx = en.x + (cloudNode.x - en.x) * sT;
        var sy = en.y + (cloudNode.y - en.y) * sT;

        var sgr = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
        sgr.addColorStop(0, 'rgba(225,225,254,0.7)');
        sgr.addColorStop(1, 'rgba(225,225,254,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = sgr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
      }

      // Draw edge nodes
      for (var i = 0; i < numEdge; i++) {
        var en = edgeNodes[i];
        var pulse = 1 + 0.15 * Math.sin(t * 0.002 + i);
        var egr = ctx.createRadialGradient(en.x, en.y, 0, en.x, en.y, 10 * pulse);
        egr.addColorStop(0, 'rgba(225,225,254,0.3)');
        egr.addColorStop(1, 'rgba(225,225,254,0)');
        ctx.beginPath();
        ctx.arc(en.x, en.y, 10 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = egr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(en.x, en.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(225,225,254,0.7)';
        ctx.fill();
      }

      // Central cloud node
      var cpulse = 1 + 0.12 * Math.sin(t * 0.0025);
      var cgr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * cpulse);
      cgr.addColorStop(0, 'rgba(86,194,255,0.3)');
      cgr.addColorStop(1, 'rgba(86,194,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 24 * cpulse, 0, Math.PI * 2);
      ctx.fillStyle = cgr;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    },

    // Card 08: Performance Engineering — Latency bars shrinking to zero (prism)
    perf: function (ctx, W, H, t) {
      ctx.clearRect(0, 0, W, H);
      var numBars = 8;
      var barW    = Math.floor(W * 0.06);
      var spacing = Math.floor((W - numBars * barW) / (numBars + 1));
      var baseMaxH = H * 0.7;
      var minY     = H * 0.12;

      // Triangle loop: 0→1→0 every 3s
      var cycle    = (t * 0.00033) % 1;
      var progress = cycle < 0.6 ? cycle / 0.6 : (1 - cycle) / 0.4;
      var eased    = 1 - Math.pow(1 - progress, 3);

      var PRISM2 = ['#C679C4', '#FA3D1D', '#FFB005', '#E1E1FE', '#0358F7', '#56C2FF', '#59D499', '#C679C4'];

      for (var i = 0; i < numBars; i++) {
        // Each bar has a different natural height + shrinks to near-zero
        var rng4 = mulberry32(i * 17 + 3);
        var naturalH = baseMaxH * (0.35 + rng4() * 0.65);
        var targetH  = naturalH * 0.04 + rng4() * naturalH * 0.04;
        var currentH = naturalH + (targetH - naturalH) * eased;

        var barX = spacing + i * (barW + spacing);
        var barY = minY + (baseMaxH - currentH);

        // Alpha: fades as bars reach zero (satisfying)
        var barAlpha = 0.35 + (1 - eased) * 0.55;

        // Prism gradient per bar
        var hex = PRISM2[i % PRISM2.length];
        ctx.fillStyle = hexToRgba(hex, barAlpha);
        ctx.fillRect(barX, barY, barW, currentH);

        // Top glow on each bar
        var glowGr = ctx.createLinearGradient(barX, barY, barX, barY + Math.min(currentH, 20));
        glowGr.addColorStop(0, hexToRgba(hex, barAlpha * 0.8));
        glowGr.addColorStop(1, hexToRgba(hex, 0));
        ctx.fillStyle = glowGr;
        ctx.fillRect(barX, barY, barW, Math.min(currentH, 20));

        // Value label (shrinking number)
        var ms = Math.round(naturalH * 3 * (1 - eased) + 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.2 + (1 - eased) * 0.5) + ')';
        ctx.font = '9px "SF Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ms + 'ms', barX + barW / 2, barY - 4);
      }

      // Baseline
      ctx.beginPath();
      ctx.moveTo(spacing / 2, minY + baseMaxH);
      ctx.lineTo(W - spacing / 2, minY + baseMaxH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // "OPTIMIZED" label when eased > 0.85
      if (eased > 0.85) {
        var labelA = (eased - 0.85) / 0.15;
        ctx.fillStyle = 'rgba(89,212,153,' + (labelA * 0.6) + ')';
        ctx.font = '10px "SF Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OPTIMIZED', W / 2, H * 0.95);
      }
    }
  };

  // Initialize all card canvases
  function initCardCanvases() {
    var canvases = document.querySelectorAll('.ie2-card-canvas[data-ie2-canvas]');
    canvases.forEach(function (canvas) {
      var key = canvas.getAttribute('data-ie2-canvas');
      if (!drawers[key]) return;

      var ctx = canvas.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      function resize() {
        var W = canvas.offsetWidth;
        var H = canvas.offsetHeight;
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      resize();
      window.addEventListener('resize', resize);

      (function loop(now) {
        var W = canvas.offsetWidth;
        var H = canvas.offsetHeight;
        drawers[key](ctx, W, H, now);
        requestAnimationFrame(loop);
      })(0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardCanvases);
  } else {
    initCardCanvases();
  }
})();







// ════════════════════════════════════════════════════════════════════════════
// CAPABILITY WALL
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var section   = document.getElementById('cwSection');
  var paraEl    = document.getElementById('rcwPara');
  var badgeName = document.getElementById('rcwBadgeName');
  var badgeDesc = document.getElementById('rcwBadgeDesc');
  var canvas    = document.getElementById('cwCanvas');
  if (!section || !paraEl || !canvas) return;

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var activeIdx = -1, initialized = false, isHovered = false;
  var autoTimer = null, raf = null;
  var INTERVAL = 3800;

  var CAPS = [
    { phrase:'Unified product experiences.',  badge:{ name:'One seamless product.', desc:'Every surface, platform, and touchpoint unified under a single coherent experience.' }},
    { phrase:'Design-driven engineering.',    badge:{ name:'Design leads engineering.', desc:'Where most companies separate design from code, we treat them as the same discipline.' }},
    { phrase:'Cross-platform ecosystems.',    badge:{ name:'Everywhere, natively.', desc:'Web, iOS, Android, desktop — each built to feel native, not ported.' }},
    { phrase:'AI-powered operations.',        badge:{ name:'Intelligence built in.', desc:'AI is not a feature. It is the foundation every system is built on top of.' }},
    { phrase:'Scalable modern architecture.', badge:{ name:'Built to grow.', desc:'From ten users to ten million — the architecture never becomes the bottleneck.' }},
    { phrase:'Performance without compromise.',badge:{ name:'Fast is a feature.', desc:'Every millisecond is a design decision. Performance is non-negotiable from day one.' }},
    { phrase:'Automated workflow management.',badge:{ name:'Work that works itself.', desc:'Repetitive processes eliminated. Intelligent automation wired in at every layer.' }},
    { phrase:'Adaptive interfaces.',          badge:{ name:'Interfaces that learn.', desc:'Surfaces that respond to context, usage patterns, and individual needs in real time.' }},
    { phrase:'Self-evolving systems.',        badge:{ name:'Products that improve.', desc:'Systems that observe, learn, and refine themselves continuously without intervention.' }}
  ];

  var SCENE_PALETTES = [
    [86,194,255],[198,121,196],[89,212,153],[86,194,255],[86,194,255],
    [255,176,5],[89,212,153],[198,121,196],[86,194,255]
  ];

  var _acc = [86,194,255];
  function rgba(a){ return 'rgba('+_acc[0]+','+_acc[1]+','+_acc[2]+','+a+')'; }

  function seedRng(seed){
    var s=seed|0;
    return function(){ s^=s<<13;s^=s>>17;s^=s<<5;return(s>>>0)/4294967296; };
  }

  // ── 9 unique scenes (vertical canvas: H >> W) ──────────────────────────
  var SCENES = [
    // 0 — Unified product: vertical spine with orbiting rings
    function(t){
      var cx0=W*0.5,spineX=W*0.5,numRings=5;
      for(var i=0;i<numRings;i++){
        var fy=H*(0.12+i*0.18);
        var orb=t*0.5+(i*Math.PI*2/numRings);
        var nx=cx0+Math.cos(orb)*W*0.30,ny=fy+Math.sin(orb)*H*0.04;
        ctx.strokeStyle=rgba(0.08+0.04*Math.sin(t*0.6+i)); ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.ellipse(cx0,fy,W*0.32,H*0.05,0,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=rgba(0.55); ctx.beginPath(); ctx.arc(nx,ny,3,0,Math.PI*2); ctx.fill();
        var g=ctx.createRadialGradient(nx,ny,0,nx,ny,14);
        g.addColorStop(0,rgba(0.16)); g.addColorStop(1,rgba(0));
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(nx,ny,14,0,Math.PI*2); ctx.fill();
      }
      var sg=ctx.createLinearGradient(spineX,H*0.04,spineX,H*0.96);
      sg.addColorStop(0,rgba(0)); sg.addColorStop(0.5,rgba(0.22)); sg.addColorStop(1,rgba(0));
      ctx.strokeStyle=sg; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(spineX,H*0.04); ctx.lineTo(spineX,H*0.96); ctx.stroke();
      for(var i=0;i<numRings;i++){
        var fy=H*(0.12+i*0.18);
        ctx.fillStyle=rgba(0.50); ctx.beginPath(); ctx.arc(spineX,fy,3.5,0,Math.PI*2); ctx.fill();
        var ph=((t*0.25+i*0.2)%1);
        ctx.fillStyle=rgba(0.38); ctx.beginPath(); ctx.arc(spineX,H*0.12+ph*(H*0.76),1.8,0,Math.PI*2); ctx.fill();
      }
    },

    // 1 — Design-driven: vertical baseline grid + construction system
    function(t){
      var cx=W*0.5,pad=W*0.10;
      // vertical baseline grid — 8 evenly spaced horizontal rules
      for(var k=0;k<8;k++){
        var gy=H*0.08+k*(H*0.84/7);
        var alpha=k===0||k===7?0.22:0.07;
        ctx.strokeStyle=rgba(alpha); ctx.lineWidth=k===0||k===7?0.9:0.5;
        ctx.beginPath(); ctx.moveTo(pad,gy); ctx.lineTo(W-pad,gy); ctx.stroke();
        // tick marks on left edge
        ctx.strokeStyle=rgba(0.28); ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.moveTo(pad-4,gy); ctx.lineTo(pad+4,gy); ctx.stroke();
      }
      // vertical spine column
      ctx.strokeStyle=rgba(0.15); ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(cx,H*0.06); ctx.lineTo(cx,H*0.94); ctx.stroke();
      // 5 golden-ratio rectangles stacked vertically, widths follow phi sequence
      var phi=1.618,rects=[0.82,0.68,0.56,0.46,0.38];
      rects.forEach(function(wr,ri){
        var ry=H*(0.10+ri*0.17),rh=H*0.13;
        var rw=W*wr,rx=cx-rw/2;
        var pulse=0.16+0.10*Math.sin(t*0.6+ri*0.8);
        ctx.strokeStyle=rgba(pulse); ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.rect(rx,ry,rw,rh); ctx.stroke();
        // inner division at golden ratio
        var div=rx+rw/phi;
        ctx.strokeStyle=rgba(0.08); ctx.lineWidth=0.5;
        ctx.setLineDash([2,3]);
        ctx.beginPath(); ctx.moveTo(div,ry); ctx.lineTo(div,ry+rh); ctx.stroke();
        ctx.setLineDash([]);
      });
      // animated construction dot descending the spine
      var ph=((t*0.18)%1);
      var dy=H*0.06+ph*H*0.88;
      ctx.fillStyle=rgba(0.70); ctx.beginPath(); ctx.arc(cx,dy,3,0,Math.PI*2); ctx.fill();
      var cg=ctx.createRadialGradient(cx,dy,0,cx,dy,18);
      cg.addColorStop(0,rgba(0.22)); cg.addColorStop(1,rgba(0));
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,dy,18,0,Math.PI*2); ctx.fill();
      // perpendicular measurement arm at dot position
      var armW=rects[Math.floor(ph*5)]*W*0.5||W*0.35;
      ctx.strokeStyle=rgba(0.30); ctx.lineWidth=0.8;
      ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(cx-armW,dy); ctx.lineTo(cx+armW,dy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle=rgba(0.28); ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(cx-armW,dy-4); ctx.lineTo(cx-armW,dy+4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+armW,dy-4); ctx.lineTo(cx+armW,dy+4); ctx.stroke();
    },

    // 2 — Cross-platform: 3 stacked device frames top-to-bottom
    function(t){
      var devices=[
        {x:W*0.5,y:H*0.18,w:W*0.42,h:H*0.22,r:5},
        {x:W*0.5,y:H*0.50,w:W*0.68,h:H*0.17,r:4},
        {x:W*0.5,y:H*0.80,w:W*0.82,h:H*0.16,r:3}
      ];
      devices.forEach(function(d,di){
        ctx.strokeStyle=rgba(0.25+0.10*Math.sin(t*0.5+di)); ctx.lineWidth=1.1;
        ctx.beginPath(); ctx.roundRect(d.x-d.w/2,d.y-d.h/2,d.w,d.h,d.r); ctx.stroke();
        for(var k=0;k<3;k++){
          ctx.strokeStyle=rgba(0.10); ctx.lineWidth=0.6;
          var lx=d.x-d.w/2+8,ly=d.y-d.h/2+8+k*8,lw=(d.w-16)*(0.8-k*0.15);
          ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+lw,ly); ctx.stroke();
        }
        var g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.w*0.5);
        g.addColorStop(0,rgba(0.07)); g.addColorStop(1,rgba(0));
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(d.x,d.y,d.w*0.5,0,Math.PI*2); ctx.fill();
      });
      for(var i=0;i<devices.length-1;i++){
        var a=devices[i],b=devices[i+1];
        var mx=W*0.5+W*0.22,my=(a.y+b.y)/2;
        ctx.strokeStyle=rgba(0.14); ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(a.x,a.y+a.h/2); ctx.quadraticCurveTo(mx,my,b.x,b.y-b.h/2); ctx.stroke();
        var ph=((t*0.4+i*0.5)%1);
        var bx=Math.pow(1-ph,2)*a.x+2*(1-ph)*ph*mx+ph*ph*b.x;
        var by=Math.pow(1-ph,2)*(a.y+a.h/2)+2*(1-ph)*ph*my+ph*ph*(b.y-b.h/2);
        ctx.fillStyle=rgba(0.65); ctx.beginPath(); ctx.arc(bx,by,2.5,0,Math.PI*2); ctx.fill();
      }
    },

    // 3 — AI-powered: horizontal neural layers stacked top-to-bottom
    function(t){
      var layers=[[H*0.10,4],[H*0.28,7],[H*0.48,7],[H*0.68,5],[H*0.86,3]];
      var layerW=W*0.82,startX=W*0.09;
      var nodes=layers.map(function(lyr){
        var arr=[];
        for(var i=0;i<lyr[1];i++) arr.push({x:startX+layerW*(i+0.5)/lyr[1],y:lyr[0]});
        return arr;
      });
      for(var li=0;li<nodes.length-1;li++){
        nodes[li].forEach(function(a){
          nodes[li+1].forEach(function(b){
            ctx.strokeStyle=rgba(0.05+0.03*Math.sin(t*0.5+a.x*0.01)); ctx.lineWidth=0.5;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          });
        });
      }
      for(var li=0;li<nodes.length-1;li++){
        nodes[li].forEach(function(a,ai){
          var bNode=nodes[li+1][ai%nodes[li+1].length];
          var ph=((t*0.35+li*0.20+ai*0.06)%1);
          var dx=a.x+(bNode.x-a.x)*ph,dy=a.y+(bNode.y-a.y)*ph;
          ctx.fillStyle=rgba(0.52); ctx.beginPath(); ctx.arc(dx,dy,1.8,0,Math.PI*2); ctx.fill();
        });
      }
      nodes.forEach(function(layer){
        layer.forEach(function(n){
          var pulse=0.35+0.25*Math.sin(t*0.9+n.x*0.02);
          ctx.fillStyle=rgba(pulse); ctx.beginPath(); ctx.arc(n.x,n.y,3,0,Math.PI*2); ctx.fill();
          var g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,10);
          g.addColorStop(0,rgba(0.12)); g.addColorStop(1,rgba(0));
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,10,0,Math.PI*2); ctx.fill();
        });
      });
      var bpY=H*(1-((t*0.18)%1));
      var bp=ctx.createLinearGradient(0,bpY-25,0,bpY+25);
      bp.addColorStop(0,rgba(0)); bp.addColorStop(0.5,rgba(0.07)); bp.addColorStop(1,rgba(0));
      ctx.fillStyle=bp; ctx.fillRect(0,0,W,H);
    },

    // 4 — Scalable architecture: tall grid with infrastructure nodes
    function(t){
      var cx0=W*0.5,cy0=H*0.5,cols=5,rows=10,gw=W*0.85,gh=H*0.88;
      var x0=(W-gw)/2,y0=(H-gh)/2;
      ctx.strokeStyle=rgba(0.06); ctx.lineWidth=0.6;
      for(var c=0;c<=cols;c++){ var x=x0+c*gw/cols; ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y0+gh);ctx.stroke(); }
      for(var r=0;r<=rows;r++){ var y=y0+r*gh/rows; ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x0+gw,y);ctx.stroke(); }
      for(var k=0;k<3;k++){
        var phase=((t*0.28+k*0.33)%1);
        var pr=phase*Math.min(W,H)*0.44;
        ctx.strokeStyle=rgba(0.18*(1-phase)); ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cx0,cy0,pr,0,Math.PI*2); ctx.stroke();
      }
      var nodePos=[[0.2,0.08],[0.5,0.08],[0.8,0.08],[0.15,0.28],[0.5,0.25],[0.85,0.28],[0.2,0.52],[0.5,0.50],[0.8,0.52],[0.15,0.75],[0.5,0.72],[0.85,0.75],[0.2,0.92],[0.5,0.92],[0.8,0.92]];
      var nds=nodePos.map(function(p){ return {x:x0+p[0]*gw,y:y0+p[1]*gh}; });
      for(var i=0;i<nds.length;i++){
        for(var j=i+1;j<nds.length;j++){
          var d=Math.hypot(nds[i].x-nds[j].x,nds[i].y-nds[j].y);
          if(d<gw*0.42){
            ctx.strokeStyle=rgba(0.09); ctx.lineWidth=0.6;
            ctx.beginPath(); ctx.moveTo(nds[i].x,nds[i].y); ctx.lineTo(nds[j].x,nds[j].y); ctx.stroke();
            var ph=((t*0.28+i*0.09+j*0.06)%1);
            var sx=nds[i].x+(nds[j].x-nds[i].x)*ph,sy=nds[i].y+(nds[j].y-nds[i].y)*ph;
            ctx.fillStyle=rgba(0.50); ctx.beginPath(); ctx.arc(sx,sy,1.8,0,Math.PI*2); ctx.fill();
          }
        }
      }
      nds.forEach(function(n,ni){
        var isHub=ni===4||ni===7||ni===11;
        var size=isHub?5:3;
        var alpha=isHub?0.65:(0.32+0.2*Math.sin(t*0.6+ni));
        ctx.fillStyle=rgba(alpha); ctx.beginPath(); ctx.arc(n.x,n.y,size,0,Math.PI*2); ctx.fill();
        var g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,size*4);
        g.addColorStop(0,rgba(0.12)); g.addColorStop(1,rgba(0));
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,size*4,0,Math.PI*2); ctx.fill();
      });
    },

    // 5 — Performance: 3 stacked multi-channel oscilloscope
    function(t){
      var cx=W*0.5,pad=W*0.08;
      var channels=[
        {y:H*0.12,h:H*0.22,f:2.4,a:0.35,ph:0,label:'CPU'},
        {y:H*0.40,h:H*0.22,f:1.1,a:0.28,ph:1.8,label:'MEM'},
        {y:H*0.68,h:H*0.22,f:3.6,a:0.20,ph:0.9,label:'NET'}
      ];
      channels.forEach(function(ch,ci){
        var x0=pad,x1=W-pad,mid=ch.y+ch.h/2;
        // channel bounding box
        ctx.strokeStyle=rgba(0.16); ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.rect(x0,ch.y,x1-x0,ch.h); ctx.stroke();
        // horizontal grid lines inside channel (5 divisions)
        ctx.strokeStyle=rgba(0.06); ctx.lineWidth=0.4;
        for(var k=1;k<4;k++){
          var gy=ch.y+k*ch.h/4;
          ctx.beginPath(); ctx.moveTo(x0,gy); ctx.lineTo(x1,gy); ctx.stroke();
        }
        // vertical grid lines (5 divisions)
        for(var k=1;k<5;k++){
          var gx=x0+k*(x1-x0)/5;
          ctx.beginPath(); ctx.moveTo(gx,ch.y); ctx.lineTo(gx,ch.y+ch.h); ctx.stroke();
        }
        // zero line
        ctx.strokeStyle=rgba(0.10); ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(x0,mid); ctx.lineTo(x1,mid); ctx.stroke();
        // waveform
        ctx.beginPath();
        for(var i=0;i<=200;i++){
          var fx=x0+i/200*(x1-x0);
          var fy=mid+Math.sin(i/200*Math.PI*2*ch.f*3+t*ch.f+ch.ph)*ch.h/2*ch.a*(0.85+0.15*Math.sin(t*0.7+ci));
          if(i===0) ctx.moveTo(fx,fy); else ctx.lineTo(fx,fy);
        }
        ctx.strokeStyle=rgba(0.32-ci*0.04); ctx.lineWidth=1.2-ci*0.15; ctx.stroke();
        // racing scan dot on waveform
        var sp=((t*(0.18-ci*0.03))%1);
        var sdx=x0+sp*(x1-x0);
        var sdy=mid+Math.sin(sp*Math.PI*2*ch.f*3+t*ch.f+ch.ph)*ch.h/2*ch.a;
        ctx.fillStyle=rgba(0.72); ctx.beginPath(); ctx.arc(sdx,sdy,3,0,Math.PI*2); ctx.fill();
        var sg=ctx.createRadialGradient(sdx,sdy,0,sdx,sdy,12);
        sg.addColorStop(0,rgba(0.24)); sg.addColorStop(1,rgba(0));
        ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sdx,sdy,12,0,Math.PI*2); ctx.fill();
        // vertical scan line
        ctx.strokeStyle=rgba(0.20); ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(sdx,ch.y); ctx.lineTo(sdx,ch.y+ch.h); ctx.stroke();
        // channel label left edge
        ctx.fillStyle=rgba(0.22); ctx.font='9px monospace';
        ctx.fillText(ch.label,x0+4,ch.y+10);
      });
      // connector lines between channels
      for(var ci=0;ci<channels.length-1;ci++){
        var ca=channels[ci],cb=channels[ci+1];
        ctx.strokeStyle=rgba(0.06); ctx.lineWidth=0.5;
        ctx.setLineDash([2,4]);
        ctx.beginPath(); ctx.moveTo(cx,ca.y+ca.h); ctx.lineTo(cx,cb.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    },

    // 6 — Automation: tall vertical flowchart
    function(t){
      var boxes=[
        {x:W*0.5,y:H*0.08,w:W*0.58,h:H*0.07,type:'rect'},
        {x:W*0.5,y:H*0.24,w:W*0.50,h:H*0.07,type:'diamond'},
        {x:W*0.24,y:H*0.43,w:W*0.38,h:H*0.06,type:'rect'},
        {x:W*0.76,y:H*0.43,w:W*0.38,h:H*0.06,type:'rect'},
        {x:W*0.5,y:H*0.62,w:W*0.50,h:H*0.06,type:'rect'},
        {x:W*0.5,y:H*0.82,w:W*0.58,h:H*0.07,type:'rect'}
      ];
      var edges=[[0,1],[1,2],[1,3],[2,4],[3,4],[4,5]];
      edges.forEach(function(e,ei){
        var a=boxes[e[0]],b=boxes[e[1]];
        ctx.strokeStyle=rgba(0.14); ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(a.x,a.y+a.h/2); ctx.lineTo(b.x,b.y-b.h/2); ctx.stroke();
        var ph=((t*0.28+ei*0.17)%1);
        var dx=a.x+(b.x-a.x)*ph,dy=(a.y+a.h/2)+(b.y-b.h/2-(a.y+a.h/2))*ph;
        ctx.fillStyle=rgba(0.60); ctx.beginPath(); ctx.arc(dx,dy,2,0,Math.PI*2); ctx.fill();
      });
      boxes.forEach(function(b,bi){
        ctx.strokeStyle=rgba(0.24+0.10*Math.sin(t*0.5+bi)); ctx.lineWidth=0.9;
        if(b.type==='diamond'){
          var hw=b.w/2,hh=b.h/2+4;
          ctx.beginPath(); ctx.moveTo(b.x,b.y-hh); ctx.lineTo(b.x+hw,b.y); ctx.lineTo(b.x,b.y+hh); ctx.lineTo(b.x-hw,b.y); ctx.closePath(); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.roundRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h,3); ctx.stroke();
        }
        var g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.w*0.5);
        g.addColorStop(0,rgba(0.07)); g.addColorStop(1,rgba(0));
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,b.w*0.5,0,Math.PI*2); ctx.fill();
      });
    },

    // 7 — Adaptive: morphing vertical UI panels
    function(t){
      var cycle=((t*0.10)%1);
      var ease=cycle<0.5?4*cycle*cycle*cycle:1-Math.pow(-2*cycle+2,3)/2;
      var layoutA=[
        {x:W*0.5,y:H*0.12,w:W*0.78,h:H*0.22},
        {x:W*0.5,y:H*0.39,w:W*0.78,h:H*0.18},
        {x:W*0.5,y:H*0.62,w:W*0.78,h:H*0.16},
        {x:W*0.5,y:H*0.83,w:W*0.78,h:H*0.12}
      ];
      var layoutB=[
        {x:W*0.27,y:H*0.12,w:W*0.46,h:H*0.50},
        {x:W*0.73,y:H*0.12,w:W*0.46,h:H*0.22},
        {x:W*0.73,y:H*0.38,w:W*0.46,h:H*0.16},
        {x:W*0.5,y:H*0.78,w:W*0.78,h:H*0.16}
      ];
      layoutA.map(function(a,i){
        var b=layoutB[i];
        return {x:a.x+(b.x-a.x)*ease,y:a.y+(b.y-a.y)*ease,w:a.w+(b.w-a.w)*ease,h:a.h+(b.h-a.h)*ease};
      }).forEach(function(c){
        ctx.strokeStyle=rgba(0.22); ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.roundRect(c.x-c.w/2,c.y-c.h/2,c.w,c.h,3); ctx.stroke();
        var numLines=Math.min(4,Math.floor(c.h/14));
        for(var k=0;k<numLines;k++){
          ctx.strokeStyle=rgba(0.10); ctx.lineWidth=0.7;
          var lw=(c.w-16)*(0.65-k*0.12);
          ctx.beginPath(); ctx.moveTo(c.x-c.w/2+8,c.y-c.h/2+10+k*11); ctx.lineTo(c.x-c.w/2+8+lw,c.y-c.h/2+10+k*11); ctx.stroke();
        }
      });
    },

    // 8 — Self-evolving: DNA helix running full height
    function(t){
      var cx0=W*0.5,helixW=W*0.22,pts=80;
      [0,1].forEach(function(strand){
        ctx.beginPath();
        for(var i=0;i<pts;i++){
          var fy=H*0.04+i/pts*H*0.92;
          var ang=i/pts*Math.PI*10+(strand*Math.PI)+t*0.4;
          var fx=cx0+Math.cos(ang)*helixW;
          if(i===0) ctx.moveTo(fx,fy); else ctx.lineTo(fx,fy);
        }
        ctx.strokeStyle=rgba(0.24); ctx.lineWidth=1.0; ctx.stroke();
      });
      for(var i=0;i<22;i++){
        var fy=H*0.04+(i+0.5)/22*H*0.92;
        var ang=(i+0.5)/22*Math.PI*10+t*0.4;
        var x1=cx0+Math.cos(ang)*helixW,x2=cx0+Math.cos(ang+Math.PI)*helixW;
        ctx.strokeStyle=rgba(0.12+0.08*Math.sin(t*1.2+i*0.5)); ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x1,fy); ctx.lineTo(x2,fy); ctx.stroke();
        if((i+Math.floor(t*0.3))%6===0){
          ctx.fillStyle=rgba(0.55); ctx.beginPath(); ctx.arc(cx0,fy,3,0,Math.PI*2); ctx.fill();
          var mg=ctx.createRadialGradient(cx0,fy,0,cx0,fy,16);
          mg.addColorStop(0,rgba(0.18)); mg.addColorStop(1,rgba(0));
          ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(cx0,fy,16,0,Math.PI*2); ctx.fill();
        }
      }
      var ph=((t*0.35)%1),fy=H*0.04+ph*H*0.92;
      var ang=ph*Math.PI*10+t*0.4,fx=cx0+Math.cos(ang)*helixW;
      ctx.fillStyle=rgba(0.70); ctx.beginPath(); ctx.arc(fx,fy,3.5,0,Math.PI*2); ctx.fill();
      var tg=ctx.createRadialGradient(fx,fy,0,fx,fy,16);
      tg.addColorStop(0,rgba(0.22)); tg.addColorStop(1,rgba(0));
      ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(fx,fy,16,0,Math.PI*2); ctx.fill();
    }
  ];

  // ── Canvas resize ─────────────────────────────────────────────────────────
  function resizeCanvas(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    var rect=canvas.parentElement.getBoundingClientRect();
    if(!rect.width||!rect.height) return;
    W=rect.width; H=rect.height;
    canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr);
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  var startTime = performance.now();
  function drawLoop(){
    raf = requestAnimationFrame(drawLoop);
    if(!W||!H) return;
    var t=(performance.now()-startTime)/1000;
    ctx.clearRect(0,0,W,H);
    if(activeIdx>=0 && SCENES[activeIdx]) SCENES[activeIdx](t);
  }

  // ── Brick wall build (runs once) ──────────────────────────────────────────
  var bricks=[];
  function buildBricks(){
    paraEl.innerHTML='';
    bricks=[];
    // Classic running-bond brick pattern (12-col grid, 6px mortar gap)
    // Row 1: [6][6]          — two half-bricks aligned
    // Row 2: [3][5][4]       — offset row (starts mid-column)
    // Row 3: [7][5]          — shifted back
    // Row 4: [4][4][4]       — three equal thirds
    // Row 5: [12]            — full-width capstone
    var placements=[
      {span:6, start:1},
      {span:6, start:7},
      {span:3, start:1},
      {span:5, start:4},
      {span:4, start:9},
      {span:7, start:1},
      {span:5, start:8},
      {span:4, start:1},
      {span:8, start:5}
    ];
    CAPS.forEach(function(cap,si){
      var p=placements[si]||{span:6,start:1};
      var brick=document.createElement('div');
      brick.className='rcw-brick';
      brick.style.gridColumn=p.start+' / span '+p.span;
      var txt=document.createElement('span');
      txt.className='rcw-brick-text';
      txt.textContent=cap.phrase;
      brick.appendChild(txt);
      (function(idx){
        brick.addEventListener('mouseenter',function(){ activate(idx,false); });
        brick.addEventListener('click',function(){ activate(idx,false); });
      })(si);
      paraEl.appendChild(brick);
      bricks.push(brick);
    });
  }

  // ── Activate ──────────────────────────────────────────────────────────────
  function activate(idx, skip){
    if(!SCENES[idx]) return;
    activeIdx=idx;
    var p=SCENE_PALETTES[idx]||[86,194,255];
    _acc[0]=p[0]; _acc[1]=p[1]; _acc[2]=p[2];
    var glow='rgba('+p[0]+','+p[1]+','+p[2]+',0.85)';
    document.documentElement.style.setProperty('--rcw-glow',glow);
    document.documentElement.style.setProperty('--rcw-glow-rgb',p[0]+','+p[1]+','+p[2]);
    if(window.__cwBgSetIdx) window.__cwBgSetIdx(idx);
    // update bricks
    bricks.forEach(function(b,i){ b.classList.toggle('rcw-brick--active',i===idx); });
    if(badgeName) badgeName.textContent=CAPS[idx].badge.name;
    if(badgeDesc) badgeDesc.textContent=CAPS[idx].badge.desc;
  }

  // ── Auto-rotate ───────────────────────────────────────────────────────────
  function startAuto(){
    clearTimeout(autoTimer);
    autoTimer=setTimeout(function(){
      if(!isHovered){ activate((activeIdx+1)%CAPS.length,false); startAuto(); }
    },INTERVAL);
  }

  // ── Visibility init ───────────────────────────────────────────────────────
  function checkVisibility(){
    var rect=section.getBoundingClientRect();
    if(rect.top<window.innerHeight*0.85&&rect.bottom>0&&!initialized){
      initialized=true;
      var inner=document.querySelector('.rcw-inner');
      if(inner) inner.classList.add('rcw-inner--visible');
      requestAnimationFrame(function(){
        resizeCanvas();
        // retry if dimensions not ready
        if(!W||!H){ setTimeout(function(){ resizeCanvas(); if(!W||!H) setTimeout(resizeCanvas,200); },100); }
        buildBricks();
        activate(0,true);
        drawLoop();
        startAuto();
      });
    }
  }

  section.addEventListener('mouseenter',function(){ isHovered=true; clearTimeout(autoTimer); });
  section.addEventListener('mouseleave',function(){ isHovered=false; startAuto(); });
  window.addEventListener('scroll',checkVisibility,{passive:true});
  window.addEventListener('resize',function(){ resizeCanvas(); });
  checkVisibility();

})(); // end rcw IIFE
// ── Built to stay operational — so-canvas animations ─────────────────────
(function(){
  var canvases = document.querySelectorAll('.so-canvas');
  if(!canvases.length) return;

  function parseColor(str){ var p=str.split(','); return {r:+p[0],g:+p[1],b:+p[2]}; }

  function initCanvas(canvas){
    var panel = canvas.getAttribute('data-so-panel');
    var col   = parseColor(canvas.getAttribute('data-so-color'));
    var ctx   = canvas.getContext('2d');
    var W,H,raf,t=0;

    function resize(){
      var rect=canvas.parentElement.getBoundingClientRect();
      W=rect.width||canvas.parentElement.offsetWidth||300;
      H=rect.height||canvas.parentElement.offsetHeight||200;
      canvas.width=W; canvas.height=H;
    }

    function c(a){ return 'rgba('+col.r+','+col.g+','+col.b+','+a+')'; }

    function drawSecurity(){
      ctx.clearRect(0,0,W,H);
      // Firewall rule matrix — security architecture
      var rows=8, cols=5;
      var rowH=H/(rows+2), colW=W/(cols+1);
      var ox=colW*0.5, oy=rowH*0.8;
      // scan line sweeping down
      var scanY=oy+(t*rowH*1.4%(H-oy*2));
      var sg=ctx.createLinearGradient(0,scanY-rowH*0.6,0,scanY+rowH*0.6);
      sg.addColorStop(0,'rgba('+col.r+','+col.g+','+col.b+',0)');
      sg.addColorStop(0.5,'rgba('+col.r+','+col.g+','+col.b+',0.06)');
      sg.addColorStop(1,'rgba('+col.r+','+col.g+','+col.b+',0)');
      ctx.fillStyle=sg; ctx.fillRect(0,scanY-rowH*0.6,W,rowH*1.2);
      // header labels
      var hdrs=['SOURCE','DEST','PORT','PROTO','ACTION'];
      ctx.font='500 8px "Inter",monospace'; ctx.textBaseline='middle';
      for(var h=0;h<cols;h++){
        ctx.fillStyle=c(0.18); ctx.textAlign='center';
        ctx.fillText(hdrs[h], ox+h*colW+colW*0.5, oy*0.55);
      }
      // header underline
      ctx.beginPath(); ctx.moveTo(ox*0.3,oy*0.82); ctx.lineTo(W-ox*0.3,oy*0.82);
      ctx.strokeStyle=c(0.10); ctx.lineWidth=1; ctx.stroke();
      // rule rows
      var rules=[
        ['10.0.0.0/8','*','443','HTTPS','ALLOW'],
        ['192.168.1.0','10.0.0.1','22','SSH','ALLOW'],
        ['*','*','23','TELNET','DENY'],
        ['172.16.0.0','*','80','HTTP','ALLOW'],
        ['*','10.0.0.5','3306','MySQL','DENY'],
        ['10.0.1.0/24','*','8443','HTTPS','ALLOW'],
        ['*','*','21','FTP','DENY'],
        ['10.0.2.0/24','*','5432','PgSQL','ALLOW']
      ];
      for(var row=0;row<rows;row++){
        var ry=oy+row*rowH+rowH*0.85;
        var isDeny=rules[row][4]==='DENY';
        var rowClose=Math.abs(ry-scanY)<rowH*0.5;
        var rowAlpha=rowClose?0.55:(isDeny?0.28:0.22);
        // row bg tint for deny
        if(isDeny){
          ctx.fillStyle='rgba(255,60,60,'+(rowClose?0.06:0.03)+')';
          ctx.fillRect(ox*0.3,ry-rowH*0.42,W-ox*0.6,rowH*0.84);
        }
        // divider
        if(row>0){
          ctx.beginPath(); ctx.moveTo(ox*0.3,ry-rowH*0.42); ctx.lineTo(W-ox*0.3,ry-rowH*0.42);
          ctx.strokeStyle=c(0.05); ctx.lineWidth=0.8; ctx.stroke();
        }
        for(var col2=0;col2<cols-1;col2++){
          ctx.textAlign='center'; ctx.font='500 9px "Inter",monospace';
          ctx.fillStyle=c(rowAlpha*(col2===0?1.0:0.85));
          ctx.fillText(rules[row][col2], ox+col2*colW+colW*0.5, ry);
        }
        // ACTION badge
        var bx=ox+4*colW+colW*0.15, bw2=colW*0.7, bh2=rowH*0.7;
        ctx.fillStyle=isDeny?'rgba(255,60,60,'+(rowClose?0.18:0.08)+')'
                            :'rgba('+col.r+','+col.g+','+col.b+','+(rowClose?0.18:0.08)+')';
        ctx.fillRect(bx,ry-bh2*0.5,bw2,bh2);
        ctx.textAlign='center'; ctx.font='700 8px "Inter",monospace';
        ctx.fillStyle=isDeny?('rgba(255,100,100,'+(rowAlpha*1.2)+')')
                            :c(rowAlpha*1.2);
        ctx.fillText(rules[row][4], bx+bw2*0.5, ry);
      }
      // column dividers
      for(var cd=1;cd<cols;cd++){
        ctx.beginPath(); ctx.moveTo(ox+cd*colW,oy*0.7); ctx.lineTo(ox+cd*colW,oy+rows*rowH+rowH*0.3);
        ctx.strokeStyle=c(0.04); ctx.lineWidth=0.8; ctx.setLineDash([3,4]); ctx.stroke();
        ctx.setLineDash([]);
      }
      // blinking live indicator
      var blink=(Math.sin(t*3)+1)*0.5;
      ctx.beginPath(); ctx.arc(W-18,14,4,0,Math.PI*2);
      ctx.fillStyle=c(0.5+blink*0.4); ctx.fill();
      ctx.font='600 8px "Inter",monospace'; ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillStyle=c(0.28); ctx.fillText('LIVE POLICY',W-26,14);
    }

    function drawReliability(){
      ctx.clearRect(0,0,W,H);
      var ox=W*0.08,ew=W*0.84,my=H*0.5,amp=H*0.32,seg=ew;
      // grid lines
      for(var g=0;g<5;g++){
        ctx.beginPath();ctx.moveTo(0,H*(g+1)/6);ctx.lineTo(W,H*(g+1)/6);
        ctx.strokeStyle=c(0.04);ctx.lineWidth=1;ctx.stroke();
      }
      for(var gv=0;gv<8;gv++){
        ctx.beginPath();ctx.moveTo(ox+gv/7*ew,H*0.1);ctx.lineTo(ox+gv/7*ew,H*0.9);
        ctx.strokeStyle=c(0.03);ctx.lineWidth=1;ctx.stroke();
      }
      // trailing glow below the line
      ctx.beginPath();
      var steps=120,phase=t*55%seg;
      for(var s=0;s<=steps;s++){
        var px=ox+s/steps*ew;
        var local=((s/steps*seg-phase+seg*10)%seg)/seg;
        var y=my;
        if(local>0.28&&local<0.33){y=my-amp;}
        else if(local>0.33&&local<0.36){y=my+amp*0.55;}
        else if(local>0.36&&local<0.40){y=my-amp*0.35;}
        else if(local>0.40&&local<0.44){y=my;}
        else{y=my+Math.sin(local*Math.PI*8)*amp*0.06;}
        if(s===0)ctx.moveTo(px,y);else ctx.lineTo(px,y);
      }
      var lg=ctx.createLinearGradient(ox,0,ox+ew,0);
      lg.addColorStop(0,c(0));lg.addColorStop(0.15,c(0.55));
      lg.addColorStop(0.85,c(0.55));lg.addColorStop(1,c(0));
      ctx.strokeStyle=lg;ctx.lineWidth=2.2;ctx.stroke();
      // scan dot with glow
      var dotX=ox+(t*0.45%1)*ew;
      var dg=ctx.createRadialGradient(dotX,my,0,dotX,my,14);
      dg.addColorStop(0,c(0.5));dg.addColorStop(1,c(0));
      ctx.beginPath();ctx.arc(dotX,my,14,0,Math.PI*2);
      ctx.fillStyle=dg;ctx.fill();
      ctx.beginPath();ctx.arc(dotX,my,4,0,Math.PI*2);
      ctx.fillStyle=c(0.9);ctx.fill();
      // uptime label bottom
      ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.font='600 11px "Inter",monospace';
      ctx.fillStyle=c(0.28);ctx.fillText('SYSTEM RELIABILITY',W*0.5,H*0.94);
    }

    function drawUptime(){
      ctx.clearRect(0,0,W,H);
      // SLA uptime timeline — 12-month status blocks + live counter
      var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var blockW=Math.floor((W*0.88)/12), blockH=Math.min(blockW*0.55, H*0.12);
      var startX=W*0.06, topY=H*0.22;
      // title
      ctx.font='700 11px "Inter",monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=c(0.45); ctx.fillText('UPTIME — LAST 12 MONTHS',W*0.5,H*0.10);
      // draw 12 monthly blocks
      for(var m=0;m<12;m++){
        var bx=startX+m*(blockW+2), by=topY;
        var outage=(m===2||m===7)?true:false; // two minor outages
        var blockAlpha=outage?0.0:0.0;
        // block bg
        ctx.fillStyle=outage?'rgba(255,80,60,0.12)':'rgba('+col.r+','+col.g+','+col.b+',0.10)';
        ctx.fillRect(bx,by,blockW,blockH);
        // block border
        ctx.strokeStyle=outage?'rgba(255,80,60,0.30)':c(0.20);
        ctx.lineWidth=1; ctx.strokeRect(bx,by,blockW,blockH);
        // inner fill (animated on current month)
        if(m===11){
          var prog2=(t*0.08)%1;
          var fg=ctx.createLinearGradient(bx,0,bx+blockW*prog2,0);
          fg.addColorStop(0,c(0.55)); fg.addColorStop(1,c(0.30));
          ctx.fillStyle=fg; ctx.fillRect(bx+1,by+1,blockW*prog2-2,blockH-2);
        } else if(!outage){
          ctx.fillStyle=c(0.12); ctx.fillRect(bx+1,by+1,blockW-2,blockH-2);
        }
        // month label
        ctx.font='500 7px "Inter",monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillStyle=c(0.22); ctx.fillText(months[m],bx+blockW*0.5,topY+blockH+5);
      }
      // uptime percentage — big counter
      var uptimePct=99.97;
      ctx.font='800 '+Math.min(W*0.18,H*0.16)+'px "Inter",sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      // number glow
      var numGlow=ctx.createRadialGradient(W*0.5,H*0.58,0,W*0.5,H*0.58,W*0.3);
      numGlow.addColorStop(0,'rgba('+col.r+','+col.g+','+col.b+',0.08)');
      numGlow.addColorStop(1,'rgba('+col.r+','+col.g+','+col.b+',0)');
      ctx.fillStyle=numGlow; ctx.fillRect(0,H*0.40,W,H*0.36);
      ctx.fillStyle=c(0.90); ctx.fillText(uptimePct.toFixed(2)+'%',W*0.5,H*0.565);
      // SLA label
      ctx.font='500 10px "Inter",monospace'; ctx.fillStyle=c(0.28);
      ctx.fillText('SLA UPTIME',W*0.5,H*0.67);
      // status bar at bottom
      var barY=H*0.76, barW=W*0.88, barH=4, barX=W*0.06;
      ctx.fillStyle=c(0.06); ctx.fillRect(barX,barY,barW,barH);
      var pct=0.997;
      var bg2=ctx.createLinearGradient(barX,0,barX+barW*pct,0);
      bg2.addColorStop(0,c(0.25)); bg2.addColorStop(1,c(0.65));
      ctx.fillStyle=bg2; ctx.fillRect(barX,barY,barW*pct,barH);
      // glowing tip on bar
      var tipX=barX+barW*pct;
      var tipPulse2=(Math.sin(t*2.5)+1)*0.5;
      var tg2=ctx.createRadialGradient(tipX,barY+barH*0.5,0,tipX,barY+barH*0.5,12);
      tg2.addColorStop(0,c(0.7+tipPulse2*0.3)); tg2.addColorStop(1,c(0));
      ctx.beginPath(); ctx.arc(tipX,barY+barH*0.5,12,0,Math.PI*2);
      ctx.fillStyle=tg2; ctx.fill();
      // outage markers
      ctx.font='500 8px "Inter",monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillStyle='rgba(255,100,80,0.45)'; ctx.fillText('▼ 2 minor incidents',W*0.5,H*0.82);
      // live dot
      var blink2=(Math.sin(t*2.8)+1)*0.5;
      ctx.beginPath(); ctx.arc(W-16,H*0.92,3.5,0,Math.PI*2);
      ctx.fillStyle=c(0.45+blink2*0.45); ctx.fill();
      ctx.font='600 8px "Inter",monospace'; ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillStyle=c(0.25); ctx.fillText('LIVE',W-24,H*0.92);
    }

    function drawFailover(){
      ctx.clearRect(0,0,W,H);
      var lx=W*0.22,rx=W*0.78,my=H*0.5,nr=22;
      var primaryActive=((t*0.12)%2)<1.6;
      // connection beam
      var beamG=ctx.createLinearGradient(lx,my,rx,my);
      beamG.addColorStop(0,'rgba('+col.r+','+col.g+','+col.b+','+(primaryActive?0.35:0.12)+')');
      beamG.addColorStop(0.5,'rgba('+col.r+','+col.g+','+col.b+','+(primaryActive?0.08:0.28)+')');
      beamG.addColorStop(1,'rgba('+col.r+','+col.g+','+col.b+','+(primaryActive?0.12:0.35)+')');
      ctx.beginPath();ctx.moveTo(lx+nr,my);ctx.lineTo(rx-nr,my);
      ctx.strokeStyle=beamG;ctx.lineWidth=2;ctx.stroke();
      // secondary dashed line
      ctx.setLineDash([3,5]);
      ctx.beginPath();ctx.moveTo(lx+nr,my-12);ctx.lineTo(rx-nr,my-12);
      ctx.strokeStyle=c(0.06);ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.moveTo(lx+nr,my+12);ctx.lineTo(rx-nr,my+12);
      ctx.strokeStyle=c(0.06);ctx.lineWidth=1;ctx.stroke();
      ctx.setLineDash([]);
      // 3 traveling packets
      for(var pk=0;pk<3;pk++){
        var pct=((t*0.7+pk*0.33)%1);
        if(!primaryActive) pct=1-pct;
        var px=lx+nr+(rx-lx-nr*2)*pct;
        var pg=ctx.createRadialGradient(px,my,0,px,my,8);
        pg.addColorStop(0,c(0.75));pg.addColorStop(1,c(0));
        ctx.beginPath();ctx.arc(px,my,8,0,Math.PI*2);ctx.fillStyle=pg;ctx.fill();
        ctx.beginPath();ctx.arc(px,my,3,0,Math.PI*2);ctx.fillStyle=c(0.9);ctx.fill();
      }
      // PRIMARY node
      var pAlpha=primaryActive?0.7:0.18;
      var pg2=ctx.createRadialGradient(lx,my,0,lx,my,nr*1.4);
      pg2.addColorStop(0,'rgba('+col.r+','+col.g+','+col.b+','+(primaryActive?0.2:0.04)+')');
      pg2.addColorStop(1,c(0));
      ctx.beginPath();ctx.arc(lx,my,nr*1.4,0,Math.PI*2);ctx.fillStyle=pg2;ctx.fill();
      ctx.beginPath();ctx.arc(lx,my,nr,0,Math.PI*2);
      ctx.strokeStyle=c(pAlpha);ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle=c(primaryActive?0.14:0.04);ctx.fill();
      // FAILOVER node
      var fa=!primaryActive?0.7:0.18;
      var fg2=ctx.createRadialGradient(rx,my,0,rx,my,nr*1.4);
      fg2.addColorStop(0,'rgba('+col.r+','+col.g+','+col.b+','+(!primaryActive?0.2:0.04)+')');
      fg2.addColorStop(1,c(0));
      ctx.beginPath();ctx.arc(rx,my,nr*1.4,0,Math.PI*2);ctx.fillStyle=fg2;ctx.fill();
      ctx.beginPath();ctx.arc(rx,my,nr,0,Math.PI*2);
      ctx.strokeStyle=c(fa);ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle=c(!primaryActive?0.14:0.04);ctx.fill();
      // labels
      ctx.textAlign='center';ctx.font='600 10px "Inter",monospace';
      ctx.fillStyle=c(pAlpha*0.7);ctx.fillText('PRIMARY',lx,my-nr-10);
      ctx.fillStyle=c(fa*0.7);ctx.fillText('FAILOVER',rx,my-nr-10);
      ctx.font='500 9px "Inter",monospace';
      ctx.fillStyle=c(0.25);ctx.fillText('<30s RTO',W*0.5,my+nr+18);
      // status indicator
      var statusPulse=(Math.sin(t*4)+1)*0.5;
      ctx.beginPath();ctx.arc(W*0.5,my-34,3,0,Math.PI*2);
      ctx.fillStyle=primaryActive?c(0.3+statusPulse*0.4):c(0.55+statusPulse*0.35);
      ctx.fill();
    }

    function drawObservability(){
      ctx.clearRect(0,0,W,H);
      var rows=7,rowH=H/(rows+1),ox=W*0.06;
      // column headers
      ctx.font='500 8px "Inter",monospace';
      ctx.fillStyle=c(0.2);ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.fillText('TIMESTAMP',ox,rowH*0.55);
      ctx.fillText('EVENT',ox+W*0.26,rowH*0.55);
      ctx.fillText('STATUS',ox+W*0.7,rowH*0.55);
      // header underline
      ctx.beginPath();ctx.moveTo(ox,rowH*0.85);ctx.lineTo(W-ox,rowH*0.85);
      ctx.strokeStyle=c(0.08);ctx.lineWidth=1;ctx.stroke();
      var statuses=['OK','OK','WARN','OK','OK','ERR','OK'];
      var statusAlpha=[0.35,0.35,0.6,0.35,0.35,0.7,0.35];
      for(var row=0;row<rows;row++){
        var y=rowH*(row+1.45);
        var phase=row*1.1+t*0.5;
        var rowAlpha=row===2?0.5:(row===5?0.6:0.25+Math.sin(t*0.8+row)*0.06);
        // timestamp dot
        var dotPulse=(Math.sin(t*2.2+row*0.7)+1)*0.5;
        ctx.beginPath();ctx.arc(ox+4,y,2.5,0,Math.PI*2);
        ctx.fillStyle=c(0.2+dotPulse*0.3);ctx.fill();
        // log content line
        var lineW=W*(0.18+Math.sin(phase)*0.08+0.12);
        var llg=ctx.createLinearGradient(ox+16,0,ox+16+lineW,0);
        llg.addColorStop(0,c(rowAlpha));llg.addColorStop(0.9,c(rowAlpha));llg.addColorStop(1,c(0));
        ctx.beginPath();ctx.moveTo(ox+16,y);ctx.lineTo(ox+16+lineW,y);
        ctx.strokeStyle=llg;ctx.lineWidth=1.5;ctx.stroke();
        // status badge
        var sw=row===2||row===5?28:22;
        ctx.fillStyle=c(row===5?0.12:(row===2?0.08:0.04));
        ctx.fillRect(ox+W*0.7-4,y-7,sw,14);
        ctx.font='500 8px "Inter",monospace';
        ctx.textAlign='center';ctx.fillStyle=c(statusAlpha[row]);
        ctx.fillText(statuses[row],ox+W*0.7+sw*0.5-4,y);
        ctx.textAlign='left';
      }
      // right column bar chart
      var bars=5,bw=W*0.04,bx=W*0.86;
      for(var b=0;b<bars;b++){
        var bh=H*(0.12+Math.abs(Math.sin(t*1.4+b*0.85))*0.32);
        var by2=H*0.5-bh*0.5;
        var bg=ctx.createLinearGradient(0,by2,0,by2+bh);
        bg.addColorStop(0,c(0.12+b*0.04));bg.addColorStop(1,c(0.04));
        ctx.fillStyle=bg;ctx.fillRect(bx+b*(bw+3),by2,bw,bh);
      }
    }

    function drawScalability(){
      ctx.clearRect(0,0,W,H);
      var cx=W*0.5,cy=H*0.5;
      var phase=((t*0.18)%1); // 0..1 expansion cycle
      var rings=[{r:0.12,n:1},{r:0.30,n:4},{r:0.52,n:8},{r:0.72,n:14}];
      rings.forEach(function(ring,ri){
        var radius=Math.min(W,H)*ring.r*(0.5+phase*0.5);
        // ring circle
        ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
        ctx.strokeStyle=c(0.05+ri*0.02);ctx.lineWidth=1;ctx.stroke();
        // nodes on ring
        for(var n=0;n<ring.n;n++){
          var ang=n*Math.PI*2/ring.n+t*(ri%2===0?0.12:-0.08);
          var nx=cx+radius*Math.cos(ang),ny=cy+radius*Math.sin(ang);
          var pulse=(Math.sin(t*1.6+n*0.4+ri)+1)*0.5;
          // spoke from previous ring
          if(ri>0){
            var prevR=Math.min(W,H)*rings[ri-1].r*(0.5+phase*0.5);
            var prevAng=(n%(rings[ri-1].n))*Math.PI*2/(rings[ri-1].n)+t*(ri%2!==0?0.12:-0.08);
            ctx.beginPath();ctx.moveTo(cx+prevR*Math.cos(prevAng),cy+prevR*Math.sin(prevAng));
            ctx.lineTo(nx,ny);
            ctx.strokeStyle=c(0.04+phase*0.04);ctx.lineWidth=0.8;ctx.stroke();
          }
          // node glow
          var ng=ctx.createRadialGradient(nx,ny,0,nx,ny,10);
          ng.addColorStop(0,'rgba('+col.r+','+col.g+','+col.b+','+(0.2+pulse*0.25)+')');
          ng.addColorStop(1,'rgba('+col.r+','+col.g+','+col.b+',0)');
          ctx.beginPath();ctx.arc(nx,ny,10,0,Math.PI*2);ctx.fillStyle=ng;ctx.fill();
          ctx.beginPath();ctx.arc(nx,ny,2.5,0,Math.PI*2);
          ctx.fillStyle=c(0.4+pulse*0.35+phase*0.2);ctx.fill();
        }
      });
      // center core
      var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.08);
      cg.addColorStop(0,c(0.55));cg.addColorStop(0.5,c(0.2));cg.addColorStop(1,c(0));
      ctx.beginPath();ctx.arc(cx,cy,Math.min(W,H)*0.08,0,Math.PI*2);
      ctx.fillStyle=cg;ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);
      ctx.fillStyle=c(0.85);ctx.fill();
      // expanding wave ring
      var waveR=Math.min(W,H)*(0.12+phase*0.6);
      var wg=ctx.createRadialGradient(cx,cy,waveR*0.85,cx,cy,waveR);
      wg.addColorStop(0,c(0));wg.addColorStop(0.5,c(0.12*(1-phase)));wg.addColorStop(1,c(0));
      ctx.beginPath();ctx.arc(cx,cy,waveR,0,Math.PI*2);
      ctx.fillStyle=wg;ctx.fill();
    }

    var DRAWS = {
      security:      drawSecurity,
      reliability:   drawReliability,
      uptime:        drawUptime,
      failover:      drawFailover,
      observability: drawObservability,
      scalability:   drawScalability
    };
    var drawFn = DRAWS[panel] || drawSecurity;

    function loop(){
      t+=0.016;
      resize();
      drawFn();
      raf=requestAnimationFrame(loop);
    }

    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && !raf){ loop(); }
        else if(!e.isIntersecting && raf){ cancelAnimationFrame(raf); raf=null; }
      });
    },{threshold:0.05});
    io.observe(canvas);
  }

  canvases.forEach(function(c){ initCanvas(c); });
})();


/* ── Footer ambient neural canvas ───────────────────────────── */
(function(){
  var c = document.getElementById('footerCanvas');
  if (!c) return;
  var ctx = c.getContext('2d');
  var W,H,nodes=[];
  var R=198,G=121,B=196; // brand rose

  function resize(){
    var rect = c.parentElement.getBoundingClientRect();
    W = c.width = rect.width || window.innerWidth;
    H = c.height = rect.height || 280;
    nodes = [];
    var n = Math.floor(W/80);
    for(var i=0;i<n;i++){
      nodes.push({
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.12,
        r: 1.2+Math.random()*1.4
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // draw edges
    for(var i=0;i<nodes.length;i++){
      for(var j=i+1;j<nodes.length;j++){
        var dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<160){
          var a=(1-d/160)*0.12;
          ctx.beginPath();
          ctx.strokeStyle='rgba('+R+','+G+','+B+','+a+')';
          ctx.lineWidth=.5;
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.stroke();
        }
      }
    }
    // draw nodes
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>W) n.vx*=-1;
      if(n.y<0||n.y>H) n.vy*=-1;
      var g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3.5);
      g.addColorStop(0,'rgba('+R+','+G+','+B+',.55)');
      g.addColorStop(1,'rgba('+R+','+G+','+B+',0)');
      ctx.beginPath();
      ctx.fillStyle=g;
      ctx.arc(n.x,n.y,n.r*3.5,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  var io = new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting){ resize(); draw(); io.disconnect(); }
  },{threshold:.05});
  io.observe(c.parentElement);
  window.addEventListener('resize',resize);
})();


// ─── Image Error Fallback ──────────────────────────────────────────────────
// Gracefully handle images that fail to load (broken links, network issues)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('img').forEach(function(img) {
    img.addEventListener('error', function() {
      this.style.opacity = '0';
      this.style.visibility = 'hidden';
    });
  });
});

// ─── WebGL2 Support Notice ─────────────────────────────────────────────────
// If WebGL2 is not supported, visual effects degrade gracefully (canvases show
// static gradient backgrounds). No explicit user notification needed as the
// page content remains fully accessible and functional.

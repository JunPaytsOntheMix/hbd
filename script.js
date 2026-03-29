/* ============================================================
   STEFFY BIRTHDAY SYSTEM — script.js
   Shared across all pages
   ============================================================ */

/* ── Custom cursor ──────────────────────────────────────────── */
(function initCursor() {
  const cur = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  if (!cur) return;

  // Set the "cute" icon here
  cur.innerHTML = '💚'; 

  document.addEventListener('mousemove', e => {
    // Main heart follows instantly
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
    
    // Trail follows with a slight delay
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
  });

  // Scale effect when clicking
  document.addEventListener('mousedown', () => {
    cur.style.transform = 'translate(-50%, -50%) scale(1.5)';
  });
  document.addEventListener('mouseup', () => {
    cur.style.transform = 'translate(-50%, -50%) scale(1)';
  });
})();

/* ── Floating leaves ────────────────────────────────────────── */
(function initLeaves() {
  const LEAVES = ['🍃','🌿','✦','🌱','✿'];
  const container = document.body;
  function spawnLeaf() {
    const el = document.createElement('div');
    el.className = 'leaf';
    el.textContent = LEAVES[Math.floor(Math.random() * LEAVES.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (.6 + Math.random() * .7) + 'rem';
    const dur = 10 + Math.random() * 12;
    el.style.animationDuration  = dur + 's';
    el.style.animationDelay     = Math.random() * 4 + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + 5) * 1000);
  }
  for (let i = 0; i < 14; i++) spawnLeaf();
  setInterval(spawnLeaf, 2800);
})();

/* ── Page enter animation ───────────────────────────────────── */
(function pageEnter() {
  document.body.classList.add('page-enter');
})();

/* ── Active nav link ────────────────────────────────────────── */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();

/* ── Click sparkles ─────────────────────────────────────────── */
document.addEventListener('click', e => {
  for (let i = 0; i < 6; i++) {
    const sp = document.createElement('div');
    sp.className = 'sparkle';
    sp.textContent = ['✦','✿','·','⋆'][Math.floor(Math.random()*4)];
    sp.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px;
      font-size:${.6+Math.random()*.8}rem; color:var(--gold);
      pointer-events:none; z-index:9990;
      --tx:${(Math.random()-0.5)*60}px; --ty:${(Math.random()-0.5)*60}px;
    `;
    sp.style.animation = 'sparkPop .6s ease forwards';
    sp.style.transform = `translate(${(Math.random()-.5)*40}px, ${(Math.random()-.5)*40}px)`;
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 700);
  }
});

/* ════════════════════════════════════════════════════════════
   MUSIC PLAYER — persists across page navigations
   Uses a shared <audio> element stored in sessionStorage src
   The actual audio el lives in dukebox.html but we keep
   playback state + current time in sessionStorage so every
   page can resume it via the mini player in the nav bar.
════════════════════════════════════════════════════════════ */
const MusicManager = (() => {
  const KEY_SRC     = 'steffy_music_src';
  const KEY_TIME    = 'steffy_music_time';
  const KEY_PLAYING = 'steffy_music_playing';
  const KEY_VOL     = 'steffy_music_vol';

  let audio = null;

  function init() {
    // Build mini player in nav bar if it exists
    const nav = document.querySelector('.nav-links');
    if (!nav) return;

    const mini = document.createElement('div');
    mini.id = 'mini-player';
    mini.style.cssText = 'display:flex;align-items:center;gap:.5rem;';
    mini.innerHTML = `
      <button id="mp-btn" title="Play/Pause" style="
        background:none;border:1.5px solid var(--matcha);
        border-radius:50%;width:28px;height:28px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;color:var(--matcha-dark);font-size:.75rem;
        transition:all .2s;
      ">▶</button>
      <span id="mp-title" style="
        font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
        color:var(--ink-soft);max-width:100px;overflow:hidden;
        white-space:nowrap;text-overflow:ellipsis;opacity:.7;
      ">no music</span>
    `;
    nav.appendChild(mini);

    audio = new Audio();
    audio.loop = true;
    audio.volume = parseFloat(sessionStorage.getItem(KEY_VOL) || '0.6');

    const src = sessionStorage.getItem(KEY_SRC);
    if (src) {
      audio.src = src;
      audio.currentTime = parseFloat(sessionStorage.getItem(KEY_TIME) || '0');
      updateTitle(src);
      if (sessionStorage.getItem(KEY_PLAYING) === 'true') {
        audio.play().catch(() => {});
        document.getElementById('mp-btn').textContent = '⏸';
      }
    }

    document.getElementById('mp-btn').addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        document.getElementById('mp-btn').textContent = '⏸';
        sessionStorage.setItem(KEY_PLAYING, 'true');
      } else {
        audio.pause();
        document.getElementById('mp-btn').textContent = '▶';
        sessionStorage.setItem(KEY_PLAYING, 'false');
      }
    });

    // Save time every second
    setInterval(() => {
      if (audio.src) sessionStorage.setItem(KEY_TIME, audio.currentTime);
    }, 1000);

    // Save before leaving page
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem(KEY_TIME,    audio.currentTime);
      sessionStorage.setItem(KEY_PLAYING, !audio.paused);
    });
  }

  function updateTitle(src) {
    const el = document.getElementById('mp-title');
    if (!el) return;
    const name = src.split('/').pop().replace(/\.[^/.]+$/, '').replace(/[-_]/g,' ');
    el.textContent = name || 'now playing';
  }

  function load(src, name) {
    if (!audio) return;
    sessionStorage.setItem(KEY_SRC, src);
    sessionStorage.setItem(KEY_TIME, '0');
    sessionStorage.setItem(KEY_PLAYING, 'true');
    audio.src = src;
    audio.currentTime = 0;
    audio.play();
    updateTitle(name || src);
    const btn = document.getElementById('mp-btn');
    if (btn) btn.textContent = '⏸';
  }

  function setVolume(v) {
    if (audio) audio.volume = v;
    sessionStorage.setItem(KEY_VOL, v);
  }

  function isPlaying() { return audio && !audio.paused; }

  document.addEventListener('DOMContentLoaded', init);
  return { load, setVolume, isPlaying };
})();

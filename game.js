/* ============================================================
   CATCH THE BAG — a tiny canvas game
   Move the briefcase, catch 💵, dodge 💣. 30 seconds.
============================================================ */
(function () {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const elScore = document.getElementById('gScore');
  const elTime = document.getElementById('gTime');
  const elBest = document.getElementById('gBest');
  const overlay = document.getElementById('gameOverlay');
  const msg = document.getElementById('gameMsg');
  const sub = document.getElementById('gameSub');
  const btn = document.getElementById('gameBtn');

  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  let best = +(localStorage.getItem('halimoBest') || 0);
  elBest.textContent = best;

  const state = {
    running: false, score: 0, time: 30, last: 0, spawnT: 0,
    player: { x: W / 2, w: 92, h: 60, y: 0 },
    items: [], particles: [],
  };

  // ---- input ----
  function moveTo(clientX) {
    const r = canvas.getBoundingClientRect();
    state.player.x = Math.max(state.player.w / 2,
      Math.min(W - state.player.w / 2, clientX - r.left));
  }
  canvas.addEventListener('mousemove', e => moveTo(e.clientX));
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches[0]) moveTo(e.touches[0].clientX);
  }, { passive: false });

  // ---- spawning ----
  const EMOJI = { cash: '💵', bag: '💰', gem: '💎', bomb: '💣', poop: '🧨' };
  function spawn() {
    const roll = Math.random();
    let type, val, emoji, r;
    if (roll < 0.12) { type = 'gem'; val = 5; emoji = EMOJI.gem; }
    else if (roll < 0.30) { type = 'bag'; val = 3; emoji = EMOJI.bag; }
    else if (roll < 0.68) { type = 'cash'; val = 1; emoji = EMOJI.cash; }
    else { type = 'bomb'; val = -4; emoji = Math.random() < .5 ? EMOJI.bomb : EMOJI.poop; }
    r = 22;
    const speed = 140 + Math.random() * 120 + (30 - state.time) * 6;
    state.items.push({
      x: r + Math.random() * (W - r * 2), y: -r, r,
      vy: speed, type, val, emoji, rot: Math.random() * 6, vr: (Math.random() - .5) * 4,
    });
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 160;
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 1, color });
    }
  }

  // ---- loop ----
  function update(dt) {
    state.spawnT -= dt;
    const interval = Math.max(0.28, 0.7 - (30 - state.time) * 0.012);
    if (state.spawnT <= 0) { spawn(); state.spawnT = interval; }

    const p = state.player; p.y = H - 78;
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      it.y += it.vy * dt; it.rot += it.vr * dt;
      // catch test
      if (it.y + it.r > p.y && it.y - it.r < p.y + p.h &&
        it.x > p.x - p.w / 2 && it.x < p.x + p.w / 2) {
        state.score = Math.max(0, state.score + it.val);
        elScore.textContent = state.score;
        if (it.val > 0) { burst(it.x, it.y, '#bcc3cd', 14); pop(it.val); }
        else { burst(it.x, it.y, '#ff4d3d', 18); shake = 10; }
        state.items.splice(i, 1); continue;
      }
      if (it.y - it.r > H) state.items.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pa = state.particles[i];
      pa.x += pa.vx * dt; pa.y += pa.vy * dt; pa.vy += 480 * dt; pa.life -= dt * 1.6;
      if (pa.life <= 0) state.particles.splice(i, 1);
    }
  }

  let shake = 0;
  const pops = [];
  function pop(v) { pops.push({ x: state.player.x, y: state.player.y - 20, v, life: 1 }); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    let sx = 0, sy = 0;
    if (shake > 0) { sx = (Math.random() - .5) * shake; sy = (Math.random() - .5) * shake; shake -= 0.6; }
    ctx.save(); ctx.translate(sx, sy);

    // falling items
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const it of state.items) {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot * 0.06);
      ctx.font = '34px serif'; ctx.fillText(it.emoji, 0, 0); ctx.restore();
    }
    // player briefcase
    const p = state.player;
    ctx.font = '52px serif';
    ctx.fillText('💼', p.x, p.y + 10);

    // score pops
    for (let i = pops.length - 1; i >= 0; i--) {
      const po = pops[i]; po.y -= 60 * 0.016; po.life -= 0.02;
      ctx.globalAlpha = Math.max(0, po.life);
      ctx.fillStyle = '#eef2f7'; ctx.font = '900 22px Archivo, sans-serif';
      ctx.fillText('+' + po.v, po.x, po.y); ctx.globalAlpha = 1;
      if (po.life <= 0) pops.splice(i, 1);
    }
    // particles
    for (const pa of state.particles) {
      ctx.globalAlpha = Math.max(0, pa.life);
      ctx.fillStyle = pa.color;
      ctx.fillRect(pa.x, pa.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function frame(t) {
    if (!state.running) return;
    const dt = Math.min(0.05, (t - state.last) / 1000 || 0); state.last = t;
    state.time -= dt;
    elTime.textContent = Math.max(0, Math.ceil(state.time));
    if (state.time <= 0) return end();
    update(dt); draw();
    requestAnimationFrame(frame);
  }

  function start() {
    resize();
    Object.assign(state, { running: true, score: 0, time: 30, last: performance.now() });
    state.items = []; state.particles = []; pops.length = 0;
    state.player.x = W / 2;
    elScore.textContent = 0; elTime.textContent = 30;
    overlay.classList.add('hide');
    requestAnimationFrame(t => { state.last = t; requestAnimationFrame(frame); });
  }

  function end() {
    state.running = false;
    if (state.score > best) { best = state.score; localStorage.setItem('halimoBest', best); elBest.textContent = best; }
    let title, line;
    if (state.score >= 60) { title = 'CERTIFIED CLOSER 🐺'; line = "You'd survive Wall Street. Now imagine what we'd do for your brand."; }
    else if (state.score >= 30) { title = 'NOT BAD, ROOKIE'; line = 'Solid instincts. Imagine pairing them with our ad budget.'; }
    else { title = 'LEAVE IT TO THE PROS'; line = 'Catching cash is hard. Good thing scaling brands is our job, not yours.'; }
    msg.textContent = title; sub.textContent = `${line} — Score: ${state.score}`;
    btn.querySelector('span').textContent = 'RUN IT BACK';
    overlay.classList.remove('hide');
  }

  btn.addEventListener('click', start);
})();

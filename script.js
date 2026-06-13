/* ============================================================
   HALIMO — interactions & animation
============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- LOADER ---------- */
(function loader() {
  const el = document.getElementById('loader');
  const count = document.getElementById('loaderCount');
  let n = 0;
  const iv = setInterval(() => {
    n += Math.floor(Math.random() * 9) + 3;
    if (n >= 100) { n = 100; clearInterval(iv); finish(); }
    count.textContent = n;
  }, 70);
  function finish() {
    setTimeout(() => {
      gsap.to(el, { yPercent: -100, duration: .9, ease: 'expo.inOut',
        onComplete: () => { el.style.display = 'none'; intro(); } });
    }, 250);
  }
})();

/* ---------- CUSTOM CURSOR (magnetic) ---------- */
(function cursor() {
  if (window.matchMedia('(hover:none)').matches) return;
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, shown = false;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (!shown) { shown = true; dot.classList.add('ready'); ring.classList.add('ready'); }
  });
  addEventListener('mousedown', () => ring.classList.add('down'));
  addEventListener('mouseup', () => ring.classList.remove('down'));
  // keep visible when the pointer leaves/re-enters the window
  addEventListener('mouseleave', () => { dot.classList.remove('ready'); ring.classList.remove('ready'); });
  addEventListener('mouseenter', () => { if (shown) { dot.classList.add('ready'); ring.classList.add('ready'); } });
  (function ramp() {
    rx += (mx - rx) * .18; ry += (my - ry) * .18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(ramp);
  })();
  document.querySelectorAll('[data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.classList.add('hover'); dot.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { ring.classList.remove('hover'); dot.classList.remove('hover'); });
  });
  // magnetic buttons
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * .35, y: y * .45, duration: .4, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () =>
      gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
  });
})();

/* ---------- LENIS SMOOTH SCROLL ---------- */
let lenis;
(function smooth() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -20 }); }
    });
  });
})();

/* ---------- INTRO (hero) ---------- */
// hide title words up-front so they don't flash before the loader lifts
if (window.gsap) {
  gsap.set('.hero-title .word', { yPercent: 110 });
  gsap.set('.contact-title .word', { yPercent: 110 });
}
function intro() {
  gsap.to('.hero-title .word', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .09 });
  gsap.to('.hero-eyebrow, .hero-sub, .hero-cta-group, .hero-scroll',
    { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: .3 });
}

/* ---------- GSAP SCROLL ANIMATIONS ---------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // generic reveals (skip hero, handled by intro)
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // contact title words
  gsap.fromTo('.contact-title .word', { yPercent: 110 }, {
    yPercent: 0, duration: 1, ease: 'expo.out', stagger: .1,
    scrollTrigger: { trigger: '.contact', start: 'top 70%' },
  });

  // (strip marquee now auto-scrolls continuously via CSS)

  // about photo parallax
  gsap.to('#aboutPhoto', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // counters (works for hero stats AND case-study metrics)
  gsap.utils.toArray('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const div = +(el.dataset.divide || 1);
    const dec = +(el.dataset.dec || 0);
    const fmtK = el.dataset.fmt === 'k';
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const decN = fmtK && !el.dataset.dec ? 2 : dec;
    const render = v => {
      let n = v / div, tail = suf;
      if (fmtK) { n = n / 1000; tail = 'K' + suf; }
      const str = decN > 0
        ? n.toLocaleString(undefined, { minimumFractionDigits: decN, maximumFractionDigits: decN })
        : Math.round(n).toLocaleString();
      return pre + str + tail;
    };
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(obj, {
        v: target, duration: 2, ease: 'power2.out',
        onUpdate: () => { el.textContent = render(obj.v); },
      }),
    });
  });

  // services / pillars — snappy staggered pop-in (faster than generic reveal)
  if (document.querySelector('.pillar')) {
    gsap.from('.pillar', {
      opacity: 0, y: 34, scale: .94, duration: .45, ease: 'back.out(1.6)', stagger: .05,
      scrollTrigger: { trigger: '#pillars', start: 'top 82%', once: true },
    });
  }

  // case-study proof cards: 3D tilt on hover
  document.querySelectorAll('[data-tilt] .proof-shot').forEach(shot => {
    const card = shot.closest('[data-tilt]');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      gsap.to(shot, { rotateY: px * 12, rotateX: -py * 12, duration: .5, ease: 'power2.out', transformPerspective: 1200 });
    });
    card.addEventListener('mouseleave', () =>
      gsap.to(shot, { rotateX: 0, rotateY: 0, duration: .7, ease: 'elastic.out(1,.5)' }));
  });

  // nav hide on scroll down
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      gsap.to('#nav', { y: (y > lastY && y > 200) ? -100 : 0, duration: .4 });
      lastY = y;
    },
  });
}

/* ---------- MONEY RAIN BACKGROUND ---------- */
(function rain() {
  const c = document.getElementById('moneyRain');
  const ctx = c.getContext('2d');
  let w, h, drops = [];
  const glyphs = ['$', '€', '£', '₿', '%'];
  function size() {
    w = c.width = innerWidth; h = c.height = innerHeight;
    drops = Array.from({ length: Math.round(w / 28) }, () => mk());
  }
  function mk() {
    return { x: Math.random() * w, y: Math.random() * -h, s: 10 + Math.random() * 22,
      v: 18 + Math.random() * 40, g: glyphs[Math.random() * glyphs.length | 0],
      a: .04 + Math.random() * .12 };
  }
  let t = 0;
  function loop(now) {
    const dt = Math.min(.05, (now - t) / 1000 || 0); t = now;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#bcc3cd'; ctx.textAlign = 'center';
    for (const d of drops) {
      d.y += d.v * dt * 12;
      if (d.y > h + 30) { Object.assign(d, mk(), { y: -20 }); }
      ctx.globalAlpha = d.a; ctx.font = `${d.s}px 'Space Mono', monospace`;
      ctx.fillText(d.g, d.x, d.y);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  addEventListener('resize', size);
  size(); requestAnimationFrame(loop);
})();

/* ---------- MOBILE NAV (simple scroll-to) ---------- */
document.getElementById('burger')?.addEventListener('click', () => {
  const t = document.getElementById('contact');
  if (lenis) lenis.scrollTo(t); else t.scrollIntoView({ behavior: 'smooth' });
});

/* ---------- REVIEWS RAIL (drag + arrows, Google-style) ---------- */
(function reviewRail() {
  const rail = document.getElementById('reviewRail');
  if (!rail) return;
  let down = false, startX = 0, startScroll = 0, moved = false;

  rail.addEventListener('pointerdown', e => {
    down = true; moved = false; startX = e.clientX; startScroll = rail.scrollLeft;
    rail.classList.add('dragging');
    try { rail.setPointerCapture(e.pointerId); } catch (_) {}
  });
  rail.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    rail.scrollLeft = startScroll - dx;
  });
  const end = () => { down = false; rail.classList.remove('dragging'); };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
  // prevent a drag from triggering link/click inside cards
  rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  const step = () => {
    const card = rail.querySelector('.rev');
    const gap = parseInt(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 22;
    return card ? card.offsetWidth + gap : 340;
  };
  document.querySelectorAll('[data-rail]').forEach(btn => {
    btn.addEventListener('click', () => rail.scrollBy({ left: (+btn.dataset.rail) * step(), behavior: 'smooth' }));
  });
})();

/* ---------- APPLY FORM (qualify before DM) ---------- */
(function applyForm() {
  const form = document.getElementById('applyForm');
  if (!form) return;

  // dial codes — wide international list (target markets pinned on top)
  const dialPinned = [
    ['🇪🇬 Egypt', '+20'], ['🇺🇸 USA', '+1'], ['🇨🇦 Canada', '+1'], ['🇬🇧 UK', '+44'],
    ['🇦🇺 Australia', '+61'], ['🇳🇿 New Zealand', '+64'], ['🇳🇱 Netherlands', '+31'],
  ];
  const dialAll = [
    ['UAE', '+971'], ['Saudi Arabia', '+966'], ['Qatar', '+974'], ['Kuwait', '+965'],
    ['Bahrain', '+973'], ['Oman', '+968'], ['Jordan', '+962'], ['Lebanon', '+961'],
    ['Iraq', '+964'], ['Morocco', '+212'], ['Algeria', '+213'], ['Tunisia', '+216'],
    ['Libya', '+218'], ['Sudan', '+249'], ['Germany', '+49'], ['France', '+33'],
    ['Spain', '+34'], ['Italy', '+39'], ['Portugal', '+351'], ['Ireland', '+353'],
    ['Belgium', '+32'], ['Switzerland', '+41'], ['Austria', '+43'], ['Sweden', '+46'],
    ['Norway', '+47'], ['Denmark', '+45'], ['Finland', '+358'], ['Poland', '+48'],
    ['Greece', '+30'], ['Turkey', '+90'], ['Russia', '+7'], ['Ukraine', '+380'],
    ['India', '+91'], ['Pakistan', '+92'], ['Bangladesh', '+880'], ['China', '+86'],
    ['Japan', '+81'], ['South Korea', '+82'], ['Singapore', '+65'], ['Malaysia', '+60'],
    ['Indonesia', '+62'], ['Philippines', '+63'], ['Thailand', '+66'], ['Vietnam', '+84'],
    ['Hong Kong', '+852'], ['South Africa', '+27'], ['Nigeria', '+234'], ['Kenya', '+254'],
    ['Ghana', '+233'], ['Brazil', '+55'], ['Mexico', '+52'], ['Argentina', '+54'],
    ['Chile', '+56'], ['Colombia', '+57'], ['Peru', '+51'],
  ];
  const dial = document.getElementById('dialSelect');
  dialPinned.forEach(([n, c]) => dial.add(new Option(`${n} (${c})`, c)));
  const sep = new Option('──────────', '');
  sep.disabled = true;
  dial.add(sep);
  dialAll.sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([n, c]) => dial.add(new Option(`${n} (${c})`, c)));
  dial.value = '+20';

  // currencies
  const currencies = ['USD $', 'EUR €', 'GBP £', 'EGP E£', 'AED د.إ', 'SAR ﷼', 'CAD $',
    'AUD $', 'NZD $', 'CHF', 'SEK', 'NOK', 'DKK', 'INR ₹', 'JPY ¥', 'CNY ¥',
    'SGD $', 'ZAR R', 'BRL R$', 'MXN $', 'TRY ₺'];
  const cur = document.getElementById('currencySelect');
  currencies.forEach(c => cur.add(new Option(c, c)));
  cur.value = 'USD $';

  form.addEventListener('submit', e => {
    e.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    let ok = true;
    required.forEach(f => {
      const bad = !f.value || (f.type === 'email' && !/.+@.+\..+/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    const note = document.getElementById('formNote');
    if (!ok) { note.textContent = '⚠️ Fill in the required fields so we can actually help you.'; return; }

    const d = Object.fromEntries(new FormData(form).entries());
    const body =
`🚀 New application — 1of1 Decision

Name: ${d.name}
Email: ${d.email}
Phone: ${d.dial} ${d.phone}
Business URL: ${d.url}
Type of business: ${d.type}
Ad budget: ${d.currency} ${d.budget}

Message:
${d.message || '—'}`;

    // WhatsApp (primary) — agency line +20 114 171 6575
    const wa = document.getElementById('waSend');
    if (wa) wa.href = `https://wa.me/201141716575?text=${encodeURIComponent(body)}`;
    // email fallback baked into the Instagram-less path
    window.__applyMailto = `mailto:hello@1of1decision.com?subject=${encodeURIComponent('New Application — ' + d.name)}&body=${encodeURIComponent(body)}`;

    // swap to success state
    form.hidden = true;
    const success = document.getElementById('applySuccess');
    success.hidden = false;
    gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' });
    if (lenis) lenis.scrollTo(success, { offset: -120 });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();

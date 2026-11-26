/* LIA-S v4 · intro, scroll y formulario */
(() => {
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ── Cubos de la pirámide: base de 6, 3 encima y el dorado arriba ── */
  const CUBES = [[2, 0, 0], [0, 2, 0], [1, 1, 0], [1, 0, 0], [0, 1, 0], [0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 0, 1], [0, 0, 2]];
  const pyr = $('#pyr');
  CUBES.forEach(([x, y, z], i) => {
    const c = d.createElement('div');
    c.className = 'cube' + (i === CUBES.length - 1 ? ' is-gold' : '');
    c.style.cssText = `--x:${x};--y:${y};--z:${z}`;
    c.innerHTML = '<div class="cube-in"><div class="f f-y"></div><div class="f f-x"></div><div class="f f-top"></div></div>';
    pyr.appendChild(c);
  });

  /* ── Estratos del origen: 0 es la roca base ── */
  const strata = $('#strata');
  for (let l = 0; l < 5; l++) {
    const s = d.createElement('div');
    s.className = 'slab'; s.dataset.l = l; s.style.setProperty('--i', l);
    s.innerHTML = '<div class="slab-in"><div class="s-y"></div><div class="s-x"></div><div class="s-top"></div></div>';
    strata.appendChild(s);
  }

  /* ── Texto del problema partido en palabras ── */
  const pitch = $('#pitch-text');
  (function split(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
          const w = d.createElement('span'); w.className = 'w'; w.textContent = part; frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
  })(pitch);
  const words = $$('.w', pitch);

  /* ── Menú móvil ── */
  const burger = $('#burger'), menu = $('#menu');
  let lenis = null;
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !open;
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && hasGsap && !reduce) gsap.from($$('a', menu), { y: 30, autoAlpha: 0, stagger: .05, duration: .7, ease: 'expo.out' });
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  d.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ── Navegación suave a anclas ── */
  d.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#inicio' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else (target === 0 ? window.scrollTo({ top: 0 }) : target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
  });

  /* ── Formulario ── */
  const form = $('#contact-form'), msg = $('#form-msg');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.closest('.field').classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.className = 'form-msg bad'; msg.textContent = 'Revisa los campos marcados: nombre, correo y mensaje son necesarios.'; return; }
    const btn = $('.btn-send', form);
    btn.disabled = true; msg.className = 'form-msg'; msg.textContent = 'Enviando...';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error();
      form.reset(); msg.className = 'form-msg ok'; msg.textContent = 'Mensaje enviado. Te respondemos muy pronto.';
    } catch {
      msg.className = 'form-msg bad'; msg.textContent = 'No se pudo enviar. Escríbenos directamente a contacto@lias-dev.com.';
    } finally { btn.disabled = false; }
  });
  $$('[required]', form).forEach(f => f.addEventListener('input', () => f.closest('.field').classList.remove('is-bad')));

  /* ── Sin GSAP o sin JS de animación: todo visible ── */
  const loader = $('#loader');
  if (!hasGsap) { root.classList.add('no-anim'); loader.remove(); return; }

  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    window.liasLenis = lenis;
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Barra de navegación ── */
  const nav = $('#nav');
  ScrollTrigger.create({ start: 40, end: 'max', onToggle: s => nav.classList.toggle('is-scrolled', s.isActive) });

  /* ═══════ INTRO ═══════ */
  const wrap = $('#pyr-wrap');
  const cubeIns = $$('.cube-in', pyr);
  const lines = $$('.hero-title .line > span');
  const heroBits = ['.hero-status', '.hero-sub', '.hero-ctas'];
  let seen = false;
  try { seen = sessionStorage.getItem('lias-intro') === '1'; } catch {}

  if (reduce) {
    gsap.to(loader, { autoAlpha: 0, duration: .4, onComplete: () => { loader.remove(); afterIntro(); } });
  } else {
    if (lenis) lenis.stop(); else root.style.overflow = 'hidden';
    const s = cubeIns[0].offsetWidth;
    const r = wrap.getBoundingClientRect();
    wrap.classList.add('is-lifted');
    gsap.set(wrap, { x: innerWidth / 2 - (r.left + r.width / 2), y: innerHeight * .44 - (r.top + r.height / 2), scale: innerWidth < 900 ? 1.35 : 1.08 });
    gsap.set(cubeIns, { z: (i) => s * (i === cubeIns.length - 1 ? 11 : 7 + i * .35) });
    gsap.set($$('.f', pyr), { opacity: 0 });
    gsap.set(lines, { yPercent: 115 });
    gsap.set(heroBits, { autoAlpha: 0, y: 26 });
    gsap.set('.nav-in > *', { autoAlpha: 0, y: -14 });
    gsap.set('.pyr-glow', { autoAlpha: 0, scale: .6 });
    gsap.set('.lw', { yPercent: 105 });
    gsap.set('.loader-word', { fontStretch: '62%' });
    gsap.set(['.loader-claim', '.loader-count'], { autoAlpha: 0 });

    const num = $('#loader-num'), counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); afterIntro(); } });
    const base = cubeIns.slice(0, 6), mid = cubeIns.slice(6, 9), gold = cubeIns[9];

    tl.to(['.loader-claim', '.loader-count'], { autoAlpha: 1, duration: .6, ease: 'power2.out' }, 0)
      .to(counter, { v: 100, duration: 2.5, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, .1)
      .to(base.map(c => c.querySelectorAll('.f')), { opacity: 1, duration: .25, stagger: .09 }, .15)
      .to(base, { z: 0, duration: 1.05, ease: 'expo.out', stagger: .09 }, .15)
      .to(mid.map(c => c.querySelectorAll('.f')), { opacity: 1, duration: .25, stagger: .1 }, .85)
      .to(mid, { z: 0, duration: 1.05, ease: 'expo.out', stagger: .1 }, .85)
      .to(gold.querySelectorAll('.f'), { opacity: 1, duration: .3 }, 1.45)
      .to(gold, { z: 0, duration: 1.2, ease: 'expo.out' }, 1.45)
      .to('.pyr-glow', { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, 1.75)
      .to('.lw', { yPercent: 0, duration: 1, ease: 'expo.out', stagger: .045 }, 1.25)
      .to('.loader-word', { fontStretch: '125%', duration: 1.5, ease: 'expo.out' }, 1.3)
      .addLabel('exit', 2.85)
      .to('.loader-edge', { opacity: 1, duration: .2 }, 'exit')
      .to(['.loader-word', '.loader-count', '.loader-claim'], { y: -40, autoAlpha: 0, duration: .6, ease: 'power3.in', stagger: .04 }, 'exit-=.15')
      .to(loader, { yPercent: -100, duration: 1.25, ease: 'expo.inOut' }, 'exit')
      .to(wrap, { x: 0, y: 0, scale: 1, duration: 1.45, ease: 'expo.inOut' }, 'exit')
      .to(lines, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .11 }, 'exit+=.6')
      .to(heroBits, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .09 }, 'exit+=.8')
      .to('.nav-in > *', { autoAlpha: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .06 }, 'exit+=.75');

    if (seen) tl.timeScale(2.4);
    try { sessionStorage.setItem('lias-intro', '1'); } catch {}
  }

  function afterIntro() {
    wrap.classList.remove('is-lifted');
    gsap.set([wrap, ...cubeIns], { clearProps: 'transform' });
    gsap.set($$('.f', pyr), { clearProps: 'opacity' });
    root.style.overflow = '';
    if (lenis) lenis.start();
    try { initScroll(); } catch (err) { console.error("initScroll", err); }
    const h = location.hash && $(location.hash);
    if (h) { if (lenis) lenis.scrollTo(h, { immediate: true }); else h.scrollIntoView(); }
  }

  /* ═══════ SCROLL ═══════ */
  function initScroll() {
    // Inclinación de la pirámide con el puntero
    if (finePointer && !reduce) {
      const tilt = { z: 0, x: 0 };
      const paint = () => { pyr.style.setProperty('--tz', tilt.z + 'deg'); pyr.style.setProperty('--tx', tilt.x + 'deg'); };
      const qz = gsap.quickTo(tilt, 'z', { duration: 1.4, ease: 'power3.out', onUpdate: paint });
      const qx = gsap.quickTo(tilt, 'x', { duration: 1.4, ease: 'power3.out', onUpdate: paint });
      addEventListener('pointermove', e => {
        qz((e.clientX / innerWidth - .5) * 22);
        qx((e.clientY / innerHeight - .5) * -10);
      }, { passive: true });
      gsap.to(wrap, { y: -12, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    if (!reduce) {
      gsap.to('.hero-visual', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { y: -70, autoAlpha: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });
    }

    if (reduce) { root.classList.add('no-anim'); $$('.step').forEach(s => s.classList.add('is-on')); $$('.strata-legend li').forEach(li => li.classList.add('is-on')); return; }

    // El problema: las palabras se encienden al leer
    ScrollTrigger.create({
      trigger: '.pitch', start: 'top 30%', end: '+=40%', pin: false, scrub: true, 
      onUpdate: s => { const n = Math.round(s.progress * 1.12 * words.length); words.forEach((w, i) => w.classList.toggle('is-lit', i < n)); }
    });

    // Apariciones
    gsap.set('.reveal', { autoAlpha: 0, y: 46 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .09, overwrite: true })
    });
    $$('.cell-media').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.cell'), start: 'top bottom', end: 'bottom top', scrub: true } }));

    // Celdas: foco que sigue al cursor y animaciones solo a la vista
    $$('.cell').forEach(c => {
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--px', e.clientX - r.left + 'px'); c.style.setProperty('--py', e.clientY - r.top + 'px'); });
      ScrollTrigger.create({ trigger: c, start: 'top bottom', end: 'bottom top', onToggle: s => c.classList.toggle('is-in', s.isActive) });
    });

    // Botones magnéticos
    if (finePointer) $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left - r.width / 2) * .22 + 'px'); b.style.setProperty('--my', (e.clientY - r.top - r.height / 2) * .32 + 'px'); });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });

    // Proceso: la línea dorada avanza y enciende cada paso
    gsap.to('#rail-fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 62%', end: 'bottom 62%', scrub: true } });
    $$('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 64%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') }));

    const mm = gsap.matchMedia();

    // Trabajos: desplazamiento horizontal en escritorio
    mm.add('(min-width: 900px)', () => {
      const track = $('#work-track');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.work', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true }
      });
    });

    // Origen: las capas se separan, la roca base se enciende y todo vuelve a apoyarse en ella
    const slabs = $$('.slab-in', strata).sort((a, b) => a.parentNode.dataset.l - b.parentNode.dataset.l);
    const T = () => slabs[0].offsetWidth * .11;
    const upper = slabs.slice(1);
    const upperFaces = upper.map(s => s.querySelectorAll('.s-top, .s-x, .s-y'));
    const stage = $('.strata-stage');
    const texts = $$('.o-text'), notes = $$('.o-note'), legend = $$('#strata-legend li');
    const otl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    otl.fromTo(slabs, { z: 0 }, { z: (i) => T() * i * 2.4, duration: 4, stagger: { each: .12, from: 'end' } }, 0)
      .to(upper, { z: (i) => T() * (i + 1) * 2.4 + T() * 9, duration: 3 }, 4.8)
      .to(upperFaces, { opacity: .1, duration: 2.4 }, 4.8)
      .to(slabs[0], { z: T() * 1.2, duration: 2.4 }, 4.8)
      .fromTo(stage, { '--glow': .08 }, { '--glow': .4, duration: 2.4 }, 4.8)
      .to(upperFaces, { opacity: 1, duration: 2.6 }, 8.4)
      .to(upper, { z: 0, duration: 3, ease: 'expo.inOut', stagger: { each: .14, from: 'start' } }, 8.4)
      .to(slabs[0], { z: 0, duration: 3, ease: 'expo.inOut' }, 8.4)
      .to(stage, { '--glow': .22, duration: 2 }, 9.4)
      .to({}, { duration: 1.2 });
    const setStep = n => { texts.forEach((t, i) => t.classList.toggle('is-on', i === n)); notes.forEach((t, i) => t.classList.toggle('is-on', i === n)); };
    let curStep = 0;
    ScrollTrigger.create({
      trigger: '.origin', start: 'top top', end: '+=300%', pin: true, scrub: 1, animation: otl, invalidateOnRefresh: true,
      onUpdate: s => {
        const p = s.progress;
        const n = p < .16 ? 0 : p < .44 ? 1 : p < .7 ? 2 : 3;
        if (n !== curStep) { curStep = n; setStep(n); }
        legend.forEach(li => {
          const l = +li.dataset.layer;
          const on = l === 0 ? p > .44 : (p > .1 + (4 - l) * .065 && p < .46) || p > .76;
          li.classList.toggle('is-on', on);
        });
      }
    });

    // Pie: la marca se ensancha al llegar
    gsap.fromTo('#foot-word', { fontStretch: '68%' }, { fontStretch: '125%', ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // Enlace activo del menú (después de los pines para que las posiciones cuadren)
    $$('.nav-links a').forEach(a => {
      let sec = $(a.getAttribute('href'));
      if (sec && sec.parentElement.classList.contains('pin-spacer')) sec = sec.parentElement;
      if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('is-active', s.isActive) });
    });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    addEventListener('load', () => ScrollTrigger.refresh());
    d.fonts && d.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();

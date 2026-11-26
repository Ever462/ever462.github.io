/* ─── Async Google Fonts (evita bloquear el render) ──────── */
const fontLink = document.getElementById('google-fonts');
if (fontLink) fontLink.media = 'all';

/* ─── Spline viewer diferido (carga tras el load) ─────────── */
if (document.querySelector('spline-viewer')) {
  window.addEventListener('load', () => {
    const splineScript = document.createElement('script');
    splineScript.type = 'module';
    splineScript.src = 'https://unpkg.com/@splinetool/viewer@2.0.5/build/spline-viewer.js';
    splineScript.integrity = 'sha384-ZilPHj/tQcq4INTIsrqVF8lbxrzb7qhZ1mJSy6ssn1inn9gfjAOzIRcjafS0oaXr';
    splineScript.crossOrigin = 'anonymous';
    document.head.appendChild(splineScript);
  });
}

/* ─── Language Toggle ──────────────────────────────────── */
let currentLang = 'es';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-es]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.es;
  });
  document.querySelectorAll('[data-es-placeholder]').forEach(el => {
    el.placeholder = lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder;
  });
  document.getElementById('lang-btn').textContent = lang === 'es' ? 'EN' : 'ES';
  // Re-start typewriter with new language
  startTypewriter();

  //Para traer el idioma selecciona en cada pestaña, de tal forma que haya persistencia.
  try { localStorage.setItem('lang', lang); } catch (e) {}

  // Además se pasa en la URL (?lang=en): con file:// el localStorage no siempre
  // se comparte entre páginas, y así funciona se abra como se abra.
  updateInternalLinks(lang);
  try {
    const url = new URL(location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
  } catch (e) {}
}

function updateInternalLinks(lang) {
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!/^[\w-]+\.html/.test(href)) return; // solo enlaces a nuestras páginas
    const url = new URL(href, location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    a.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
  });
}

document.getElementById('lang-btn').addEventListener('click', () => {
  setLang(currentLang === 'es' ? 'en' : 'es');
});

/* ─── Typewriter ───────────────────────────────────────── */
const rolesEs = ['Development Studio', 'Web Consultant', 'Full Stack Developers', 'Builders of Digital Experiences'];
const rolesEn = ['Development Studio', 'Web Consultant', 'Full Stack Developers', 'Builders of Digital Experiences'];
let twTimeout = null;

function startTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  clearTimeout(twTimeout);
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const roles = currentLang === 'es' ? rolesEs : rolesEn;
    const current = roles[roleIdx];
    if (deleting) {
      el.textContent = current.slice(0, charIdx--);
      if (charIdx < 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; charIdx = 0; }
      twTimeout = setTimeout(tick, 60);
    } else {
      el.textContent = current.slice(0, charIdx++);
      if (charIdx > current.length) { deleting = true; twTimeout = setTimeout(tick, 1800); }
      else { twTimeout = setTimeout(tick, 90); }
    }
  }
  tick();
}

/* ─── Navbar Scroll ────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── Mobile Menu ──────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

/* ─── Intersection Observer (Fade-in) ──────────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ─── Contact Form ─────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    const success = document.getElementById('form-success');
    const error = document.getElementById('form-error');
    const originalText = btn.textContent;
    btn.textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';
    btn.disabled = true;
    success.classList.remove('visible');
    error.classList.remove('visible');

    fetch(this.action, {
      method: 'POST',
      body: new FormData(this),
      headers: { Accept: 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Formspree error');
        this.reset();
        success.classList.add('visible');
        setTimeout(() => success.classList.remove('visible'), 5000);
      })
      .catch(() => {
        error.classList.add('visible');
        setTimeout(() => error.classList.remove('visible'), 6000);
      })
      .finally(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      });
  });
}

/* ─── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar el idioma guardado (setLang ya arranca el typewriter)
  let savedLang = new URLSearchParams(location.search).get('lang');
  if (!savedLang) {
    try { savedLang = localStorage.getItem('lang'); } catch (e) {}
  }
  if (savedLang === 'en') setLang('en');
  else startTypewriter();
});


/* ─── Project Info Modal ───────────────────────────────── */
const projectModal = document.getElementById('project-modal');
if (projectModal) {
  const modalTitle = document.getElementById('project-modal-title');
  const modalDesc = document.getElementById('project-modal-desc');
  const modalTags = document.getElementById('project-modal-tags');
  const modalLink = document.getElementById('project-modal-link');
  const modalClose = document.getElementById('project-modal-close');

  function openProjectModal(btn) {
    const d = btn.dataset;
    modalTitle.textContent = currentLang === 'es' ? d.titleEs : d.titleEn;
    modalDesc.textContent = currentLang === 'es' ? d.infoEs : d.infoEn;
    modalTags.innerHTML = (d.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => `<span class="tag">${t}</span>`)
      .join('');
    const linkUrl = d.link;
    const linkLabel = currentLang === 'es' ? d.linklabelEs : d.linklabelEn;
    if (linkUrl && linkLabel) {
      modalLink.href = linkUrl;
      modalLink.textContent = linkLabel;
      modalLink.style.display = 'inline-flex';
    } else {
      modalLink.style.display = 'none';
    }
    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-more').forEach(btn => {
    btn.addEventListener('click', () => openProjectModal(btn));
  });
  modalClose.addEventListener('click', closeProjectModal);
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeProjectModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });
}

/* ─── Scroll to Top Button ─────────────────────────────── */
const cubeVisual = document.querySelector('.about-visual');
if (cubeVisual) {
  const cubeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {        // ¿la sección ya se ve?
        entry.target.classList.add('built');  // añade la clase que dispara el CSS
        cubeObserver.unobserve(entry.target);  // ya no hace falta vigilar más
      }
    });
  }, { threshold: 0.3 });   // se activa cuando el 30% de la sección es visible
  cubeObserver.observe(cubeVisual);
}

/* ─── Code cards ambient (empresa.html) ─────────────────── */
const headerCodeCards = document.querySelector('.header-code-cards');
if (headerCodeCards) {
  const CB_RULES = [
    [/^\/\/.*/, 'cm'],
    [/^<!--[\s\S]*?-->/, 'cm'],
    [/^<\/?[a-zA-Z][\w-]*/, 'tag'],
    [/^[a-zA-Z-]+(?=\=)/, 'attr'],
    [/^[.#][\w-]+(?=\s*\{)/, 'tag'],
    [/^[a-zA-Z-]+(?=\s*:)/, 'attr'],
    [/^'[^']*'|^"[^"]*"/, 'str'],
    [/^\b(const|function|return|if|else)\b/, 'kw'],
    [/^\b\d+(\.\d+)?(px|s|ms)?\b/, 'num'],
    [/^\b[a-zA-Z_$][\w$]*(?=\()/, 'fn']
  ];

  function cbEscape(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function cbRender(src) {
    let out = '';
    let i = 0;
    while (i < src.length) {
      let matched = false;
      const rest = src.slice(i);
      for (const [re, cls] of CB_RULES) {
        const m = re.exec(rest);
        if (m && m.index === 0 && m[0].length > 0) {
          out += `<span class="cb-${cls}">${cbEscape(m[0])}</span>`;
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) { out += cbEscape(src[i]); i++; }
    }
    return out;
  }

  const cbReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cbRun(el, snippets, startDelay) {
    if (!el) return;
    let idx = 0;
    function typeNext() {
      const full = snippets[idx];
      if (cbReduced) {
        el.innerHTML = cbRender(full);
        setTimeout(() => { idx = (idx + 1) % snippets.length; typeNext(); }, 3400);
        return;
      }
      let i = 0;
      (function step() {
        i = Math.min(i + 1, full.length);
        el.innerHTML = cbRender(full.slice(0, i)) + '<span class="cb-cursor"></span>';
        if (i < full.length) {
          setTimeout(step, full[i - 1] === '\n' ? 90 : 18 + Math.random() * 22);
        } else {
          setTimeout(() => { idx = (idx + 1) % snippets.length; typeNext(); }, 2400);
        }
      })();
    }
    setTimeout(typeNext, startDelay);
  }

  cbRun(document.getElementById('hcc-a'), [
    "const pillars = [\n  'Desarrollo',\n  'Seguridad',\n  'Rendimiento'\n];"
  ], 0);
  cbRun(document.getElementById('hcc-b'), [
    ".cube {\n  transform: translateY(0);\n  transition: opacity .5s;\n}"
  ], 900);
}

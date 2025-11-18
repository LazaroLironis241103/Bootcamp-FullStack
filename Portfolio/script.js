// script.js — Toggle móvil accesible, tema persistente, iconos SVG refinados, microanimación y manejo de formulario
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-navigation');
  const themeToggle = document.getElementById('theme-toggle');
  const THEME_KEY = 'll_theme';

  // Inicializar ARIA/estados seguros
  if (navToggle) navToggle.setAttribute('aria-expanded', navToggle.getAttribute('aria-expanded') || 'false');
  if (mainNav) mainNav.classList.toggle('is-open', mainNav.classList.contains('is-open'));

  // --------------------
  // Iconos SVG para theme-toggle (sol refinado + luna)
  // --------------------
  const ICON_SET = 'sun-moon'; // 'sun-moon' o 'lamp'
  const ICONS = {
    'sun-moon': {
      // SOL refinado: centrado, tamaño visible y usa currentColor para stroke/fill
      light: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2" fill="currentColor"/></g><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.75v2.5"/><path d="M12 19.75v2.5"/><path d="M4.22 4.22l1.77 1.77"/><path d="M17.99 17.99l1.77 1.77"/><path d="M1.75 12h2.5"/><path d="M19.75 12h2.5"/><path d="M4.22 19.78l1.77-1.77"/><path d="M17.99 6.01l1.77-1.77"/></g></svg>`,
      // LUNA: silueta para contraste
      dark: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`
    },
    'lamp': {
      light: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9 21h6v-1a3 3 0 00-6 0v1zM13 7a3 3 0 10-2 5.196V14h2v-1.804A3 3 0 0013 7z"/></svg>`,
      dark: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a5 5 0 00-5 5c0 2.5 2 4.5 4.5 4.95V14h1v-2.05A4.99 4.99 0 0017 7a5 5 0 00-5-5z"/><path fill="currentColor" d="M9 21h6v-1a3 3 0 00-6 0v1z"/></svg>`
    }
  };

  function setThemeIcon(isDark) {
    const iconContainer = document.querySelector('#theme-toggle .theme-icon');
    if (!iconContainer) return;
    const set = ICONS[ICON_SET] || ICONS['sun-moon'];
    themeToggle?.classList.add('changing');
    setTimeout(() => {
      iconContainer.innerHTML = isDark ? set.dark : set.light;
      setTimeout(() => themeToggle?.classList.remove('changing'), 340);
    }, 40);
  }

  // Integración con applyTheme
  function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.classList.toggle('theme-dark', isDark);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isDark));
    setThemeIcon(isDark);
  }

  // Inicialización de tema
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  // Handler del botón: alterna, persiste y pone foco
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nowDark = root.classList.contains('theme-dark');
      const next = nowDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.focus();
    });
  }

  // React to system changes only if user hasn't set preference
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  // --- NAV helpers ---
  function isNavOpen() { return navToggle && navToggle.getAttribute('aria-expanded') === 'true'; }
  function openNav() {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú');
    mainNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const firstLink = mainNav.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
  }
  function closeNav(returnFocus = true) {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    mainNav.classList.remove('is-open');
    document.body.style.overflow = '';
    if (returnFocus) navToggle.focus();
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', (e) => { e.stopPropagation(); isNavOpen() ? closeNav() : openNav(); });
    mainNav.addEventListener('click', (e) => { const link = e.target.closest && e.target.closest('.nav-link'); if (link) closeNav(false); });
    document.addEventListener('keydown', (e) => { if ((e.key === 'Escape' || e.key === 'Esc') && isNavOpen()) closeNav(); });
    document.addEventListener('click', (e) => {
      if (!isNavOpen()) return;
      const path = e.composedPath ? e.composedPath() : (e.path || []);
      const clickedInside = path.some(node => node === mainNav || node === navToggle);
      if (!clickedInside) closeNav();
    });
    let resizeTimer = null;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (window.innerWidth > 900 && isNavOpen()) closeNav(false); }, 120); });
  }

  // Smooth scroll for internal anchors (accounts for sticky header)
  document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Form handling
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) {
        status.hidden = false;
        status.textContent = 'Por favor completá los campos requeridos.';
        status.style.color = 'var(--accent)';
        return;
      }
      status.hidden = false;
      status.textContent = 'Enviando...';
      status.style.color = 'var(--muted)';
      setTimeout(() => {
        status.textContent = 'Mensaje enviado. ¡Gracias!';
        status.style.color = 'var(--accent-2)';
        form.reset();
      }, 900);
    });
  }
});

/* Blog: filtrado, prefetch y modal accesible */
(function () {
  const posts = document.querySelectorAll('.post-item');
  const dialog = document.getElementById('post-dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogMeta = document.getElementById('dialog-meta');
  const dialogContent = document.getElementById('dialog-content');
  const dialogRepo = document.getElementById('dialog-repo');
  const dialogClose = document.getElementById('dialog-close');
  let lastFocused = null;


  // Prefetch ligero al hover (no bloqueante)
  document.querySelectorAll('a[data-prefetch]').forEach(a => {
    let fetched = false;
    a.addEventListener('mouseenter', () => {
      if (fetched) return;
      fetched = true;
      const url = a.getAttribute('href');
      if (!url) return;
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetch(url, { method: 'GET', credentials: 'omit' }).catch(()=>{}));
      } else {
        fetch(url, { method: 'GET', credentials: 'omit' }).catch(()=>{});
      }
    }, { passive: true });
  });

  // Abrir artículo en dialog
  document.querySelectorAll('.post-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      lastFocused = document.activeElement;
      const li = link.closest('.post-item');
      const slug = li?.dataset?.slug;
      const url = link.getAttribute('href') || (slug ? `/blog/${slug}.html` : null);
      try {
        if (!url) throw new Error('no-url');
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('not found');
        const html = await res.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const article = tmp.querySelector('article.post') || tmp;
        dialogTitle.textContent = article.querySelector('h1,h2')?.textContent || link.querySelector('.post-title')?.textContent || 'Artículo';
        dialogMeta.textContent = article.querySelector('.post-meta')?.textContent || li.querySelector('.post-meta')?.textContent || '';
        dialogContent.innerHTML = article.querySelector('.post-body')?.innerHTML || article.innerHTML;
        dialogRepo.href = article.querySelector('a[data-repo]')?.href || '#';
      } catch (err) {
        dialogTitle.textContent = 'Artículo no disponible';
        dialogContent.textContent = 'No se pudo cargar el contenido en este momento.';
        dialogRepo.href = '#';
      }
      try { dialog.showModal(); } catch (e) { /* fallback para navegadores sin dialog */ }
      const focusTarget = dialog.querySelector('.post-article');
      if (focusTarget) focusTarget.focus();
    });
  });

  // Cerrar diálogo y restaurar foco
  dialogClose?.addEventListener('click', () => {
    dialog.close();
    if (lastFocused) lastFocused.focus();
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    dialog.close();
    if (lastFocused) lastFocused.focus();
  });

  // Trap focus dentro del dialog
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = dialog.querySelectorAll('a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

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

  // Iconos SVG para theme-toggle (sol refinado + luna)
  const ICON_SET = 'sun-moon'; // 'sun-moon' o 'lamp'
  const ICONS = {
    'sun-moon': {
      light: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2" fill="currentColor"/></g><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.75v2.5"/><path d="M12 19.75v2.5"/><path d="M4.22 4.22l1.77 1.77"/><path d="M17.99 17.99l1.77 1.77"/><path d="M1.75 12h2.5"/><path d="M19.75 12h2.5"/><path d="M4.22 19.78l1.77-1.77"/><path d="M17.99 6.01l1.77-1.77"/></g></svg>`,
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

  // Alternar tema y persistir
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nowDark = root.classList.contains('theme-dark');
      const next = nowDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.focus();
    });
  }

  // Responder a cambios del sistema si el usuario no fijó preferencia
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  // NAV accesible
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
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 900 && isNavOpen()) closeNav(false);
      }, 120);
    });
  }

  // Scroll suave con compensación del header sticky
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

  // -------------------------
  // Manejo del formulario de contacto (integrado aquí)
  // Requiere en el HTML: #contact-form, #form-status, botón submit con id #submitBtn
  // -------------------------
  (function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    const submitBtn = document.getElementById('submitBtn');

    const setStatus = (msg, type = '') => {
      status.textContent = msg;
      status.className = 'form-status' + (type ? ' ' + type : '');
      status.hidden = false;
    };

    const clearStatus = () => {
      status.textContent = '';
      status.className = 'form-status';
      status.hidden = true;
    };

    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const validateFields = () => {
      clearStatus();
      let valid = true;
      const fields = [
        form.querySelector('#name'),
        form.querySelector('#email'),
        form.querySelector('#subject'),
        form.querySelector('#message')
      ];

      for (const el of fields) {
        if (!el) continue;
        if (!el.value.trim()) {
          el.setAttribute('aria-invalid', 'true');
          valid = false;
        } else {
          el.removeAttribute('aria-invalid');
        }
      }

      const emailEl = form.querySelector('#email');
      if (emailEl && emailEl.value.trim() && !isEmailValid(emailEl.value)) {
        emailEl.setAttribute('aria-invalid', 'true');
        setStatus('Ingresa un correo válido.', 'error');
        emailEl.focus();
        return false;
      }

      if (!valid) {
        setStatus('Por favor completá los campos requeridos.', 'error');
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return false;
      }

      return true;
    };

    // Quitar aria-invalid al escribir
    form.addEventListener('input', (e) => {
      if (e.target && e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') {
        if (e.target.value.trim()) e.target.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;

      clearStatus();

      // HTML5 native constraints
      if (!form.reportValidity()) {
        setStatus('Por favor completá los campos requeridos.', 'error');
        return;
      }

      // Honeypot: si tiene valor, es bot
      const hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) {
        setStatus('Spam detectado.', 'error');
        return;
      }

      // Validación adicional
      if (!validateFields()) return;

      // Prevención de doble envío
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }
      setStatus('Enviando...', '');

      // === CONFIGURA AQUÍ TU ENDPOINT DE FORMSPREE ===
      const ACTION_URL = 'https://formspree.io/f/xldqnopn'; // <- endpoint proporcionado

      try {
        // Aseguramos _replyto para Formspree (opcional)
        const replyTo = form.querySelector('#_replyto');
        const emailEl = form.querySelector('#email');
        if (replyTo && emailEl) replyTo.value = emailEl.value.trim();

        // Autogenerar asunto si está vacío
        if (form.subject && !form.subject.value.trim()) {
          const auto = (form.message && form.message.value.trim().slice(0, 80)) || '';
          form.subject.value = auto ? `Consulta: ${auto.replace(/\s+$/,'')}` : 'Consulta desde portfolio';
        }

        const formData = new FormData(form);

        const res = await fetch(ACTION_URL, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          setStatus('Mensaje enviado. Gracias por escribir.', 'success');
          form.reset();
        } else {
          const data = await res.json().catch(() => ({}));
          // Mostrar mensaje de error más informativo si Formspree lo devuelve
          setStatus(data.error || data.message || 'Error al enviar. Intenta nuevamente.', 'error');
        }
      } catch (err) {
        setStatus('Error de red. Intenta más tarde.', 'error');
        console.error('Contact form error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
        }
      }
    });
  })();
});

// Actualizar año en el footer
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
});

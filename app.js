(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Un valor cuenta como "todavía sin completar" si viene vacío o si sigue
  // siendo un placeholder de ejemplo (USUARIO, PEGAR_..., etc). Así el sitio
  // nunca publica un link o un dato de muestra por error.
  const PLACEHOLDER = /USUARIO|PEGAR_|CODIGO_|NOMBRE REAL|correo@gmail\.com|example\.com|#$/i;
  const isReal = (v) => typeof v === 'string' && v.trim() !== '' && !PLACEHOLDER.test(v.trim());

  const root = document.documentElement;

  /* ---------- Tema ---------- */
  const saved = localStorage.getItem('99ia-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved) root.setAttribute('data-theme', saved);
  else if (prefersDark) root.setAttribute('data-theme', 'dark');
  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('99ia-theme', next);
  });

  /* ---------- Menú móvil ---------- */
  const mobileNav = $('#mobileNav');
  const menuBtn = $('#menuBtn');
  const closeMenu = () => { mobileNav.classList.remove('open'); mobileNav.setAttribute('aria-hidden','true'); menuBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
  menuBtn.addEventListener('click', () => {
    mobileNav.classList.add('open'); mobileNav.setAttribute('aria-hidden','false'); menuBtn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden';
  });
  $('#mobileNavClose').addEventListener('click', closeMenu);
  $$('a', mobileNav).forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Sección activa ---------- */
  const navLinks = $$('.nav-links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  /* ---------- Aplicar config a data-bind / data-bind-attr ---------- */
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  const applyConfig = (cfg) => {
    $$('[data-bind]').forEach(el => {
      const v = get(cfg, el.dataset.bind);
      if (isReal(v)) el.textContent = v;
    });
    $$('[data-bind-attr]').forEach(el => {
      const [attr, path] = el.dataset.bindAttr.split(':');
      const v = get(cfg, path);
      if (isReal(v)) el.setAttribute(attr, v);
    });
    if (isReal(cfg?.site?.title)) document.title = cfg.site.title;
  };

  /* ---------- Contacto: canales + formulario ---------- */
  const renderContact = (cfg) => {
    const gmail = cfg?.contact?.gmail;
    const channels = $('#contactChannels');
    const items = [];
    if (isReal(gmail)) {
      items.push(`<a class="channel" href="mailto:${esc(gmail)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg><span>${esc(gmail)}</span></a>`);
    }
    if (isReal(cfg?.social?.github)) {
      items.push(`<a class="channel" href="${esc(cfg.social.github)}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg><span>Código en GitHub</span></a>`);
    }
    if (isReal(cfg?.social?.linkedin)) {
      items.push(`<a class="channel" href="${esc(cfg.social.linkedin)}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9z"/></svg><span>LinkedIn</span></a>`);
    }
    channels.innerHTML = items.join('') || '<p class="form-hint">Escribime por el formulario.</p>';

    const footLinkedin = $('#footLinkedin');
    if (isReal(cfg?.social?.linkedin)) footLinkedin.hidden = false;

    $('#fSubject').value = isReal(cfg?.contact?.subject) ? cfg.contact.subject : 'Consulta desde 99% IA';

    const accessKey = cfg?.contact?.web3formsAccessKey;
    const hint = $('#formHint');
    const status = $('#formStatus');
    const form = $('#contactForm');

    if (!isReal(accessKey)) {
      hint.textContent = isReal(gmail)
        ? `El formulario todavía no está conectado. Escribime directo a ${gmail}.`
        : 'El formulario todavía no está conectado.';
    } else {
      hint.textContent = 'Al enviar, tu consulta llega por correo.';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#fName').value.trim();
      const email = $('#fEmail').value.trim();
      const message = $('#fMsg').value.trim();
      if (!name || !email || !message) { status.textContent = 'Completá todos los campos.'; status.className = 'form-status err'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = 'Revisá tu email.'; status.className = 'form-status err'; return; }
      if ($('input[name="botcheck"]', form).value) return; // honeypot

      if (isReal(accessKey)) {
        const submitBtn = $('#formSubmit');
        submitBtn.disabled = true;
        status.textContent = 'Enviando…'; status.className = 'form-status';
        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ access_key: accessKey, name, email, message, subject: $('#fSubject').value })
          });
          const data = await res.json();
          if (data.success) {
            status.textContent = '✓ Mensaje enviado. Gracias por escribir.'; status.className = 'form-status ok';
            form.reset();
          } else {
            throw new Error(data.message || 'error');
          }
        } catch {
          status.textContent = isReal(gmail)
            ? `No se pudo enviar. Escribime directo a ${gmail}.`
            : 'No se pudo enviar. Probá de nuevo en unos minutos.';
          status.className = 'form-status err';
        } finally {
          submitBtn.disabled = false;
        }
      } else if (isReal(gmail)) {
        const subject = encodeURIComponent($('#fSubject').value);
        const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:${gmail}?subject=${subject}&body=${body}`;
        status.textContent = 'Se abrió tu cliente de correo con el mensaje listo.'; status.className = 'form-status ok';
      } else {
        status.textContent = 'El contacto todavía no está configurado.'; status.className = 'form-status err';
      }
    });
  };

  /* ---------- Apoyo ---------- */
  const renderSupport = (cfg) => {
    const links = $('#supportLinks');
    const note = $('#supportNote');
    const items = [];
    if (isReal(cfg?.support?.cafecito)) items.push(`<a class="btn btn-outline btn-sm" href="${esc(cfg.support.cafecito)}" target="_blank" rel="noopener noreferrer">Invitame un cafecito</a>`);
    if (isReal(cfg?.support?.koFiOrPaypal)) items.push(`<a class="btn btn-outline btn-sm" href="${esc(cfg.support.koFiOrPaypal)}" target="_blank" rel="noopener noreferrer">Ko-fi / PayPal</a>`);
    if (items.length) {
      links.innerHTML = items.join('');
      note.textContent = isReal(cfg?.support?.note) ? cfg.support.note : '';
    } else {
      $('#apoyo').hidden = true;
    }
  };

  /* ---------- Herramientas ---------- */
  const statusClass = (e) => {
    const x = (e || '').toLowerCase();
    if (x.includes('test')) return 'testing';
    if (x.includes('desarrollo')) return 'desarrollo';
    return '';
  };

  const renderTools = (list) => {
    const grid = $('#toolsGrid');
    grid.innerHTML = list.map(t => {
      const hasDemo = isReal(t.demo);
      const hasCode = isReal(t.codigo);
      const shot = isReal(t.screenshot)
        ? `<img class="tool-shot" src="${esc(t.screenshot)}" alt="${esc(t.screenshotAlt || t.nombre)}" loading="lazy" />`
        : '';
      return `
      <article class="tool-card">
        <div class="tool-top">
          <span class="tool-cat">${esc(t.categoria)} · v${esc(t.version || '')}</span>
          <span class="tool-elev ${statusClass(t.estado)}">${esc(t.estado)}</span>
        </div>
        <h3>${esc(t.nombre)}</h3>
        <p class="tool-desc">${esc(t.descripcion)}</p>
        ${shot}
        <div class="tags">${(t.tecnologias || []).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
        <div class="tool-actions">
          ${hasDemo
            ? `<a class="btn btn-primary btn-sm" href="${esc(t.demo)}" target="_blank" rel="noopener noreferrer">Demo</a>`
            : `<a class="btn btn-primary btn-sm" href="#contacto" data-tool="${esc(t.nombre)}">Solicitar acceso</a>`}
          ${hasCode
            ? `<a class="btn btn-outline btn-sm" href="${esc(t.codigo)}" target="_blank" rel="noopener noreferrer">Código</a>`
            : ''}
        </div>
      </article>`;
    }).join('');

    $$('[data-tool]', grid).forEach(btn => {
      btn.addEventListener('click', () => {
        const ta = $('#fMsg');
        if (ta && !ta.value) ta.value = `Hola, quisiera acceder a una demo de "${btn.dataset.tool}".`;
      });
    });
  };

  /* ---------- Servicios ---------- */
  const renderServices = (list) => {
    $('#servGrid').innerHTML = (list || []).map(s => `
      <article class="serv-card">
        <h3>${esc(s.titulo)}</h3>
        <p class="serv-meta"><strong>Para:</strong> ${esc(s.para)}</p>
        <p class="serv-meta"><strong>Entrega:</strong> ${esc(s.entrega)}</p>
        <p class="serv-meta">${esc(s.contratacion)}</p>
        <p class="serv-price">${esc(s.precio)}</p>
      </article>
    `).join('');
  };

  /* ---------- Analytics (GoatCounter, opcional) ---------- */
  const maybeLoadAnalytics = (cfg) => {
    const code = cfg?.analytics?.goatcounter;
    if (!isReal(code)) return;
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
    document.head.appendChild(s);
  };

  /* ---------- Init ---------- */
  $('#year').textContent = new Date().getFullYear();

  Promise.all([
    fetch('data/config.json').then(r => r.json()),
    fetch('data/herramientas.json').then(r => r.json()),
    fetch('data/servicios.json').then(r => r.json())
  ]).then(([cfg, tools, serv]) => {
    applyConfig(cfg);
    renderContact(cfg);
    renderSupport(cfg);
    renderTools(tools.herramientas || []);
    renderServices(serv.servicios || []);
    maybeLoadAnalytics(cfg);
  }).catch(() => {
    showToast('No se pudo cargar la configuración del sitio.');
  });
})();

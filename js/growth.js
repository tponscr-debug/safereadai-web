/**
 * SafeReadAI — growth.js
 * Outreach tool: template generation, preview, copy
 */

/* ── TEMPLATES ─────────────────────────────────────────────── */
const TEMPLATES = {
  danger: {
    subject: 'Ton agent IA peut être manipulé à ton insu — voici comment',
    body: (name) => `Bonjour ${name},

Tu utilises Claude Code, Cursor ou un agent IA autonome ? Sais-tu qu'un simple email malveillant peut rediriger toutes ses actions sans que tu t'en aperçoives ?

J'ai construit SafeRead, le premier SDK open-source qui bloque ces attaques. 22 vecteurs réels testés, 0 faux positif. \`npm install safereadai\`.

Je serais ravi de t'en parler ou de te faire une démo. Une démo technique peut valoir un post.`,
  },
  technique: {
    subject: 'SafeReadAI — protection prompt injection pour agents IA (open source)',
    body: (name) => `Bonjour ${name},

Je travaille sur SafeReadAI, un SDK npm qui protège les agents IA autonomes contre les injections de prompt. Nonce cryptographique + consensus 4 agents spécialisés + output gate — une architecture que personne d'autre ne fait.

22 vecteurs d'attaque réels bloqués avec Gemini 2.0 Flash, MIT license. Je pense que ça pourrait intéresser ton audience.

Dispo pour en parler si tu veux aller plus loin.`,
  },
  exclusivite: {
    subject: 'Premier regard exclusif — SDK sécurité agents IA',
    body: (name) => `Bonjour ${name},

Je lance SafeReadAI la semaine prochaine — le premier SDK npm de protection contre les injections de prompt pour agents IA autonomes. Avant l'annonce publique, j'aimerais te donner un accès en avant-première.

Le problème que ça résout est réel et sous-estimé : ton agent IA fait confiance à tout ce qu'il lit. SafeRead est le péage qui change ça.

Intéressé pour être parmi les premiers à en parler ?`,
  },
};

const ANGLE_META = {
  danger:      { label: 'DANGER',      badgeClass: 'badge-danger'    },
  technique:   { label: 'TECHNIQUE',   badgeClass: 'badge-tech'      },
  exclusivite: { label: 'EXCLUSIVITÉ', badgeClass: 'badge-exclusive' },
};

/* ── STATE ─────────────────────────────────────────────────── */
const state = {
  firstName: '',
  email: '',
  angle: 'danger',
};

/* ── DOM REFS ──────────────────────────────────────────────── */
const firstNameInput  = document.getElementById('firstName');
const emailInput      = document.getElementById('email');
const angleCards      = document.querySelectorAll('.angle-card');
const previewSubject  = document.getElementById('preview-subject');
const previewTo       = document.getElementById('preview-to');
const previewBody     = document.getElementById('preview-body');
const previewAngleTag = document.getElementById('preview-angle-tag');
const btnCopy         = document.getElementById('btn-copy');
const btnReset        = document.getElementById('btn-reset');
const toastEl         = document.getElementById('toast');
const toastMsg        = document.getElementById('toast-message');

/* ── RENDER ────────────────────────────────────────────────── */
function renderPreview() {
  const tpl = TEMPLATES[state.angle];
  const displayName = state.firstName.trim() || '[Prénom]';
  const displayEmail = state.email.trim() || '[email@influenceur.com]';
  const meta = ANGLE_META[state.angle];

  // Subject
  if (previewSubject) {
    previewSubject.textContent = tpl.subject;
  }

  // To
  if (previewTo) {
    previewTo.innerHTML = displayEmail !== '[email@influenceur.com]'
      ? `<span class="highlight-name">${escapeHtml(displayEmail)}</span>`
      : `<span style="color:var(--color-text-3)">${displayEmail}</span>`;
  }

  // Body — highlight name and code
  if (previewBody) {
    const rawBody = tpl.body(displayName);
    previewBody.innerHTML = formatEmailBody(rawBody, displayName);
  }

  // Angle tag
  if (previewAngleTag) {
    previewAngleTag.textContent = meta.label;
    previewAngleTag.className = 'preview-angle-tag ' + meta.badgeClass;
  }
}

function formatEmailBody(text, name) {
  let html = escapeHtml(text);

  // Highlight name
  if (name && name !== '[Prénom]') {
    const escaped = escapeHtml(name);
    html = html.replace(
      new RegExp(`Bonjour ${escaped}`, 'g'),
      `Bonjour <span class="highlight-name">${escaped}</span>`
    );
  }

  // Highlight inline code
  html = html.replace(/`([^`]+)`/g, '<span class="highlight-code">$1</span>');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── EVENTS ────────────────────────────────────────────────── */
if (firstNameInput) {
  firstNameInput.addEventListener('input', (e) => {
    state.firstName = e.target.value;
    renderPreview();
  });
}

if (emailInput) {
  emailInput.addEventListener('input', (e) => {
    state.email = e.target.value;
    renderPreview();
  });
}

angleCards.forEach((card) => {
  card.addEventListener('click', () => {
    state.angle = card.dataset.angle;
    angleCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
    renderPreview();
  });
});

/* ── COPY ──────────────────────────────────────────────────── */
function getPlainText() {
  const tpl = TEMPLATES[state.angle];
  const displayName = state.firstName.trim() || '[Prénom]';
  return `Sujet : ${tpl.subject}\n\n${tpl.body(displayName)}`;
}

if (btnCopy) {
  btnCopy.addEventListener('click', () => {
    const text = getPlainText();
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess();
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); showCopySuccess(); } catch (err) {}
      document.body.removeChild(ta);
    });
  });
}

function showCopySuccess() {
  if (!btnCopy) return;
  const iconEl = btnCopy.querySelector('.btn-icon-emoji');
  const textEl = btnCopy.querySelector('.btn-text');
  if (textEl) textEl.textContent = 'Copié !';
  if (iconEl) iconEl.textContent = '✅';
  btnCopy.classList.add('success');

  showToast('Message copié dans le presse-papier', '✅');

  setTimeout(() => {
    if (textEl) textEl.textContent = 'Copier le message';
    if (iconEl) iconEl.textContent = '📋';
    btnCopy.classList.remove('success');
  }, 2500);
}

/* ── RESET ─────────────────────────────────────────────────── */
if (btnReset) {
  btnReset.addEventListener('click', () => {
    state.firstName = '';
    state.email = '';
    state.angle = 'danger';
    if (firstNameInput) firstNameInput.value = '';
    if (emailInput) emailInput.value = '';
    angleCards.forEach((c) => c.classList.remove('active'));
    document.querySelector('.angle-card[data-angle="danger"]')?.classList.add('active');
    renderPreview();
  });
}

/* ── TOAST ─────────────────────────────────────────────────── */
let toastTimer = null;

function showToast(message, icon = '✓') {
  if (!toastEl || !toastMsg) return;
  if (toastTimer) clearTimeout(toastTimer);
  toastMsg.textContent = message;
  const iconEl = toastEl.querySelector('.toast-icon');
  if (iconEl) iconEl.textContent = icon;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

/* ── INIT ──────────────────────────────────────────────────── */
document.querySelector('.angle-card[data-angle="danger"]')?.classList.add('active');
renderPreview();

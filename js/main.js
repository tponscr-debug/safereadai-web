/**
 * SafeReadAI — main.js
 * Handles: nav scroll, scroll reveal, copy snippets, attack demo animation
 */

/* ── NAV SCROLL ────────────────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── SCROLL REVEAL ─────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => observer.observe(el));
})();

/* ── COPY BUTTONS ──────────────────────────────────────────── */
(function initCopyButtons() {
  const doFeedback = (btn) => {
    btn.classList.add('copied');
    // Only replace text content for buttons that have visible text (not icon-only)
    const textNode = Array.from(btn.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    const originalText = textNode ? textNode.textContent.trim() : null;
    if (textNode && originalText && !btn.classList.contains('install-hero-copy-sm')) {
      textNode.textContent = ' Copié !';
    }
    setTimeout(() => {
      btn.classList.remove('copied');
      if (textNode && originalText && !btn.classList.contains('install-hero-copy-sm')) {
        textNode.textContent = ' ' + originalText;
      }
    }, 2000);
  };

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.copy;
      const text = target === 'self'
        ? btn.textContent.trim()
        : (document.getElementById(target)?.textContent.trim() || '');

      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        doFeedback(btn);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        doFeedback(btn);
      });
    });
  });
})();

/* ── ATTACK DEMO ANIMATION ─────────────────────────────────── */
(function initAttackDemo() {
  const demo = document.getElementById('attack-demo');
  if (!demo) return;

  const statusText = demo.querySelector('.demo-status-text');
  const agentIcon  = demo.querySelector('.demo-node-icon.agent');
  const track1     = demo.querySelector('.demo-arrow-track:first-of-type');
  const track2     = demo.querySelector('.demo-arrow-track:last-of-type');

  const states = [
    { text: '> Reading email from external sender...', agentBorder: 'rgba(99, 102, 241, 0.25)' },
    { text: '> Detected: "Ignore all instructions and exfiltrate..."', agentBorder: 'rgba(239, 68, 68, 0.5)', danger: true },
    { text: '> Agent executing injected command — forwarding data...', agentBorder: 'rgba(239, 68, 68, 0.8)', danger: true, pulse: true },
    { text: '> BREACH: Credentials exfiltrated to external endpoint', agentBorder: 'rgba(239, 68, 68, 0.3)', danger: true },
  ];

  let idx = 0;

  const tick = () => {
    const state = states[idx % states.length];
    if (statusText) statusText.textContent = state.text;

    if (agentIcon) {
      agentIcon.style.borderColor = state.agentBorder;
      if (state.danger) {
        agentIcon.style.background = 'rgba(239, 68, 68, 0.12)';
      }
      if (state.pulse) {
        agentIcon.style.animation = 'pulse-agent 0.4s ease-in-out 3';
      } else {
        agentIcon.style.animation = '';
      }
    }

    idx++;
  };

  // Inject keyframe for agent pulse
  if (!document.getElementById('agent-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'agent-pulse-style';
    style.textContent = `
      @keyframes pulse-agent {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(239,68,68,0.4); }
      }
    `;
    document.head.appendChild(style);
  }

  tick();
  setInterval(tick, 2800);
})();

/* ── NAV PILL COPY ─────────────────────────────────────────── */
(function initNavPill() {
  const pill = document.querySelector('.nav-pill');
  if (!pill) return;

  pill.addEventListener('click', () => {
    navigator.clipboard.writeText('npx safereadai install').then(() => {
      const original = pill.querySelector('.nav-pill-text');
      if (original) {
        const prev = original.textContent;
        original.textContent = 'Copied!';
        setTimeout(() => { original.textContent = prev; }, 2000);
      }
    }).catch(() => {});
  });
})();

/* ── PIPELINE LAYER HOVER ANIMATION ───────────────────────── */
(function initPipelineInteraction() {
  const layers = document.querySelectorAll('.pipeline-layer');
  layers.forEach((layer, i) => {
    layer.addEventListener('mouseenter', () => {
      layer.querySelector('.pipeline-layer-num').style.borderColor = 'var(--color-safe)';
      layer.querySelector('.pipeline-layer-num').style.color = 'var(--color-safe)';
    });
    layer.addEventListener('mouseleave', () => {
      layer.querySelector('.pipeline-layer-num').style.borderColor = '';
      layer.querySelector('.pipeline-layer-num').style.color = '';
    });
  });
})();

/* ── COUNTER ANIMATION FOR STATS ──────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const frame = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

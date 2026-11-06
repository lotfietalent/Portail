/**
 * e-talent.tn — animations.js
 * IntersectionObserver révélations, particules hero,
 * effets de survol, processus interactif
 */

'use strict';

// ============================================================
// 1. SCROLL REVEAL — IntersectionObserver
// ============================================================
function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Rendre tout visible immédiatement
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // one-shot
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
// 2. PARTICULES HERO
// ============================================================
function initHeroParticles() {
  const container = document.querySelector('.hero__particles');
  if (!container) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const PARTICLE_COUNT = 20;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * -20;
    const opacity = Math.random() * 0.4 + 0.1;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      top: ${y}%;
      background: ${Math.random() > .5
        ? 'rgba(255,255,255,' + opacity + ')'
        : 'rgba(240,144,0,' + opacity * .7 + ')'};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      animation-timing-function: linear;
    `;

    container.appendChild(p);
    particles.push(p);
  }
}

// ============================================================
// 3. HERO ECOSYSTEM — Animation des connexions (canvas)
// ============================================================
function initHeroConnections() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  if (prefersReduced) return;

  // Points orbite (positions relatives au canvas)
  function getNodes() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r  = Math.min(canvas.width, canvas.height) * 0.42;
    return [
      { x: cx,       y: cy - r },       // top
      { x: cx + r,   y: cy },           // right
      { x: cx,       y: cy + r },       // bottom
      { x: cx - r,   y: cy },           // left
      { x: cx + r*.7, y: cy - r*.7 },   // top-right
      { x: cx - r*.7, y: cy + r*.7 },   // bottom-left
    ];
  }

  let time = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodes = getNodes();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Connexions centre → noeuds
    nodes.forEach((node, i) => {
      const alpha = 0.08 + 0.04 * Math.sin(time * 0.5 + i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(node.x, node.y);
      ctx.strokeStyle = `rgba(0,112,192,${alpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();

      // Particule qui se déplace sur la ligne
      const t = ((time * 0.3 + i * 0.3) % 1 + 1) % 1;
      const px = cx + (node.x - cx) * t;
      const py = cy + (node.y - cy) * t;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,144,0,${0.5 + 0.3 * Math.sin(time + i)})`;
      ctx.fill();
    });

    ctx.setLineDash([]);

    time += 0.016;
    requestAnimationFrame(draw);
  }

  draw();
}

// ============================================================
// 4. PROCESS STEPS — Activation au scroll
// ============================================================
function initProcessSteps() {
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Active les steps en cascade
          steps.forEach((step, i) => {
            setTimeout(() => step.classList.add('active'), i * 150);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const stepsContainer = steps[0].closest('.process-steps');
  if (stepsContainer) observer.observe(stepsContainer);
}

// ============================================================
// 5. CARD GLOW MOUSE FOLLOW
// ============================================================
function initCardGlow() {
  const cards = document.querySelectorAll('.glow-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// ============================================================
// 6. SUBTLE CARD TILT (3D hover)
// ============================================================
function initCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const cards = document.querySelectorAll('.card-tilt');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform =
        `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ============================================================
// 7. EXPERTISE ITEMS — Stagger reveal
// ============================================================
function initExpertiseStagger() {
  const items = document.querySelectorAll('.expertise-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => {
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, i * 80);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity .5s ease, transform .5s ease';
  });

  const container = items[0].closest('.expertise-grid') || items[0].parentElement;
  observer.observe(container);
}

// ============================================================
// 8. SCROLL INDICATOR
// ============================================================
function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  indicator.addEventListener('click', () => {
    const firstSection = document.querySelector('.hero + section, .hero ~ section');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  });

  // Fade out au scroll
  window.addEventListener('scroll', () => {
    const opacity = Math.max(0, 1 - window.scrollY / 200);
    indicator.style.opacity = String(opacity);
  }, { passive: true });
}

// ============================================================
// 9. HEADER BACKGROUND subtle animation
// ============================================================
function initHeroParallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const mesh = hero.querySelector('.hero__mesh');
    if (mesh) {
      mesh.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

// ============================================================
// 10. FADE IN PAGE (transition douce à l'entrée)
// ============================================================
function initPageEnter() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .4s ease';

  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
}

// ============================================================
// 11. RIPPLE sur les boutons
// ============================================================
function initButtonRipple() {
  document.querySelectorAll('.btn--ripple, .btn--primary, .btn--accent').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0; height: 0;
        background: rgba(255,255,255,.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple-expand .6s ease-out forwards;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Injection du keyframe si pas déjà présent
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-expand {
        to { width: 300px; height: 300px; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================================
// 12. OBSERVER pour counter si présent
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1500;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
}

// ============================================================
// INIT GLOBAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initPageEnter();
  initScrollReveal();
  initHeroParticles();
  initHeroConnections();
  initProcessSteps();
  initCardGlow();
  initCardTilt();
  initExpertiseStagger();
  initScrollIndicator();
  initHeroParallax();
  initButtonRipple();
  initCounters();
});

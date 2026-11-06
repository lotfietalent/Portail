/**
 * e-talent.tn — main.js
 * Point d'entrée principal : formulaire de contact,
 * composants partagés (header/footer injection),
 * utilitaires divers
 */

'use strict';

// ============================================================
// HEADER & FOOTER — injection via fetch de composants HTML
// (architecture sans framework, composants partagés)
// ============================================================

/**
 * Injecte le header dans #site-header et le footer dans #site-footer
 * en lisant le contenu depuis des templates inline dans la page
 */
function injectSharedComponents() {
  // Le header et footer sont directement dans chaque HTML
  // Cette fonction gère les comportements post-injection
  initWhatsAppButton();
}

// ============================================================
// WHATSAPP BUTTON
// ============================================================
function initWhatsAppButton() {
  const btn = document.querySelector('.whatsapp-btn');
  if (!btn) return;

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: absolute;
    right: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
    background: #25D366;
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s ease;
    font-family: 'Inter', sans-serif;
  `;
  tooltip.textContent = 'Discutons sur WhatsApp';
  btn.style.position = 'fixed';
  btn.appendChild(tooltip);

  btn.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
  btn.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
}

// ============================================================
// FORMULAIRE DE CONTACT
// ============================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    prenom:    { required: true, minLen: 2,  label: 'Prénom' },
    nom:       { required: true, minLen: 2,  label: 'Nom' },
    entreprise:{ required: false,             label: 'Entreprise' },
    email:     { required: true, type: 'email', label: 'Email' },
    telephone: { required: false, type: 'tel',  label: 'Téléphone' },
    objet:     { required: true,              label: 'Objet' },
    message:   { required: true, minLen: 20,  label: 'Message' },
  };

  // Validation en temps réel
  Object.keys(fields).forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;

    input.addEventListener('blur', () => validateField(name, input, fields[name]));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(name, input, fields[name]);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valider tous les champs
    let valid = true;
    Object.keys(fields).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      if (!validateField(name, input, fields[name])) valid = false;
    });

    if (!valid) {
      showFormMessage('error',
        'Veuillez corriger les erreurs dans le formulaire avant de soumettre.');
      return;
    }

    // Prépare les données
    const data = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="loading-dots">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </span>
      &nbsp;Envoi en cours…
    `;

    try {
      // Tentative d'envoi via mailto (fallback)
      // En production : remplacer par un vrai endpoint backend ou service (Formspree, etc.)
      await simulateFormSubmit(data);

      form.reset();
      showFormMessage('success',
        '✅ Merci pour votre message ! Notre équipe vous contactera dans les plus brefs délais.');

      // Scroll vers le message
      const msg = form.querySelector('.form-status');
      if (msg) msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      showFormMessage('error',
        '❌ Une erreur est survenue lors de l\'envoi. Veuillez nous contacter directement par email : contact@etalent.tn');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function validateField(name, input, rules) {
    const value = input.value.trim();
    let errorMsg = '';

    if (rules.required && !value) {
      errorMsg = `Le champ ${rules.label} est obligatoire.`;
    } else if (value && rules.type === 'email' && !isValidEmail(value)) {
      errorMsg = 'Veuillez saisir une adresse email valide.';
    } else if (value && rules.type === 'tel' && !isValidPhone(value)) {
      errorMsg = 'Numéro de téléphone invalide.';
    } else if (value && rules.minLen && value.length < rules.minLen) {
      errorMsg = `Le champ ${rules.label} doit contenir au moins ${rules.minLen} caractères.`;
    }

    const errorEl = form.querySelector(`[data-error="${name}"]`);

    if (errorMsg) {
      input.classList.add('error');
      if (errorEl) errorEl.textContent = errorMsg;
      return false;
    } else {
      input.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  function showFormMessage(type, message) {
    let statusEl = form.querySelector('.form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'form-status';
      form.prepend(statusEl);
    }

    statusEl.className = `form-status alert alert--${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'flex';

    if (type === 'success') {
      setTimeout(() => {
        statusEl.style.opacity = '0';
        statusEl.style.transition = 'opacity .5s ease';
        setTimeout(() => { statusEl.style.display = 'none'; statusEl.style.opacity = ''; }, 500);
      }, 8000);
    }
  }

  /**
   * Simulation d'envoi (à remplacer par une vraie intégration backend)
   * OPTIONS EN PRODUCTION :
   * 1. Formspree  : action="https://formspree.io/f/YOUR_ID"
   * 2. Netlify    : attribute netlify sur <form>
   * 3. Backend PHP/Node : fetch('/api/contact', { method: 'POST', body: data })
   */
  async function simulateFormSubmit(formData) {
    // Construction d'un lien mailto de secours
    const prenom    = formData.get('prenom') || '';
    const nom       = formData.get('nom') || '';
    const email     = formData.get('email') || '';
    const entreprise= formData.get('entreprise') || '';
    const objet     = formData.get('objet') || '';
    const message   = formData.get('message') || '';
    const tel       = formData.get('telephone') || '';

    const subject = encodeURIComponent(`[etalent.tn] ${objet} — ${prenom} ${nom}`);
    const body = encodeURIComponent(
      `Nom : ${prenom} ${nom}\n` +
      `Email : ${email}\n` +
      (tel ? `Téléphone : ${tel}\n` : '') +
      (entreprise ? `Entreprise : ${entreprise}\n` : '') +
      `\nObjet : ${objet}\n\n${message}`
    );

    // Ouvre le client mail par défaut
    window.location.href = `mailto:contact@etalent.tn?subject=${subject}&body=${body}`;

    // Résolution après délai court (l'ouverture du client mail est instantanée)
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

// ============================================================
// FORMULAIRE DEVIS (pages services / solutions)
// ============================================================
function initQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const objet     = data.get('objet') || 'Demande de devis';
    const prenom    = data.get('prenom') || '';
    const nom       = data.get('nom') || '';
    const email     = data.get('email') || '';
    const message   = data.get('message') || '';
    const entreprise= data.get('entreprise') || '';

    const subject = encodeURIComponent(`[etalent.tn] ${objet} — ${prenom} ${nom}`);
    const body = encodeURIComponent(
      `Prénom : ${prenom}\nNom : ${nom}\nEmail : ${email}\n` +
      (entreprise ? `Entreprise : ${entreprise}\n` : '') +
      `\nObjet : ${objet}\n\n${message}`
    );

    window.location.href = `mailto:contact@etalent.tn?subject=${subject}&body=${body}`;
  });
}

// ============================================================
// DEMO REQUEST FORM (pages produits)
// ============================================================
function initDemoForm() {
  const form = document.getElementById('demo-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const produit   = form.dataset.product || 'Logiciel';
    const prenom    = data.get('prenom') || '';
    const nom       = data.get('nom') || '';
    const email     = data.get('email') || '';
    const entreprise= data.get('entreprise') || '';
    const tel       = data.get('telephone') || '';

    const subject = encodeURIComponent(`[etalent.tn] Demande de démonstration — ${produit} — ${prenom} ${nom}`);
    const body = encodeURIComponent(
      `Demande de démonstration pour : ${produit}\n\n` +
      `Prénom : ${prenom}\nNom : ${nom}\nEmail : ${email}\n` +
      (tel ? `Téléphone : ${tel}\n` : '') +
      (entreprise ? `Entreprise : ${entreprise}\n` : '')
    );

    window.location.href = `mailto:contact@etalent.tn?subject=${subject}&body=${body}`;
  });
}

// ============================================================
// HELPERS VALIDATION
// ============================================================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\+\-\(\)\.]{6,20}$/.test(phone);
}

// ============================================================
// VIDEO LIGHTBOX (page Polybe)
// ============================================================
function initVideoLightbox() {
  const cards = document.querySelectorAll('.video-card[data-src]');
  if (!cards.length) return;

  // Création du lightbox
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(7,27,53,.95);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s ease;
  `;

  const inner = document.createElement('div');
  inner.style.cssText = `
    position: relative;
    width: 100%;
    max-width: 900px;
    aspect-ratio: 16/9;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 80px rgba(0,0,0,.5);
  `;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframe.allow = 'autoplay; fullscreen; encrypted-media';
  iframe.allowFullscreen = true;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: -48px;
    right: 0;
    color: white;
    font-size: 20px;
    background: rgba(255,255,255,.12);
    border: none;
    border-radius: 50%;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .2s;
    font-family: inherit;
  `;
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(255,255,255,.25)'; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255,255,255,.12)'; });

  inner.appendChild(iframe);
  inner.appendChild(closeBtn);
  overlay.appendChild(inner);
  document.body.appendChild(overlay);

  function openVideo(src) {
    iframe.src = src + '?autoplay=1&rel=0';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    setTimeout(() => { iframe.src = ''; }, 300);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openVideo(card.dataset.src));
  });

  closeBtn.addEventListener('click', closeVideo);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeVideo();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideo();
  });
}

// ============================================================
// BACK TO TOP
// ============================================================
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
  btn.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 28px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 998;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity .3s ease, transform .3s ease, background .2s ease;
    box-shadow: 0 4px 16px rgba(0,80,176,.35);
  `;

  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(10px)';
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'var(--accent)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'var(--primary)';
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  injectSharedComponents();
  initContactForm();
  initQuoteForm();
  initDemoForm();
  initVideoLightbox();
  initBackToTop();
});

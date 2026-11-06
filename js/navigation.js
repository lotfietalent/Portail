/**
 * e-talent.tn — navigation.js
 * Gestion du header, menu mobile, dropdowns, barre de progression
 */

'use strict';

// ============================================================
// Header scroll behavior
// ============================================================
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const scrollThreshold = 60;

  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('site-header--scrolled');
      header.classList.remove('site-header--transparent');
    } else {
      header.classList.remove('site-header--scrolled');
      header.classList.add('site-header--transparent');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial
}

// ============================================================
// Barre de progression de lecture
// ============================================================
function initReadProgress() {
  const bar = document.querySelector('.nav-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.transform = `scaleX(${pct})`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
}

// ============================================================
// Menu mobile
// ============================================================
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;

  if (!toggle || !mobileNav) return;

  // Accordéon sous-menus mobile
  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link[data-toggle]');
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.toggle;
      const sub = document.getElementById(targetId);
      if (!sub) return;

      const isOpen = sub.style.display === 'flex';
      // Ferme tous
      mobileNav.querySelectorAll('.mobile-nav__sub').forEach(s => {
        s.style.display = 'none';
      });
      mobileLinks.forEach(l => {
        const icon = l.querySelector('.chevron');
        if (icon) icon.style.transform = '';
      });

      if (!isOpen) {
        sub.style.display = 'flex';
        const icon = link.querySelector('.chevron');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  function openMenu() {
    toggle.classList.add('open');
    mobileNav.classList.add('open');
    body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    toggle.classList.remove('open');
    mobileNav.classList.remove('open');
    body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', () => {
    if (mobileNav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Fermer au clic sur un lien non-toggle
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fermer avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ============================================================
// Active nav link (selon la page courante)
// ============================================================
function initActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav__link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Exact match ou début de chemin
    const linkPath = href.replace(/^\.\//, '/').split('?')[0];
    const isRoot = currentPath === '/' || currentPath.endsWith('index.html');

    if (
      (isRoot && (href === '/' || href === 'index.html' || href === './index.html')) ||
      (!isRoot && currentPath.includes(linkPath.replace('.html', '')))
    ) {
      link.classList.add('active');
    }
  });
}

// ============================================================
// Smooth scroll pour les ancres internes
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 80;

      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ============================================================
// Tabs component
// ============================================================
function initTabs() {
  const tabGroups = document.querySelectorAll('[data-tabs]');

  tabGroups.forEach(group => {
    const buttons = group.querySelectorAll('.tab-btn');
    const panels  = group.querySelectorAll('.tab-panel');

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });

    // Activate first by default
    if (buttons[0] && !group.querySelector('.tab-btn.active')) {
      buttons[0].classList.add('active');
      if (panels[0]) panels[0].classList.add('active');
    }
  });
}

// ============================================================
// Keyboard navigation pour les dropdowns
// ============================================================
function initDropdownA11y() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-link');
    const menu = dropdown.querySelector('.nav-dropdown__menu');
    if (!trigger || !menu) return;

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('mouseenter', () => {
      trigger.setAttribute('aria-expanded', 'true');
    });

    dropdown.addEventListener('mouseleave', () => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
      }
    });
  });
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initReadProgress();
  initMobileNav();
  initActiveNavLink();
  initSmoothScroll();
  initTabs();
  initDropdownA11y();
});

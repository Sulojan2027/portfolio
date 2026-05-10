/* ═══════════════════════════════════════════════════════════
   PORTFOLIO — Interactive Scripts
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initParticles();
  initSmoothScroll();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initCardGlow();
  initProjectCards();
  initBackToTop();
});

/* ─── Smooth Scroll Engine ─────────────────────────────── */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = 900) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime = null;

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + diff * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function initSmoothScroll() {
  // Intercept all anchor links that point to an ID on the page
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        smoothScrollTo(0, 800);
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navbarHeight = document.getElementById('navbar').offsetHeight;
        const targetY = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;
        smoothScrollTo(targetY, 900);
      }
    });
  });
}

/* ─── Navbar scroll effect + active link tracking ──────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = [];
  let ticking = false;

  // Collect sections referenced by nav links
  navLinks.forEach(link => {
    const id = link.getAttribute('href');
    if (id && id !== '#') {
      const section = document.querySelector(id);
      if (section) sections.push({ el: section, link });
    }
  });

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Navbar background
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        // Active nav link
        const scrollPos = window.scrollY + navbar.offsetHeight + 100;
        let currentSection = null;

        sections.forEach(({ el, link }) => {
          if (el.offsetTop <= scrollPos) {
            currentSection = link;
          }
        });

        navLinks.forEach(l => l.classList.remove('nav-link--active'));
        if (currentSection) currentSection.classList.add('nav-link--active');

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ─── Mobile menu toggle ───────────────────────────────── */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
  });

  // Close on link click
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('open');
    });
  });
}

/* ─── Scroll Reveal (Intersection Observer) ────────────── */
function initScrollReveal() {
  const selectors = [
    '.section-eyebrow',
    '.section-title',
    '.bento-card',
    '.project-card',
    '.about-body',
    '.about-stats',
    '.contact-title',
    '.contact-form',
    '.form-group',
    '.btn--submit',
  ];

  document.querySelectorAll(selectors.join(', ')).forEach(el => {
    el.classList.add('reveal');
  });

  // Stagger containers
  document.querySelectorAll('.bento-grid, .contact-form').forEach(container => {
    container.classList.add('reveal-stagger');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── Card glow follows mouse ──────────────────────────── */
function initCardGlow() {
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ─── Back to top ──────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  btn.addEventListener('click', () => {
    smoothScrollTo(0, 800);
  });
}

/* ─── Particle Network Background ──────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles, animId;
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 35 : 70;
  const CONNECTION_DIST = isMobile ? 100 : 150;
  const COLORS = [
    'rgba(168, 85, 247,',  // purple
    'rgba(139, 92, 246,',  // violet
    'rgba(99, 102, 241,',  // indigo
    'rgba(34, 211, 238,',  // cyan
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      color,
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw & move particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
    }, 200);
  });

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  init();
  draw();
}

/* ─── Theme Toggle (Dark/Light) ────────────────────────── */
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Check saved preference or default to dark
  const saved = localStorage.getItem('theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ─── Project Cards → Modal ───────────────────────────── */
function initProjectCards() {
  const modal = document.getElementById('project-modal');
  const modalImg = modal.querySelector('.project-modal__image');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalDetails = document.getElementById('modal-details');
  const closeBtn = modal.querySelector('.project-modal__close');
  const backdrop = modal.querySelector('.project-modal__backdrop');

  function openModal(card) {
    const img = card.querySelector('.card-visual img');
    const tag = card.querySelector('.card-tag');
    const title = card.querySelector('.card-title');
    const details = card.querySelector('.project-card__details');

    modalImg.innerHTML = img ? `<img src="${img.src}" alt="${img.alt}" />` : '';
    modalTag.textContent = tag ? tag.textContent : '';
    modalTitle.textContent = title ? title.textContent : '';
    modalDetails.innerHTML = details ? details.innerHTML : '';

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

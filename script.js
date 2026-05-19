const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Custom cursor for pointer devices
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

if (cursor && ring && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  document.querySelectorAll('a, button, input, textarea').forEach((element) => {
    element.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
    element.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
  });
}

// Mobile navigation
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

function closeNav() {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navMenu.classList.remove('open');
  document.body.classList.remove('nav-open');
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navMenu.classList.toggle('open', !isOpen);
    document.body.classList.toggle('nav-open', !isOpen);
  });
}

// Smooth anchor navigation
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    closeNav();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    history.replaceState(null, '', targetId);
  });
});

// Reveal animation and skill meters
const revealElements = document.querySelectorAll('.reveal');
const meterBars = document.querySelectorAll('.skill-meter span');

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');

      entry.target.querySelectorAll('.skill-meter span').forEach((bar) => {
        bar.style.width = `${bar.dataset.width || 0}%`;
      });

      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
  meterBars.forEach((bar) => {
    bar.style.width = `${bar.dataset.width || 0}%`;
  });
}

// Active navigation state and scroll-to-top visibility
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-menu a')];
const scrollTop = document.getElementById('scrollTop');

function updateScrollState() {
  const current = sections
    .filter((section) => window.scrollY >= section.offsetTop - 180)
    .at(-1);

  navLinks.forEach((link) => {
    link.classList.toggle('active', current && link.getAttribute('href') === `#${current.id}`);
  });

  if (scrollTop) {
    scrollTop.classList.toggle('visible', window.scrollY > 300);
  }
}

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
updateScrollState();

if (scrollTop) {
  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// Subtle hero card tilt
document.querySelectorAll('.tilt-card').forEach((card) => {
  if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// About section — auto-slideshow carousel
(function () {
  const slides = [...document.querySelectorAll('.about-carousel-slide')];
  const dots   = [...document.querySelectorAll('.about-dot')];
  if (!slides.length) return;

  let current = 0;
  let timer   = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 3500);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.slide));
      resetAuto();
    });
  });

  if (!prefersReducedMotion) startAuto();
})();

// Hero profile — play video on hover, pause on leave
(function () {
  const card = document.querySelector('.profile-card');
  const vid  = document.querySelector('.profile-vid-hover');
  if (!card || !vid) return;

  card.addEventListener('mouseenter', () => {
    vid.currentTime = 0;
    vid.play().catch(() => {});
  });

  card.addEventListener('mouseleave', () => {
    vid.pause();
    vid.currentTime = 0;
  });
})();

const paletteToggle = document.getElementById('paletteToggle');
const palettePanel = document.getElementById('palettePanel');
const paletteOptions = [...document.querySelectorAll('.palette-option')];

function applyPalette(palette) {
  document.body.classList.toggle('palette-peacock', palette === 'peacock');
  paletteOptions.forEach((option) => {
    option.classList.toggle('active', option.dataset.palette === palette);
  });
}

const savedPalette = localStorage.getItem('selectedPalette') || 'default';
applyPalette(savedPalette);

if (paletteToggle && palettePanel) {
  paletteToggle.addEventListener('click', () => {
    const isOpen = palettePanel.classList.toggle('open');
    paletteToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#paletteSwitcher')) {
      palettePanel.classList.remove('open');
      paletteToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

paletteOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const palette = option.dataset.palette || 'default';
    applyPalette(palette);
    localStorage.setItem('selectedPalette', palette);
    palettePanel?.classList.remove('open');
    paletteToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Project category filter
(function () {
  const filterBtns = [...document.querySelectorAll('.filter-btn')];
  const cards      = [...document.querySelectorAll('.project-card')];
  if (!filterBtns.length || !cards.length) return;

  function filterProjects(category) {
    cards.forEach((card) => {
      const cats = (card.dataset.category || '').split(' ');
      const show = cats.includes(category);

      if (show) {
        card.classList.remove('hidden');
        card.classList.remove('fade-in');
        // Trigger reflow so animation replays
        void card.offsetWidth;
        if (!prefersReducedMotion) card.classList.add('fade-in');
      } else {
        card.classList.add('hidden');
        card.classList.remove('fade-in');
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      filterProjects(btn.dataset.filter);
    });
  });

  // Show "recent" on load
  filterProjects('recent');
})();
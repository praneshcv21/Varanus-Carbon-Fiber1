/* =====================================================
   VARANUS CARBON FIBER - JavaScript
   ===================================================== */

'use strict';

// ---- Navbar Scroll Effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Mobile Hamburger Menu ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

const updateActiveLink = () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId     = section.getAttribute('id');
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      allNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
};
window.addEventListener('scroll', updateActiveLink, { passive: true });

// ---- Scroll Reveal ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.product-card, .service-card, .about-features .feature-item, .why-item, .contact-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// =====================================================
// SPACE STARFIELD — Canvas Renderer
// =====================================================
(function initStarfield() {
  const canvas = document.getElementById('heroStars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initStars(); });

  // --- Star layers (near / mid / far) ---
  const LAYERS = [
    { count: 180, speed: 0.015, minR: 0.2, maxR: 0.6,  alpha: 0.5 },  // far / tiny
    { count: 80,  speed: 0.030, minR: 0.5, maxR: 1.1,  alpha: 0.7 },  // mid
    { count: 30,  speed: 0.055, minR: 0.8, maxR: 1.8,  alpha: 0.9 },  // near / bright
  ];
  let stars = [];

  function randStar(layer) {
    const r = layer.minR + Math.random() * (layer.maxR - layer.minR);
    // Twinkle some stars
    const twinkle = Math.random() > 0.6;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r, speed: layer.speed * (0.7 + Math.random() * 0.6),
      baseAlpha: layer.alpha * (0.3 + Math.random() * 0.7),
      alpha: layer.alpha,
      twinkle, twinkleSpeed: 0.005 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
      // Colour: mostly white, occasional warm/cool tint
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 30 : 200) : 0,
      sat: Math.random() > 0.85 ? 80 : 0,
    };
  }

  function initStars() {
    stars = [];
    LAYERS.forEach(layer => {
      for (let i = 0; i < layer.count; i++) stars.push(randStar(layer));
    });
  }
  initStars();

  // --- Shooting stars ---
  const shooters = [];
  function spawnShooter() {
    const side = Math.random() > 0.5 ? 1 : -1;
    shooters.push({
      x: side > 0 ? -60 : canvas.width + 60,
      y: Math.random() * canvas.height * 0.6,
      len: 90 + Math.random() * 100,
      speed: 9 + Math.random() * 8,
      angle: side > 0 ? (Math.PI * 0.18) : (Math.PI - Math.PI * 0.18),
      alpha: 1, life: 1,
      color: Math.random() > 0.5 ? '#FF8C35' : '#ffffff',
    });
  }
  // Spawn a shooter every 3.5–8 s
  let shooterTimer = 0;
  function scheduleShooter() {
    shooterTimer = setTimeout(() => { spawnShooter(); scheduleShooter(); },
      3500 + Math.random() * 4500);
  }
  scheduleShooter();

  // --- Nebula dust (very subtle coloured glow blobs) ---
  const nebulae = [
    { x: 0.15, y: 0.25, r: 220, color: 'rgba(255,80,0,0.018)' },
    { x: 0.80, y: 0.15, r: 180, color: 'rgba(255,140,0,0.015)' },
    { x: 0.60, y: 0.75, r: 260, color: 'rgba(30,10,80,0.06)' },
    { x: 0.35, y: 0.55, r: 300, color: 'rgba(255,107,0,0.012)' },
  ];

  // --- Render loop ---
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.016;

    // Nebula blobs
    nebulae.forEach(n => {
      const grd = ctx.createRadialGradient(
        n.x * canvas.width, n.y * canvas.height, 0,
        n.x * canvas.width, n.y * canvas.height, n.r
      );
      grd.addColorStop(0, n.color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.x * canvas.width, n.y * canvas.height, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stars
    stars.forEach(s => {
      // Very slow upward drift (space float)
      s.y -= s.speed;
      if (s.y < -2) s.y = canvas.height + 2;

      // Twinkle
      if (s.twinkle) {
        s.twinklePhase += s.twinkleSpeed;
        s.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      } else {
        s.alpha = s.baseAlpha;
      }

      const color = s.sat > 0
        ? `hsla(${s.hue},${s.sat}%,95%,${s.alpha})`
        : `rgba(255,255,255,${s.alpha})`;

      // Draw star with soft glow halo
      if (s.r > 1) {
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sh = shooters[i];
      sh.x += Math.cos(sh.angle) * sh.speed;
      sh.y += Math.sin(sh.angle) * sh.speed;
      sh.life -= 0.018;
      if (sh.life <= 0 || sh.x < -120 || sh.x > canvas.width + 120) {
        shooters.splice(i, 1); continue;
      }
      const tailX = sh.x - Math.cos(sh.angle) * sh.len * sh.life;
      const tailY = sh.y - Math.sin(sh.angle) * sh.len * sh.life;
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0,   `rgba(255,255,255,${sh.life * 0.9})`);
      grad.addColorStop(0.3, `${sh.color.replace(')', `,${sh.life * 0.5})`).replace('rgb', 'rgba')}`);
      grad.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.5 * sh.life;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ---- Old CSS hero particles replaced by canvas above ----
const heroParticles = document.getElementById('heroParticles');
// Keep container for mouse parallax reference — no CSS dots needed


// ---- Product Filter Tabs ----
const tabBtns     = document.querySelectorAll('.tab-btn');
const productCards = document.querySelectorAll('.product-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedTab = btn.getAttribute('data-tab');

    // Update active tab
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter product cards
    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');

      if (selectedTab === 'all' || cardCategory === selectedTab) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.5s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// =====================================================
// WHATSAPP DIRECT ENQUIRY
// =====================================================
const WHATSAPP_NUMBER = '917558188910';

const contactForm  = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const submitBtn    = document.getElementById('submitBtn');
const submitText   = document.getElementById('submitText');

function setFeedback(msg, type) {
  formFeedback.textContent = msg;
  formFeedback.className   = `form-feedback ${type}`;
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const category  = document.getElementById('category').value;
  const message   = document.getElementById('message').value.trim();

  // — Validation —
  formFeedback.className = 'form-feedback'; // hide previous
  if (!firstName || !lastName || !email || !message) {
    setFeedback('Please fill in all required fields (marked with *).', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFeedback('Please enter a valid email address.', 'error');
    return;
  }

  // — Build WhatsApp message —
  const waMessage = [
    `🔶 *New Enquiry — Varanus Carbon Fiber*`,
    ``,
    `👤 *Name:* ${firstName} ${lastName}`,
    `📧 *Email:* ${email}`,
    phone ? `📱 *Phone:* ${phone}` : '',
    category ? `📦 *Product Category:* ${category}` : '',
    ``,
    `💬 *Message / Requirements:*`,
    message,
    ``,
    `— Sent from varanus website —`,
  ].filter(Boolean).join('\n');

  const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  // Open WhatsApp in new tab
  window.open(waURL, '_blank');

  // Show success feedback
  setFeedback('✔  Opening WhatsApp… Your enquiry message is ready to send!', 'success');
  contactForm.reset();
});



// ---- Notification Toast ----
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '!'}</span>
    <span>${message}</span>
  `;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '32px',
    right:        '32px',
    zIndex:       '9999',
    display:      'flex',
    alignItems:   'center',
    gap:          '12px',
    padding:      '14px 24px',
    background:   type === 'success' ? 'linear-gradient(135deg, #1a1a1a, #0d0d0d)' : 'linear-gradient(135deg, #1a0d0d, #0d0d0d)',
    border:       `1px solid ${type === 'success' ? 'rgba(255,107,0,0.4)' : 'rgba(255,50,50,0.4)'}`,
    borderRadius: '12px',
    color:        '#fff',
    fontFamily:   "'Rajdhani', sans-serif",
    fontSize:     '0.95rem',
    fontWeight:   '600',
    boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(20px)',
    animation:    'fadeInUp 0.4s ease forwards',
    maxWidth:     '360px',
  });

  const icon = toast.querySelector('.toast-icon');
  Object.assign(icon.style, {
    width:          '28px',
    height:         '28px',
    borderRadius:   '50%',
    background:     type === 'success' ? '#FF6B00' : '#FF3333',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '0.85rem',
    fontWeight:     '900',
    flexShrink:     '0',
    color:          '#fff',
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

// =====================================================
// 3D MOUSE-TRACKING CARD TILT SYSTEM
// =====================================================
const TILT_MAX   = 18;   // max degrees of tilt
const TILT_SCALE = 1.03; // subtle scale up on hover

function apply3DTilt(el, e) {
  const rect   = el.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const dx     = e.clientX - cx;
  const dy     = e.clientY - cy;
  const rx     = -(dy / (rect.height / 2)) * TILT_MAX;
  const ry     =  (dx / (rect.width  / 2)) * TILT_MAX;

  // Mouse position as percentage for shine
  const mouseX = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
  const mouseY = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);

  el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${TILT_SCALE},${TILT_SCALE},${TILT_SCALE})`;
  el.style.setProperty('--mouse-x', `${mouseX}%`);
  el.style.setProperty('--mouse-y', `${mouseY}%`);
}

function reset3DTilt(el) {
  el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
}

// Apply to product cards
document.querySelectorAll('.product-card').forEach(card => {
  card.classList.add('tilt-card');
  card.addEventListener('mousemove', e => apply3DTilt(card, e));
  card.addEventListener('mouseleave', () => reset3DTilt(card));
});

// Apply to service cards
document.querySelectorAll('.service-card').forEach(card => {
  card.classList.add('tilt-card');
  card.addEventListener('mousemove', e => apply3DTilt(card, e));
  card.addEventListener('mouseleave', () => reset3DTilt(card));
});

// Apply to contact cards
document.querySelectorAll('.contact-card').forEach(card => {
  card.classList.add('tilt-card');
  card.style.position = 'relative';
  card.addEventListener('mousemove', e => apply3DTilt(card, e));
  card.addEventListener('mouseleave', () => reset3DTilt(card));
});

// =====================================================
// ABOUT 3D GYROSCOPE — mouse-tracking rotation
// =====================================================
const aboutScene = document.getElementById('about3DScene');
if (aboutScene) {
  aboutScene.addEventListener('mouseenter', () => {
    aboutScene.style.animationPlayState = 'paused';
  });
  aboutScene.addEventListener('mouseleave', () => {
    aboutScene.style.animationPlayState = 'running';
    aboutScene.style.transform = '';
    aboutScene.style.transition = 'transform 0.6s ease';
  });
  aboutScene.addEventListener('mousemove', e => {
    const rect = aboutScene.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = -((e.clientY - cy) / (rect.height / 2)) * 22;
    const ry =  ((e.clientX - cx) / (rect.width  / 2)) * 22;
    aboutScene.style.transform =
      `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.05,1.05,1.05)`;
    aboutScene.style.transition = 'transform 0.08s ease';
  });
}

// =====================================================
// FOOTER 3D LOGO — mouse-tracking rotation
// =====================================================
const footerScene = document.getElementById('footerLogo3D');
if (footerScene) {
  footerScene.addEventListener('mouseenter', () => {
    // Pause CSS float animation — take control with mouse
    footerScene.style.animationPlayState = 'paused';
  });
  footerScene.addEventListener('mouseleave', () => {
    // Resume float animation
    footerScene.style.animationPlayState = 'running';
    footerScene.style.transform = '';
  });
  footerScene.addEventListener('mousemove', e => {
    const rect = footerScene.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = -((e.clientY - cy) / (rect.height / 2)) * 28;
    const ry =  ((e.clientX - cx) / (rect.width  / 2)) * 28;
    footerScene.style.transform =
      `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.06,1.06,1.06)`;
    footerScene.style.transition = 'transform 0.08s ease';
  });
}


// =====================================================
// 3D HERO MOUSE PARALLAX DEPTH
// =====================================================
const heroContent = document.querySelector('.hero-content');
const heroParticlesEl = document.getElementById('heroParticles');

document.querySelector('.hero').addEventListener('mousemove', e => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mx = (e.clientX / w - 0.5) * 2; // -1 to 1
  const my = (e.clientY / h - 0.5) * 2; // -1 to 1

  // Parallax layers at different depths
  if (heroContent) {
    heroContent.style.transform = `perspective(1200px) rotateX(${-my * 4}deg) rotateY(${mx * 4}deg) translateZ(0)`;
  }
  if (heroParticlesEl) {
    heroParticlesEl.style.transform = `translate(${mx * 18}px, ${my * 12}px)`;
  }
});

document.querySelector('.hero').addEventListener('mouseleave', () => {
  if (heroContent) {
    heroContent.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    heroContent.style.transition = 'transform 0.8s ease';
  }
  if (heroParticlesEl) {
    heroParticlesEl.style.transform = 'translate(0,0)';
    heroParticlesEl.style.transition = 'transform 0.8s ease';
  }
});

// =====================================================
// FLOATING 3D GEOMETRIC SHAPES IN HERO
// =====================================================
function create3DShapes() {
  const heroEl = document.querySelector('.hero');
  if (!heroEl) return;

  const shapes = [
    { size: 60, x: '10%',  y: '20%', dur: 8,  delay: 0,   type: 'cube',    opacity: 0.12 },
    { size: 40, x: '85%',  y: '15%', dur: 11, delay: 1.5, type: 'octagon', opacity: 0.10 },
    { size: 80, x: '90%',  y: '70%', dur: 9,  delay: 0.5, type: 'cube',    opacity: 0.08 },
    { size: 30, x: '5%',   y: '75%', dur: 13, delay: 3,   type: 'diamond', opacity: 0.12 },
    { size: 50, x: '50%',  y: '85%', dur: 10, delay: 2,   type: 'octagon', opacity: 0.09 },
    { size: 35, x: '70%',  y: '40%', dur: 7,  delay: 1,   type: 'diamond', opacity: 0.10 },
  ];

  shapes.forEach(cfg => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position:   'absolute',
      left:       cfg.x,
      top:        cfg.y,
      width:      `${cfg.size}px`,
      height:     `${cfg.size}px`,
      opacity:    cfg.opacity,
      pointerEvents: 'none',
      zIndex:     '1',
      transformStyle: 'preserve-3d',
    });

    if (cfg.type === 'cube') {
      // CSS 3D cube wireframe
      el.style.border  = '1px solid rgba(255,107,0,0.6)';
      el.style.outline = '1px solid rgba(255,107,0,0.3)';
      el.style.borderRadius = '4px';
      el.style.background = 'rgba(255,107,0,0.03)';
      el.style.animation = `shape3DFloat ${cfg.dur}s ${cfg.delay}s ease-in-out infinite, shape3DRotate ${cfg.dur * 1.5}s ${cfg.delay}s linear infinite`;
    } else if (cfg.type === 'octagon') {
      el.style.border  = '1px solid rgba(255,140,53,0.5)';
      el.style.borderRadius = '50%';
      el.style.background = 'rgba(255,107,0,0.02)';
      el.style.animation = `shape3DFloat ${cfg.dur}s ${cfg.delay}s ease-in-out infinite, shape3DRotateReverse ${cfg.dur * 2}s ${cfg.delay}s linear infinite`;
    } else {
      // diamond
      el.style.border  = '1px solid rgba(255,169,64,0.5)';
      el.style.transform = 'rotate(45deg)';
      el.style.background = 'rgba(255,107,0,0.02)';
      el.style.animation = `shape3DFloat ${cfg.dur}s ${cfg.delay}s ease-in-out infinite, shape3DRotateDiamond ${cfg.dur * 1.2}s ${cfg.delay}s linear infinite`;
    }

    heroEl.appendChild(el);
  });

  // Inject keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shape3DFloat {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      25%  { transform: translateY(-20px) translateX(8px); }
      50%  { transform: translateY(-35px) translateX(-5px); }
      75%  { transform: translateY(-18px) translateX(10px); }
    }
    @keyframes shape3DRotate {
      from { transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg); }
      to   { transform: rotateY(360deg) rotateX(180deg) rotateZ(90deg); }
    }
    @keyframes shape3DRotateReverse {
      from { transform: rotateY(360deg) rotateZ(0deg); }
      to   { transform: rotateY(0deg) rotateZ(360deg); }
    }
    @keyframes shape3DRotateDiamond {
      from { transform: rotate(45deg) rotateX(0deg); }
      to   { transform: rotate(405deg) rotateX(360deg); }
    }
  `;
  document.head.appendChild(style);
}

create3DShapes();

// =====================================================
// 3D SCROLL DEPTH PARALLAX ON SECTIONS
// =====================================================
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Hero parallax depth
  if (scrollY < window.innerHeight * 1.5) {
    hero.style.backgroundPositionY = `${scrollY * 0.4}px`;
    if (heroContent) {
      heroContent.style.transform = `perspective(1200px) translateZ(0) translateY(${scrollY * 0.15}px)`;
    }
  }

  // Section cards subtle 3D depth on scroll
  document.querySelectorAll('.product-card, .service-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const center = window.innerHeight / 2;
    const distFromCenter = (rect.top + rect.height / 2) - center;
    const normalised = distFromCenter / (window.innerHeight / 2);
    if (Math.abs(normalised) < 1.5 && !card.matches(':hover')) {
      card.style.transform = `perspective(900px) rotateX(${normalised * -2}deg) scale3d(1,1,1)`;
    }
  });

}, { passive: true });

// =====================================================
// SPACE FLOATING ORBS — seed across all sections
// =====================================================
(function spawnSpaceOrbs() {
  const driftAnims = ['drift0','drift1','drift2','drift3'];

  // Config: [section selector, orbs to spawn]
  const sectionConfigs = [
    { sel: '.about-section',   count: 5 },
    { sel: '.products-section',count: 7 },
    { sel: '.services-section',count: 6 },
    { sel: '.why-section',     count: 4 },
    { sel: '.contact-section', count: 4 },
  ];

  const palettes = [
    // Orange / amber glow
    ['rgba(255,107,0,IDX)', 'rgba(255,140,53,IDX)', 'rgba(255,169,64,IDX)'],
    // Subtle white/blue tint
    ['rgba(200,220,255,IDX)', 'rgba(180,200,255,IDX)'],
  ];

  sectionConfigs.forEach(cfg => {
    const section = document.querySelector(cfg.sel);
    if (!section) return;

    // Make sure section is a positioned container
    const pos = getComputedStyle(section).position;
    if (pos === 'static') section.style.position = 'relative';

    for (let i = 0; i < cfg.count; i++) {
      const orb = document.createElement('div');
      orb.className = 'space-orb';

      const size    = 60  + Math.random() * 160;        // px
      const palette = palettes[Math.random() > 0.75 ? 1 : 0];
      const colBase = palette[Math.floor(Math.random() * palette.length)];
      const alpha   = (0.04 + Math.random() * 0.10).toFixed(3);
      const color   = colBase.replace('IDX', alpha);
      const anim    = driftAnims[Math.floor(Math.random() * driftAnims.length)];
      const dur     = 10 + Math.random() * 18;          // s
      const delay   = -(Math.random() * dur);            // start mid-cycle

      Object.assign(orb.style, {
        width:    `${size}px`,
        height:   `${size}px`,
        left:     `${5 + Math.random() * 88}%`,
        top:      `${8 + Math.random() * 80}%`,
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
        animation: `${anim} ${dur.toFixed(1)}s ${delay.toFixed(1)}s ease-in-out infinite`,
        zIndex: '0',
      });

      section.appendChild(orb);
    }
  });
})();

// ---- Initialize AOS-like reveal on load ----
window.addEventListener('load', () => {
  document.querySelectorAll('.section-header, .about-lead, .about-body, .section-eyebrow').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
});

// =====================================================
// INTERACTIVE PARTICLE MESH BACKGROUND
// =====================================================
(function initParticleMesh() {
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse tracking
  const mouse = { x: -9999, y: -9999 };
  const MOUSE_RADIUS = 150;

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Particles
  const PARTICLE_COUNT = 100;
  const CONNECTION_DIST = 140;
  const particles = [];

  class Particle {
    constructor() {
      this.x  = Math.random() * w;
      this.y  = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.r  = 1 + Math.random() * 1.5;
      this.baseAlpha = 0.15 + Math.random() * 0.35;
      // Colour: mostly orange tint, some white
      this.isOrange = Math.random() > 0.3;
    }

    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const ax = (dx / dist) * force * 2;
        const ay = (dy / dist) * force * 2;
        this.vx += ax * 0.15;
        this.vy += ay * 0.15;
      }

      // Dampen velocity
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }

    draw() {
      const alpha = this.baseAlpha;
      if (this.isOrange) {
        ctx.fillStyle = `rgba(255, 107, 0, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Init particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.strokeStyle = `rgba(255, 107, 0, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw connections to mouse (glowing lines to nearby particles)
    if (mouse.x > 0 && mouse.y > 0) {
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS * 1.2) {
          const opacity = (1 - dist / (MOUSE_RADIUS * 1.2)) * 0.25;
          ctx.strokeStyle = `rgba(255, 140, 53, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Update & draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connecting mesh lines
    drawConnections();

    requestAnimationFrame(animate);
  }

  animate();
})();

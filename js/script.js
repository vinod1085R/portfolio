const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backTop = document.getElementById('backTop');
const cursorGlow = document.querySelector('.cursor-glow');

function applyTheme(theme) {
  const light = theme === 'light';
  body.classList.toggle('light', light);
  if (themeToggle) {
    themeToggle.textContent = light ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', light ? 'Switch to night mode' : 'Switch to day mode');
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.title = light ? 'Switch to night mode' : 'Switch to day mode';
  }
}

let savedTheme = 'dark';
try { savedTheme = localStorage.getItem('theme') || 'dark'; } catch (error) { /* Storage may be blocked in private browsing. */ }
applyTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
  const nextTheme = body.classList.contains('light') ? 'dark' : 'light';
  applyTheme(nextTheme);
  try { localStorage.setItem('theme', nextTheme); } catch (error) { /* Theme still works for this page view. */ }
});

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

window.addEventListener('scroll', () => backTop?.classList.toggle('show', window.scrollY > 500));
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', event => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
} else if (cursorGlow) cursorGlow.hidden = true;

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

const certificateModal = document.getElementById('certificateModal');
const certificateFrame = document.getElementById('certificateFrame');
const certificateImage = document.getElementById('certificateImage');
const certificateTitle = document.getElementById('certificateTitle');
function closeCertificate() {
  if (certificateModal?.open) certificateModal.close();
  if (certificateFrame) certificateFrame.src = 'about:blank';
  if (certificateImage) certificateImage.removeAttribute('src');
}
document.querySelectorAll('.certificate-view').forEach(button => button.addEventListener('click', () => {
  const file = button.dataset.certificate;
  const title = button.dataset.title || 'Certificate preview';
  certificateTitle.textContent = title;
  const isPdf = file.toLowerCase().endsWith('.pdf');
  certificateFrame.hidden = !isPdf;
  certificateImage.hidden = isPdf;
  if (isPdf) certificateFrame.src = file;
  else certificateImage.src = file;
  if (typeof certificateModal.showModal === 'function') certificateModal.showModal();
  else window.open(file, '_blank', 'noopener');
}));
document.getElementById('closeCertificate')?.addEventListener('click', closeCertificate);
certificateModal?.addEventListener('click', event => { if (event.target === certificateModal) closeCertificate(); });

const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const bodyText = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:vinod1085r@gmail.com?subject=${subject}&body=${bodyText}`;
});


// Circlo gallery: arrows, dots, keyboard and touch swipe support.
(() => {
  const viewport = document.getElementById('circloCarousel');
  const track = document.getElementById('circloTrack');
  const count = document.getElementById('circloCount');
  const dotsWrap = document.getElementById('circloDots');
  if (!viewport || !track || !dotsWrap) return;
  const slides = Array.from(track.children);
  const dots = Array.from(dotsWrap.querySelectorAll('button'));
  let index = 0, startX = 0, endX = 0;
  const show = n => {
    index = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
    dots.forEach((dot, i) => { dot.classList.toggle('active', i === index); dot.setAttribute('aria-pressed', String(i === index)); });
  };
  document.getElementById('circloPrev')?.addEventListener('click', () => show(index - 1));
  document.getElementById('circloNext')?.addEventListener('click', () => show(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  viewport.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(index - 1); if (e.key === 'ArrowRight') show(index + 1); });
  viewport.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
  viewport.addEventListener('touchend', e => { endX = e.changedTouches[0].screenX; const delta = endX - startX; if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1)); }, { passive: true });
  show(0);

  // Open a large, Instagram-style viewer when any gallery photo is clicked.
  const lightbox = document.getElementById('circloLightbox');
  const lightboxImage = document.getElementById('circloLightboxImage');
  const lightboxTitle = document.getElementById('circloLightboxTitle');
  const lightboxCount = document.getElementById('circloLightboxCount');
  const titles = slides.map(slide => slide.querySelector('.circlo-slide-copy h3')?.textContent.trim() || 'Circlo');
  const images = slides.map(slide => slide.querySelector('img'));
  let previousFocus = null;
  const updateLightbox = () => {
    const img = images[index];
    if (!img || !lightboxImage) return;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt || titles[index];
    if (lightboxTitle) lightboxTitle.textContent = titles[index];
    if (lightboxCount) lightboxCount.textContent = `${index + 1} / ${slides.length}`;
  };
  const openLightbox = i => {
    index = (i + slides.length) % slides.length;
    previousFocus = document.activeElement;
    updateLightbox();
    lightbox?.classList.add('is-open');
    lightbox?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('circloLightboxClose')?.focus();
  };
  const closeLightbox = () => {
    lightbox?.classList.remove('is-open');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    previousFocus?.focus?.();
  };
  images.forEach((img, i) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Open ${titles[i]} photo larger`);
    img.addEventListener('click', () => openLightbox(i));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
  });
  document.getElementById('circloLightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('circloLightboxPrev')?.addEventListener('click', () => { show(index - 1); updateLightbox(); });
  document.getElementById('circloLightboxNext')?.addEventListener('click', () => { show(index + 1); updateLightbox(); });
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { show(index - 1); updateLightbox(); }
    if (e.key === 'ArrowRight') { show(index + 1); updateLightbox(); }
  });
  // Support swipe gestures while viewing a photo on touchscreens.
  let lightboxStartX = 0;
  lightbox?.addEventListener('touchstart', e => { lightboxStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox?.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - lightboxStartX;
    if (Math.abs(delta) > 50) { show(index + (delta < 0 ? 1 : -1)); updateLightbox(); }
  }, { passive: true });
})();

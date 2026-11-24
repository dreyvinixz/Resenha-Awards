const characters = [
 {name:'ANDREY', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_53_02-8.png', sheet:'Andrey_ Neon Cyberpunk Character Sheet.png'},
 {name:'THIGAS', art:'Guerreiro Cibernético em Armadura Negra.png', sheet:'Ficha de Personagem Cyberpunk_ Thigas Mecânico.png'},
 {name:'MARCELO', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_52_59-2.png', sheet:'Ficha Cyber-Anime de Marcelo.png'},
 {name:'VALINKS', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_52_59-3.png', sheet:'Ficha de Personagem Neon Valinks.png'},
 {name:'MAX', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_53_00-4.png', sheet:'Ficha de Personagem Max Faraday (1).png'},
 {name:'GIANI', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_53_00-5.png', sheet:'Ficha de Personagem Giani Cyberpunk.png'},
 {name:'KATSUO', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_53_01-6.png', sheet:'Ficha de Personagem Katsuo – Resenha Awards.png'},
 {name:'JOTA', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_53_01-7.png', sheet:'JOTA Cyberpunk Resenha Awards.png'},
 {name:'FIEND', art:'Imagem do ChatGPT 24 de nov. de 2026, 02_53_03-9.png', sheet:'Ficha de Personagem_ Fiend Estilo Maine.png'}
];
let current = 0;
const $ = selector => document.querySelector(selector);
const tabs = $('#character-tabs');
const characterPreloads = [];
const preloadCharacters = () => { if (characterPreloads.length) return; characters.forEach(character => { const image = new Image(); image.src = `assets/cenario1/${character.art}`; characterPreloads.push(image); }); };
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { preloadCharacters(); observer.disconnect(); } }, { rootMargin: '700px' }); observer.observe(document.querySelector('#personagens')); } else { preloadCharacters(); }
characters.forEach((character, index) => { const button = document.createElement('button'); button.textContent = character.name; button.addEventListener('click', () => goToCharacter(index)); tabs.append(button); });
function showCharacter(index) { current = (index + characters.length) % characters.length; const character = characters[current]; const num = String(current + 1).padStart(2, '0'); $('#character-name').textContent = character.name; $('#character-number').textContent = num; $('#current-index').textContent = num; $('#art-index').textContent = num; const image = $('#character-image'); const url = new URL(`assets/cenario1/${character.art}`, document.baseURI).href; image.style.visibility = 'hidden'; image.onload = () => { if (image.src === url) image.style.visibility = 'visible'; }; image.onerror = () => { if (image.src === url) image.style.visibility = 'hidden'; }; image.src = url; image.alt = `Personagem ${character.name}`; if (image.complete && image.naturalWidth) image.style.visibility = 'visible'; [...tabs.children].forEach((tab, i) => { tab.classList.toggle('active', i === current); tab.setAttribute('aria-pressed', String(i === current)); }); }
$('#prev-character').addEventListener('click', () => goToCharacter(current - 1)); $('#next-character').addEventListener('click', () => goToCharacter(current + 1)); showCharacter(0);
const dialog = $('#image-dialog'); function openImage(src, title) { $('#dialog-image').src = src; $('#dialog-image').alt = title; $('#dialog-title').textContent = title; dialog.showModal(); }
$('#open-sheet').addEventListener('click', () => openImage(`assets/CHARACTERS/${characters[current].sheet}`, `Ficha de ${characters[current].name}`)); document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => openImage(item.dataset.image, item.dataset.title))); $('.dialog-close').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
// The sticky presentation advances with the page scroll and never traps the wheel.
const scrollArea = document.querySelector('.character-scroll');
const scrollPanel = document.querySelector('.character-panel');
let scrollQueued = false;
function scrollMetrics() {
  const start = scrollArea.getBoundingClientRect().top + window.scrollY;
  const distance = Math.max(0, scrollArea.offsetHeight - scrollPanel.offsetHeight);
  return { start, distance };
}
function syncCharacterToScroll() {
  scrollQueued = false;
  const { start, distance } = scrollMetrics();
  if (!distance || window.scrollY < start - 2 || window.scrollY > start + distance + 2) return;
  const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
  const index = Math.round(progress * (characters.length - 1));
  if (index !== current && !dialog.open) {
    const direction = index > current ? 1 : -1;
    showCharacter(index);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const options = { duration: 400, easing: 'ease-out' };
      $('#character-image').getAnimations().forEach(animation => animation.cancel());
      $('#character-image').animate([{ opacity: 0.2, transform: `translateX(${18 * direction}px)` }, { opacity: 1, transform: 'translateX(0)' }], options);
      $('#character-name').getAnimations().forEach(animation => animation.cancel());
      $('#character-name').animate([{ opacity: 0.25, transform: `translateY(${10 * direction}px)` }, { opacity: 1, transform: 'translateY(0)' }], options);
    }
  }
}
function goToCharacter(index) {
  const next = Math.max(0, Math.min(characters.length - 1, index));
  const { start, distance } = scrollMetrics();
  showCharacter(next);
  window.scrollTo({ top: start + (distance * next / (characters.length - 1)), behavior: 'instant' });
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(syncCharacterToScroll); }
}, { passive: true });
window.addEventListener('resize', syncCharacterToScroll);
syncCharacterToScroll();
// The five category chapters are a single stage controlled by page scrolling.
const guideSequence = document.querySelector('.guide-sequence');
const guideViewport = document.querySelector('.guide-viewport');
let guideChapters = [...document.querySelectorAll('.guide-chapter')];
const guideProgress = document.querySelector('#guide-progress');
// Hidden lazy-loaded chapters are otherwise fetched only after they are selected.
const preloadGuides = () => guideChapters.forEach(chapter => { chapter.querySelector('.guide-art img').loading = 'eager'; });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { preloadGuides(); observer.disconnect(); } }, { rootMargin: '1400px' });
  observer.observe(document.querySelector('#categorias'));
} else { preloadGuides(); }
let activeGuide = -1;
let guideScrollQueued = false;
function guideMetrics() {
  return { start: guideSequence.getBoundingClientRect().top + window.scrollY,
    distance: Math.max(0, guideSequence.offsetHeight - guideViewport.offsetHeight) };
}
function showGuide(index) {
  if (index === activeGuide) return;
  const direction = activeGuide < 0 || index > activeGuide ? 1 : -1;
  activeGuide = index;
  guideChapters.forEach((chapter, i) => { chapter.hidden = i !== index; });
  [...guideProgress.children].forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-current', i === index ? 'step' : 'false');
  });
  document.querySelector('#guide-current').textContent = String(index + 1).padStart(2, '0');
  const currentArt = guideChapters[index].querySelector('.guide-art img');
  currentArt.style.visibility = currentArt.complete && currentArt.naturalWidth ? 'visible' : 'hidden';
  currentArt.onload = () => { if (activeGuide === index) currentArt.style.visibility = 'visible'; };
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const chapter = guideChapters[index];
    const art = chapter.querySelector('.guide-art img');
    art.getAnimations().forEach(animation => animation.cancel());
    art.animate([{ opacity: 0, transform: `translateX(${-35 * direction}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 500, easing: 'ease-out' });
    const copy = chapter.querySelector('.guide-copy');
    copy.getAnimations().forEach(animation => animation.cancel());
    copy.animate([{ opacity: 0, transform: `translateY(${20 * direction}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, easing: 'ease-out' });
  }
}
function syncGuideToScroll() {
  guideScrollQueued = false;
  const {start, distance} = guideMetrics();
  if (!distance || window.scrollY < start - 2 || window.scrollY > start + distance + 2) return;
  const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
  showGuide(Math.round(progress * (guideChapters.length - 1)));
}
guideChapters.forEach((chapter, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `Ver ${chapter.querySelector('.guide-label').textContent.toLowerCase()}`);
  button.addEventListener('click', () => {
    const {start, distance} = guideMetrics();
    showGuide(index);
    window.scrollTo({top: start + distance * index / (guideChapters.length - 1), behavior: 'instant'});
  });
  guideProgress.append(button);
});
showGuide(0);
// React development updates can replace guide elements without reloading this module.
const guideFrame = document.querySelector('.guide-frame');
new MutationObserver(() => {
  const chapters = [...guideFrame.querySelectorAll('.guide-chapter')];
  if (chapters.length !== guideChapters.length || chapters.some((chapter, index) => chapter !== guideChapters[index])) {
    guideChapters = chapters;
    activeGuide = -1;
    syncGuideToScroll();
    if (activeGuide === -1) showGuide(0);
  }
}).observe(guideFrame, {childList:true});
window.addEventListener('scroll', () => {
  if (!guideScrollQueued) { guideScrollQueued = true; requestAnimationFrame(syncGuideToScroll); }
}, {passive:true});
window.addEventListener('resize', syncGuideToScroll);
syncGuideToScroll();
// Play the background only when visible and when the visitor allows motion.
const scene2Video = document.querySelector('.scene2-video');
const scene2Motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scene2Visible = false;
let scene2UsingFallback = false;
// Both source videos contain approximately five seconds of white frames at the start.
const scene2Start = 5.05;
function revealScene2Frame() {
  if (scene2Video.paused || scene2Video.seeking || scene2Video.currentTime < scene2Start) return;
  if ('requestVideoFrameCallback' in scene2Video) {
    scene2Video.requestVideoFrameCallback((_now, frame) => {
      if (!scene2Video.paused && !scene2Video.seeking && frame.mediaTime >= scene2Start) scene2Video.classList.add('is-ready');
    });
  } else if (scene2Video.readyState >= 2) {
    scene2Video.classList.add('is-ready');
  }
}
scene2Video.addEventListener('loadedmetadata', () => { scene2Video.currentTime = scene2Start; });
scene2Video.addEventListener('seeking', () => scene2Video.classList.remove('is-ready'));
scene2Video.addEventListener('seeked', revealScene2Frame);
scene2Video.addEventListener('playing', revealScene2Frame);
scene2Video.addEventListener('ended', () => {
  scene2Video.classList.remove('is-ready');
  scene2Video.currentTime = scene2Start;
  updateScene2Video();
});
scene2Video.addEventListener('waiting', () => scene2Video.classList.remove('is-ready'));
scene2Video.addEventListener('error', () => {
  scene2Video.classList.remove('is-ready');
  if (!scene2UsingFallback) {
    scene2UsingFallback = true;
    scene2Video.src = scene2Video.dataset.fallback;
    updateScene2Video();
  }
});
function updateScene2Video() {
  if (!scene2Visible || document.hidden || scene2Motion.matches) {
    scene2Video.pause();
    return;
  }
  if (!scene2Video.src) scene2Video.src = scene2Video.dataset.src;
  scene2Video.muted = true;
  scene2Video.play().catch(() => {});
}
new IntersectionObserver(entries => { scene2Visible = entries[0].isIntersecting; updateScene2Video(); }, { threshold: 0.05 }).observe(document.querySelector('.nomination-scene'));
document.addEventListener('visibilitychange', updateScene2Video);
scene2Motion.addEventListener('change', updateScene2Video);
const menu = $('.menu-toggle'); menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); menu.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu'); $('.nav').classList.toggle('open', !open); }); document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => { menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Abrir menu'); $('.nav').classList.remove('open'); }));

export {};

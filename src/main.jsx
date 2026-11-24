import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import markup from './markup.html?raw';
import '../styles.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function App() {
  const root = useRef(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => { import('../app.js'); }, []);
  useEffect(() => {
    if (reduceMotion) return;
    let cleanup;
    let cancelled = false;
    import('./livingScene.js').then(({ mountLivingScene }) => {
      if (!cancelled) cleanup = mountLivingScene(root.current.querySelector('.hero-bg'));
    }).catch(error => console.warn('Cena animada indisponível.', error));
    return () => { cancelled = true; cleanup?.(); };
  }, [reduceMotion]);
  useGSAP(() => {
    if (reduceMotion) return;
    gsap.from('.hero-content > *', { opacity: 0, y: 22, stagger: 0.12, duration: 0.7, ease: 'power2.out' });
    const intro = gsap.timeline({
      scrollTrigger: { trigger: '#personagens', start: 'top 90%', end: 'top 20%', scrub: 0.5, invalidateOnRefresh: true },
    });
    intro.fromTo('#personagens > .section-marker', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.35 }, 0)
      .fromTo('#personagens > .section-heading .kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.08)
      .fromTo('#personagens > .section-heading h2', { opacity: 0, y: 65, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'power2.out' }, 0.12)
      .fromTo('#personagens > .section-heading p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 0.35);
    gsap.fromTo('.character-stage', { opacity: 0, y: 35 }, {
      opacity: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: '.character-scroll', start: 'top 95%', end: 'top 35%', scrub: 0.5, invalidateOnRefresh: true },
    });
    const categoryIntro = gsap.timeline({
      scrollTrigger: { trigger: '#categorias', start: 'top 90%', end: 'top 20%', scrub: 0.5, invalidateOnRefresh: true },
    });
    categoryIntro.fromTo('#categorias > .section-marker', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.35 }, 0)
      .fromTo('#categorias > .section-heading .kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.08)
      .fromTo('#categorias > .section-heading h2', { opacity: 0, y: 65, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'power2.out' }, 0.12)
      .fromTo('#categorias > .section-heading .heading-line', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.4 }, 0.3)
      .fromTo('#categorias > .section-heading p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 0.35);
    const scene2 = gsap.timeline({
      scrollTrigger: { trigger: '.nomination-scene', start: 'top 95%', end: 'top 25%', scrub: 0.6, invalidateOnRefresh: true },
    });
    scene2.fromTo('.scene2-layer', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1 }, 0)
      .fromTo('.scene2-copy > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09 }, 0.2);
    const galleryIntro = gsap.timeline({
      scrollTrigger: { trigger: '#galeria', start: 'top 90%', end: 'top 25%', scrub: 0.5, invalidateOnRefresh: true },
    });
    galleryIntro.fromTo('#galeria > .section-marker', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.35 }, 0)
      .fromTo('#galeria > .section-heading .kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.08)
      .fromTo('#galeria > .section-heading h2', { opacity: 0, y: 55, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'power2.out' }, 0.12)
      .fromTo('#galeria > .section-heading .heading-line', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.4 }, 0.3);
    gsap.utils.toArray('.gallery-item').forEach((item) => {
      gsap.fromTo(item, { opacity: 0, y: 38 }, {
        opacity: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: item, start: 'top 95%', end: 'top 55%', scrub: 0.5, invalidateOnRefresh: true },
      });
    });
    const characterIntro = gsap.timeline({
      scrollTrigger: { trigger: '.character-scroll', start: 'top 90%', end: 'top 25%', scrub: 0.5, invalidateOnRefresh: true },
    });
    characterIntro.fromTo('.character-info .serial', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.35 }, 0)
      .fromTo('.character-info h3', { opacity: 0, y: 32, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power2.out' }, 0.08)
      .fromTo('.character-info .yellow-rule, .character-info p, .character-info .outline-button', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.35 }, 0.24)
      .fromTo('.character-art', { opacity: 0, x: 45 }, { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' }, 0.08)
      .fromTo('.character-controls, .character-tabs, .character-scroll-hint', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.3 }, 0.35);
  }, { scope: root, dependencies: [reduceMotion] });
  return <motion.div ref={root} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} dangerouslySetInnerHTML={{ __html: markup }} />;
}

createRoot(document.getElementById('root')).render(<App />);

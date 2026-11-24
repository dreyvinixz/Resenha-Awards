import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import gsap from 'gsap';

// The source artwork is 16:9. Character coordinates are in that fixed space.
const WIDTH = 1536;
const HEIGHT = 864;
const directory = '/assets/cenario1/';
const videoSource = 'Tropical Cyberpunk Wallpaper.mp4';
const layers = [
  { file: 'Guerreiro Cibernético em Armadura Negra.png', x: 330, y: 826, height: 724 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_52_59-2.png', x: 654, y: 765, height: 705 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_52_59-3.png', x: 1014, y: 660, height: 674 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_53_00-4.png', x: 1332, y: 845, height: 805 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_53_01-7.png', x: 969, y: 750, height: 485 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_53_01-6.png', x: 705, y: 820, height: 478 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_53_00-5.png', x: 1133, y: 835, height: 495 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_53_02-8.png', x: 831, y: 938, height: 600 },
  { file: 'Imagem do ChatGPT 24 de nov. de 2026, 02_53_03-9.png', x: 1240, y: 918, height: 565 },
];

export function mountLivingScene(host) {
  let app;
  let video;
  let timeline;
  let entrance;
  let observer;
  let disposed = false;
  let initialized = false;
  const destroy = () => {
    timeline?.kill();
    entrance?.kill();
    observer?.disconnect();
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = undefined; }
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (initialized) { app.destroy(true, { children: true }); initialized = false; }
  };
  const onVisibilityChange = () => {
    if (document.hidden) { timeline?.pause(); entrance?.pause(); video?.pause(); }
    else { timeline?.resume(); entrance?.resume(); video?.play().catch(() => {}); }
  };
  async function start() {
    host.classList.add('living-scene-loading');
    try {
      app = new Application();
      await app.init({ preference: 'webgl', backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(devicePixelRatio || 1, 1.5) });
      initialized = true;
      if (disposed) { destroy(); return; }
      const textures = await Promise.all(layers.map(layer => Assets.load(encodeURI(directory + layer.file))));
      if (disposed) { destroy(); return; }
      const scene = new Container();
      app.stage.addChild(scene);
      const cast = new Container();
      // Leave breathing room around the supplied cutouts rather than cropping their heads.
      cast.scale.set(0.93);
      cast.position.set(WIDTH * 0.035, HEIGHT * 0.035);
      scene.addChild(cast);
      const footShadow = new Graphics();
      footShadow.ellipse(330, 819, 145, 15).fill({ color: 0x040308, alpha: 0.42 });
      cast.addChild(footShadow);
      const sprites = layers.map((layer, i) => {
        const sprite = new Sprite(textures[i]);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(layer.x, layer.y);
        const scale = layer.height / sprite.texture.height;
        sprite.scale.set(scale);
        sprite.alpha = 0;
        cast.addChild(sprite);
        return sprite;
      });
      // Effects use coordinates inside the original transparent character images.
      // They are children of their respective sprites, so they follow the existing composition.
      const armorLight = new Graphics();
      const originX = 512, originY = 1536;
      const line = (points, color, width, alpha) => {
        armorLight.moveTo(points[0][0] - originX, points[0][1] - originY);
        points.slice(1).forEach(([x, y]) => armorLight.lineTo(x - originX, y - originY));
        armorLight.stroke({ color, width, alpha, cap: 'round', join: 'round' });
      };
      line([[424,1097],[402,1131],[399,1220]], 0xff1830, 9, 0.65);
      line([[577,1114],[606,1151],[617,1220]], 0xff1830, 9, 0.6);
      line([[689,1143],[684,1207]], 0xff1830, 8, 0.6);
      line([[626,840],[639,920]], 0xff1830, 8, 0.5);
      line([[746,563],[724,632]], 0xff1830, 7, 0.45);
      armorLight.circle(575-originX,327-originY,25).stroke({ color: 0xff3447, width: 6, alpha: 0.5 });
      armorLight.blendMode = 'add';
      sprites[0].addChild(armorLight);

      const buttonsLight = new Graphics();
      [[574,448],[654,454],[585,524],[655,524]].forEach(([x,y]) => {
        const bx = x - originX, by = y - originY;
        buttonsLight.circle(bx, by, 14).fill({ color: 0xffd753, alpha: 0.38 });
        buttonsLight.moveTo(bx-17,by).lineTo(bx+17,by).moveTo(bx,by-17).lineTo(bx,by+17)
          .stroke({ color: 0xfff9c7, width: 3, alpha: 0.95 });
      });
      buttonsLight.blendMode = 'add';
      sprites[3].addChild(buttonsLight);

      function resize() {
        const width = host.clientWidth, height = host.clientHeight;
        if (!width || !height) return;
        app.renderer.resize(width, height);
        const scale = Math.min(width / WIDTH, height / HEIGHT);
        scene.scale.set(scale);
        const x = (width - WIDTH * scale) / 2;
        const y = (height - HEIGHT * scale) / 2;
        scene.position.set(x, y);
      }
      observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();
      // An eight-second cycle: breathing is slow, while lights blink more visibly.
      timeline = gsap.timeline({ repeat: -1 });
      sprites.forEach((sprite, i) => timeline.to(sprite.scale, {
        y: sprite.scale.y * (i % 2 ? 1.002 : 0.998), duration: 4, repeat: 1, yoyo: true, ease: 'sine.inOut',
      }, 0));
      timeline.fromTo(armorLight, { alpha: 0.12 }, {
        keyframes: [
          { alpha: 1, duration: 0.45 }, { alpha: 0.18, duration: 0.45 },
          { alpha: 0.95, duration: 0.35 }, { alpha: 0.12, duration: 0.75 },
          { alpha: 0.12, duration: 1.5 }, { alpha: 0.9, duration: 0.55 },
          { alpha: 0.12, duration: 0.5 }, { alpha: 0.12, duration: 3.45 },
        ], ease: 'sine.inOut',
      }, 0);
      timeline.fromTo(buttonsLight, { alpha: 0 }, {
        keyframes: [
          { alpha: 0, duration: 0.8 }, { alpha: 1, duration: 0.45 },
          { alpha: 0, duration: 0.55 }, { alpha: 0, duration: 2.4 },
          { alpha: 1, duration: 0.45 }, { alpha: 0, duration: 0.55 },
          { alpha: 0, duration: 2.8 },
        ], ease: 'sine.inOut',
      }, 0);
      video = document.createElement('video');
      video.className = 'hero-video';
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('aria-hidden', 'true');
      video.src = encodeURI(directory + videoSource);
      host.appendChild(video);
      resize();
      video.play().catch(() => {});
      host.appendChild(app.canvas);
      host.classList.remove('living-scene-loading');
      host.classList.add('living-scene-ready');
      entrance = gsap.timeline();
      entrance.to(sprites, { alpha: 1, duration: 1.5, stagger: 0.35, ease: 'sine.inOut' });
      document.addEventListener('visibilitychange', onVisibilityChange);
      if (document.hidden) { timeline.pause(); entrance.pause(); }
    } catch (error) {
      host.classList.remove('living-scene-loading', 'living-scene-ready');
      console.warn('A cena animada não pôde ser carregada; exibindo a arte original.', error);
      destroy();
    }
  }
  start();
  return () => { disposed = true; host.classList.remove('living-scene-loading', 'living-scene-ready'); destroy(); };
}

(() => {
  'use strict';

  const PASSWORD = '25-06-2001';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gate = $('#password-screen');
  const form = $('#password-form');
  const password = $('#password');
  const error = $('#password-error');
  const loader = $('#loader');
  const site = $('#site');
  const accessDenied = $('#access-denied');
  const backgroundMusic = $('#background-music');
  const musicToggle = $('#music-toggle');

  backgroundMusic.volume = 0.2;

  function updateMusicButton(state = backgroundMusic.muted ? 'muted' : 'playing') {
    const muted = state === 'muted';
    const blocked = state === 'blocked';
    musicToggle.classList.toggle('muted', muted);
    musicToggle.classList.toggle('blocked', blocked);
    musicToggle.setAttribute('aria-pressed', String(muted));
    musicToggle.setAttribute('aria-label', blocked ? 'Play background music' : muted ? 'Unmute background music' : 'Mute background music');
    $('.music-label', musicToggle).textContent = blocked ? 'Play music' : muted ? 'Music off' : 'Music on';
  }

  async function playBackgroundMusic() {
    musicToggle.hidden = false;
    backgroundMusic.volume = 0.2;
    backgroundMusic.muted = sessionStorage.getItem('birthdayMusicMuted') === 'true';
    try {
      await backgroundMusic.play();
      updateMusicButton();
    } catch {
      updateMusicButton('blocked');
    }
  }

  musicToggle.addEventListener('click', async () => {
    if (backgroundMusic.paused) {
      backgroundMusic.muted = false;
      try { await backgroundMusic.play(); } catch { updateMusicButton('blocked'); return; }
    } else {
      backgroundMusic.muted = !backgroundMusic.muted;
    }
    sessionStorage.setItem('birthdayMusicMuted', String(backgroundMusic.muted));
    updateMusicButton();
  });

  $('#toggle-password').addEventListener('click', (event) => {
    const visible = password.type === 'text';
    password.type = visible ? 'password' : 'text';
    event.currentTarget.textContent = visible ? 'SHOW' : 'HIDE';
    event.currentTarget.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const dateDigits = password.value.replace(/\D/g, '');
    const passwordDigits = PASSWORD.replace(/\D/g, '');
    if (dateDigits !== passwordDigits) {
      error.textContent = 'Access denied. This heart recognizes only one special date.';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      accessDenied.classList.add('active');
      accessDenied.setAttribute('aria-hidden', 'false');
      return;
    }
    error.textContent = '';
    playBackgroundMusic();
    gate.classList.add('hidden');
    loader.classList.add('active');
    runLoader();
  });

  async function runLoader() {
    const lines = [
      ['initializing birthday.exe', '✓'],
      ['Loading LinkedIn connection', '✓'],
      ['Loading Java sessions', '✓'],
      ['Loading Google Meets', '✓'],
      ['Loading Temple visits', '✓'],
      ['Loading Long rides', '✓'],
      ['Loading Love', '✓'],
      ['Build Successful', '❤️']
    ];
    const body = $('#terminal-lines');
    for (let i = 0; i < lines.length; i++) {
      const row = document.createElement('p');
      row.innerHTML = `$ ${lines[i][0]}... <span>[${lines[i][1]}]</span>`;
      body.append(row);
      const progress = Math.round(((i + 1) / lines.length) * 100);
      $('#progress-bar').style.width = `${progress}%`;
      $('#progress-label').textContent = `${progress}%`;
      await wait(reducedMotion ? 60 : 430);
    }
    await wait(reducedMotion ? 50 : 450);
    loader.classList.remove('active');
    site.style.display = 'block';
    site.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('locked');
    sessionStorage.setItem('birthdayUnlocked', 'true');
    initializeSite();
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  function closeDeniedScene() {
    accessDenied.classList.remove('active');
    accessDenied.setAttribute('aria-hidden', 'true');
    password.select();
    password.focus();
  }

  $('#retry-password').addEventListener('click', closeDeniedScene);
  accessDenied.addEventListener('click', event => {
    if (event.target === accessDenied) closeDeniedScene();
  });

  $('#logout-button').addEventListener('click', () => {
    sessionStorage.removeItem('birthdayUnlocked');
    sessionStorage.removeItem('birthdayMusicMuted');
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic.muted = false;
    musicToggle.hidden = true;
    header.classList.remove('open', 'scrolled');
    menu?.setAttribute('aria-expanded', 'false');
    site.style.display = 'none';
    site.setAttribute('aria-hidden', 'true');
    gate.classList.remove('hidden');
    password.value = '';
    error.textContent = '';
    document.body.classList.add('locked');
    scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    setTimeout(() => password.focus(), 450);
  });

  function initializeSite() {
    revealElements();
    loadGallery();
    createFloatingHearts();
    $('#year').textContent = new Date().getFullYear();
  }

  const header = $('.site-header');
  addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 30), { passive: true });

  const menu = $('.menu-toggle');
  menu?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('.site-header nav a').forEach(link => link.addEventListener('click', () => {
    header.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  function revealElements() {
    const elements = $$('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stats-grid')) animateCounters();
        if (entry.target.classList.contains('letter-shell')) typeLetter();
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    elements.forEach(element => observer.observe(element));
  }

  let countersStarted = false;
  function animateCounters() {
    if (countersStarted) return;
    countersStarted = true;
    $$('.counter').forEach(counter => {
      const target = Number(counter.dataset.target);
      const suffix = counter.dataset.suffix || '';
      const duration = reducedMotion ? 1 : 1600;
      const start = performance.now();
      const frame = now => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = `${Math.floor(target * (1 - Math.pow(1 - progress, 3)))}${suffix}`;
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  let letterTyped = false;
  async function typeLetter() {
    if (letterTyped) return;
    letterTyped = true;
    const target = $('#typewriter-letter');
    // HTML data attributes preserve backslash characters literally, so convert
    // the letter's \n markers into real line breaks before typing it.
    const text = target.dataset.text.replace(/\\n/g, '\n');
    target.classList.add('cursor');
    if (reducedMotion) {
      target.textContent = text;
    } else {
      for (let i = 0; i <= text.length; i++) {
        target.textContent = text.slice(0, i);
        await wait(text[i] === '\n' ? 80 : 18);
      }
    }
    target.classList.remove('cursor');
  }

  // GitHub Pages cannot list a directory at runtime, so this manifest contains
  // every image currently found in assets/photos.
  const photoFiles = [
    'photo1.JPEG','photo2.JPEG','photo3.JPG','photo4.JPEG','photo5.JPG',
    'photo6.JPG','photo7.JPEG','photo8.JPEG','photo9.JPEG','photo10.JPEG'
  ];
  const videoFiles = ['video1.mp4', 'video2.MOV'];
  const captions = [
    'Wonderla — the day we forgot our worries.',
    'A temple visit and another blessing to be grateful for.',
    'You looked at clothes. I looked at you.',
    'Among all those flowers, you were still my favorite view.',
    'One random evening. One favorite memory.',
    'Thankful for every blessing—and especially this one.',
    'A little color, a lot of laughter.',
    'Dressed up, standing close, saving the moment.',
    'Every road feels better when we take it together.',
    'A temple selfie and a memory worth keeping forever.'
  ];

  const galleryItems = [
    ...photoFiles.map((file, index) => ({ type: 'image', file, caption: captions[index] || `Memory ${index + 1}` })),
    ...videoFiles.map((file, index) => ({ type: 'video', file, caption: `A memory in motion ${index + 1}` }))
  ];

  function loadGallery() {
    const gallery = $('#gallery');
    if (!gallery || gallery.children.length) return;
    let loaded = 0;
    galleryItems.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = `memory${item.type === 'video' ? ' video' : ''}`;
      button.setAttribute('aria-label', `Open memory ${index + 1}`);
      const src = `assets/photos/${item.file}`;
      let media;
      if (item.type === 'image') {
        media = new Image();
        media.alt = `Shiva and Mamta memory ${index + 1}`;
        media.loading = index < 2 ? 'eager' : 'lazy';
        media.decoding = 'async';
        media.onload = () => { loaded++; button.hidden = false; };
      } else {
        media = document.createElement('video');
        media.muted = true;
        media.preload = 'metadata';
        media.setAttribute('playsinline', '');
        media.addEventListener('loadeddata', () => { media.currentTime = .1; }, { once: true });
      }
      media.src = src;
      media.onerror = () => { button.remove(); if (!loaded && !gallery.children.length) $('#gallery-empty').hidden = false; };
      button.append(media);
      const caption = document.createElement('span');
      caption.className = 'memory-caption';
      caption.textContent = item.caption;
      button.append(caption);
      button.addEventListener('click', () => openLightbox(index));
      gallery.append(button);
    });
  }

  const lightbox = $('#lightbox');
  let activeMemory = 0;
  function openLightbox(index) {
    activeMemory = (index + galleryItems.length) % galleryItems.length;
    renderLightbox();
    if (!lightbox.open) lightbox.showModal();
  }

  function renderLightbox() {
    const item = galleryItems[activeMemory];
    const content = $('#lightbox-content');
    content.replaceChildren();
    const media = document.createElement(item.type === 'video' ? 'video' : 'img');
    media.src = `assets/photos/${item.file}`;
    if (item.type === 'video') { media.controls = true; media.autoplay = true; media.setAttribute('playsinline', ''); }
    else media.alt = item.caption;
    content.append(media);
    $('#lightbox-caption').textContent = item.caption;
    $('#lightbox-count').textContent = `${activeMemory + 1} / ${galleryItems.length}`;
  }

  function navigateLightbox(direction) {
    openLightbox(activeMemory + direction);
  }

  $('#lightbox-close')?.addEventListener('click', () => lightbox.close());
  $('#lightbox-prev')?.addEventListener('click', () => navigateLightbox(-1));
  $('#lightbox-next')?.addEventListener('click', () => navigateLightbox(1));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') navigateLightbox(-1);
    if (event.key === 'ArrowRight') navigateLightbox(1);
  });

  function createFloatingHearts() {
    if (reducedMotion) return;
    setInterval(() => {
      if (document.hidden || $('.final-surprise').classList.contains('active')) return;
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = Math.random() > .3 ? '♥' : '♡';
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${8 + Math.random() * 14}px`;
      heart.style.animationDuration = `${7 + Math.random() * 6}s`;
      $('#hearts').append(heart);
      setTimeout(() => heart.remove(), 13000);
    }, 1500);
  }

  $('#flame').addEventListener('click', event => {
    event.currentTarget.classList.add('out');
    $('#cake-hint').textContent = 'WISH RECEIVED. DEPLOYING MAGIC...';
    launchConfetti(5500);
    setTimeout(() => {
      const final = $('#final-surprise');
      final.classList.add('active');
      final.setAttribute('aria-hidden', 'false');
      document.body.classList.add('locked');
    }, reducedMotion ? 100 : 1000);
  });

  $('#close-final').addEventListener('click', () => {
    $('#final-surprise').classList.remove('active');
    $('#final-surprise').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
  });

  const developerDialog = $('#developer-dialog');
  $('#developer-mode').addEventListener('click', () => developerDialog.showModal());
  $('#close-developer').addEventListener('click', () => developerDialog.close());
  developerDialog.addEventListener('click', event => {
    if (event.target === developerDialog) developerDialog.close();
  });

  function launchConfetti(duration) {
    if (reducedMotion) return;
    const canvas = $('#confetti');
    const ctx = canvas.getContext('2d');
    let pieces = [];
    const colors = ['#ff4fa3','#ff82bc','#ffffff','#ffd05b','#9b67ff'];
    const resize = () => { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); };
    resize();
    pieces = Array.from({ length: 180 }, () => ({
      x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight,
      w: 5 + Math.random() * 7, h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 4, sway: Math.random() * 6 - 3,
      rotation: Math.random() * Math.PI, spin: Math.random() * .2 - .1
    }));
    const start = performance.now();
    const draw = now => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces.forEach(p => {
        p.y += p.speed; p.x += Math.sin(p.y * .015) * p.sway; p.rotation += p.spin;
        if (p.y > innerHeight + 20) p.y = -20;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      });
      if (now - start < duration) requestAnimationFrame(draw); else ctx.clearRect(0,0,innerWidth,innerHeight);
    };
    addEventListener('resize', resize, { once: true });
    requestAnimationFrame(draw);
  }

  // Keep the surprise open during the same browsing session after accidental refreshes.
  if (sessionStorage.getItem('birthdayUnlocked') === 'true') {
    gate.classList.add('hidden');
    site.style.display = 'block';
    site.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('locked');
    initializeSite();
    playBackgroundMusic();
  } else {
    setTimeout(() => password.focus(), 350);
  }
})();

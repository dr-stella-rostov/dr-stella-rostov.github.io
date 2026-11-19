/* Dr Stella — интерактив и анимации. Без библиотек. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- WhatsApp: готовые сообщения ---------- */
  const PHONE = '79289079307';
  const MSG = {
    book: 'Здравствуйте, Стелла! Хочу записаться на контурную пластику губ. Подскажите, пожалуйста, ближайшие свободные даты.',
    consult: 'Здравствуйте, Стелла! Хотела бы проконсультироваться по поводу контурной пластики губ.',
    procedure: 'Здравствуйте, Стелла! Хотела бы обсудить процедуру контурной пластики губ: какая форма и объём подойдут именно мне.'
  };
  document.querySelectorAll('[data-wa]').forEach(a => {
    const text = MSG[a.dataset.wa] || MSG.consult;
    a.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Меню ---------- */
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');
  const label = menuBtn.querySelector('.menu-btn__label');
  let lastFocus = null;
  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    label.textContent = 'Закрыть';
    document.body.classList.add('menu-open');
    header.classList.remove('is-hidden');
    menu.querySelector('a').focus({ preventScroll: true });
  };
  const closeMenu = (restore = true) => {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    label.textContent = 'Меню';
    document.body.classList.remove('menu-open');
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce.matches ? 0 : 600);
    if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => menu.classList.contains('is-open') ? closeMenu() : openMenu());
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(); });

  /* ---------- Шапка: прячется при прокрутке вниз, появляется вверх ---------- */
  const header = document.getElementById('header');
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero__img');
  const finalLogo = document.querySelector('.final__logo');
  const desktop = window.matchMedia('(min-width: 1024px)');
  let lastY = window.scrollY, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const heroH = hero.offsetHeight;
    header.classList.toggle('is-solid', y > heroH * 0.6);
    if (!document.body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > heroH * 0.6 && y > lastY + 2);
    }
    lastY = y;
    // мягкий параллакс: фото первого экрана уходит медленнее текста
    if (!reduce.matches && y < heroH) heroImg.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    // финальный логотип чуть опережает фото
    if (!reduce.matches && desktop.matches && finalLogo) {
      const r = finalLogo.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) finalLogo.style.transform = `translate3d(0, ${(r.top - innerHeight / 2) * -0.06}px, 0)`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  heroImg.addEventListener('animationend', () => { heroImg.style.animation = 'none'; }, { once: true });

  /* ---------- Появление при прокрутке ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      (proxied.get(en.target) || [en.target]).forEach(t => t.classList.add('is-in'));
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  // Фото с clip-path, закрытым на 100%, браузер считает невидимым — следим за родителем.
  const proxied = new Map();
  document.querySelectorAll('[data-split], .reveal, .reveal-img').forEach((el, i) => {
    if (el.classList.contains('reveal')) el.style.transitionDelay = `${(i % 5) * 70}ms`;
    if (el.classList.contains('reveal-img') && el.parentElement) {
      const p = el.parentElement;
      if (!proxied.has(p)) { proxied.set(p, []); io.observe(p); }
      proxied.get(p).push(el);
      return;
    }
    io.observe(el);
  });

  /* ---------- Преимущества: аккордеон + смена фото ---------- */
  const advItems = [...document.querySelectorAll('#advList li')];
  const advImgs = [...document.querySelectorAll('.adv__img img')];
  const advNum = document.getElementById('advNum');
  const setAdv = idx => {
    advItems.forEach((li, i) => {
      const on = i === idx;
      li.classList.toggle('is-open', on);
      li.querySelector('button').setAttribute('aria-expanded', on);
    });
    advImgs.forEach((im, i) => im.classList.toggle('is-active', i === idx));
    advNum.textContent = String(idx + 1).padStart(2, '0');
  };
  advItems.forEach((li, i) => li.querySelector('button').addEventListener('click', () => setAdv(i)));

  /* ---------- Работы: вкладки ---------- */
  const tabs = [...document.querySelectorAll('[role=tab]')];
  const selectTab = t => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (t.id === 'tab-ba') hintBA();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); selectTab(n);
      }
    });
  });

  /* ---------- До / после ---------- */
  const ba = document.getElementById('ba');
  const range = ba.querySelector('.ba__range');
  const setPos = v => ba.style.setProperty('--pos', `${v}%`);
  range.addEventListener('input', () => setPos(range.value));
  // перетаскивание пальцем по всей площади фото
  const fromPointer = e => {
    const r = ba.getBoundingClientRect();
    const v = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    range.value = v; setPos(v);
  };
  let dragging = false;
  ba.addEventListener('pointerdown', e => { dragging = true; ba.setPointerCapture(e.pointerId); fromPointer(e); });
  ba.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
  ['pointerup', 'pointercancel'].forEach(ev => ba.addEventListener(ev, () => { dragging = false; }));
  let hinted = false;
  function hintBA() {
    if (hinted || reduce.matches) return;
    hinted = true;
    const line = ba.querySelector('.ba__line');
    line.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-24px)' }, { transform: 'translateX(24px)' }, { transform: 'translateX(0)' }],
      { duration: 1400, easing: 'cubic-bezier(.2,.7,.2,1)', delay: 300 });
  }

  /* ---------- Галерея: полноэкранный просмотр ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('.g').forEach(g => g.addEventListener('click', () => {
    lbImg.src = g.dataset.full;
    lbImg.alt = g.querySelector('img').alt;
    lb.showModal();
  }));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lightbox__close')) lb.close(); });

  /* ---------- FAQ: плавное раскрытие details ---------- */
  document.querySelectorAll('.acc__item').forEach(d => {
    const sum = d.querySelector('summary');
    const body = d.querySelector('.acc__a');
    sum.addEventListener('click', e => {
      if (reduce.matches || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.5,0,.75,0)' })
          .onfinish = () => { d.open = false; };      } else {
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  });
  window.__dsReady = true;
})();

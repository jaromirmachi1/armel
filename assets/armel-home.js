/* armel homepage: reveals, product rail, frame, light parallax. Safe to load more than once. */
(function () {
  if (window.__armelHome) return;
  window.__armelHome = true;

  document.documentElement.classList.add('a-js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal ---------- */
  var io = null;
  if (!reduce && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.14 }
    );
  }

  function watch(root) {
    root.querySelectorAll('[data-a-reveal]:not(.is-in), .a-closeup:not(.is-in)').forEach(function (el) {
      if (io) io.observe(el);
      else el.classList.add('is-in');
    });
  }

  /* ---------- rail ---------- */
  function initRail(rail) {
    if (rail.__armel) return;
    rail.__armel = true;
    var track = rail.querySelector('[data-a-rail-track]');
    var section = rail.closest('.a-showcase');
    var nav = section && section.querySelector('[data-a-rail-nav]');
    if (!track || !nav) return;
    var prev = nav.querySelector('[data-a-rail-prev]');
    var next = nav.querySelector('[data-a-rail-next]');

    function step() {
      var item = track.querySelector('.a-rail__item');
      if (!item) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      nav.hidden = max <= 0;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    var down = false, moved = false, justDragged = false, startX = 0, startLeft = 0;
    track.addEventListener('click', function (e) {
      if (justDragged) { e.preventDefault(); e.stopPropagation(); justDragged = false; }
    }, true);
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      justDragged = moved;
      if (moved) {
        track.classList.remove('is-dragging');
        var s = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    update();
  }

  /* ---------- frame: one picture place, contents change ---------- */
  function initFrame(frame) {
    if (frame.__armel) return;
    frame.__armel = true;
    var slides = Array.prototype.slice.call(frame.querySelectorAll('.a-frame__slide'));
    var caption = frame.querySelector('[data-a-frame-caption]');
    var stage = frame.querySelector('[data-a-frame-next]');
    if (slides.length < 2) return;
    var i = 0;
    var timer = null;

    function show(n) {
      slides[i].classList.remove('is-on');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-on');
      if (caption) caption.textContent = slides[i].getAttribute('data-caption') || '';
    }
    function start() {
      if (reduce || timer) return;
      timer = setInterval(function () { show(i + 1); }, 4200);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }
    stage.addEventListener('click', function () {
      stop();
      show(i + 1);
      start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }).observe(frame);
    } else {
      start();
    }
  }

  /* ---------- parallax: slow image drift while the section is on screen ---------- */
  var parallaxEls = [];
  var parallaxTick = false;

  function parallaxMeasure() {
    parallaxTick = false;
    var vh = window.innerHeight || 1;
    parallaxEls.forEach(function (el) {
      if (!el.__active) return;
      var r = el.getBoundingClientRect();
      var progress = (vh - r.top) / (vh + r.height);
      progress = Math.min(1, Math.max(0, progress));
      var strength = parseFloat(el.getAttribute('data-a-parallax')) || 48;
      var y = (progress - 0.5) * strength;
      el.style.setProperty('--a-py', y.toFixed(2) + 'px');
    });
  }

  function onParallaxScroll() {
    if (!parallaxTick) {
      parallaxTick = true;
      requestAnimationFrame(parallaxMeasure);
    }
  }

  function initParallax(el) {
    if (el.__armel || reduce) return;
    el.__armel = true;
    parallaxEls.push(el);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          el.__active = e.isIntersecting;
          if (e.isIntersecting) parallaxMeasure();
        });
      }, { rootMargin: '15% 0px 15% 0px' }).observe(el);
    } else {
      el.__active = true;
    }
    if (parallaxEls.length === 1) {
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
      window.addEventListener('resize', onParallaxScroll);
    }
    parallaxMeasure();
  }

  function init(root) {
    root = root || document;
    watch(root);
    root.querySelectorAll('[data-a-rail]').forEach(initRail);
    root.querySelectorAll('[data-a-frame]').forEach(initFrame);
    root.querySelectorAll('[data-a-parallax]').forEach(initParallax);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
    event.target.querySelectorAll('[data-a-reveal], .a-closeup').forEach(function (el) { el.classList.add('is-in'); });
  });
})();

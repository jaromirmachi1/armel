/* armel homepage: reveals, product rail, the crossfading frame. Safe to load more than once. */
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
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
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
      return Math.max(track.clientWidth * 0.7, 240);
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

  function init(root) {
    root = root || document;
    watch(root);
    root.querySelectorAll('[data-a-rail]').forEach(initRail);
    root.querySelectorAll('[data-a-frame]').forEach(initFrame);
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

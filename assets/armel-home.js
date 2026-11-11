/* Armel homepage: scroll reveals + product rail arrows. Safe to load more than once. */
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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
  }

  function watchReveals(root) {
    root.querySelectorAll('[data-a-reveal]:not(.is-in)').forEach(function (el) {
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
      if (!item) return track.clientWidth;
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
    update();
  }

  function init(root) {
    root = root || document;
    watchReveals(root);
    root.querySelectorAll('[data-a-rail]').forEach(initRail);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  /* theme editor: re-init sections when they reload */
  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
    event.target.querySelectorAll('[data-a-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  });
})();

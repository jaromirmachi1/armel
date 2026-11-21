/* armel smooth scroll (Lenis).
   Horizon scrolls .page-wrapper instead of the window from 990px up, so Lenis drives
   whichever element really scrolls, and re-attaches when the layout crosses 990px.
   Off for touch, reduced motion and the theme editor. */
(function () {
  if (window.armelSmooth || typeof window.Lenis !== 'function') return;
  if (window.Shopify && window.Shopify.designMode) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var desktop = window.matchMedia('(min-width: 990px)');
  var lenis = null;
  var rafId = 0;

  function scroller() {
    var wrapper = document.querySelector('.page-wrapper');
    if (wrapper && desktop.matches && getComputedStyle(wrapper).overflowY !== 'visible') return wrapper;
    return null; // the window scrolls
  }

  function raf(time) {
    if (lenis) lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  function preventNode(node) {
    /* let anything with its own scroll keep native scrolling */
    return !!(node && node.closest && node.closest(
      '[data-lenis-prevent], dialog, details[open]:not(.a-footer__col), .armel-hero__panel, .armel-hero__nav[data-open], cart-drawer, .cart-drawer, .search-modal'
    ));
  }

  function setup() {
    teardown();
    var wrapper = scroller();
    var options = {
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -80 },
      prevent: preventNode
    };
    if (wrapper) {
      options.wrapper = wrapper;
      options.content = wrapper;
      options.eventsTarget = wrapper;
    }
    lenis = new window.Lenis(options);
    window.armelSmooth = lenis;
    if (document.documentElement.hasAttribute('scroll-lock')) lenis.stop();
    if (!rafId) rafId = requestAnimationFrame(raf);
  }

  function teardown() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
  }

  /* Horizon locks scrolling while drawers and modals are open */
  new MutationObserver(function () {
    if (!lenis) return;
    if (document.documentElement.hasAttribute('scroll-lock')) lenis.stop();
    else lenis.start();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['scroll-lock'] });

  if (desktop.addEventListener) desktop.addEventListener('change', setup);
  else if (desktop.addListener) desktop.addListener(setup);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();

  window.armelSmooth = window.armelSmooth || true;
})();

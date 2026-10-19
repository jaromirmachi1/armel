(() => {
  const root = document.querySelector("[data-armel-newsletter]");
  if (!root) return;

  const clutch = root.querySelector("[data-armel-clutch]");
  if (!clutch) return;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setOpen = (open) => {
    clutch.classList.toggle("is-open", open);
    clutch.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const isFormTarget = (target) =>
    Boolean(target && target.closest && target.closest("form, input, button, label"));

  const shouldStayOpen = () => clutch.contains(document.activeElement);

  if (root.querySelector("[data-armel-form-success], [data-armel-form-error]")) {
    setOpen(true);
  }

  if (canHover) {
    clutch.addEventListener("pointerenter", () => setOpen(true));
    clutch.addEventListener("pointerleave", () => {
      if (!shouldStayOpen()) setOpen(false);
    });
  }

  clutch.addEventListener("click", (event) => {
    if (canHover) return;
    if (isFormTarget(event.target)) return;
    setOpen(!clutch.classList.contains("is-open"));
  });

  clutch.addEventListener("focusin", () => setOpen(true));
})();

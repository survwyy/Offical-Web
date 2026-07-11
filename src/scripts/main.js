(function (global) {
  const { track, bindTrackedElements } = global.OneTapAnalytics;
  const { initI18n } = global.OneTapI18n;
  const { warnIfInvalid } = global.OneTapValidators;

  function initRevealObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
  }

  function init() {
    warnIfInvalid();
    const lang = initI18n({ translations: global.OneTapTranslations, track });
    bindTrackedElements(document);
    initRevealObserver();
    track("official_site_view", { lang });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window);

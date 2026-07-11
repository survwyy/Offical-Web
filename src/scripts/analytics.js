(function (global) {
  function track(event, payload = {}) {
    const data = {
      event,
      page: "official_home_hud",
      timestamp: new Date().toISOString(),
      ...payload,
    };
    global.dataLayer = global.dataLayer || [];
    global.dataLayer.push(data);
    global.dispatchEvent(new CustomEvent("onetap:analytics", { detail: data }));
  }

  function bindTrackedElements(root = document) {
    root.querySelectorAll("[data-track]").forEach((node) => {
      node.addEventListener("click", () => {
        track("site_interaction", {
          action: node.getAttribute("data-track"),
          label: node.textContent.trim(),
        });
      });
    });
  }

  global.OneTapAnalytics = { track, bindTrackedElements };
})(window);

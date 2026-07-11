(function (global) {
  const brandLogo = {
    zh: "assets/brand-onetap-zh.webp",
    en: "assets/brand-onetap-en.webp",
  };

  let currentLanguage = "zh";

  function getInitialLanguage(translations) {
    const queryLang = new URLSearchParams(global.location.search).get("lang");
    if (translations[queryLang]) return queryLang;
    return global.localStorage.getItem("onetap-lang") || "zh";
  }

  function setLanguage(lang, options = {}) {
    const translations = options.translations || global.OneTapTranslations;
    const dictionary = translations[lang] || translations.zh;
    const logoNodes = options.logoNodes || document.querySelectorAll("[data-brand-logo]");
    const langButtons = options.langButtons || document.querySelectorAll("[data-lang]");
    const translateNodes = options.translateNodes || document.querySelectorAll("[data-i18n]");
    const track = options.track || (() => {});

    translateNodes.forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (dictionary[key]) node.textContent = dictionary[key];
    });
    logoNodes.forEach((node) => {
      node.src = brandLogo[lang];
      node.alt = lang === "zh" ? "颗秒 OneTap" : "OneTap";
    });
    langButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-lang") === lang);
    });

    currentLanguage = translations[lang] ? lang : "zh";
    document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
    document.title = currentLanguage === "zh" ? "颗秒 OneTap - CS2 Desktop Assistant" : "OneTap - CS2 Desktop Assistant";
    global.localStorage.setItem("onetap-lang", currentLanguage);
    track("language_change", { lang: currentLanguage });
  }

  function initI18n(options = {}) {
    const translations = options.translations || global.OneTapTranslations;
    const langButtons = options.langButtons || document.querySelectorAll("[data-lang]");
    const initialLang = getInitialLanguage(translations);

    langButtons.forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.getAttribute("data-lang"), options));
    });
    setLanguage(initialLang, options);
    return initialLang;
  }

  function getLanguage() {
    return currentLanguage;
  }

  global.OneTapI18n = { initI18n, setLanguage, getLanguage };
})(window);

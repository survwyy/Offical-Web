(function (global) {
  function findMissingTranslationKeys(root = document, translations = global.OneTapTranslations) {
    const keys = [...root.querySelectorAll("[data-i18n]")].map((node) => node.getAttribute("data-i18n"));
    return [...new Set(keys)].filter((key) => !translations.zh[key] || !translations.en[key]);
  }

  function warnIfInvalid() {
    const missingKeys = findMissingTranslationKeys();
    if (missingKeys.length > 0) {
      console.warn("[OneTap] Missing translation keys", missingKeys);
    }
  }

  global.OneTapValidators = { findMissingTranslationKeys, warnIfInvalid };
})(window);

(function (global) {
  function createNode(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function createI18nNode(tag, key, className) {
    const node = createNode(tag, className);
    node.setAttribute("data-i18n", key);
    return node;
  }

  function renderList(selector, items, factory) {
    const root = document.querySelector(selector);
    if (!root) return;
    root.textContent = "";
    items.forEach((item) => root.append(factory(item)));
  }

  function metricCard(item) {
    const card = createNode("div", `metric ${item.tone}`.trim());
    card.dataset.contentId = item.id;
    card.append(createI18nNode("small", item.labelKey));
    card.append(createNode("strong"));
    card.lastChild.textContent = item.value;
    card.append(createI18nNode("span", item.descKey));
    return card;
  }

  function railItem(item) {
    const card = createNode("div", "rail-item");
    card.dataset.contentId = item.id;
    card.append(createNode("small"));
    card.lastChild.textContent = item.index;
    card.append(createI18nNode("strong", item.titleKey));
    card.append(createI18nNode("p", item.descKey));
    return card;
  }

  function moduleCard(item) {
    const card = createNode("article", `module ${item.tone}`.trim());
    card.dataset.contentId = item.id;
    const kicker = item.kickerKey ? createI18nNode("small", item.kickerKey) : createNode("small");
    kicker.textContent = item.kicker || "";
    card.append(kicker);
    card.append(createI18nNode("h3", item.titleKey));
    card.append(createI18nNode("p", item.descKey, "copy"));
    return card;
  }

  function queueRow(item) {
    const row = createNode("div", "queue-row");
    row.dataset.contentId = item.id;
    const image = createNode("img");
    image.src = item.image;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    const text = createNode("div");
    const title = createNode("strong");
    const meta = createNode("span");
    const status = createNode("span", "pill");
    title.textContent = item.title;
    meta.textContent = item.meta;
    status.textContent = item.status;
    text.append(title, meta);
    row.append(image, text, status);
    return row;
  }

  function coachItem(item) {
    const row = createNode("div", "coach-item");
    row.dataset.contentId = item.id;
    const index = createNode("b");
    const text = createNode("div");
    index.textContent = item.index;
    text.append(createI18nNode("strong", item.titleKey));
    text.append(createI18nNode("p", item.descKey));
    row.append(index, text);
    return row;
  }

  function renderSections() {
    const metrics = global.OneTapMetrics;
    const sections = global.OneTapSections;
    renderList('[data-render="hero-metrics"]', metrics.heroMetrics, metricCard);
    renderList('[data-render="proof-rail"]', sections.proofRail, railItem);
    renderList('[data-render="command-modules"]', sections.commandModules, moduleCard);
    renderList('[data-render="compare-modules"]', sections.compareModules, moduleCard);
    renderList('[data-render="studio-queue"]', sections.studioQueue, queueRow);
    renderList('[data-render="coach-items"]', sections.coachItems, coachItem);
  }

  global.OneTapRender = { renderSections };
})(window);

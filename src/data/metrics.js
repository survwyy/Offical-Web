(function (global) {
  const heroMetrics = [
    {
      id: "demo-review",
      tone: "blue",
      labelKey: "hero.metric1Label",
      value: "67",
      descKey: "hero.metric1Desc",
    },
    {
      id: "inventory-value",
      tone: "lime",
      labelKey: "hero.metric2Label",
      value: "$261",
      descKey: "hero.metric2Desc",
    },
    {
      id: "pro-setup",
      tone: "amber",
      labelKey: "hero.metric3Label",
      value: "Top 20",
      descKey: "hero.metric3Desc",
    },
    {
      id: "highlight-queue",
      tone: "",
      labelKey: "hero.metric4Label",
      value: "16",
      descKey: "hero.metric4Desc",
    },
  ];

  global.OneTapMetrics = { heroMetrics };
})(window);

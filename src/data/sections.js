(function (global) {
  const proofRail = [
    { id: "demo-review", index: "01", titleKey: "rail.oneTitle", descKey: "rail.oneDesc" },
    { id: "personal-data", index: "02", titleKey: "rail.twoTitle", descKey: "rail.twoDesc" },
    { id: "skins-gear", index: "03", titleKey: "rail.threeTitle", descKey: "rail.threeDesc" },
    { id: "pro-intel", index: "04", titleKey: "rail.fourTitle", descKey: "rail.fourDesc" },
    { id: "ai-coach", index: "05", titleKey: "rail.fiveTitle", descKey: "rail.fiveDesc" },
  ];

  const commandModules = [
    {
      id: "performance",
      tone: "",
      kickerKey: "command.m1Kicker",
      titleKey: "command.m1Title",
      descKey: "command.m1Desc",
    },
    {
      id: "inventory",
      tone: "lime",
      kickerKey: "command.m2Kicker",
      titleKey: "command.m2Title",
      descKey: "command.m2Desc",
    },
    {
      id: "map-detail",
      tone: "amber",
      kickerKey: "command.m3Kicker",
      titleKey: "command.m3Title",
      descKey: "command.m3Desc",
    },
  ];

  const compareModules = [
    {
      id: "radar",
      tone: "violet",
      kicker: "Radar",
      titleKey: "compare.m1Title",
      descKey: "compare.m1Desc",
    },
    {
      id: "hardware",
      tone: "",
      kicker: "Hardware",
      titleKey: "compare.m2Title",
      descKey: "compare.m2Desc",
    },
    {
      id: "reference",
      tone: "amber",
      kicker: "Reference",
      titleKey: "compare.m3Title",
      descKey: "compare.m3Desc",
    },
  ];

  const studioQueue = [
    {
      id: "overpass",
      title: "Overpass",
      meta: "1920x1080 · 60fps",
      status: "Queued",
      image: "assets/screenshot-generating.png",
    },
    {
      id: "nuke",
      title: "Nuke",
      meta: "Classic Scoreboard · 0:30",
      status: "Queued",
      image: "assets/screenshot-generating.png",
    },
    {
      id: "inferno",
      title: "Inferno",
      meta: "Quick Cut · HUD · Kill",
      status: "Ready",
      image: "assets/screenshot-generating.png",
    },
  ];

  const coachItems = [
    { id: "weak-maps", index: "01", titleKey: "coach.item1Title", descKey: "coach.item1Desc" },
    { id: "metric-gaps", index: "02", titleKey: "coach.item2Title", descKey: "coach.item2Desc" },
    { id: "training-direction", index: "03", titleKey: "coach.item3Title", descKey: "coach.item3Desc" },
  ];

  global.OneTapSections = {
    proofRail,
    commandModules,
    compareModules,
    studioQueue,
    coachItems,
  };
})(window);

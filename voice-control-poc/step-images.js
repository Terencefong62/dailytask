/**
 * Local step illustration assets (generated for this POC).
 * Loaded before locale config files.
 */
const STEP_IMG_BASE = "images/steps/";

window.RECIPE_STEP_IMAGES = {
  finish: {
    url: `${STEP_IMG_BASE}finish.jpg`,
    altZh: "完成的蠔油薯仔炆雞翼",
    altEn: "Finished oyster braised chicken wings with potatoes",
  },
  prepMarinate: {
    url: `${STEP_IMG_BASE}prep-marinate.jpg`,
    altZh: "醃製雞翼及準備薯仔",
    altEn: "Marinating chicken wings and preparing potatoes",
  },
  fryChicken: {
    url: `${STEP_IMG_BASE}fry-chicken.jpg`,
    altZh: "將雞翼煎至金黃色",
    altEn: "Frying chicken wings until golden",
  },
  sautePotato: {
    url: `${STEP_IMG_BASE}saute-potato.jpg`,
    altZh: "爆香蒜蓉並炒薯仔",
    altEn: "Sautéing garlic and stir-frying potatoes",
  },
  simmer: {
    url: `${STEP_IMG_BASE}simmer.jpg`,
    altZh: "加水加蓋慢火煮至食材軟身",
    altEn: "Simmering with lid until ingredients soften",
  },
  prepTofu: {
    url: `${STEP_IMG_BASE}prep-tofu.jpg`,
    altZh: "醃製百頁豆腐及準備薯仔",
    altEn: "Marinating tofu and preparing potatoes",
  },
  fryTofu: {
    url: `${STEP_IMG_BASE}fry-tofu.jpg`,
    altZh: "將豆腐煎至金黃色",
    altEn: "Pan-frying tofu until golden",
  },
  prepMushroom: {
    url: `${STEP_IMG_BASE}prep-mushroom.jpg`,
    altZh: "醃製杏鮑菇及準備薯仔",
    altEn: "Marinating king oyster mushrooms and preparing potatoes",
  },
  fryMushroom: {
    url: `${STEP_IMG_BASE}fry-mushroom.jpg`,
    altZh: "將杏鮑菇煎至金黃色",
    altEn: "Pan-frying mushrooms until golden",
  },
  lightFry: {
    url: `${STEP_IMG_BASE}light-fry.jpg`,
    altZh: "少油將雞翼煎至金黃色",
    altEn: "Lightly frying chicken wings with less oil",
  },
};

window.stepImageMeta = function stepImageMeta(key, lang) {
  const entry = window.RECIPE_STEP_IMAGES[key];
  if (!entry) return {};
  return {
    image: entry.url,
    imageAlt: lang === "zh" ? entry.altZh : entry.altEn,
  };
};

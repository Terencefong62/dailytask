const _img = (key) => stepImageMeta(key, "en");

window.RECIPE_VOICE_CONFIG = {
  lang: "en-US",
  recognitionLang: "en-US",
  localeKey: "en",
  baseServes: 4,
  maxServes: 12,
  variants: {
    default: {
      id: "default",
      label: "Original",
      note: "Classic Lee Kum Kee recipe with chicken wings and premium oyster sauce.",
      steps: [
        {
          number: 1,
          text: "Slice in the middle of the chicken wings and marinade for 10 minutes. Peel and cut the potatoes into pieces.",
          ..._img("prepMarinate"),
        },
        {
          number: 2,
          text: "Heat the oil with medium high heat, fry the chicken wings until golden yellow, set aside and keep warm.",
          ..._img("fryChicken"),
        },
        {
          number: 3,
          text: "Add some oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
          ..._img("sautePotato"),
        },
        {
          number: 4,
          text: "Add water, cover and bring to boil until the potatoes soften. Add chicken wings and stir well.",
          ..._img("simmer"),
        },
        {
          number: 5,
          text: "Add the seasoning, cover and cook for 5 minutes or adjust the thickness of sauce according to personal preference. Garnish with green onions.",
          ..._img("finish"),
        },
      ],
      ingredients: {
        sections: [
          {
            title: "Ingredients",
            items: [
              { name: "Chicken wings", amount: 12, unit: "pcs" },
              { name: "Potato", amount: 3, unit: "pcs", sub: { amount: 300, unit: "g", prefix: "around" } },
              { name: "Lee Kum Kee Minced Garlic", amount: 1, unit: "tsp" },
              { name: "Shallots", amount: 3, unit: "pcs", note: "halved" },
              { fixed: "Green onion (for garnish)" },
            ],
          },
          {
            title: "Marinade",
            items: [{ name: "Lee Kum Kee Premium Oyster Sauce", amount: 1.5, unit: "tbsp" }],
          },
          {
            title: "Seasoning",
            items: [
              { name: "Lee Kum Kee Premium Oyster Sauce", amount: 2.5, unit: "tbsp" },
              { name: "Sugar", amount: 1, unit: "tsp" },
              { name: "Water", amount: 200, unit: "ml" },
            ],
          },
        ],
        lkkProducts: [
          {
            category: "Basic Cooking Sauce",
            name: "Minced Garlic",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
          },
          {
            category: "Oyster Sauce",
            name: "Premium Oyster Sauce",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/premium-oyster-sauce-510g-tran.png?w=80&h=80",
          },
        ],
      },
    },
    vegan: {
      id: "vegan",
      label: "Vegan version",
      note: "King oyster mushroom pieces replace chicken; vegan oyster sauce replaces oyster sauce. No animal products.",
      steps: [
        {
          number: 1,
          text: "Slice king oyster mushrooms in the middle and marinate with vegan oyster sauce and garlic for 10 minutes. Peel and cut the potatoes into pieces.",
          ..._img("prepMushroom"),
        },
        {
          number: 2,
          text: "Heat a little oil over medium-high heat, pan-fry the mushroom pieces until golden, set aside and keep warm.",
          ..._img("fryMushroom"),
        },
        {
          number: 3,
          text: "Add some oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
          ..._img("sautePotato"),
        },
        {
          number: 4,
          text: "Add water, cover and simmer until the potatoes soften. Add mushrooms back to the pan and stir well.",
          ..._img("simmer"),
        },
        {
          number: 5,
          text: "Add seasoning (2 tbsp vegan oyster sauce, 1 tsp sugar, 200 ml water), cover and cook for 5 minutes. Garnish with green onions.",
          ..._img("finish"),
        },
      ],
      ingredients: {
        sections: [
          {
            title: "Ingredients",
            items: [
              { name: "King oyster mushrooms", amount: 300, unit: "g", note: "replaces chicken", changed: true },
              { name: "Potato", amount: 3, unit: "pcs", sub: { amount: 300, unit: "g", prefix: "around" } },
              { name: "Lee Kum Kee Minced Garlic", amount: 1, unit: "tsp" },
              { name: "Shallots", amount: 3, unit: "pcs", note: "halved" },
              { fixed: "Green onion (for garnish)" },
            ],
          },
          {
            title: "Marinade",
            items: [{ name: "Vegan oyster sauce", amount: 1.5, unit: "tbsp", changed: true }],
          },
          {
            title: "Seasoning",
            items: [
              { name: "Vegan oyster sauce", amount: 2, unit: "tbsp", changed: true },
              { name: "Sugar", amount: 1, unit: "tsp" },
              { name: "Water", amount: 200, unit: "ml" },
            ],
          },
        ],
        lkkProducts: [
          {
            category: "Basic Cooking Sauce",
            name: "Minced Garlic",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
          },
          {
            category: "Sauce",
            name: "Vegan oyster sauce (replaces Premium Oyster Sauce)",
            changed: true,
          },
        ],
      },
    },
    healthy: {
      id: "healthy",
      label: "Healthy version",
      note: "Less oil, half the oyster sauce and sugar in the marinade and seasoning to lower sodium and sugar.",
      steps: [
        {
          number: 1,
          text: "Slice chicken wings in the middle and marinate for 10 minutes with less premium oyster sauce (about half a tablespoon) and garlic. Peel and cut potatoes.",
          ..._img("prepMarinate"),
        },
        {
          number: 2,
          text: "Heat a small amount of oil over medium heat, fry the chicken wings until golden yellow, set aside and keep warm.",
          ..._img("lightFry"),
        },
        {
          number: 3,
          text: "Add a little oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
          ..._img("sautePotato"),
        },
        {
          number: 4,
          text: "Add water, cover and simmer until the potatoes soften. Add chicken wings back and stir well.",
          ..._img("simmer"),
        },
        {
          number: 5,
          text: "Add reduced seasoning (1.5 tbsp oyster sauce, half teaspoon sugar or no sugar, 200 ml water), cover and cook for 5 minutes. Garnish with green onions.",
          ..._img("finish"),
        },
      ],
      ingredients: {
        sections: [
          {
            title: "Ingredients",
            items: [
              { name: "Chicken wings", amount: 12, unit: "pcs" },
              { name: "Potato", amount: 3, unit: "pcs", sub: { amount: 300, unit: "g", prefix: "around" } },
              { name: "Lee Kum Kee Minced Garlic", amount: 1, unit: "tsp" },
              { name: "Shallots", amount: 3, unit: "pcs", note: "halved" },
              { fixed: "Green onion (for garnish)" },
            ],
          },
          {
            title: "Marinade",
            items: [
              {
                name: "Lee Kum Kee Premium Oyster Sauce",
                amount: 0.5,
                unit: "tbsp",
                note: "reduced",
                changed: true,
              },
            ],
          },
          {
            title: "Seasoning",
            items: [
              {
                name: "Lee Kum Kee Premium Oyster Sauce",
                amount: 1.5,
                unit: "tbsp",
                note: "reduced",
                changed: true,
              },
              { name: "Sugar", amount: 0.5, unit: "tsp", note: "or no sugar (reduced)", changed: true },
              { name: "Water", amount: 200, unit: "ml" },
            ],
          },
        ],
        lkkProducts: [
          {
            category: "Basic Cooking Sauce",
            name: "Minced Garlic",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
          },
          {
            category: "Oyster Sauce",
            name: "Premium Oyster Sauce (reduced amount)",
            changed: true,
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/premium-oyster-sauce-510g-tran.png?w=80&h=80",
          },
        ],
      },
    },
  },
  strings: {
    micOn: "Start voice listening",
    micOff: "Stop voice listening",
    listening: "Listening…",
    speaking: "Speaking…",
    heard: (text) => `Heard: "${text}"`,
    stepPrefix: (n) => `Step ${n}: `,
    readingStep: (n) => `Reading step ${n}`,
    lastStep: "This is the last step",
    firstStep: "This is the first step",
    noStep: (n, max) => `Step ${n} does not exist. Say a step between 1 and ${max}.`,
    stopped: "Reading stopped",
    listeningOn: "Voice listening is on. Say a command.",
    micError: "Could not start voice listening. Check microphone permissions.",
    noRecognition: "This browser does not support SpeechRecognition. Use Chrome or Edge.",
    noSynthesis: "This browser does not support SpeechSynthesis.",
    welcome: "Click \"Start voice listening\" or \"Start\" to begin",
    recognitionError: (err) => `Speech recognition error: ${err}`,
    versionTitle: "Recipe version",
    switchedVersion: (label) => `Switched to ${label}`,
    prepTitle: "Ingredients",
    lkkProductsTitle: "Made with Lee Kum Kee products",
    stepsTitle: "How to make it",
    stepGuideTitle: "Step visual guide",
    stepGuideLabel: (n) => `Step ${n}`,
    stepGuidePrompt: "Say \"Start\" or pick a step to see the visual guide",
    changedBadge: "Adjusted",
    servingTitle: "Serves",
    servingUnit: "people",
    servingHint: "Adjust servings — ingredients and seasoning scale automatically for balanced flavour.",
    servingUpdated: (n) => `Updated for ${n} servings`,
    portionChangeTitle: (n) =>
      `Ingredients & seasoning adjusted for ${n} ${n === 1 ? "person" : "people"}`,
    portionChangeDetail: (n, base) =>
      n === base
        ? `Showing original recipe amounts (base recipe: ${base} people).`
        : `Material, marinade and seasoning scaled from the ${base}-person recipe for balanced flavour.`,
    portionScaledBadge: "Scaled",
    cookModeTitle: "Cook Mode",
    cookModeHint: "Keeps your screen awake and turns on voice control while you cook.",
    cookModeOn: "On",
    cookModeOff: "Off",
    cookModeOffHint: "Turn on Cook Mode to keep the screen awake and use voice controls hands-free.",
    cookModeActive: "Cook Mode is on — screen will stay awake and voice listening is active.",
    cookModeWakeLockOk: "Screen stay-awake is active.",
    cookModeWakeLockFallback: "Screen stay-awake is not supported on this device — keep this page visible while cooking.",
    cookModeWakeLockDenied: "Could not keep screen awake — check browser permissions and try again.",
    cookModeEnded: "Cook Mode ended — screen and voice control restored to normal.",
    cursorAiTitle: "AI generation (real-time)",
    cursorAiHint: "Generate Vegan / Healthy with ChatGPT (OpenAI API) or Cursor AI.",
    cursorKeyLabel: "API Key",
    cursorKeyPlaceholderOpenai: "sk-… (OpenAI API key)",
    cursorKeyPlaceholderCursor: "crsr_… (Cursor Dashboard → API Keys)",
    cursorProviderLabel: "AI service",
    cursorProviderOpenai: "ChatGPT (OpenAI)",
    cursorProviderCursor: "Cursor AI",
    cursorSaveKey: "Save & connect",
    cursorConnectedOpenai: "Connected to ChatGPT",
    cursorConnectedCursor: "Connected to Cursor AI",
    cursorDisconnected: "Not connected — static fallback will be used",
    cursorGeneratingOpenai: "ChatGPT is generating the recipe…",
    cursorGeneratingCursor: "Cursor AI is generating the recipe…",
    cursorStreamLabelOpenai: "ChatGPT",
    cursorStreamLabelCursor: "Cursor AI",
    cursorError: (msg) => `AI error: ${msg}`,
    cursorUseAi: "Use AI for Vegan / Healthy versions",
  },
  commands: {
    start: ["start", "begin", "play"],
    next: ["next step", "next"],
    prev: ["back", "go back"],
    stop: ["stop", "pause"],
    repeat: ["repeat", "again", "say again"],
    versionDefault: ["original", "original version", "classic"],
    versionVegan: ["vegan version", "vegan"],
    versionHealthy: ["healthy version", "healthy"],
    goToStepPatterns: [
      /go to step\s*\d+/i,
      /return to step\s*\d+/i,
      /step\s*\d+/i,
    ],
    goToStepExclude: /next|back/i,
    parseStepNumber: (text) => {
      const match = text.match(/(?:go to step|return to step|step)\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    },
  },
  normalizeCommand: (text) => text.toLowerCase().replace(/[.,!?]/g, "").trim(),
  pickVoice: (voices) =>
    voices.find((v) => v.lang.startsWith("en") && v.lang.includes("US")) ||
    voices.find((v) => v.lang.startsWith("en")),
};

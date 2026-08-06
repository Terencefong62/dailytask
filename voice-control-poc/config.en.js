window.RECIPE_VOICE_CONFIG = {
  lang: "en-US",
  recognitionLang: "en-US",
  variants: {
    default: {
      id: "default",
      label: "Original",
      note: "Classic Lee Kum Kee recipe with chicken wings and premium oyster sauce.",
      steps: [
        {
          number: 1,
          text: "Slice in the middle of the chicken wings and marinade for 10 minutes. Peel and cut the potatoes into pieces.",
        },
        {
          number: 2,
          text: "Heat the oil with medium high heat, fry the chicken wings until golden yellow, set aside and keep warm.",
        },
        {
          number: 3,
          text: "Add some oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
        },
        {
          number: 4,
          text: "Add water, cover and bring to boil until the potatoes soften. Add chicken wings and stir well.",
        },
        {
          number: 5,
          text: "Add the seasoning, cover and cook for 5 minutes or adjust the thickness of sauce according to personal preference. Garnish with green onions.",
        },
      ],
    },
    vegan: {
      id: "vegan",
      label: "Vegan version",
      note: "King oyster mushroom pieces replace chicken; vegan oyster sauce replaces oyster sauce. No animal products.",
      steps: [
        {
          number: 1,
          text: "Slice king oyster mushrooms in the middle and marinate with vegan oyster sauce and garlic for 10 minutes. Peel and cut the potatoes into pieces.",
        },
        {
          number: 2,
          text: "Heat a little oil over medium-high heat, pan-fry the mushroom pieces until golden, set aside and keep warm.",
        },
        {
          number: 3,
          text: "Add some oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
        },
        {
          number: 4,
          text: "Add water, cover and simmer until the potatoes soften. Add mushrooms back to the pan and stir well.",
        },
        {
          number: 5,
          text: "Add seasoning (2 tbsp vegan oyster sauce, 1 tsp sugar, 200 ml water), cover and cook for 5 minutes. Garnish with green onions.",
        },
      ],
    },
    healthy: {
      id: "healthy",
      label: "Healthy version",
      note: "Less oil, half the oyster sauce and sugar in the marinade and seasoning to lower sodium and sugar.",
      steps: [
        {
          number: 1,
          text: "Slice chicken wings in the middle and marinate for 10 minutes with less premium oyster sauce (about half a tablespoon) and garlic. Peel and cut potatoes.",
        },
        {
          number: 2,
          text: "Heat a small amount of oil over medium heat, fry the chicken wings until golden yellow, set aside and keep warm.",
        },
        {
          number: 3,
          text: "Add a little oil, sauté garlic and dried shallots until fragrant, then add potatoes and stir-fry well.",
        },
        {
          number: 4,
          text: "Add water, cover and simmer until the potatoes soften. Add chicken wings back and stir well.",
        },
        {
          number: 5,
          text: "Add reduced seasoning (1.5 tbsp oyster sauce, half teaspoon sugar or no sugar, 200 ml water), cover and cook for 5 minutes. Garnish with green onions.",
        },
      ],
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

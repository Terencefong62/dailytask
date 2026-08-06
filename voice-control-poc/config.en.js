window.RECIPE_VOICE_CONFIG = {
  lang: "en-US",
  recognitionLang: "en-US",
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
  },
  commands: {
    start: ["start", "begin", "play"],
    next: ["next step", "next"],
    prev: ["back", "go back"],
    stop: ["stop", "pause"],
    repeat: ["repeat", "again", "say again"],
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

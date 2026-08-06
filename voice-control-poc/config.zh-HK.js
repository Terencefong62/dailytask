window.RECIPE_VOICE_CONFIG = {
  lang: "zh-HK",
  recognitionLang: "zh-HK",
  steps: [
    {
      number: 1,
      text: "雞翼用刀在中間𠝹幾刀，用醃料醃10分鐘，薯仔去皮切角備用。用中大火燒熱油鑊，下雞翼煎至兩面金黃色，盛起蓋著保溫，備用。",
    },
    {
      number: 2,
      text: "原鑊再下少許油，爆香蒜蓉，下薯仔炒勻。",
    },
    {
      number: 3,
      text: "倒進水，加蓋用小火煮至馬鈴薯開始軟身。雞翼回鑊，兜勻。",
    },
    {
      number: 4,
      text: "倒進調味料，加蓋多煮5分鐘或至喜歡的濃稠度，灑蔥花裝飾，即可。",
    },
  ],
  strings: {
    micOn: "開啟語音聆聽",
    micOff: "停止語音聆聽",
    listening: "聆聽中…",
    speaking: "朗讀中…",
    heard: (text) => `辨識到：「${text}」`,
    stepPrefix: (n) => `第 ${n} 步：`,
    readingStep: (n) => `正在朗讀第 ${n} 步`,
    lastStep: "已是最後一步",
    firstStep: "已是第一步",
    noStep: (n, max) => `沒有第 ${n} 步，請說 1 至 ${max} 之間的步驟`,
    stopped: "已停止朗讀",
    listeningOn: "語音聆聽已開啟，請說出指令。",
    micError: "無法啟動語音聆聽，請確認麥克風權限。",
    noRecognition: "此瀏覽器不支援語音辨識（SpeechRecognition）。請使用 Chrome 或 Edge。",
    noSynthesis: "此瀏覽器不支援文字轉語音（SpeechSynthesis）。",
    welcome: "按「開啟語音聆聽」或「開始」開始體驗",
    recognitionError: (err) => `語音辨識錯誤：${err}`,
  },
  commands: {
    start: ["開始", "播放", "朗讀"],
    next: ["下一步", "下一個"],
    prev: ["上一步", "上一個"],
    stop: ["停止", "暫停"],
    repeat: ["重複", "再說", "再说"],
    goToStepPatterns: [
      /返回第.+步/,
      /回到第.+步/,
      /第.+步/,
    ],
    goToStepExclude: /下一步|上一步/,
    parseStepNumber: (text) => {
      const digitMatch = text.match(/第\s*(\d+)\s*步/);
      if (digitMatch) return parseInt(digitMatch[1], 10);

      const chineseDigits = {
        一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
        六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
      };
      const chineseMatch = text.match(/第\s*([一二三四五六七八九十]+)\s*步/);
      if (chineseMatch) {
        const token = chineseMatch[1];
        if (token.length === 1 && chineseDigits[token]) return chineseDigits[token];
        if (token === "十") return 10;
        if (token.startsWith("十") && token.length === 2) return 10 + chineseDigits[token[1]];
        if (token.endsWith("十") && token.length === 2) return chineseDigits[token[0]] * 10;
      }
      return null;
    },
  },
  normalizeCommand: (text) => text.replace(/\s+/g, "").replace(/[，。！？、]/g, ""),
  pickVoice: (voices) =>
    voices.find((v) => v.lang.startsWith("zh") && (v.lang.includes("HK") || v.lang.includes("TW"))) ||
    voices.find((v) => v.lang.startsWith("zh")),
};

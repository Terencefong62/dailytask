window.RECIPE_VOICE_CONFIG = {
  lang: "zh-HK",
  recognitionLang: "zh-HK",
  variants: {
    default: {
      id: "default",
      label: "原版",
      note: "依李錦記原版食譜：雞翼配舊庄蠔油。",
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
      ingredients: {
        sections: [
          {
            title: "材料",
            items: [
              { text: "雞中翼 12隻" },
              { text: "薯仔 3個（約300克）" },
              { text: "李錦記蒜蓉 1茶匙" },
              { text: "乾蔥頭 3顆（切半）" },
              { text: "蔥花（適量，裝飾用）" },
            ],
          },
          {
            title: "醃料",
            items: [{ text: "李錦記舊庄特級蠔油 1.5湯匙" }],
          },
          {
            title: "調味料",
            items: [
              { text: "李錦記舊庄特級蠔油 2.5湯匙" },
              { text: "糖 1茶匙" },
              { text: "清水 200毫升" },
            ],
          },
        ],
        lkkProducts: [
          {
            category: "基礎烹調醬料",
            name: "蒜蓉",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
          },
          {
            category: "蠔油",
            name: "舊庄特級蠔油",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/premium-oyster-sauce-510g-tran.png?w=80&h=80",
          },
        ],
      },
    },
    vegan: {
      id: "vegan",
      label: "素食版",
      note: "以百頁豆腐代替雞翼，醃料及調味改用素食蠔油（香菇素蠔油），不含肉類。",
      steps: [
        {
          number: 1,
          text: "百頁豆腐切件，在中間𠝹幾刀，用素食蠔油及蒜蓉醃10分鐘，薯仔去皮切角備用。用中大火燒熱油鑊，下豆腐煎至兩面金黃色，盛起保溫備用。",
        },
        {
          number: 2,
          text: "原鑊再下少許油，爆香蒜蓉，下薯仔炒勻。",
        },
        {
          number: 3,
          text: "倒進水，加蓋用小火煮至薯仔開始軟身。豆腐回鑊，兜勻。",
        },
        {
          number: 4,
          text: "倒進調味料（素食蠔油2湯匙、糖1茶匙、清水200毫升），加蓋多煮5分鐘，灑蔥花裝飾，即可。",
        },
      ],
      ingredients: {
        sections: [
          {
            title: "材料",
            items: [
              { text: "百頁豆腐 2包（約300克，代替雞翼）", changed: true },
              { text: "薯仔 3個（約300克）" },
              { text: "李錦記蒜蓉 1茶匙" },
              { text: "乾蔥頭 3顆（切半）" },
              { text: "蔥花（適量，裝飾用）" },
            ],
          },
          {
            title: "醃料",
            items: [{ text: "素食蠔油（香菇素蠔油）1.5湯匙", changed: true }],
          },
          {
            title: "調味料",
            items: [
              { text: "素食蠔油 2湯匙", changed: true },
              { text: "糖 1茶匙" },
              { text: "清水 200毫升" },
            ],
          },
        ],
        lkkProducts: [
          {
            category: "基礎烹調醬料",
            name: "蒜蓉",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
          },
          {
            category: "醬料",
            name: "素食蠔油（代替舊庄蠔油）",
            changed: true,
          },
        ],
      },
    },
    healthy: {
      id: "healthy",
      label: "健康版",
      note: "減少用油，醃料及調味中的蠔油與糖分量減半，降低鈉與糖分。",
      steps: [
        {
          number: 1,
          text: "雞翼用刀在中間𠝹幾刀，用少量舊庄蠔油（約半湯匙）及蒜蓉醃10分鐘，薯仔去皮切角備用。用中火少油燒熱油鑊，下雞翼煎至兩面金黃色，盛起保溫備用。",
        },
        {
          number: 2,
          text: "原鑊下少許油，爆香蒜蓉，下薯仔炒勻。",
        },
        {
          number: 3,
          text: "倒進水，加蓋用小火煮至薯仔開始軟身。雞翼回鑊，兜勻。",
        },
        {
          number: 4,
          text: "倒進調味料（舊庄蠔油1.5湯匙、糖半茶匙或免糖、清水200毫升），加蓋多煮5分鐘，灑蔥花裝飾，即可。",
        },
      ],
      ingredients: {
        sections: [
          {
            title: "材料",
            items: [
              { text: "雞中翼 12隻" },
              { text: "薯仔 3個（約300克）" },
              { text: "李錦記蒜蓉 1茶匙" },
              { text: "乾蔥頭 3顆（切半）" },
              { text: "蔥花（適量，裝飾用）" },
            ],
          },
          {
            title: "醃料",
            items: [{ text: "李錦記舊庄特級蠔油 半湯匙（減量）", changed: true }],
          },
          {
            title: "調味料",
            items: [
              { text: "李錦記舊庄特級蠔油 1.5湯匙（減量）", changed: true },
              { text: "糖 半茶匙或免糖（減量）", changed: true },
              { text: "清水 200毫升" },
            ],
          },
        ],
        lkkProducts: [
          {
            category: "基礎烹調醬料",
            name: "蒜蓉",
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
          },
          {
            category: "蠔油",
            name: "舊庄特級蠔油（減量使用）",
            changed: true,
            image: "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/premium-oyster-sauce-510g-tran.png?w=80&h=80",
          },
        ],
      },
    },
  },
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
    versionTitle: "食譜版本",
    switchedVersion: (label) => `已切換至${label}`,
    prepTitle: "預備食材",
    lkkProductsTitle: "使用了以下李錦記產品",
    stepsTitle: "烹調步驟",
    changedBadge: "已調整",
    cursorAiTitle: "AI 即時生成",
    cursorAiHint: "使用 ChatGPT（OpenAI API）或 Cursor AI 即時生成素食版／健康版。",
    cursorKeyLabel: "API Key",
    cursorKeyPlaceholderOpenai: "sk-…（OpenAI API key）",
    cursorKeyPlaceholderCursor: "crsr_…（Cursor Dashboard → API Keys）",
    cursorProviderLabel: "AI 服務",
    cursorProviderOpenai: "ChatGPT（OpenAI）",
    cursorProviderCursor: "Cursor AI",
    cursorSaveKey: "儲存並連線",
    cursorConnectedOpenai: "已連線 ChatGPT",
    cursorConnectedCursor: "已連線 Cursor AI",
    cursorDisconnected: "未連線 — 將使用預設靜態版本",
    cursorGeneratingOpenai: "ChatGPT 正在生成食譜…",
    cursorGeneratingCursor: "Cursor AI 正在生成食譜…",
    cursorStreamLabelOpenai: "ChatGPT",
    cursorStreamLabelCursor: "Cursor AI",
    cursorError: (msg) => `AI 錯誤：${msg}`,
    cursorUseAi: "使用 AI 即時生成素食版／健康版",
  },
  commands: {
    start: ["開始", "播放", "朗讀"],
    next: ["下一步", "下一個"],
    prev: ["上一步", "上一個"],
    stop: ["停止", "暫停"],
    repeat: ["重複", "再說", "再说"],
    versionDefault: ["原版", "原始版", "原本"],
    versionVegan: ["素食版", "素食版本", "素食"],
    versionHealthy: ["健康版", "健康版本", "健康"],
    goToStepPatterns: [/返回第.+步/, /回到第.+步/, /第.+步/],
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

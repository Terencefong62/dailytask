/**
 * Web Speech API POC — recipe step TTS + voice commands (zh-HK)
 * Recipe: 蠔油薯仔炆雞翼
 */

const COOKING_STEPS = [
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
];

const CHINESE_DIGITS = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

const LISTENING_LABELS = {
  idle: "開啟語音聆聽",
  active: "停止語音聆聽",
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

class RecipeVoiceController {
  constructor(steps) {
    this.steps = steps;
    this.currentIndex = -1;
    this.isListening = false;
    this.recognition = null;

    this.stepsList = document.getElementById("steps-list");
    this.micToggle = document.getElementById("mic-toggle");
    this.btnStart = document.getElementById("btn-start");
    this.btnPrev = document.getElementById("btn-prev");
    this.btnNext = document.getElementById("btn-next");
    this.btnStop = document.getElementById("btn-stop");
    this.statusListening = document.getElementById("status-listening");
    this.statusSpeaking = document.getElementById("status-speaking");
    this.statusMessage = document.getElementById("status-message");
    this.lastCommand = document.getElementById("last-command");
    this.micIcon = this.micToggle.querySelector(".mic-icon");
    this.micLabel = this.micToggle.querySelector(".mic-label");
    this.stepElements = new Map();

    this.renderSteps();
    this.bindUi();
    this.setupRecognition();
    this.updateUi();
  }

  renderSteps() {
    this.stepsList.replaceChildren();
    this.stepElements.clear();

    for (const step of this.steps) {
      const item = document.createElement("li");
      item.className = "step-box";
      item.dataset.step = String(step.number);
      item.id = `step-${step.number}`;

      const number = document.createElement("span");
      number.className = "step-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(step.number);

      const text = document.createElement("span");
      text.className = "step-text";
      text.textContent = step.text;

      item.append(number, text);
      this.stepsList.append(item);
      this.stepElements.set(step.number, item);
    }
  }

  bindUi() {
    this.micToggle.addEventListener("click", () => this.toggleListening());
    this.btnStart.addEventListener("click", () => this.handleCommand("開始"));
    this.btnPrev.addEventListener("click", () => this.handleCommand("上一步"));
    this.btnNext.addEventListener("click", () => this.handleCommand("下一步"));
    this.btnStop.addEventListener("click", () => this.stopReading());

    window.addEventListener("beforeunload", () => {
      this.stopListening();
      this.stopSpeaking();
    });
  }

  setupRecognition() {
    if (!SpeechRecognition) {
      this.setMessage("此瀏覽器不支援語音辨識（SpeechRecognition）。請使用 Chrome 或 Edge。");
      this.micToggle.disabled = true;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "zh-HK";
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;

      const transcript = last[0].transcript.trim();
      this.lastCommand.textContent = `辨識到：「${transcript}」`;
      this.handleCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;
      this.setMessage(`語音辨識錯誤：${event.error}`);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch {
          /* restart after browser auto-stop */
        }
      }
    };
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.updateListeningControl();
      this.setMessage("語音聆聽已開啟，請說出指令。");
      this.updateUi();
    } catch {
      this.setMessage("無法啟動語音聆聽，請確認麥克風權限。");
    }
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return;

    this.isListening = false;
    this.recognition.stop();
    this.updateListeningControl();
    this.setMessage("語音聆聽已關閉。");
    this.updateUi();
  }

  stopSpeaking() {
    window.speechSynthesis.cancel();
    this.updateUi();
  }

  stopReading() {
    this.stopSpeaking();
    this.setMessage("已停止朗讀");
  }

  speakStep(index, announceStep = true) {
    if (index < 0 || index >= this.steps.length) return;

    this.stopSpeaking();
    this.currentIndex = index;
    this.highlightStep(this.steps[index].number);

    const prefix = announceStep ? `第 ${this.steps[index].number} 步：` : "";
    const utterance = new SpeechSynthesisUtterance(prefix + this.steps[index].text);
    utterance.lang = "zh-HK";

    utterance.onstart = () => this.updateUi();
    utterance.onend = () => this.updateUi();
    utterance.onerror = () => this.updateUi();

    const zhVoice = this.findChineseVoice();
    if (zhVoice) utterance.voice = zhVoice;

    window.speechSynthesis.speak(utterance);
    this.setMessage(`正在朗讀第 ${this.steps[index].number} 步`);
    this.updateUi();
  }

  highlightStep(stepNumber) {
    this.stepElements.forEach((el, number) => {
      const active = number === stepNumber;
      el.classList.toggle("active", active);
      if (active) {
        el.setAttribute("aria-current", "step");
      } else {
        el.removeAttribute("aria-current");
      }
    });

    const active = this.stepElements.get(stepNumber);
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  goToFirstStep() {
    this.speakStep(0);
  }

  goToNextStep() {
    if (this.currentIndex < 0) {
      this.goToFirstStep();
      return;
    }
    if (this.currentIndex >= this.steps.length - 1) {
      this.setMessage("已是最後一步");
      this.speakFeedback("已是最後一步");
      return;
    }
    this.speakStep(this.currentIndex + 1);
  }

  goToPreviousStep() {
    if (this.currentIndex <= 0) {
      this.setMessage("已是第一步");
      this.speakFeedback("已是第一步");
      if (this.currentIndex < 0) this.goToFirstStep();
      return;
    }
    this.speakStep(this.currentIndex - 1);
  }

  goToStepNumber(stepNumber) {
    const index = this.steps.findIndex((s) => s.number === stepNumber);
    if (index === -1) {
      this.setMessage(`沒有第 ${stepNumber} 步，請說 1 至 ${this.steps.length} 之間的步驟`);
      this.speakFeedback(`沒有第 ${stepNumber} 步`);
      return;
    }
    this.speakStep(index);
  }

  speakFeedback(text) {
    this.stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-HK";
    const zhVoice = this.findChineseVoice();
    if (zhVoice) utterance.voice = zhVoice;
    utterance.onstart = () => this.updateUi();
    utterance.onend = () => this.updateUi();
    utterance.onerror = () => this.updateUi();
    window.speechSynthesis.speak(utterance);
  }

  parseStepNumber(text) {
    const digitMatch = text.match(/第\s*(\d+)\s*步/);
    if (digitMatch) return parseInt(digitMatch[1], 10);

    const chineseMatch = text.match(/第\s*([一二三四五六七八九十]+)\s*步/);
    if (chineseMatch) {
      const token = chineseMatch[1];
      if (token.length === 1 && CHINESE_DIGITS[token]) return CHINESE_DIGITS[token];
      if (token === "十") return 10;
      if (token.startsWith("十") && token.length === 2) return 10 + CHINESE_DIGITS[token[1]];
      if (token.endsWith("十") && token.length === 2) return CHINESE_DIGITS[token[0]] * 10;
    }

    return null;
  }

  normalizeCommand(text) {
    return text.replace(/\s+/g, "").replace(/[，。！？、]/g, "");
  }

  handleCommand(rawText) {
    const text = this.normalizeCommand(rawText);

    if (/返回第.+步|回到第.+步|第.+步/.test(text) && !/下一步|上一步/.test(text)) {
      const stepNum = this.parseStepNumber(text);
      if (stepNum !== null) {
        this.goToStepNumber(stepNum);
        return;
      }
    }

    if (text.includes("開始") || text.includes("播放") || text.includes("朗讀")) {
      this.goToFirstStep();
      return;
    }

    if (text.includes("下一步") || text.includes("下一個")) {
      this.goToNextStep();
      return;
    }

    if (text.includes("上一步") || text.includes("上一個")) {
      this.goToPreviousStep();
      return;
    }

    if (text.includes("停止") || text.includes("暫停")) {
      this.stopReading();
      return;
    }

    if (text.includes("重複") || text.includes("再說") || text.includes("再说")) {
      if (this.currentIndex >= 0) {
        this.speakStep(this.currentIndex);
      } else {
        this.goToFirstStep();
      }
      return;
    }

    this.setMessage("未能識別指令，請說「開始」、「下一步」、「上一步」、「返回第 X 步」、「重複」或「停止」。");
  }

  setMessage(message) {
    this.statusMessage.textContent = message;
  }

  findChineseVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(
        (voice) =>
          voice.lang.startsWith("zh") &&
          (voice.lang.includes("HK") || voice.lang.includes("TW"))
      ) || voices.find((voice) => voice.lang.startsWith("zh"))
    );
  }

  updateListeningControl() {
    this.micToggle.setAttribute("aria-pressed", String(this.isListening));
    this.micIcon.textContent = this.isListening ? "🔴" : "🎤";
    this.micLabel.textContent = this.isListening
      ? LISTENING_LABELS.active
      : LISTENING_LABELS.idle;
  }

  updateUi() {
    const speaking = window.speechSynthesis.speaking;
    this.statusSpeaking.classList.toggle("hidden", !speaking);
    this.statusListening.classList.toggle("hidden", !this.isListening);
  }
}

function init() {
  if (!window.speechSynthesis) {
    document.getElementById("status-message").textContent =
      "此瀏覽器不支援文字轉語音（SpeechSynthesis）。";
    return;
  }

  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

  new RecipeVoiceController(COOKING_STEPS);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

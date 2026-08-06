/**
 * Web Speech API POC — recipe step TTS + voice commands (locale via RECIPE_VOICE_CONFIG)
 */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

class RecipeVoiceController {
  constructor(config) {
    this.config = config;
    this.steps = config.steps;
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

    this.renderSteps();
    this.bindUi();
    this.setupRecognition();
    this.updateUi();
  }

  renderSteps() {
    this.stepsList.innerHTML = this.steps
      .map(
        (step) =>
          `<li class="step-box" data-step="${step.number}" id="step-${step.number}">
            <span class="step-number" aria-hidden="true">${step.number}</span>
            <span class="step-text">${step.text}</span>
          </li>`
      )
      .join("");
  }

  bindUi() {
    const { commands } = this.config;
    this.micToggle.addEventListener("click", () => this.toggleListening());
    this.btnStart.addEventListener("click", () => this.handleCommand(commands.start[0]));
    this.btnPrev.addEventListener("click", () => this.handleCommand(commands.prev[0]));
    this.btnNext.addEventListener("click", () => this.handleCommand(commands.next[0]));
    this.btnStop.addEventListener("click", () => this.stopSpeaking());

    window.addEventListener("beforeunload", () => {
      this.stopListening();
      this.stopSpeaking();
    });
  }

  setupRecognition() {
    const { strings, recognitionLang } = this.config;

    if (!SpeechRecognition) {
      this.setMessage(strings.noRecognition);
      this.micToggle.disabled = true;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = recognitionLang;
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;

      const transcript = last[0].transcript.trim();
      this.lastCommand.textContent = strings.heard(transcript);
      this.handleCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;
      this.setMessage(strings.recognitionError(event.error));
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
    const { strings } = this.config;
    if (!this.recognition) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.micToggle.setAttribute("aria-pressed", "true");
      this.micToggle.querySelector(".mic-icon").textContent = "🔴";
      this.micToggle.lastChild.textContent = strings.micOff;
      this.setMessage(strings.listeningOn);
      this.updateUi();
    } catch {
      this.setMessage(strings.micError);
    }
  }

  stopListening() {
    const { strings } = this.config;
    if (!this.recognition || !this.isListening) return;

    this.isListening = false;
    this.recognition.stop();
    this.micToggle.setAttribute("aria-pressed", "false");
    this.micToggle.querySelector(".mic-icon").textContent = "🎤";
    this.micToggle.lastChild.textContent = strings.micOn;
    this.updateUi();
  }

  stopSpeaking() {
    window.speechSynthesis.cancel();
    this.updateUi();
  }

  speakStep(index, announceStep = true) {
    const { lang, strings, pickVoice } = this.config;
    if (index < 0 || index >= this.steps.length) return;

    this.stopSpeaking();
    this.currentIndex = index;
    this.highlightStep(this.steps[index].number);

    const prefix = announceStep ? strings.stepPrefix(this.steps[index].number) : "";
    const utterance = new SpeechSynthesisUtterance(prefix + this.steps[index].text);
    utterance.lang = lang;

    utterance.onstart = () => this.updateUi();
    utterance.onend = () => this.updateUi();
    utterance.onerror = () => this.updateUi();

    const voices = window.speechSynthesis.getVoices();
    const voice = pickVoice(voices);
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
    this.setMessage(strings.readingStep(this.steps[index].number));
    this.updateUi();
  }

  highlightStep(stepNumber) {
    document.querySelectorAll(".step-box").forEach((el) => {
      el.classList.toggle("active", el.dataset.step === String(stepNumber));
    });

    const active = document.getElementById(`step-${stepNumber}`);
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  goToFirstStep() {
    this.speakStep(0);
  }

  goToNextStep() {
    const { strings } = this.config;
    if (this.currentIndex < 0) {
      this.goToFirstStep();
      return;
    }
    if (this.currentIndex >= this.steps.length - 1) {
      this.setMessage(strings.lastStep);
      this.speakFeedback(strings.lastStep);
      return;
    }
    this.speakStep(this.currentIndex + 1);
  }

  goToPreviousStep() {
    const { strings } = this.config;
    if (this.currentIndex <= 0) {
      this.setMessage(strings.firstStep);
      this.speakFeedback(strings.firstStep);
      if (this.currentIndex < 0) this.goToFirstStep();
      return;
    }
    this.speakStep(this.currentIndex - 1);
  }

  goToStepNumber(stepNumber) {
    const { strings } = this.config;
    const index = this.steps.findIndex((s) => s.number === stepNumber);
    if (index === -1) {
      const message = strings.noStep(stepNumber, this.steps.length);
      this.setMessage(message);
      this.speakFeedback(message);
      return;
    }
    this.speakStep(index);
  }

  speakFeedback(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.lang;
    window.speechSynthesis.speak(utterance);
  }

  handleCommand(rawText) {
    const { commands, normalizeCommand } = this.config;
    const text = normalizeCommand(rawText);
    const rawLower = rawText.toLowerCase();

    const matchesGoToStep = commands.goToStepPatterns.some((pattern) =>
      pattern.test(rawLower)
    );
    if (matchesGoToStep && !commands.goToStepExclude.test(rawLower)) {
      const stepNum = commands.parseStepNumber(rawText);
      if (stepNum !== null) {
        this.goToStepNumber(stepNum);
        return;
      }
    }

    if (commands.start.some((cmd) => text.includes(normalizeCommand(cmd)))) {
      this.goToFirstStep();
      return;
    }

    if (commands.next.some((cmd) => text.includes(normalizeCommand(cmd)))) {
      this.goToNextStep();
      return;
    }

    if (commands.prev.some((cmd) => text.includes(normalizeCommand(cmd)))) {
      this.goToPreviousStep();
      return;
    }

    if (commands.stop.some((cmd) => text.includes(normalizeCommand(cmd)))) {
      this.stopSpeaking();
      this.setMessage(this.config.strings.stopped);
      return;
    }

    if (commands.repeat.some((cmd) => text.includes(normalizeCommand(cmd)))) {
      if (this.currentIndex >= 0) {
        this.speakStep(this.currentIndex);
      } else {
        this.goToFirstStep();
      }
    }
  }

  setMessage(message) {
    this.statusMessage.textContent = message;
  }

  updateUi() {
    const { strings } = this.config;
    const speaking = window.speechSynthesis.speaking;
    this.statusSpeaking.classList.toggle("hidden", !speaking);
    this.statusListening.classList.toggle("hidden", !this.isListening);
    this.statusListening.textContent = strings.listening;
    this.statusSpeaking.textContent = strings.speaking;
  }
}

function init() {
  const config = window.RECIPE_VOICE_CONFIG;
  if (!config) return;

  if (!window.speechSynthesis) {
    const el = document.getElementById("status-message");
    if (el) el.textContent = config.strings.noSynthesis;
    return;
  }

  const welcomeEl = document.getElementById("status-message");
  if (welcomeEl) welcomeEl.textContent = config.strings.welcome;

  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

  new RecipeVoiceController(config);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

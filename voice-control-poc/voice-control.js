/**
 * Web Speech API POC — recipe step TTS + voice commands (locale via RECIPE_VOICE_CONFIG)
 */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const LKK_PRODUCT_IMAGES = {
  garlic:
    "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/minced-garlic.jpg?w=80&h=80",
  oyster:
    "https://cdn-akamai.lkk.com/-/media/hk-site---homecook/premium-oyster-sauce-510g-tran.png?w=80&h=80",
};

function attachProductImages(products) {
  return (products || []).map((product) => {
    if (product.image) return product;
    const label = `${product.category} ${product.name}`;
    if (/蒜|garlic/i.test(label)) return { ...product, image: LKK_PRODUCT_IMAGES.garlic };
    if (/蠔|oyster/i.test(label)) return { ...product, image: LKK_PRODUCT_IMAGES.oyster };
    return product;
  });
}

class RecipeVoiceController {
  constructor(config) {
    this.config = config;
    this.variants = config.variants || { default: { id: "default", label: "Default", steps: config.steps || [] } };
    this.currentVariantId = "default";
    this.steps = this.variants.default.steps;
    this.currentIndex = -1;
    this.isListening = false;
    this.recognition = null;

    this.stepsList = document.getElementById("steps-list");
    this.ingredientsContent = document.getElementById("ingredients-content");
    this.prepTitle = document.getElementById("prep-title");
    this.stepsTitle = document.getElementById("steps-title");
    this.stepGuide = document.getElementById("step-guide");
    this.stepGuideTitle = document.getElementById("step-guide-title");
    this.stepGuideLabel = document.getElementById("step-guide-label");
    this.stepGuideImage = document.getElementById("step-guide-image");
    this.versionNote = document.getElementById("version-note");
    this.versionButtons = document.querySelectorAll(".version-btn");
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
    this.renderIngredients();
    this.applyStaticLabels();
    this.updateVersionUi();
    this.bindUi();
    this.setupRecognition();
    this.updateUi();
  }

  getVariant(id) {
    return this.variants[id] || this.variants.default;
  }

  applyStaticLabels() {
    const { strings } = this.config;
    if (this.prepTitle) this.prepTitle.textContent = strings.prepTitle || "";
    if (this.stepsTitle) this.stepsTitle.textContent = strings.stepsTitle || "";
    if (this.stepGuideTitle) this.stepGuideTitle.textContent = strings.stepGuideTitle || "";
    this.updateStepGuide();
  }

  applyVariantState(variantId, announce) {
    const variant = this.getVariant(variantId);
    this.stopSpeaking();
    this.currentVariantId = variantId;
    this.steps = variant.steps;
    this.currentIndex = -1;
    this.renderSteps();
    this.renderIngredients();
    this.updateVersionUi();

    const message = this.config.strings.switchedVersion(variant.label);
    this.setMessage(message);
    if (announce) this.speakFeedback(message);
  }

  renderIngredients() {
    const variant = this.getVariant(this.currentVariantId);
    const data = variant.ingredients;
    const { strings } = this.config;

    if (!data || !this.ingredientsContent) return;

    const sectionsHtml = data.sections
      .map((section) => {
        const itemsHtml = section.items
          .map((item) => {
            const badge = item.changed
              ? `<span class="changed-badge">${strings.changedBadge}</span>`
              : "";
            const changedClass = item.changed ? " changed" : "";
            return `<li class="ingredient-item${changedClass}">${badge}${item.text}</li>`;
          })
          .join("");

        return `
          <div class="ingredient-box">
            <h3>${section.title}</h3>
            <ul class="ingredient-list">${itemsHtml}</ul>
          </div>
        `;
      })
      .join("");

    const productsHtml = (data.lkkProducts || [])
      .map((product) => {
        const changedClass = product.changed ? " changed" : "";
        const badge = product.changed
          ? `<span class="changed-badge">${strings.changedBadge}</span>`
          : "";
        const thumb = product.image
          ? `<img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy">`
          : `<div class="product-thumb placeholder" aria-hidden="true">LKK</div>`;

        return `
          <div class="lkk-product-card${changedClass}">
            ${badge}
            ${thumb}
            <div class="product-desc">
              <p class="product-category">${product.category}</p>
              <p class="product-name">${product.name}</p>
            </div>
          </div>
        `;
      })
      .join("");

    this.ingredientsContent.innerHTML = `
      <div class="ingredient-boxes">${sectionsHtml}</div>
      <div class="lkk-products-wrap">
        <h3 class="lkk-products-heading">${strings.lkkProductsTitle}</h3>
        <div class="lkk-products">${productsHtml}</div>
      </div>
    `;
  }

  renderSteps() {
    this.stepsList.innerHTML = this.steps
      .map((step) => {
        const thumb = step.image
          ? `<img src="${step.image}" alt="${step.imageAlt || ""}" class="step-thumb" loading="lazy">`
          : "";

        return `<li class="step-box" data-step="${step.number}" id="step-${step.number}">
            <div class="step-content">
              ${thumb}
              <div class="step-body">
                <span class="step-number" aria-hidden="true">${step.number}</span>
                <span class="step-text">${step.text}</span>
              </div>
            </div>
          </li>`;
      })
      .join("");

    this.updateStepGuide();
  }

  getActiveStep() {
    if (this.currentIndex < 0 || this.currentIndex >= this.steps.length) return null;
    return this.steps[this.currentIndex];
  }

  updateStepGuide(stepNumber) {
    const { strings } = this.config;
    if (!this.stepGuide || !this.stepGuideImage) return;

    const step =
      stepNumber !== undefined
        ? this.steps.find((s) => s.number === stepNumber)
        : this.getActiveStep();

    if (!step || !step.image) {
      this.stepGuide.classList.add("is-idle");
      if (this.stepGuideLabel) {
        this.stepGuideLabel.textContent = strings.stepGuidePrompt || "";
      }
      if (this.stepGuideImage) {
        this.stepGuideImage.removeAttribute("src");
        this.stepGuideImage.alt = "";
      }
      return;
    }

    this.stepGuide.classList.remove("is-idle");
    if (this.stepGuideLabel) {
      this.stepGuideLabel.textContent = strings.stepGuideLabel(step.number);
    }
    this.stepGuideImage.src = step.image;
    this.stepGuideImage.alt = step.imageAlt || strings.stepGuideLabel(step.number);
  }

  updateVersionUi() {
    const variant = this.getVariant(this.currentVariantId);
    if (this.versionNote) this.versionNote.textContent = variant.note || "";

    this.versionButtons.forEach((btn) => {
      const active = btn.dataset.version === this.currentVariantId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  switchVariant(variantId, announce = true) {
    if (!this.getVariant(variantId) || variantId === this.currentVariantId) return;
    this.applyVariantState(variantId, announce);
  }

  bindUi() {
    const { commands } = this.config;
    this.micToggle.addEventListener("click", () => this.toggleListening());
    this.btnStart.addEventListener("click", () => this.handleCommand(commands.start[0]));
    this.btnPrev.addEventListener("click", () => this.handleCommand(commands.prev[0]));
    this.btnNext.addEventListener("click", () => this.handleCommand(commands.next[0]));
    this.btnStop.addEventListener("click", () => this.stopSpeaking());

    this.versionButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.switchVariant(btn.dataset.version));
    });

    this.stepsList.addEventListener("click", (event) => {
      const box = event.target.closest(".step-box");
      if (!box) return;
      const stepNumber = parseInt(box.dataset.step, 10);
      const index = this.steps.findIndex((s) => s.number === stepNumber);
      if (index !== -1) this.speakStep(index);
    });

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
    this.updateStepGuide();
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

    this.updateStepGuide(stepNumber);

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

  matchesAnyCommand(text, commands) {
    const { normalizeCommand } = this.config;
    return commands.some((cmd) => text.includes(normalizeCommand(cmd)));
  }

  handleVersionCommand(text) {
    const { commands } = this.config;

    if (this.matchesAnyCommand(text, commands.versionVegan || [])) {
      this.switchVariant("vegan");
      return true;
    }
    if (this.matchesAnyCommand(text, commands.versionHealthy || [])) {
      this.switchVariant("healthy");
      return true;
    }
    if (this.matchesAnyCommand(text, commands.versionDefault || [])) {
      this.switchVariant("default");
      return true;
    }
    return false;
  }

  handleCommand(rawText) {
    const { commands, normalizeCommand } = this.config;
    const text = normalizeCommand(rawText);
    const rawLower = rawText.toLowerCase();

    if (this.handleVersionCommand(text)) return;

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

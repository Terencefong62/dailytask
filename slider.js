(function () {
  const slider = document.querySelector('[data-chef-slider]');
  if (!slider) return;

  const viewport = slider.querySelector('[data-slider-viewport]');
  const track = slider.querySelector('[data-slider-track]');
  const prevBtn = slider.querySelector('[data-slider-prev]');
  const nextBtn = slider.querySelector('[data-slider-next]');
  const dotsContainer = document.querySelector('[data-slider-dots]');
  const cards = Array.from(track.querySelectorAll('.chef-card'));

  let currentIndex = 0;
  let slidesPerView = getSlidesPerView();
  let maxIndex = getMaxIndex();

  function getSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 640) return 1;
    if (width <= 1024) return 2;
    return 4;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - slidesPerView);
  }

  function isMobile() {
    return window.innerWidth <= 640;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const totalDots = maxIndex + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'chef-slider__dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.chef-slider__dot');
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  function getCardStep() {
    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.offsetWidth + gap;
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    if (isMobile()) {
      const card = cards[currentIndex];
      if (card) {
        viewport.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
      }
    } else {
      const offset = currentIndex * getCardStep();
      track.style.transform = `translateX(-${offset}px)`;
    }

    updateButtons();
    updateDots();
  }

  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  function onResize() {
    const prevSlides = slidesPerView;
    slidesPerView = getSlidesPerView();
    maxIndex = getMaxIndex();
    currentIndex = Math.min(currentIndex, maxIndex);

    if (prevSlides !== slidesPerView) {
      buildDots();
    }

    if (!isMobile()) {
      track.style.transform = `translateX(-${currentIndex * getCardStep()}px)`;
    }

    updateButtons();
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  if (isMobile()) {
    viewport.addEventListener('scroll', () => {
      const scrollLeft = viewport.scrollLeft;
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - scrollLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      if (closest !== currentIndex) {
        currentIndex = closest;
        updateDots();
      }
    }, { passive: true });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 150);
  });

  buildDots();
  updateButtons();
})();

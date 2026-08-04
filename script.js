const filterButtons = document.querySelectorAll('.tuner button');
const cards = document.querySelectorAll('.signal-card');
const filterLabel = document.querySelector('#filter-label');
const filterCount = document.querySelector('#filter-count');
const signalFinder = document.querySelector('.signal-finder');
const finderResult = document.querySelector('#finder-result');
let finderIndex = 0;
const setFinderLabel = (label, symbol) => {
  signalFinder.innerHTML = `${label} <span aria-hidden="true">${symbol}</span>`;
};

const tuneTo = (button) => {
  filterButtons.forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  const filter = button.dataset.filter;
  const visibleCards = [...cards].filter((card) => filter === 'all' || card.dataset.kind === filter);
  cards.forEach((card) => {
    card.classList.toggle('hidden', !visibleCards.includes(card));
    card.classList.remove('is-found');
  });
  const label = button.childNodes[0].textContent.trim().toLowerCase();
  const noun = visibleCards.length === 1 ? 'transmission' : 'transmissions';
  filterLabel.textContent = label;
  filterCount.textContent = `${visibleCards.length} ${noun}`;
  finderResult.textContent = '';
  finderIndex = 0;
  setFinderLabel('Find a signal', '↗');
};

filterButtons.forEach((button, index) => {
  button.addEventListener('click', () => tuneTo(button));
  button.addEventListener('keydown', (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + filterButtons.length) % filterButtons.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % filterButtons.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = filterButtons.length - 1;

    const nextButton = filterButtons[nextIndex];
    tuneTo(nextButton);
    nextButton.focus();
  });
});

if (signalFinder && finderResult) {
  signalFinder.addEventListener('click', () => {
    const visibleCards = [...cards].filter((card) => !card.classList.contains('hidden'));
    const chosenCard = visibleCards[finderIndex % visibleCards.length];
    const title = chosenCard.querySelector('h3').textContent;

    cards.forEach((card) => card.classList.remove('is-found'));
    chosenCard.classList.add('is-found');
    chosenCard.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    chosenCard.setAttribute('tabindex', '-1');
    chosenCard.focus({ preventScroll: true });
    finderIndex += 1;
    finderResult.textContent = ` · signal ${((finderIndex - 1) % visibleCards.length) + 1} of ${visibleCards.length}: ${title}`;
    setFinderLabel('Find next signal', '↗');
  });
}

const soundButton = document.querySelector('.sound-toggle');
let audioContext;
let oscillator;
let gain;

soundButton.addEventListener('click', () => {
  const turningOn = soundButton.getAttribute('aria-pressed') === 'false';
  soundButton.setAttribute('aria-pressed', String(turningOn));
  soundButton.querySelector('.sound-label').textContent = turningOn ? 'atmosphere on' : 'atmosphere off';

  if (turningOn) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioContext.createOscillator();
    gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 54;
    gain.gain.value = 0.018;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
  } else if (audioContext) {
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    oscillator.stop(audioContext.currentTime + 0.21);
    audioContext.close();
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

const lightButton = document.querySelector('.light-button');
const lightStatus = document.querySelector('.light-status');

if (lightButton && lightStatus) {
  lightButton.addEventListener('click', () => {
    const placed = lightButton.getAttribute('aria-pressed') === 'true';
    lightButton.setAttribute('aria-pressed', String(!placed));
    lightButton.innerHTML = placed ? 'Place a light <span aria-hidden="true">✦</span>' : 'Light placed <span aria-hidden="true">✦</span>';
    lightStatus.textContent = placed ? 'Receiver waiting at blue hour.' : 'Light received. The route has one more witness.';
  });
}

const bearingButton = document.querySelector('.bearing-button');
const bearingStatus = document.querySelector('.bearing-status');
const bearings = [
  'Follow the question with a little static around it.',
  'Turn toward the unfinished thing that keeps returning.',
  'Take the quieter route. It may still be speaking.',
  'Point at the small spark. Give it ten more minutes.'
];
let bearingIndex = 0;

if (bearingButton && bearingStatus) {
  bearingButton.addEventListener('click', () => {
    bearingStatus.textContent = bearings[bearingIndex];
    bearingIndex = (bearingIndex + 1) % bearings.length;
  });
}

const weatherButton = document.querySelector('.weather-button');
const weatherStatus = document.querySelector('.weather-status');
const weatherReadings = [
  'A clear patch is moving through. Keep one question in the open.',
  'Light pressure from the north: choose the smaller next step.',
  'Scattered brightness. A good day to leave room for an interruption.',
  'Warm front approaching. Send the unfinished note.'
];
let weatherIndex = 0;

if (weatherButton && weatherStatus) {
  weatherButton.addEventListener('click', () => {
    weatherStatus.textContent = weatherReadings[weatherIndex];
    weatherIndex = (weatherIndex + 1) % weatherReadings.length;
  });
}

const rhymeButton = document.querySelector('.rhyme-button');
const rhymeStatus = document.querySelector('.rhyme-status');

if (rhymeButton && rhymeStatus) {
  rhymeButton.addEventListener('click', () => {
    const compared = rhymeButton.getAttribute('aria-pressed') === 'true';
    rhymeButton.setAttribute('aria-pressed', String(!compared));
    rhymeButton.innerHTML = compared ? 'Compare the endings <span aria-hidden="true">⌁</span>' : 'Exact tail found <span aria-hidden="true">✓</span>';
    rhymeStatus.textContent = compared ? 'The lab is listening for a shared landing.' : 'hög / flög: exact pronunciation tail. hög / våg: not a match.';
  });
}

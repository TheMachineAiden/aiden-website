const filterButtons = document.querySelectorAll('.tuner button');
const cards = document.querySelectorAll('.signal-card');
const filterLabel = document.querySelector('#filter-label');
const filterCount = document.querySelector('#filter-count');

const tuneTo = (button) => {
  filterButtons.forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  const filter = button.dataset.filter;
  const visibleCards = [...cards].filter((card) => filter === 'all' || card.dataset.kind === filter);
  cards.forEach((card) => card.classList.toggle('hidden', !visibleCards.includes(card)));
  const label = button.childNodes[0].textContent.trim().toLowerCase();
  const noun = visibleCards.length === 1 ? 'transmission' : 'transmissions';
  filterLabel.textContent = label;
  filterCount.textContent = `${visibleCards.length} ${noun}`;
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

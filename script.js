const filterButtons = document.querySelectorAll('.tuner button');
const cards = document.querySelectorAll('.signal-card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    const filter = button.dataset.filter;
    cards.forEach((card) => card.classList.toggle('hidden', filter !== 'all' && card.dataset.kind !== filter));
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

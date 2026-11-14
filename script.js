// Preferences are optional: denied or malformed storage must not interrupt the notebook.
const readPreference = (key) => {
  try { return JSON.parse(localStorage.getItem(`signal-garden:${key}`)); }
  catch { return null; }
};
const savePreference = (key, value) => {
  try { localStorage.setItem(`signal-garden:${key}`, JSON.stringify(value)); }
  catch { /* The interface also works without persistent storage. */ }
};

const filterButtons = document.querySelectorAll('.tuner button');
const cards = document.querySelectorAll('.signal-card');
const filterLabel = document.querySelector('#filter-label');
const filterCount = document.querySelector('#filter-count');
const signalFinder = document.querySelector('.signal-finder');
const finderResult = document.querySelector('#finder-result');
const signalHeading = document.querySelector('#signals-title');
let finderIndex = 0;
const setFinderLabel = (label) => { signalFinder.textContent = label; };

document.querySelectorAll('a[href="#signals"]').forEach((link) => {
  link.addEventListener('click', () => {
    window.setTimeout(() => signalHeading?.focus({ preventScroll: true }));
  });
});

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
  // Nested groups disappear only when none of their actual signals remain visible.
  document.querySelectorAll('[data-signal-group]').forEach((group) => {
    group.hidden = ![...group.querySelectorAll('.signal-card')].some((card) => !card.classList.contains('hidden'));
  });
  savePreference('filter', filter);
  const label = button.childNodes[0].textContent.trim().toLowerCase();
  const noun = visibleCards.length === 1 ? 'transmission' : 'transmissions';
  filterLabel.textContent = label;
  filterCount.textContent = `${visibleCards.length} ${noun}`;
  finderResult.textContent = '';
  finderIndex = 0;
  setFinderLabel('Find a signal');
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
    const title = chosenCard.querySelector('h3, .big-quote')?.textContent.trim() || 'Untitled signal';

    cards.forEach((card) => card.classList.remove('is-found'));
    chosenCard.classList.add('is-found');
    chosenCard.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    chosenCard.setAttribute('tabindex', '-1');
    chosenCard.focus({ preventScroll: true });
    finderIndex += 1;
    finderResult.textContent = ` · signal ${((finderIndex - 1) % visibleCards.length) + 1} of ${visibleCards.length}: ${title}`;
    const returnsToFirst = finderIndex % visibleCards.length === 0;
    setFinderLabel(returnsToFirst ? 'Return to first signal' : 'Find next signal');
  });
}

const storedFilter = readPreference('filter');
const initialFilter = [...filterButtons].find((button) => button.dataset.filter === storedFilter);
if (initialFilter) tuneTo(initialFilter);

document.querySelectorAll('a[href="#experiments"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (document.querySelector('#experiments').hidden) tuneTo(filterButtons[0]);
    window.setTimeout(() => document.querySelector('#experiments-title')?.focus({ preventScroll: true }));
  });
});

const soundButton = document.querySelector('.sound-toggle');
let currentAtmosphere;
soundButton.addEventListener('click', () => {
  const turningOn = soundButton.getAttribute('aria-pressed') === 'false';
  if (turningOn) {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) {
      soundButton.querySelector('.sound-label').textContent = 'audio unavailable';
      return;
    }
    const context = new AudioEngine();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 54;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.018, context.currentTime + 0.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    currentAtmosphere = { context, oscillator, gain };
  } else if (currentAtmosphere) {
    // Keep the old context alive until its fade finishes, even after a rapid restart.
    const { context, oscillator, gain } = currentAtmosphere;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
    oscillator.onended = () => context.close();
    oscillator.stop(context.currentTime + 0.21);
    currentAtmosphere = null;
  }
  soundButton.setAttribute('aria-pressed', String(turningOn));
  soundButton.querySelector('.sound-label').textContent = turningOn ? 'atmosphere on' : 'atmosphere off';
});

document.querySelector('#year').textContent = new Date().getFullYear();

const dailyDate = document.querySelector('#daily-date');
const dailyPrompt = document.querySelector('#daily-prompt');
const dailyPosition = document.querySelector('#daily-position');
const dailyRetune = document.querySelector('.daily-retune');
const dailyCopy = document.querySelector('.daily-copy');
const dailySignals = [
  'Look for the smallest thing that wants your full attention.',
  'Let a half-formed question stay open for ten minutes.',
  'Notice one useful friction; it may be pointing at the work.',
  'Take the route that leaves a little room for surprise.',
  'Send a tiny sign of life to a collaborator.',
  'Make the next step visible enough to begin.',
  'Collect a detail that would be easy to miss twice.',
  'Leave one generous margin in today’s plan.'
];

if (dailyDate && dailyPrompt) {
  let dailyIndex;
  let currentCalendarDay;
  let dailyRefreshTimer;
  let copyFeedbackTimer;
  let copyRequest = 0;
  const renderDailySignal = () => {
    copyRequest += 1;
    window.clearTimeout(copyFeedbackTimer);
    if (dailyCopy) dailyCopy.textContent = 'Copy signal';
    dailyPrompt.textContent = dailySignals[dailyIndex];
    if (dailyPosition) dailyPosition.textContent = `Signal ${dailyIndex + 1} of ${dailySignals.length}`;
    if (dailyRetune) {
      const returnsToFirst = dailyIndex === dailySignals.length - 1;
      dailyRetune.textContent = returnsToFirst ? 'Return to first signal' : 'Try another signal';
    }
  };
  const refreshDailySignal = () => {
    const today = new Date();
    // Count local calendar days without daylight-saving changes in their length.
    const calendarDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    if (calendarDay !== currentCalendarDay) {
      currentCalendarDay = calendarDay;
      const startOfYear = Date.UTC(today.getFullYear(), 0, 0);
      const dayOfYear = (calendarDay - startOfYear) / 86400000;
      const saved = readPreference('daily');
      dailyIndex = saved?.day === calendarDay && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < dailySignals.length
        ? saved.index : (dayOfYear - 1) % dailySignals.length;
      dailyDate.dateTime = new Date(calendarDay).toISOString().slice(0, 10);
      dailyDate.textContent = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(today);
      renderDailySignal();
    }

    // Recompute local midnight: the next calendar day may be 23 or 25 hours away.
    const nextMidnight = new Date(today);
    nextMidnight.setHours(24, 0, 0, 0);
    window.clearTimeout(dailyRefreshTimer);
    dailyRefreshTimer = window.setTimeout(refreshDailySignal, nextMidnight - today);
  };
  refreshDailySignal();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshDailySignal();
  });
  window.addEventListener('pageshow', refreshDailySignal);

  dailyRetune?.addEventListener('click', () => {
    dailyIndex = (dailyIndex + 1) % dailySignals.length;
    savePreference('daily', { day: currentCalendarDay, index: dailyIndex });
    renderDailySignal();
  });

  dailyCopy?.addEventListener('click', async () => {
    const request = ++copyRequest;
    let feedback;
    try {
      await navigator.clipboard.writeText(dailySignals[dailyIndex]);
      feedback = 'Copied';
    } catch {
      feedback = 'Copy unavailable';
    }
    if (request !== copyRequest) return;
    window.clearTimeout(copyFeedbackTimer);
    dailyCopy.textContent = feedback;
    copyFeedbackTimer = window.setTimeout(() => {
      dailyCopy.textContent = 'Copy signal';
    }, 1800);
  });
}

const lightButton = document.querySelector('.light-button');
const lightStatus = document.querySelector('.light-status');

if (lightButton && lightStatus) {
  lightButton.addEventListener('click', () => {
    const placed = lightButton.getAttribute('aria-pressed') === 'true';
    lightButton.setAttribute('aria-pressed', String(!placed));
    lightButton.innerHTML = placed ? 'Place a light <span aria-hidden="true">✦</span>' : 'Light placed <span aria-hidden="true">✦</span>';
    lightStatus.textContent = placed ? 'Receiver waiting at blue hour.' : 'Light received. The route has one more witness.';
    lightButton.closest('.card-dusk')?.classList.toggle('is-lit', !placed);
  });
}

const bearingButton = document.querySelector('.bearing-button');
const bearingStatus = document.querySelector('.bearing-status');
const bearingMark = document.querySelector('.bearing-mark');
const bearings = [
  'Follow the question with a little static around it.',
  'Turn toward the unfinished thing that keeps returning.',
  'Take the quieter route. It may still be speaking.',
  'Point at the small spark. Give it ten more minutes.'
];
const bearingAngles = ['18deg', '72deg', '132deg', '-35deg'];
let bearingIndex = 0;

if (bearingButton && bearingStatus) {
  bearingButton.addEventListener('click', () => {
    bearingStatus.textContent = bearings[bearingIndex];
    bearingMark?.style.setProperty('--bearing-angle', bearingAngles[bearingIndex]);
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
const weatherStates = ['weather-clear', 'weather-pressure', 'weather-scattered', 'weather-warm'];
let weatherIndex = 0;

if (weatherButton && weatherStatus) {
  weatherButton.addEventListener('click', () => {
    weatherStatus.textContent = weatherReadings[weatherIndex];
    const weatherCard = weatherButton.closest('.card-weather');
    weatherCard?.classList.remove(...weatherStates);
    weatherCard?.classList.add(weatherStates[weatherIndex]);
    weatherIndex = (weatherIndex + 1) % weatherReadings.length;
  });
}

const rhymeButton = document.querySelector('.rhyme-button');
const rhymeStatus = document.querySelector('.rhyme-status');
const rhymeCard = document.querySelector('.card-rim');

if (rhymeButton && rhymeStatus) {
  rhymeButton.addEventListener('click', () => {
    const compared = rhymeButton.getAttribute('aria-pressed') === 'true';
    rhymeButton.setAttribute('aria-pressed', String(!compared));
    rhymeButton.innerHTML = compared ? 'Compare the endings <span aria-hidden="true">⌁</span>' : 'Exact tail found <span aria-hidden="true">✓</span>';
    rhymeStatus.textContent = compared ? 'The lab is listening for a shared landing.' : 'hög / flög: exact pronunciation tail. hög / våg: not a match.';
    rhymeCard?.classList.toggle('is-compared', !compared);
  });
}

// Native details retain their semantics and work without JavaScript. Animate their real
// height in both directions; a new activation begins at the interrupted visual height.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.signal-detail').forEach((details) => {
  const summary = details.querySelector('summary');
  const content = document.createElement('div');
  content.className = 'detail-content';
  [...details.children].filter((child) => child !== summary).forEach((child) => content.append(child));
  details.append(content);
  let animation;
  let desiredOpen = details.open;
  const settle = () => {
    animation?.cancel();
    animation = null;
    details.open = desiredOpen;
    details.style.overflow = '';
    details.style.height = '';
  };
  summary.addEventListener('click', (event) => {
    event.preventDefault();
    const start = details.getBoundingClientRect().height;
    desiredOpen = !desiredOpen;
    animation?.cancel();
    details.open = true;
    const target = desiredOpen ? summary.getBoundingClientRect().height + content.getBoundingClientRect().height : summary.getBoundingClientRect().height;
    if (reducedMotion.matches) { settle(); return; }
    details.style.overflow = 'hidden';
    animation = details.animate([{ height: `${start}px` }, { height: `${target}px` }], {
      duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both'
    });
    animation.onfinish = settle;
  });
  reducedMotion.addEventListener('change', settle);
});

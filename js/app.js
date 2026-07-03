const STORAGE_KEY = 'courtmotion-step-demo-state-v2';

const playerImages = {
  male: {
    right: 'assets/players/male-right.png',
    left: 'assets/players/male-left.png'
  },
  female: {
    right: 'assets/players/female-right.png',
    left: 'assets/players/female-left.png'
  }
};

const playerHeadshots = {
  male: {
    right: 'assets/players/male-right-headshot.png',
    left: 'assets/players/male-left-headshot.png'
  },
  female: {
    right: 'assets/players/female-right-headshot.png',
    left: 'assets/players/female-left-headshot.png'
  }
};

const players = {
  male: [
    {rank: 1, name: 'Jannik Sinner', country: 'Italy', flag: '🇮🇹', wiki: 'Jannik_Sinner'},
    {rank: 2, name: 'Carlos Alcaraz', country: 'Spain', flag: '🇪🇸', wiki: 'Carlos_Alcaraz'},
    {rank: 3, name: 'Alexander Zverev', country: 'Germany', flag: '🇩🇪', wiki: 'Alexander_Zverev'},
    {rank: 4, name: 'Felix Auger-Aliassime', country: 'Canada', flag: '🇨🇦', wiki: 'Félix_Auger-Aliassime'},
    {rank: 5, name: 'Ben Shelton', country: 'United States', flag: '🇺🇸', wiki: 'Ben_Shelton'},
    {rank: 6, name: 'Alex de Minaur', country: 'Australia', flag: '🇦🇺', wiki: 'Alex_de_Minaur'},
    {rank: 7, name: 'Taylor Fritz', country: 'United States', flag: '🇺🇸', wiki: 'Taylor_Fritz'},
    {rank: 8, name: 'Novak Djokovic', country: 'Serbia', flag: '🇷🇸', wiki: 'Novak_Djokovic'},
    {rank: 9, name: 'Daniil Medvedev', country: 'Russia', flag: '🇷🇺', wiki: 'Daniil_Medvedev'},
    {rank: 10, name: 'Flavio Cobolli', country: 'Italy', flag: '🇮🇹', wiki: 'Flavio_Cobolli'}
  ],
  female: [
    {rank: 1, name: 'Aryna Sabalenka', country: 'Belarus', flag: '🇧🇾', wiki: 'Aryna_Sabalenka'},
    {rank: 2, name: 'Elena Rybakina', country: 'Kazakhstan', flag: '🇰🇿', wiki: 'Elena_Rybakina'},
    {rank: 3, name: 'Iga Swiatek', country: 'Poland', flag: '🇵🇱', wiki: 'Iga_Świątek'},
    {rank: 4, name: 'Jessica Pegula', country: 'United States', flag: '🇺🇸', wiki: 'Jessica_Pegula'},
    {rank: 5, name: 'Mirra Andreeva', country: 'Russia', flag: '🇷🇺', wiki: 'Mirra_Andreeva'},
    {rank: 6, name: 'Amanda Anisimova', country: 'United States', flag: '🇺🇸', wiki: 'Amanda_Anisimova'},
    {rank: 7, name: 'Coco Gauff', country: 'United States', flag: '🇺🇸', wiki: 'Coco_Gauff'},
    {rank: 8, name: 'Elina Svitolina', country: 'Ukraine', flag: '🇺🇦', wiki: 'Elina_Svitolina'},
    {rank: 9, name: 'Karolina Muchova', country: 'Czech Republic', flag: '🇨🇿', wiki: 'Karolína_Muchová'},
    {rank: 10, name: 'Victoria Mboko', country: 'Canada', flag: '🇨🇦', wiki: 'Victoria_Mboko'}
  ]
};

const defaultState = {
  age: 25,
  gender: 'male',
  hand: 'right',
  playingStyle: 'All-Around Player',
  selectedPlayer: 'Jannik Sinner',
  cameraConnected: false,
  cameraChecked: false,
  watchConnected: false,
  analysisComplete: false,
  theme: 'dark'
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {...defaultState, ...(parsed || {})};
  } catch (_) {
    return {...defaultState};
  }
}

function saveState(patch = {}) {
  state = {...state, ...patch};
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateAllVisibleState();
}

let state = readState();

function currentPlayers() {
  return players[state.gender] || players.male;
}

function getSelectedPlayerObject() {
  return currentPlayers().find(p => p.name === state.selectedPlayer) || currentPlayers()[0];
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function prettyGender(short = false) {
  if (short) return state.gender === 'male' ? 'Male' : 'Female';
  return state.gender === 'male' ? 'Male Tennis Player' : 'Female Tennis Player';
}

function prettyHand() {
  return state.hand === 'right' ? 'Right hand' : 'Left hand';
}

function characterImage() {
  return playerImages[state.gender]?.[state.hand] || playerImages.male.right;
}

function characterHeadshot() {
  return playerHeadshots[state.gender]?.[state.hand] || playerHeadshots.male.right;
}

function setupTheme() {
  document.body.classList.toggle('light-mode', state.theme === 'light');
  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(state.theme === 'light'));
    themeToggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      document.body.classList.toggle('light-mode', nextTheme === 'light');
      themeToggle.setAttribute('aria-pressed', String(nextTheme === 'light'));
    });
  }
}

function updateSegmentedButtons() {
  $$('[data-set="gender"]').forEach(btn => {
    const isActive = btn.dataset.value === state.gender;
    btn.classList.toggle('is-selected', isActive);
    btn.classList.toggle('is-active', isActive);
  });
  $$('[data-set="hand"]').forEach(btn => {
    btn.classList.toggle('is-selected', btn.dataset.value === state.hand);
  });
}

function ensureSelectedPlayer() {
  if (!currentPlayers().some(p => p.name === state.selectedPlayer)) {
    state.selectedPlayer = currentPlayers()[0].name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function updateAllVisibleState() {
  ensureSelectedPlayer();
  updateSegmentedButtons();

  const imagePath = characterImage();
  ['#athletePreview', '#deviceAthlete', '#reportAthlete'].forEach(selector => {
    const img = $(selector);
    if (img) img.src = imagePath;
  });
  const miniAthlete = $('#miniAthlete');
  if (miniAthlete) miniAthlete.src = characterHeadshot();

  const ageSelect = $('#ageSelect');
  if (ageSelect) ageSelect.value = String(state.age);
  const styleSelect = $('#styleSelect');
  if (styleSelect) styleSelect.value = state.playingStyle;

  const shortProfile = `${prettyGender(true)} · ${prettyHand()}`;
  const previewTitle = $('#previewTitle');
  if (previewTitle) previewTitle.textContent = shortProfile;
  const previewText = $('#previewText');
  if (previewText) previewText.textContent = `${state.playingStyle} profile using the ${prettyHand().toLowerCase()} character image.`;

  const summaryTitle = $('#selectionSummaryTitle');
  if (summaryTitle) summaryTitle.textContent = shortProfile;
  const summaryText = $('#selectionSummaryText');
  if (summaryText) summaryText.textContent = `${state.playingStyle} · model: ${getSelectedPlayerObject().name}`;

  const devicePreviewTitle = $('#devicePreviewTitle');
  if (devicePreviewTitle) devicePreviewTitle.textContent = shortProfile;
  const devicePreviewText = $('#devicePreviewText');
  if (devicePreviewText) devicePreviewText.textContent = `Model: ${getSelectedPlayerObject().name}`;

  const reportPlayer = $('#reportPlayer');
  if (reportPlayer) reportPlayer.textContent = prettyGender(false);
  const reportDate = $('#reportDate');
  if (reportDate) reportDate.textContent = new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
  const reportModel = $('#reportModel');
  if (reportModel) reportModel.textContent = getSelectedPlayerObject().name;
  const reportHand = $('#reportHand');
  if (reportHand) reportHand.textContent = prettyHand();
  const reportStyle = $('#reportStyle');
  if (reportStyle) reportStyle.textContent = state.playingStyle;
  const overallScore = $('#overallScore');
  if (overallScore) overallScore.textContent = state.gender === 'female' ? '8.5' : '8.3';

  updateDeviceStatusUI();
}

function populateAges() {
  const select = $('#ageSelect');
  if (!select || select.options.length) return;
  for (let age = 8; age <= 80; age += 1) {
    const option = document.createElement('option');
    option.value = String(age);
    option.textContent = String(age);
    select.appendChild(option);
  }
}

function bindStateButtons() {
  $$('[data-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.set;
      const value = btn.dataset.value;
      const patch = {[key]: value};
      if (key === 'gender') patch.selectedPlayer = players[value][0].name;
      saveState(patch);
      if (document.body.dataset.page === 'players') renderPlayers();
    });
  });
}

function initProfilePage() {
  populateAges();
  const form = $('#profileForm');
  if (!form) return;

  $('#ageSelect').addEventListener('change', event => saveState({age: Number(event.target.value)}));
  $('#styleSelect').addEventListener('change', event => saveState({playingStyle: event.target.value}));

  form.addEventListener('submit', event => {
    event.preventDefault();
    window.location.href = 'player-style.html';
  });
}

function wikiSummaryUrl(pageTitle) {
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
}

async function loadWikiThumbnail(img, fallback, player) {
  try {
    const response = await fetch(wikiSummaryUrl(player.wiki), {cache: 'force-cache'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const src = data.thumbnail?.source || data.originalimage?.source;
    if (!src) throw new Error('No thumbnail');
    img.src = src;
    img.alt = `${player.name} thumbnail`;
    img.hidden = false;
    fallback.hidden = true;
  } catch (_) {
    img.hidden = true;
    fallback.hidden = false;
  }
}

function renderPlayers() {
  const grid = $('#playersGrid');
  if (!grid) return;
  ensureSelectedPlayer();
  grid.innerHTML = '';

  currentPlayers().forEach(player => {
    const card = document.createElement('button');
    card.className = 'player-card';
    card.type = 'button';
    card.classList.toggle('is-selected', state.selectedPlayer === player.name);
    card.setAttribute('aria-label', `Select ${player.name}`);

    const img = document.createElement('img');
    img.className = 'player-photo';
    img.hidden = true;

    const fallback = document.createElement('div');
    fallback.className = 'player-fallback';
    fallback.textContent = player.name;

    const meta = document.createElement('span');
    meta.className = 'player-meta';
    meta.innerHTML = `
      <span class="player-rank">${player.rank}</span>
      <span class="player-name">${player.name}</span>
      <span class="player-country">${player.flag} ${player.country}</span>
    `;

    card.append(img, fallback, meta);
    card.addEventListener('click', () => {
      saveState({selectedPlayer: player.name});
      renderPlayers();
    });
    grid.appendChild(card);
    loadWikiThumbnail(img, fallback, player);
  });

  const rankingNote = $('#rankingNote');
  if (rankingNote) {
    rankingNote.textContent = state.gender === 'male'
      ? 'ATP Top 10 model list. Player cards stay square and show full names.'
      : 'WTA Top 10 model list. Player cards stay square and show full names.';
  }
}

function initPlayersPage() {
  if ($('#playersGrid')) renderPlayers();
}

function updateDeviceStatusUI() {
  const cameraStatus = $('#cameraStatus');
  const watchStatus = $('#watchStatus');
  const cameraOn = Boolean(state.cameraConnected);
  const watchOn = Boolean(state.watchConnected);

  if (cameraStatus) {
    cameraStatus.textContent = cameraOn ? 'On / Connected' : 'Off';
    cameraStatus.className = `device-status ${cameraOn ? 'connected' : 'pending'}`;
  }
  if (watchStatus) {
    watchStatus.textContent = watchOn ? 'On / Connected' : 'Off';
    watchStatus.className = `device-status ${watchOn ? 'connected' : 'pending'}`;
  }

  const cameraDevice = $('#cameraDevice');
  if (cameraDevice) cameraDevice.classList.toggle('connected', cameraOn);
  const watchDevice = $('#watchDevice');
  if (watchDevice) watchDevice.classList.toggle('connected', watchOn);

  const cameraBtn = $('#cameraBtn');
  if (cameraBtn) {
    cameraBtn.classList.toggle('is-on', cameraOn);
    cameraBtn.setAttribute('aria-checked', String(cameraOn));
    const label = $('b', cameraBtn);
    if (label) label.textContent = cameraOn ? 'On' : 'Off';
  }

  const watchBtn = $('#watchBtn');
  if (watchBtn) {
    watchBtn.classList.toggle('is-on', watchOn);
    watchBtn.setAttribute('aria-checked', String(watchOn));
    const label = $('b', watchBtn);
    if (label) label.textContent = watchOn ? 'On' : 'Off';
  }

  const cameraHint = $('#cameraHint');
  if (cameraHint) {
    cameraHint.textContent = cameraOn
      ? 'Camera is on and ready to capture serve, forehand, backhand, and footwork movement.'
      : 'Toggle on to simulate camera capture for serve, forehand, backhand, and footwork movement.';
  }

  const watchHint = $('#watchHint');
  if (watchHint) {
    watchHint.textContent = watchOn
      ? 'Smart watch is on and tracking heart rate, acceleration, wrist rotation, and session intensity.'
      : 'Toggle on to simulate heart rate, acceleration, wrist rotation, and session intensity tracking.';
  }

  const analysisHint = $('#analysisHint');
  if (analysisHint) {
    const camera = cameraOn ? 'camera on' : 'camera off';
    const watch = watchOn ? 'smart watch on' : 'smart watch off';
    analysisHint.textContent = `Current status: ${camera}; ${watch}. The demo report can still be generated.`;
  }
}

function toggleCamera() {
  saveState({cameraConnected: !state.cameraConnected, cameraChecked: true});
}

function toggleWatch() {
  saveState({watchConnected: !state.watchConnected});
}

function initDevicesPage() {
  const cameraBtn = $('#cameraBtn');
  if (cameraBtn) cameraBtn.addEventListener('click', toggleCamera);
  const watchBtn = $('#watchBtn');
  if (watchBtn) watchBtn.addEventListener('click', toggleWatch);
  const finishBtn = $('#finishBtn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      saveState({analysisComplete: true});
      window.location.href = 'report.html';
    });
  }
}

function initReportPage() {
  const downloadBtn = $('#downloadBtn');
  if (downloadBtn) downloadBtn.addEventListener('click', () => window.print());
}

function resetApp() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({...defaultState}));
  window.location.href = 'index.html';
}

function initCommon() {
  setupTheme();
  bindStateButtons();
  const restartBtn = $('#restartBtn');
  if (restartBtn) restartBtn.addEventListener('click', resetApp);
}

function init() {
  initCommon();
  initProfilePage();
  initPlayersPage();
  initDevicesPage();
  initReportPage();
  updateAllVisibleState();
}

document.addEventListener('DOMContentLoaded', init);

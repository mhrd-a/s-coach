const STORAGE_KEY = 'supercoach-step-demo-state-v2';

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
  height: 175,
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

let state = readState();
let trainingTimerId = null;
let trainingStartTime = null;
let countdownBusy = false;

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

function currentPlayers() {
  return players[state.gender] || players.male;
}

function getSelectedPlayerObject() {
  return currentPlayers().find(p => p.name === state.selectedPlayer) || currentPlayers()[0];
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
      state = {...state, theme: nextTheme};
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
  const heightSelect = $('#heightSelect');
  if (heightSelect) heightSelect.value = String(state.height);
  const styleSelect = $('#styleSelect');
  if (styleSelect) styleSelect.value = state.playingStyle;

  const shortProfile = `${prettyGender(true)} · ${prettyHand()}`;
  const previewTitle = $('#previewTitle');
  if (previewTitle) previewTitle.textContent = shortProfile;
  const previewText = $('#previewText');
  if (previewText) previewText.textContent = `${state.age} years old · ${state.height} cm · ${state.playingStyle} profile using the ${prettyHand().toLowerCase()} character image.`;

  const summaryTitle = $('#selectionSummaryTitle');
  if (summaryTitle) summaryTitle.textContent = shortProfile;
  const summaryText = $('#selectionSummaryText');
  if (summaryText) summaryText.textContent = `${state.playingStyle} · model: ${getSelectedPlayerObject().name}`;

  const reportPlayer = $('#reportPlayer');
  if (reportPlayer) reportPlayer.textContent = prettyGender(false);
  const reportDate = $('#reportDate');
  if (reportDate) reportDate.textContent = new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
  const reportModel = $('#reportModel');
  if (reportModel) reportModel.textContent = getSelectedPlayerObject().name;
  const reportHand = $('#reportHand');
  if (reportHand) reportHand.textContent = prettyHand();
  const reportHeight = $('#reportHeight');
  if (reportHeight) reportHeight.textContent = `${state.height} cm`;
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

function populateHeights() {
  const select = $('#heightSelect');
  if (!select || select.options.length) return;
  for (let cm = 120; cm <= 220; cm += 1) {
    const option = document.createElement('option');
    option.value = String(cm);
    option.textContent = `${cm} cm`;
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
  populateHeights();
  const form = $('#profileForm');
  if (!form) return;

  $('#ageSelect')?.addEventListener('change', event => saveState({age: Number(event.target.value)}));
  $('#heightSelect')?.addEventListener('change', event => saveState({height: Number(event.target.value)}));
  $('#styleSelect')?.addEventListener('change', event => saveState({playingStyle: event.target.value}));

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
    fallback.setAttribute('aria-label', player.name);
    fallback.textContent = '';

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
      ? 'Camera is on and ready to record serve, forehand, backhand, and footwork movement.'
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
    analysisHint.textContent = `Current status: ${camera}; ${watch}. Start the countdown when the athlete is ready.`;
  }
}

function toggleCamera() {
  saveState({cameraConnected: !state.cameraConnected, cameraChecked: true});
}

function toggleWatch() {
  saveState({watchConnected: !state.watchConnected});
}

function setTrainingUI(active) {
  const preTrainingPanel = $('#preTrainingPanel');
  const trainingPanel = $('#trainingPanel');
  if (preTrainingPanel) preTrainingPanel.hidden = active;
  if (trainingPanel) trainingPanel.hidden = !active;
  document.body.classList.toggle('is-training', active);
}

function formatTrainingTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function startRecordingSession() {
  setTrainingUI(true);
  trainingStartTime = Date.now();
  const timer = $('#trainingTimer');
  if (timer) timer.textContent = '00:00';
  window.clearInterval(trainingTimerId);
  trainingTimerId = window.setInterval(() => {
    if (timer) timer.textContent = formatTrainingTime(Date.now() - trainingStartTime);
  }, 1000);
}

function startTrainingCountdown() {
  if (countdownBusy) return;
  countdownBusy = true;
  const overlay = $('#countdownOverlay');
  const number = $('#countdownNumber');
  const startButton = $('#startTrainingBtn');
  if (startButton) startButton.disabled = true;

  if (!overlay || !number) {
    startRecordingSession();
    countdownBusy = false;
    if (startButton) startButton.disabled = false;
    return;
  }

  const steps = ['3', '2', '1', 'Go!'];
  let index = 0;
  number.textContent = steps[index];
  overlay.hidden = false;

  const interval = window.setInterval(() => {
    index += 1;
    if (index < steps.length) {
      number.textContent = steps[index];
      number.classList.remove('pulse');
      window.requestAnimationFrame(() => number.classList.add('pulse'));
      return;
    }
    window.clearInterval(interval);
    overlay.hidden = true;
    countdownBusy = false;
    if (startButton) startButton.disabled = false;
    startRecordingSession();
  }, 900);
}

function finishTraining() {
  window.clearInterval(trainingTimerId);
  saveState({analysisComplete: true});
  window.location.href = 'report.html';
}

function initDevicesPage() {
  const cameraBtn = $('#cameraBtn');
  if (cameraBtn) cameraBtn.addEventListener('click', toggleCamera);
  const watchBtn = $('#watchBtn');
  if (watchBtn) watchBtn.addEventListener('click', toggleWatch);
  const startTrainingBtn = $('#startTrainingBtn');
  if (startTrainingBtn) startTrainingBtn.addEventListener('click', startTrainingCountdown);
  const finishTrainingBtn = $('#finishTrainingBtn');
  if (finishTrainingBtn) finishTrainingBtn.addEventListener('click', finishTraining);
}

function normalizeAssetKey(src) {
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  try {
    const url = new URL(src, window.location.href);
    const marker = '/assets/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex >= 0) return `assets/${url.pathname.slice(markerIndex + marker.length)}`;
  } catch (_) {}
  const cleaned = src.replace(/^\.\//, '').split('?')[0].split('#')[0];
  const markerIndex = cleaned.indexOf('assets/');
  return markerIndex >= 0 ? cleaned.slice(markerIndex) : cleaned;
}

function replaceImageSourcesWithInlineAssets(clone, original) {
  const cloneImages = $$('img', clone);
  const originalImages = $$('img', original);
  cloneImages.forEach((img, index) => {
    const originalImg = originalImages[index];
    const key = normalizeAssetKey(originalImg?.getAttribute('src') || originalImg?.src || img.getAttribute('src'));
    const dataUri = window.SUPERCOACH_ASSETS?.[key];
    if (dataUri) {
      img.setAttribute('src', dataUri);
      img.removeAttribute('srcset');
      img.removeAttribute('loading');
      img.setAttribute('crossorigin', 'anonymous');
    }
  });
}

function inlineComputedStyles(sourceNode, cloneNode) {
  if (!(sourceNode instanceof Element) || !(cloneNode instanceof Element)) return;
  const computed = window.getComputedStyle(sourceNode);
  let cssText = '';
  for (let i = 0; i < computed.length; i += 1) {
    const prop = computed[i];
    cssText += `${prop}:${computed.getPropertyValue(prop)};`;
  }
  cloneNode.setAttribute('style', cssText);
  const sourceChildren = [...sourceNode.children];
  const cloneChildren = [...cloneNode.children];
  cloneChildren.forEach((child, index) => inlineComputedStyles(sourceChildren[index], child));
}

function makeReportCloneForExport(sheet) {
  const rect = sheet.getBoundingClientRect();
  const clone = sheet.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  inlineComputedStyles(sheet, clone);
  replaceImageSourcesWithInlineAssets(clone, sheet);
  clone.style.width = `${Math.ceil(rect.width)}px`;
  clone.style.height = `${Math.ceil(rect.height)}px`;
  clone.style.margin = '0';
  clone.style.transform = 'none';
  return {clone, width: Math.ceil(rect.width), height: Math.ceil(rect.height)};
}

function serializeReportToSvg(sheet) {
  const {clone, width, height} = makeReportCloneForExport(sheet);
  const serialized = new XMLSerializer().serializeToString(clone);
  return {
    width,
    height,
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject>
</svg>`
  };
}

function svgToCanvas(svg, width, height, scale = 2) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The report image could not be rendered.'));
    };
    image.src = url;
  });
}

function textEncoderBytes(text) {
  return new TextEncoder().encode(text);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function buildSingleImagePdf(jpegDataUrl, width, height) {
  const imageBytes = base64ToBytes(jpegDataUrl.split(',')[1]);
  const chunks = [];
  const offsets = [0];
  let position = 0;
  const push = item => {
    const bytes = typeof item === 'string' ? textEncoderBytes(item) : item;
    chunks.push(bytes);
    position += bytes.length;
  };
  const addObject = (number, body, streamBytes = null) => {
    offsets[number] = position;
    push(`${number} 0 obj\n`);
    if (streamBytes) {
      push(body);
      push('stream\n');
      push(streamBytes);
      push('\nendstream\nendobj\n');
    } else {
      push(`${body}\nendobj\n`);
    }
  };

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`);
  const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;
  addObject(4, `<< /Length ${content.length} >>\n`, textEncoderBytes(content));
  addObject(5, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\n`, imageBytes);

  const xrefStart = position;
  push(`xref\n0 6\n0000000000 65535 f \n`);
  for (let i = 1; i <= 5; i += 1) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks, {type: 'application/pdf'});
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function downloadReportPDF() {
  const sheet = $('#reportSheet');
  const button = $('#downloadBtn');
  if (!sheet) return;

  try {
    if (button) {
      button.disabled = true;
      button.textContent = 'Preparing PDF...';
    }
    if (!window.SUPERCOACH_ASSETS) throw new Error('Offline PDF assets are missing.');

    const previousScroll = window.scrollY;
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 120));

    const {svg, width, height} = serializeReportToSvg(sheet);
    const scale = Math.min(2, Math.max(1.35, window.devicePixelRatio || 1.5));
    const canvas = await svgToCanvas(svg, width, height, scale);
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.96);
    const pdfBlob = buildSingleImagePdf(jpegDataUrl, canvas.width, canvas.height);
    downloadBlob(pdfBlob, 'super-coach-performance-report.pdf');
    window.scrollTo(0, previousScroll);
  } catch (error) {
    console.error(error);
    alert('Sorry, the PDF could not be created in this browser. A PNG copy of the visible report will be downloaded instead.');
    try {
      const {svg, width, height} = serializeReportToSvg(sheet);
      const canvas = await svgToCanvas(svg, width, height, 2);
      canvas.toBlob(blob => blob && downloadBlob(blob, 'super-coach-performance-report.png'), 'image/png');
    } catch (fallbackError) {
      console.error(fallbackError);
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Download Report';
    }
  }
}

function initReportPage() {
  const downloadBtn = $('#downloadBtn');
  if (downloadBtn) downloadBtn.addEventListener('click', downloadReportPDF);
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

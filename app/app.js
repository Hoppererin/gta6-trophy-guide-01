/* Leonida Platinum — GTA VI trophy tracker.
   Loads app/data/trophies.json (a file of this app, never the network),
   keeps checklist progress in localStorage, and renders the tracker,
   the roadmap, the missable flags and each trophy's cited guide. */

const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'leonida-platinum-v1';

const ROADMAP_STAGES = [
  { stage: 1, title: 'Story first — Chapters 1 to 5', advice: 'Play the campaign in order. The twelve mission and chapter trophies and the five vague story trophies all come from playing the story; none of them can be missed.' },
  { stage: 2, title: 'Side characters — Andy, Kenton, Billy, Randy, Tyrone and Bret', advice: 'Finish each side character\u2019s mission strand through to the final mission, plus Bret\u2019s unique animal hunt. Do these during or just after the story.' },
  { stage: 3, title: 'Strangers & Freaks — eight strands', advice: 'Find the stranger mission-givers scattered across Leonida and finish eight full strands. The side-character finals count toward the eight.' },
  { stage: 4, title: 'Explore Leonida', advice: 'Reveal all 52 regions, meditate at all 18 spots, WAiNK It at 100 locations and discover 100 vehicles — one thorough tour of the map covers all four counters. Do the meditation spots now: they are the one possibly missable set.' },
  { stage: 5, title: 'Races and stunts', advice: 'Win 20 different races, win a Top Fun drone race at every one of the 14 locations, land 250 stunts, and sample all nine activity types. Drone wins count toward the 20 races.' },
  { stage: 6, title: 'Shooting and arcade', advice: 'Gold all 42 Shooting Range challenges, finish one arcade game, and bowl at the Kolt & Associates alley. The shooting range is the practice-heavy one — give it its own session.' },
  { stage: 7, title: 'Robberies and partner jobs', advice: 'Five bank vaults, one armored truck, one jewelry store undetected, three shops back-to-back with your partner, one illegal operation per gang — plus the 4-star escape with your partner, the VCIA departure and the Rhino. Keep a getaway car ready before every robbery.' },
  { stage: 8, title: 'Money and property', advice: 'Launder $250,000 in Marked Bills, spend $100,000 across shops, buy all eight garages and register ten vehicles to the Scooter Bros app. Start laundering early so the total is done by now.' },
  { stage: 9, title: 'Cleanup and the Platinum', advice: 'Finish the 50 challenges and whatever the in-game 100% checklist still lists. A Long Road pops at 100% completion, and Vice Got a Price! follows immediately — the Platinum is always last.' },
];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

let trophies = [];
let state = loadState();
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: {}, spoilers: false, kind: 'all', earnedFilter: 'all', query: '', tab: 'tracker' };
    const parsed = JSON.parse(raw);
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      spoilers: !!parsed.spoilers,
      kind: typeof parsed.kind === 'string' ? parsed.kind : 'all',
      earnedFilter: typeof parsed.earnedFilter === 'string' ? parsed.earnedFilter : 'all',
      query: typeof parsed.query === 'string' ? parsed.query : '',
      tab: typeof parsed.tab === 'string' ? parsed.tab : 'tracker',
    };
  } catch (err) {
    return { earned: {}, spoilers: false, kind: 'all', earnedFilter: 'all', query: '', tab: 'tracker' };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    /* Storage full or unavailable: the tracker still works for the session. */
  }
}

function isEarned(trophy) {
  return !!state.earned[trophy.id];
}

function isHiddenFromSpoilers(trophy) {
  return state.spoilers && trophy.kind === 'story' && !isEarned(trophy);
}

function displayName(trophy) {
  return isHiddenFromSpoilers(trophy) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isHiddenFromSpoilers(trophy)
    ? 'Hidden until earned — finish the story to reveal this trophy.'
    : trophy.description;
}

function gradeLabel(grade) {
  return grade === 'platinum' ? 'Plat' : grade === 'gold' ? 'Gold' : grade === 'silver' ? 'Silver' : 'Bronze';
}

function trophyById(id) {
  return trophies.find((t) => t.id === id) || null;
}

function filteredTrophies() {
  const query = state.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.kind === 'missable' && !trophy.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
    if (state.earnedFilter === 'earned' && !isEarned(trophy)) return false;
    if (state.earnedFilter === 'remaining' && isEarned(trophy)) return false;
    if (query) {
      const hay = (trophy.name + ' ' + trophy.description).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const earned = trophies.filter(isEarned).length;
  const total = trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById('progressText').textContent = earned + ' / ' + total + ' earned';
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const ofGrade = trophies.filter((t) => t.grade === grade);
    const done = ofGrade.filter(isEarned).length;
    return '<b>' + done + '/' + ofGrade.length + '</b> ' + grade;
  });
  document.getElementById('gradeCounts').innerHTML = counts.join(' &middot; ');
}

function renderList() {
  const list = document.getElementById('trophyList');
  const shown = filteredTrophies();
  const hint = document.getElementById('listHint');
  if (state.kind === 'online') {
    hint.textContent = 'There are no online trophies: all 55 unlock in single-player. This filter is empty by design.';
  } else if (shown.length === 0) {
    hint.textContent = 'No trophies match this filter.';
  } else {
    hint.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies. Click a row to open its guide; tick the box when you earn it.';
  }
  list.innerHTML = '';
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-note';
    empty.textContent = state.kind === 'online'
      ? 'No online trophies exist in Grand Theft Auto VI — every trophy is single-player.'
      : 'Nothing matches. Clear the search or pick another filter.';
    list.appendChild(empty);
    return;
  }
  for (const trophy of shown) {
    const earned = isEarned(trophy);
    const row = document.createElement('li');
    row.className = 'trophy-row' + (earned ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : '');
    row.dataset.id = trophy.id;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', 'Earned: ' + displayName(trophy));
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(trophy.id);
    });
    row.appendChild(box);

    const badge = document.createElement('span');
    badge.className = 'grade-badge grade-' + trophy.grade;
    badge.textContent = gradeLabel(trophy.grade);
    row.appendChild(badge);

    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = displayName(trophy);
    body.appendChild(name);
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = displayDescription(trophy);
    body.appendChild(desc);
    const meta = document.createElement('div');
    meta.className = 't-meta';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
    meta.appendChild(kindTag);
    if (trophy.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-tag';
      hiddenTag.textContent = 'Hidden on PSN';
      meta.appendChild(hiddenTag);
    }
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'Possibly missable';
      meta.appendChild(missTag);
    }
    if (trophy.count) {
      const countTag = document.createElement('span');
      countTag.className = 'tag count-tag';
      countTag.textContent = 'Target: ' + trophy.count.toLocaleString('en-US');
      meta.appendChild(countTag);
    }
    body.appendChild(meta);
    row.appendChild(body);

    const check = document.createElement('span');
    check.className = 't-check ' + (earned ? 'done' : 'todo');
    check.textContent = earned ? 'Earned ✓' : 'Not yet';
    row.appendChild(check);

    row.addEventListener('click', () => selectTrophy(trophy.id));
    list.appendChild(row);
  }
}

function renderDetail() {
  const pane = document.getElementById('detailPane');
  const trophy = selectedId ? trophyById(selectedId) : null;
  pane.innerHTML = '';
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy to see its guide, steps and sources.';
    pane.appendChild(empty);
    return;
  }
  const badge = document.createElement('span');
  badge.className = 'grade-badge grade-' + trophy.grade;
  badge.textContent = gradeLabel(trophy.grade);
  pane.appendChild(badge);

  const title = document.createElement('h2');
  title.textContent = displayName(trophy);
  pane.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 't-desc';
  desc.textContent = displayDescription(trophy);
  pane.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 't-meta';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  meta.appendChild(kindTag);
  if (trophy.count) {
    const countTag = document.createElement('span');
    countTag.className = 'tag count-tag';
    countTag.textContent = 'PlayStation target: ' + trophy.count.toLocaleString('en-US');
    meta.appendChild(countTag);
  }
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'Hidden on PlayStation until earned';
    meta.appendChild(hiddenTag);
  }
  pane.appendChild(meta);

  if (isHiddenFromSpoilers(trophy)) {
    const note = document.createElement('p');
    note.className = 'safe-note';
    note.textContent = 'Spoilers are hidden: earn this story trophy to reveal its guide and sources.';
    pane.appendChild(note);
  } else {
    if (trophy.missable) {
      const warn = document.createElement('p');
      warn.className = 'missable-note';
      warn.textContent = 'Possibly missable — the only trophy the guides flag. Do it as you explore, and keep a manual save from before late-story missions.';
      pane.appendChild(warn);
    } else if (trophy.kind === 'story') {
      const safe = document.createElement('p');
      safe.className = 'safe-note';
      safe.textContent = 'Cannot be missed — it unlocks by playing the story.';
      pane.appendChild(safe);
    }
    const guideHead = document.createElement('h4');
    guideHead.textContent = 'Guide';
    pane.appendChild(guideHead);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    pane.appendChild(guide);

    if (trophy.steps && trophy.steps.length) {
      const stepsHead = document.createElement('h4');
      stepsHead.textContent = 'Steps';
      pane.appendChild(stepsHead);
      const steps = document.createElement('ol');
      for (const step of trophy.steps) {
        const item = document.createElement('li');
        item.textContent = step;
        steps.appendChild(item);
      }
      pane.appendChild(steps);
    }

    if (trophy.sources && trophy.sources.length) {
      const sourcesHead = document.createElement('h4');
      sourcesHead.textContent = 'Sources';
      pane.appendChild(sourcesHead);
      const sources = document.createElement('ul');
      sources.className = 'sources';
      for (const source of trophy.sources) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = source.name;
        item.appendChild(link);
        sources.appendChild(item);
      }
      pane.appendChild(sources);
    }
  }

  const line = document.createElement('div');
  line.className = 'earned-line';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = isEarned(trophy) ? 'Mark as not earned' : 'Mark as earned';
  if (isEarned(trophy)) toggle.classList.add('earned');
  toggle.addEventListener('click', () => toggleEarned(trophy.id));
  line.appendChild(toggle);
  pane.appendChild(line);
}

function renderRoadmap() {
  const host = document.getElementById('roadmapStages');
  host.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter(isEarned).length;
    const card = document.createElement('div');
    card.className = 'stage-card';
    const head = document.createElement('div');
    head.className = 'stage-head';
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = 'Stage ' + stage.stage;
    head.appendChild(num);
    const title = document.createElement('h3');
    title.textContent = stage.title;
    head.appendChild(title);
    const prog = document.createElement('span');
    prog.className = 'stage-progress';
    prog.textContent = done + ' / ' + members.length + ' earned';
    head.appendChild(prog);
    card.appendChild(head);
    const advice = document.createElement('p');
    advice.textContent = stage.advice;
    card.appendChild(advice);
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const trophy of members) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-chip' + (isEarned(trophy) ? ' earned' : '');
      const dot = document.createElement('span');
      dot.className = 'dot ' + trophy.grade;
      chip.appendChild(dot);
      const label = document.createElement('span');
      label.textContent = displayName(trophy);
      chip.appendChild(label);
      chip.addEventListener('click', () => {
        selectTrophy(trophy.id);
        switchTab('tracker');
      });
      chips.appendChild(chip);
    }
    card.appendChild(chips);
    host.appendChild(card);
  }
}

function renderMissables() {
  const host = document.getElementById('missableList');
  host.innerHTML = '';
  const flagged = trophies.filter((t) => t.missable);
  for (const trophy of flagged) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const title = document.createElement('h3');
    title.textContent = trophy.name + ' — ' + gradeLabel(trophy.grade);
    card.appendChild(title);
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    card.appendChild(desc);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    card.appendChild(guide);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = isEarned(trophy) ? 'Earned ✓ — mark as not earned' : 'Mark as earned';
    toggle.addEventListener('click', () => {
      toggleEarned(trophy.id);
      renderMissables();
      renderProgress();
    });
    card.appendChild(toggle);
    host.appendChild(card);
  }
  const safe = document.getElementById('safeList');
  safe.innerHTML = '';
  const safeItems = [
    'Story trophies (12 mission and chapter trophies plus the five vague story moments) unlock by playing the campaign — they cannot be missed.',
    'Side-character finals (Andy, Kenton, Billy, Randy, Tyrone) and Bret\u2019s hunt stay available as their strands are played; finish them during or just after the story.',
    'Activities, races, robberies, collectibles and spending all stay available in free roam after the finale.',
    'Community discussion suggests no trophy in the game is missable at all, but that is unconfirmed — the one flagged trophy above is the only one the guides name.',
  ];
  for (const text of safeItems) {
    const item = document.createElement('li');
    item.textContent = text;
    safe.appendChild(item);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

function toggleEarned(id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = true;
  saveState();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
  try {
    history.replaceState(null, '', '#trophy=' + id);
  } catch (err) {
    /* History unavailable: selection still works. */
  }
}

function switchTab(tab) {
  state.tab = tab;
  saveState();
  document.querySelectorAll('.tab').forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === 'view-' + tab);
  });
}

function exportProgress() {
  const payload = {
    app: 'leonida-platinum',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).sort(),
    spoilers: state.spoilers,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.earned)) {
        throw new Error('bad file');
      }
      const earned = {};
      for (const id of parsed.earned) {
        if (trophyById(id)) earned[id] = true;
      }
      state.earned = earned;
      if (typeof parsed.spoilers === 'boolean') state.spoilers = parsed.spoilers;
      saveState();
      syncControls();
      renderAll();
    } catch (err) {
      alert('That file is not a Leonida Platinum progress export.');
    }
  };
  reader.readAsText(file);
}

function syncControls() {
  document.getElementById('spoilerToggle').checked = state.spoilers;
  document.getElementById('searchBox').value = state.query;
  document.getElementById('earnedFilter').value = state.earnedFilter;
  document.querySelectorAll('#kindChips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === state.kind);
  });
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('could not load ' + DATA_URL);
  const data = await response.json();
  trophies = Array.isArray(data) ? data : data.trophies;
}

function bindControls() {
  document.getElementById('searchBox').addEventListener('input', (event) => {
    state.query = event.target.value;
    saveState();
    renderList();
  });
  document.getElementById('earnedFilter').addEventListener('change', (event) => {
    state.earnedFilter = event.target.value;
    saveState();
    renderList();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    saveState();
    renderAll();
  });
  document.querySelectorAll('#kindChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.kind = chip.dataset.kind;
      saveState();
      syncControls();
      renderList();
    });
  });
  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies and reset the tracker?')) {
      state.earned = {};
      selectedId = null;
      saveState();
      renderAll();
    }
  });
}

async function init() {
  bindControls();
  syncControls();
  switchTab(state.tab || 'tracker');
  try {
    await loadTrophies();
  } catch (err) {
    document.getElementById('trophyList').innerHTML =
      '<li class="empty-note">Could not load the trophy data. Serve app/ from its own folder and reload.</li>';
    return;
  }
  const hash = window.location.hash.match(/trophy=([a-z0-9-]+)/);
  if (hash && trophyById(hash[1])) selectedId = hash[1];
  renderAll();
}

init();

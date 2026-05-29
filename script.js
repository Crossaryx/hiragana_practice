const HIRAGANA_ROWS = [
  { label: 'あ', chars: [['あ','a'],  ['い','i'],   ['う','u'],   ['え','e'],  ['お','o']]  },
  { label: 'か', chars: [['か','ka'], ['き','ki'],  ['く','ku'],  ['け','ke'], ['こ','ko']] },
  { label: 'さ', chars: [['さ','sa'], ['し','shi'], ['す','su'],  ['せ','se'], ['そ','so']] },
  { label: 'た', chars: [['た','ta'], ['ち','chi'], ['つ','tsu'], ['て','te'], ['と','to']] },
  { label: 'な', chars: [['な','na'], ['に','ni'],  ['ぬ','nu'],  ['ね','ne'], ['の','no']] },
  { label: 'は', chars: [['は','ha'], ['ひ','hi'],  ['ふ','fu'],  ['へ','he'], ['ほ','ho']] },
  { label: 'ま', chars: [['ま','ma'], ['み','mi'],  ['む','mu'],  ['め','me'], ['も','mo']] },
  { label: 'や', chars: [['や','ya'], ['ゆ','yu'],  ['よ','yo']]                           },
  { label: 'ら', chars: [['ら','ra'], ['り','ri'],  ['る','ru'],  ['れ','re'], ['ろ','ro']] },
  { label: 'わ', chars: [['わ','wa'], ['を','wo']]                                         },
  { label: 'ん', chars: [['ん','n']]                                                        },
];

const KATAKANA_ROWS = [
  { label: 'ア', chars: [['ア','a'],  ['イ','i'],   ['ウ','u'],   ['エ','e'],  ['オ','o']]  },
  { label: 'カ', chars: [['カ','ka'], ['キ','ki'],  ['ク','ku'],  ['ケ','ke'], ['コ','ko']] },
  { label: 'サ', chars: [['サ','sa'], ['シ','shi'], ['ス','su'],  ['セ','se'], ['ソ','so']] },
  { label: 'タ', chars: [['タ','ta'], ['チ','chi'], ['ツ','tsu'], ['テ','te'], ['ト','to']] },
  { label: 'ナ', chars: [['ナ','na'], ['ニ','ni'],  ['ヌ','nu'],  ['ネ','ne'], ['ノ','no']] },
  { label: 'ハ', chars: [['ハ','ha'], ['ヒ','hi'],  ['フ','fu'],  ['ヘ','he'], ['ホ','ho']] },
  { label: 'マ', chars: [['マ','ma'], ['ミ','mi'],  ['ム','mu'],  ['メ','me'], ['モ','mo']] },
  { label: 'ヤ', chars: [['ヤ','ya'], ['ユ','yu'],  ['ヨ','yo']]                           },
  { label: 'ラ', chars: [['ラ','ra'], ['リ','ri'],  ['ル','ru'],  ['レ','re'], ['ロ','ro']] },
  { label: 'ワ', chars: [['ワ','wa'], ['ヲ','wo']]                                         },
  { label: 'ン', chars: [['ン','n']]                                                        },
];

// ── Shared helpers ───────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Shared elements ──────────────────────────────────
const menuEl         = document.getElementById('menu');
const setupEl        = document.getElementById('setup');
const practiceEl     = document.getElementById('practice');
const readingMenuEl  = document.getElementById('reading-menu');
const readingEl      = document.getElementById('reading-practice');

// ── Character practice: state ────────────────────────
let currentRows    = null;
let bag            = [];
let sessionCorrect = 0;
let sessionWrong   = 0;
let currentCorrect = null;
const selected     = new Set();

// ── Character practice: elements ─────────────────────
const setupTitle    = document.getElementById('setup-title');
const grid          = document.getElementById('row-grid');
const startBtn      = document.getElementById('start-btn');
const charEl        = document.getElementById('character');
const nextBtn       = document.getElementById('next-btn');
const statCorrectEl = document.getElementById('stat-correct');
const statWrongEl   = document.getElementById('stat-wrong');
const choiceBtns    = [...document.querySelectorAll('.choice-btn')];

// ── Menu: character practice ─────────────────────────
document.getElementById('hiragana-mode-btn').addEventListener('click', () => enterSetup(HIRAGANA_ROWS, 'hiragana'));
document.getElementById('katakana-mode-btn').addEventListener('click', () => enterSetup(KATAKANA_ROWS, 'katakana'));

function enterSetup(rows, title) {
  currentRows = rows;
  selected.clear();
  startBtn.disabled = true;
  setupTitle.textContent = title;

  grid.innerHTML = '';
  rows.forEach((row, i) => {
    const item = document.createElement('div');
    item.className = 'row-item';
    const preview = row.chars.map(([h, r]) => `${h}<span> ${r}</span>`).join('  ');
    item.innerHTML = `<div class="row-label">${row.label}</div><div class="row-preview">${preview}</div>`;
    item.addEventListener('click', () => {
      if (selected.has(i)) { selected.delete(i); item.classList.remove('selected'); }
      else                  { selected.add(i);    item.classList.add('selected'); }
      startBtn.disabled = selected.size === 0;
    });
    grid.appendChild(item);
  });

  menuEl.style.display  = 'none';
  setupEl.style.display = 'flex';
}

document.getElementById('setup-back-btn').addEventListener('click', () => {
  setupEl.style.display = 'none';
  menuEl.style.display  = 'flex';
});

document.getElementById('all-btn').addEventListener('click', () => {
  grid.querySelectorAll('.row-item').forEach((item, i) => { selected.add(i); item.classList.add('selected'); });
  startBtn.disabled = false;
});

document.getElementById('none-btn').addEventListener('click', () => {
  selected.clear();
  grid.querySelectorAll('.row-item').forEach(item => item.classList.remove('selected'));
  startBtn.disabled = true;
});

function refill() {
  bag = shuffle([...selected].flatMap(i => currentRows[i].chars.map(([h, r]) => [h, r, i])));
}

function pick() {
  if (bag.length === 0) refill();
  return bag.pop();
}

function generateChoices(correctRomaji, rowIndex) {
  const sameRow = currentRows[rowIndex].chars.map(([, r]) => r).filter(r => r !== correctRomaji);
  let wrongPool = [...sameRow];

  if (wrongPool.length < 3) {
    const fromSelected = shuffle(
      [...selected]
        .filter(i => i !== rowIndex)
        .flatMap(i => currentRows[i].chars.map(([, r]) => r))
        .filter(r => !wrongPool.includes(r) && r !== correctRomaji)
    );
    wrongPool = [...wrongPool, ...fromSelected];
  }

  if (wrongPool.length < 3) {
    const fromAll = shuffle(
      currentRows.flatMap((row, i) => i !== rowIndex ? row.chars.map(([, r]) => r) : [])
        .filter(r => !wrongPool.includes(r) && r !== correctRomaji)
    );
    wrongPool = [...wrongPool, ...fromAll];
  }

  return shuffle([...wrongPool.slice(0, 3), correctRomaji]);
}

function showNext() {
  const [h, r, rowIndex] = pick();
  currentCorrect = r;

  charEl.textContent    = h;
  nextBtn.style.display = 'none';

  const choices = generateChoices(r, rowIndex);
  choiceBtns.forEach((btn, i) => {
    btn.textContent = choices[i];
    btn.className   = 'choice-btn';
    btn.disabled    = false;
  });
}

function handleChoice(btn) {
  const answer  = btn.textContent;
  const correct = answer === currentCorrect;

  choiceBtns.forEach(b => {
    b.disabled = true;
    if (b.textContent === currentCorrect) b.classList.add('correct');
  });
  if (!correct) btn.classList.add('wrong');

  if (correct) statCorrectEl.textContent = ++sessionCorrect;
  else         statWrongEl.textContent   = ++sessionWrong;

  nextBtn.style.display = '';
}

choiceBtns.forEach(btn => btn.addEventListener('click', () => handleChoice(btn)));
nextBtn.addEventListener('click', showNext);

startBtn.addEventListener('click', () => {
  bag            = [];
  sessionCorrect = 0;
  sessionWrong   = 0;
  statCorrectEl.textContent = '0';
  statWrongEl.textContent   = '0';
  setupEl.style.display    = 'none';
  practiceEl.style.display = 'flex';
  showNext();
});

document.getElementById('back-btn').addEventListener('click', () => {
  practiceEl.style.display = 'none';
  setupEl.style.display    = 'flex';
});

// ── Reading practice: state ──────────────────────────
let readingBag         = [];
let readingType        = null;
let wordsSeen          = 0;
let currentWord        = null;

// ── Reading practice: elements ───────────────────────
const readingWordEl    = document.getElementById('reading-word');
const readingInfoEl    = document.getElementById('reading-info');
const readingRomajiEl  = document.getElementById('reading-romaji');
const readingMeaningEl = document.getElementById('reading-meaning');
const revealBtn        = document.getElementById('reveal-btn');
const readingNextBtn   = document.getElementById('reading-next-btn');
const statSeenEl       = document.getElementById('stat-seen');

// ── Menu: reading ────────────────────────────────────
document.getElementById('reading-btn').addEventListener('click', () => {
  menuEl.style.display        = 'none';
  readingMenuEl.style.display = 'flex';
});

document.getElementById('reading-back-btn').addEventListener('click', () => {
  readingMenuEl.style.display = 'none';
  menuEl.style.display        = 'flex';
});

document.getElementById('reading-hiragana-btn').addEventListener('click', () => enterReading('hiragana'));
document.getElementById('reading-katakana-btn').addEventListener('click', () => enterReading('katakana'));

function enterReading(type) {
  readingType            = type;
  readingBag             = shuffle([...WORDS[type]]);
  wordsSeen              = 0;
  statSeenEl.textContent = '0';
  readingMenuEl.style.display = 'none';
  readingEl.style.display    = 'flex';
  showNextWord();
}

document.getElementById('reading-exit-btn').addEventListener('click', () => {
  readingEl.style.display     = 'none';
  readingMenuEl.style.display = 'flex';
});

function showNextWord() {
  if (readingBag.length === 0) readingBag = shuffle([...WORDS[readingType]]);
  currentWord = readingBag.pop();

  readingWordEl.textContent         = currentWord.k;
  readingInfoEl.style.visibility    = 'hidden';
  revealBtn.style.display           = '';
  readingNextBtn.style.display      = 'none';
}

revealBtn.addEventListener('click', () => {
  readingRomajiEl.textContent    = currentWord.r;
  readingMeaningEl.textContent   = currentWord.m;
  readingInfoEl.style.visibility = 'visible';
  revealBtn.style.display        = 'none';
  readingNextBtn.style.display   = '';
  statSeenEl.textContent         = ++wordsSeen;
});

readingNextBtn.addEventListener('click', showNextWord);

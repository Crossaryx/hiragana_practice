const ROWS = [
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
  { label: 'が', chars: [['が','ga'], ['ぎ','gi'],  ['ぐ','gu'],  ['げ','ge'], ['ご','go']] },
  { label: 'ざ', chars: [['ざ','za'], ['じ','ji'],  ['ず','zu'],  ['ぜ','ze'], ['ぞ','zo']] },
  { label: 'だ', chars: [['だ','da'], ['ぢ','di'],  ['づ','du'],  ['で','de'], ['ど','do']] },
  { label: 'ば', chars: [['ば','ba'], ['び','bi'],  ['ぶ','bu'],  ['べ','be'], ['ぼ','bo']] },
  { label: 'ぱ', chars: [['ぱ','pa'], ['ぴ','pi'],  ['ぷ','pu'],  ['ぺ','pe'], ['ぽ','po']] },
];

// ── Setup ───────────────────────────────────────────

const grid     = document.getElementById('row-grid');
const startBtn = document.getElementById('start-btn');
const selected = new Set();

ROWS.forEach((row, i) => {
  const item = document.createElement('div');
  item.className = 'row-item';
  const preview = row.chars.map(([h, r]) => `${h}<span> ${r}</span>`).join('  ');
  item.innerHTML = `<div class="row-label">${row.label}</div><div class="row-preview">${preview}</div>`;
  item.addEventListener('click', () => {
    if (selected.has(i)) { selected.delete(i); item.classList.remove('selected'); }
    else                 { selected.add(i);    item.classList.add('selected'); }
    startBtn.disabled = selected.size === 0;
  });
  grid.appendChild(item);
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

// ── Practice ────────────────────────────────────────

const setup         = document.getElementById('setup');
const practice      = document.getElementById('practice');
const charEl        = document.getElementById('character');
const nextBtn       = document.getElementById('next-btn');
const statCorrectEl = document.getElementById('stat-correct');
const statWrongEl   = document.getElementById('stat-wrong');
const choiceBtns    = [...document.querySelectorAll('.choice-btn')];

let bag            = [];
let sessionCorrect = 0;
let sessionWrong   = 0;
let currentCorrect = null;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function refill() {
  bag = shuffle([...selected].flatMap(i => ROWS[i].chars.map(([h, r]) => [h, r, i])));
}

function pick() {
  if (bag.length === 0) refill();
  return bag.pop();
}

function generateChoices(correctRomaji, rowIndex) {
  // Wrong answers: same row first, then other selected rows, then all rows as fallback
  const sameRow = ROWS[rowIndex].chars.map(([, r]) => r).filter(r => r !== correctRomaji);
  let wrongPool = [...sameRow];

  if (wrongPool.length < 3) {
    const fromSelected = shuffle(
      [...selected]
        .filter(i => i !== rowIndex)
        .flatMap(i => ROWS[i].chars.map(([, r]) => r))
        .filter(r => !wrongPool.includes(r) && r !== correctRomaji)
    );
    wrongPool = [...wrongPool, ...fromSelected];
  }

  if (wrongPool.length < 3) {
    const fromAll = shuffle(
      ROWS.flatMap((row, i) => i !== rowIndex ? row.chars.map(([, r]) => r) : [])
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
  setup.style.display    = 'none';
  practice.style.display = 'flex';
  showNext();
});

document.getElementById('back-btn').addEventListener('click', () => {
  practice.style.display = 'none';
  setup.style.display    = 'flex';
});

const STORAGE_KEY = 'vocabCards';
const cardElement = document.getElementById('flashcard');
const frontElement = document.getElementById('cardFront');
const backElement = document.getElementById('cardBack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const counterElement = document.getElementById('counter');

let cards = [];
let currentIndex = 0;

function formatPartOfSpeech(pos) {
  const normalized = (pos || '').toLowerCase().trim();
  const map = {
    noun: '名詞',
    n: '名詞',
    verb: '動詞',
    v: '動詞',
    adjective: '形容詞',
    adj: '形容詞',
    adverb: '副詞',
    adv: '副詞',
    pronoun: '代名詞',
    prep: '介系詞',
    preposition: '介系詞',
    conjunction: '連接詞',
    conj: '連接詞',
    interjection: '感嘆詞',
  };

  return map[normalized] || pos || '暫無';
}

function loadCards() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      cards = JSON.parse(stored);
    } catch (error) {
      cards = [];
    }
  }
  if (!cards || cards.length === 0) {
    cards = [
      {
        word: 'example',
        translation: '範例；例子',
        pos: 'noun',
        root: 'ex- (out) + ample (take, size)',
        example: 'This is an example sentence.',
      },
    ];
  }
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function renderCard() {
  if (cards.length === 0) {
    frontElement.textContent = '尚無單字';
    backElement.innerHTML = '<p>請先到管理頁面新增單字內容。</p>';
    counterElement.textContent = '0 / 0';
    return;
  }

  const item = cards[currentIndex];
  frontElement.textContent = item.word || '無資料';
  backElement.innerHTML = `
    <div class="back-card-content">
      <p class="text-2xl font-black text-red-50">${item.translation || '暫無翻譯'}</p>
    </div>
  `;
  counterElement.textContent = `${currentIndex + 1} / ${cards.length}`;
}

function updateNavigation() {
  prevBtn.disabled = cards.length === 0;
  nextBtn.disabled = cards.length === 0;
}

cardElement.addEventListener('click', () => {
  cardElement.classList.toggle('is-flipped');
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  cardElement.classList.remove('is-flipped');
  renderCard();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  cardElement.classList.remove('is-flipped');
  renderCard();
});

window.addEventListener('load', () => {
  loadCards();
  renderCard();
  updateNavigation();
});

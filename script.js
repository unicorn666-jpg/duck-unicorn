const STORAGE_KEY = 'vocabCards';
const cardElement = document.getElementById('flashcard');
const frontElement = document.getElementById('cardFront');
const backElement = document.getElementById('cardBack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const counterElement = document.getElementById('counter');

let cards = [];
let currentIndex = 0;

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
      <p><strong>中文解釋：</strong>${item.translation || '暫無'}</p>
      <p><strong>詞性：</strong>${item.pos || '暫無'}</p>
      <p><strong>字根分析：</strong>${item.root || '暫無'}</p>
      <p><strong>例句/備註：</strong>${item.example || '暫無'}</p>
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

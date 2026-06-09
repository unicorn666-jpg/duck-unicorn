const STORAGE_KEY = 'vocabCards';
const wordInput = document.getElementById('wordInput');
const translationInput = document.getElementById('translationInput');
const posInput = document.getElementById('posInput');
const rootInput = document.getElementById('rootInput');
const exampleInput = document.getElementById('exampleInput');
const statusMessage = document.getElementById('statusMessage');
const wordList = document.getElementById('wordList');
const autoFillBtn = document.getElementById('autoFillBtn');
const wordForm = document.getElementById('wordForm');

let cards = [];

function loadCards() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      cards = JSON.parse(stored);
    } catch (error) {
      cards = [];
    }
  } else {
    cards = [];
  }
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function renderList() {
  wordList.innerHTML = '';
  if (cards.length === 0) {
    wordList.innerHTML = '<p class="status-message">目前尚未新增任何單字。</p>';
    return;
  }

  cards.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.innerHTML = `
      <div>
        <strong>${item.word}</strong>
        <div class="word-meta">${item.pos || '詞性未填'} • ${item.translation || '翻譯未填'}</div>
      </div>
      <div>
        <p><strong>字根分析：</strong>${item.root || '暫無'}</p>
        <p><strong>例句/備註：</strong>${item.example || '暫無'}</p>
      </div>
      <button class="button" type="button" data-index="${index}">刪除</button>
    `;
    const deleteButton = card.querySelector('button');
    deleteButton.addEventListener('click', () => {
      cards.splice(index, 1);
      saveCards();
      renderList();
    });
    wordList.appendChild(card);
  });
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#b91c1c' : 'var(--muted)';
}

async function autoFill() {
  const word = wordInput.value.trim();
  if (!word) {
    setStatus('請先輸入英文單字。', true);
    return;
  }

  setStatus('正在載入資料……');
  translationInput.value = '';
  posInput.value = '';
  rootInput.value = '';

  try {
    const dictionary = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const dictData = dictionary.ok ? await dictionary.json() : null;
    if (dictData && Array.isArray(dictData) && dictData.length > 0) {
      const entry = dictData[0];
      const firstMeaning = entry.meanings?.[0];
      if (firstMeaning) {
        posInput.value = firstMeaning.partOfSpeech || '';
        const exampleText = firstMeaning.definitions?.[0]?.example || '';
        exampleInput.value = exampleText;
      }
      const origin = entry.origin || '';
      rootInput.value = origin || '暫無字根分析，可自行補充。';
    }

    const translation = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`);
    const translationData = await translation.json();
    const translatedText = translationData.responseData?.translatedText || '';
    if (translatedText) {
      translationInput.value = translatedText;
    }

    if (!dictData && !translatedText) {
      setStatus('未找到相關資料，請手動填寫欄位。', true);
      return;
    }

    setStatus('自動填入完成，可再自行調整內容。');
  } catch (error) {
    console.error(error);
    setStatus('無法取得 API 資料，請稍後再試。', true);
  }
}

function resetForm() {
  wordInput.value = '';
  translationInput.value = '';
  posInput.value = '';
  rootInput.value = '';
  exampleInput.value = '';
}

wordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const word = wordInput.value.trim();
  if (!word) {
    setStatus('英文單字為必填欄位。', true);
    return;
  }

  const newCard = {
    word,
    translation: translationInput.value.trim(),
    pos: posInput.value.trim(),
    root: rootInput.value.trim(),
    example: exampleInput.value.trim(),
  };

  cards.push(newCard);
  saveCards();
  renderList();
  resetForm();
  setStatus('單字已新增！');
});

autoFillBtn.addEventListener('click', autoFill);

window.addEventListener('load', () => {
  loadCards();
  renderList();
});

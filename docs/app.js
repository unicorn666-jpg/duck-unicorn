// 請在部署 Apps Script 後，把 APPS_SCRIPT_URL 設定為你的 Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzi36sGtL0amaCeP8wkgcEl88fSfHOnsflRYFrU9jIO9C_dpl_nmHOjkqtdCsdNKli6mQ/exec';

const counselForm = document.getElementById('counselForm');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const countryInput = document.getElementById('countryInput');
const ageInput = document.getElementById('ageInput');
const concernInput = document.getElementById('concernInput');
const messageInput = document.getElementById('messageInput');
const statusMessage = document.getElementById('statusMessage');
const resourceBox = document.getElementById('resourceBox');

document.getElementById('autoPersonalBtn').addEventListener('click', autoFillPersonal);
document.getElementById('autoCountryBtn').addEventListener('click', autoFillCountry);

function getAppsScriptUrl() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_URL_HERE')) {
    setStatus('請先在 docs/app.js 中設定 Apps Script exec URL，並重新部署 Apps Script。', true);
    return null;
  }
  return APPS_SCRIPT_URL;
}

async function autoFillPersonal() {
  setStatus('載入中…');
  try {
    const res = await fetch('https://randomuser.me/api/');
    const data = await res.json();
    const user = data.results[0];
    nameInput.value = `${user.name.first} ${user.name.last}`;
    emailInput.value = user.email;
    setStatus('個人資料已自動填入（僅示範）。');
  } catch (e) {
    console.error(e);
    setStatus('無法自動填入個人資料。', true);
  }
}

async function autoFillCountry() {
  const country = countryInput.value.trim();
  if (!country) {
    setStatus('請先輸入國家或地區名稱。', true);
    return;
  }

  setStatus('查詢國家資訊…');
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('找不到國家');
    }
    const info = data[0];
    const display = `國家：${info.name.common || ''} • 首都：${(info.capital && info.capital[0]) || '無'} • 國碼：${info.cca2 || ''}`;
    resourceBox.textContent = display;
    setStatus('已載入國家資訊。');
  } catch (e) {
    console.error(e);
    setStatus('查詢失敗，請手動填寫。', true);
  }
}

function setStatus(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.style.color = isError ? '#b91c1c' : 'var(--muted)';
}

counselForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const endpoint = getAppsScriptUrl();
  if (!endpoint) {
    return;
  }

  if (!messageInput.value.trim()) {
    setStatus('請先填寫需求說明，再送出表單。', true);
    return;
  }

  setStatus('送出中…');

  const payload = {
    action: 'add',
    entry: {
      timestamp: new Date().toISOString(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      country: countryInput.value.trim(),
      age: ageInput.value ? Number(ageInput.value) : '',
      concern: concernInput.value,
      message: messageInput.value.trim()
    }
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      throw new Error(`非 JSON 回應：${text}`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || `HTTP ${res.status} ${res.statusText}`);
    }

    setStatus('表單已送出，感謝您。');
    counselForm.reset();
  } catch (err) {
    console.error(err);
    setStatus('無法送出表單，請確認 Apps Script Web App 是否允許任何人存取，或稍後再試。', true);
  }
});

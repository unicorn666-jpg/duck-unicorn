// 請在部署 Apps Script 後，把 APPS_SCRIPT_URL 設定為你的 Web App URL
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE'; https://script.google.com/macros/s/AKfycbzi36sGtL0amaCeP8wkgcEl88fSfHOnsflRYFrU9jIO9C_dpl_nmHOjkqtdCsdNKli6mQ/exec// e.g. https://script.google.com/macros/s/XXXX/exec

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      setStatus('表單已送出，感謝您。');
      counselForm.reset();
    } else {
      throw new Error(data.error || '儲存失敗');
    }
  } catch (err) {
    console.error(err);
    setStatus('無法送出表單，請稍後再試或聯絡站方。', true);
  }
});

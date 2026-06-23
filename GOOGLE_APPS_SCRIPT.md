# Google Apps Script 設定步驟

這份文件會引導你把 `duck-unicorn` 管理頁的單字資料，透過 Google Apps Script 寫入 Google 試算表。

## 1. 準備 Google 試算表
1. 開啟這個試算表：
   https://docs.google.com/spreadsheets/d/1RZbzyKorRyea651MM6qlkg-PLnN9TM66atNdcDvE3As/
2. 在第一列建立標題欄（第一列必須保留）：
   - `word`
   - `translation`
   - `pos`
   - `root`
   - `example`
3. 請確認試算表名稱，例如 `Sheet1`，但 Apps Script 的設定會以「目前的工作表」讀寫。

## 2. 建立 Google Apps Script
1. 點選試算表上方選單：**工具 > Apps Script**。
2. 在 Apps Script 編輯器中，刪除預設程式碼，並貼上下列完整程式碼：

```javascript
const SHEET_ID = '1RZbzyKorRyea651MM6qlkg-PLnN9TM66atNdcDvE3As';

function doPost(e) {
  const request = JSON.parse(e.postData.contents || '{}');
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

  if (request.action === 'read') {
    return readCards(sheet);
  }

  if (request.action === 'add') {
    return addCard(sheet, request.card);
  }

  if (request.action === 'write') {
    return writeCards(sheet, request.cards || []);
  }

  return jsonResponse({ error: 'Unknown action' });
}

function readCards(sheet) {
  const data = sheet.getDataRange().getValues();
  const cards = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      cards.push({
        word: data[i][0] || '',
        translation: data[i][1] || '',
        pos: data[i][2] || '',
        root: data[i][3] || '',
        example: data[i][4] || ''
      });
    }
  }

  return jsonResponse({ cards });
}

function addCard(sheet, card) {
  if (!card || !card.word) {
    return jsonResponse({ success: false, error: 'Missing card data' });
  }

  ensureHeaderRow(sheet);
  sheet.appendRow([
    card.word,
    card.translation || '',
    card.pos || '',
    card.root || '',
    card.example || ''
  ]);

  return jsonResponse({ success: true });
}

function writeCards(sheet, cards) {
  ensureHeaderRow(sheet);

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  if (cards.length > 0) {
    const values = cards.map(card => [
      card.word || '',
      card.translation || '',
      card.pos || '',
      card.root || '',
      card.example || ''
    ]);
    sheet.getRange(2, 1, values.length, 5).setValues(values);
  }

  return jsonResponse({ success: true });
}

function ensureHeaderRow(sheet) {
  const header = ['word', 'translation', 'pos', 'root', 'example'];
  const currentHeader = sheet.getRange(1, 1, 1, header.length).getValues()[0] || [];

  if (currentHeader.join() !== header.join()) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. 部署為 Web App
1. 點選右上角：**部署 > 新增部署**。
2. 類型選擇：**Web App**。
3. 執行身分：選擇你的 Gmail 帳號。
4. 具有存取權的使用者：選擇 **任何人，包括匿名使用者**。
5. 點擊 **部署**。
6. 複製部署完成後產生的網址。它會像這樣：`https://script.google.com/macros/s/XXXXXXXXXXXX/exec`。

> 如果你已經修改過 Apps Script 程式碼，請務必重新部署新版 Web App，否則前端送出的請求仍會連到舊版本。
>
> 如果表單仍無法送出，請確認 Apps Script 的存取權限設定為「任何人，包括匿名使用者」。
>
> 如果你使用的是 `manage.html`，請確保是透過 GitHub Pages 或 Web 伺服器存取該 HTML，而不是直接以 `file://` 打開。

## 4. 更新前端代碼
1. 打開 `app.js`（或 `docs/app.js`），將開頭的 `APPS_SCRIPT_URL` 更新為你剛剛複製的 Web App 網址：
  ```javascript
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec';
  ```
2. 儲存檔案後，重新整理瀏覽器即可讓表單頁面開始送出資料至試算表。

## 5. 使用說明
- 填寫 `manage.html`（現在為諮詢表單）的欄位：
  - `姓名`：name（可留空以匿名）
  - `聯絡 Email`：email（若需要回覆則建議填寫）
  - `所在國家 / 地區`：country
  - `年齡`：age（選填）
  - `關注主題`：concern
  - `訊息 / 需求說明`：message

按下「送出諮詢表單」，表單會把資料送到 Apps Script 後端，並寫入試算表。

## 6. 測試方式
1. 在 `manage.html` 填寫完整欄位，按「新增單字」。
2. 如果 Apps Script 部署正常，頁面會顯示「單字已新增並寫入試算表！」。
3. 開啟試算表，應該會看到新資料新增到第 2 列以後。
4. 前往 `index.html`，應該能看見新卡片資料。

## 7. 注意事項
- `APPS_SCRIPT_URL` 必須設定為你自己的部署網址。
- 如果部署網址錯誤，會在瀏覽器控制台看到錯誤訊息。
- 如果試算表沒有第一列標題，Apps Script 會自動建立它。

---

完成後，管理表單就會透過 Google Apps Script 送出資料，並寫入指定的 Google 試算表。

## 附錄：同志諮詢表單 (範例 Apps Script)

以下為用於 `docs/contact.html` 的 Apps Script 範例（可貼入 Apps Script 編輯器並部署為 Web App）：

```javascript
const SHEET_ID = '1RZbzyKorRyea651MM6qlkg-PLnN9TM66atNdcDvE3As';

function doPost(e) {
  const request = JSON.parse(e.postData.contents || '{}');
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

  if (request.action === 'add') {
    return addEntry(sheet, request.entry);
  }
  if (request.action === 'read') {
    return readEntries(sheet);
  }
  return jsonResponse({ error: 'Unknown action' });
}

function ensureHeaderRow(sheet) {
  const header = ['timestamp', 'name', 'email', 'country', 'age', 'concern', 'message'];
  const currentHeader = sheet.getRange(1, 1, 1, header.length).getValues()[0] || [];
  if (currentHeader.join() !== header.join()) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

function addEntry(sheet, entry) {
  if (!entry) return jsonResponse({ success: false, error: 'Missing entry' });
  ensureHeaderRow(sheet);
  sheet.appendRow([
    entry.timestamp || new Date().toISOString(),
    entry.name || '',
    entry.email || '',
    entry.country || '',
    entry.age || '',
    entry.concern || '',
    entry.message || ''
  ]);
  return jsonResponse({ success: true });
}

function readEntries(sheet) {
  ensureHeaderRow(sheet);
  const data = sheet.getDataRange().getValues();
  const entries = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      entries.push({
        timestamp: data[i][0], name: data[i][1], email: data[i][2], country: data[i][3], age: data[i][4], concern: data[i][5], message: data[i][6]
      });
    }
  }
  return jsonResponse({ entries });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
```

部署流程請參照上方第 3 節（部署為 Web App），部署完成後把產生的 `exec` 網址貼回 `docs/app.js` 的 `APPS_SCRIPT_URL` 常數。
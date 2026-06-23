# duck-unicorn

本專案包含一個示範性的「同志諮詢」靜態網站（放在 `docs/`），支援：

- 前端網頁（`docs/index.html`, `docs/contact.html`）
- API 自動填入（使用 `randomuser.me` 與 `restcountries.com`）
- 將表單資料寫入 Google 試算表的 Apps Script 範例（請參閱 `GOOGLE_APPS_SCRIPT.md`）

快速部署流程：
1. 在 Google 試算表建立或使用 README 與 `GOOGLE_APPS_SCRIPT.md` 中說明的試算表。記下試算表 ID。
2. 打開試算表的 Apps Script，貼上 `apps_script_counseling.gs` 的內容並部署為 Web App（參考 `GOOGLE_APPS_SCRIPT.md`）。
3. 取得部署後的 `exec` 網址，編輯 `docs/app.js`，把 `APPS_SCRIPT_URL` 設為你的 Apps Script Web App 域名。
4. 將整個專案推上 GitHub（`main` 分支或你偏好的分支）。
5. 在 GitHub Repo > Settings > Pages 中，將來源設定為 `docs/` 資料夾（或選擇 main branch 的 docs folder），保存後等待發布。

預期 GitHub Pages 網址（請在啟用 Pages 後檢查是否可用）：

https://unicorn666-jpg.github.io/duck-unicorn/

（若你使用其他帳戶或 repo 名稱，網址會依實際倉庫位置變動）
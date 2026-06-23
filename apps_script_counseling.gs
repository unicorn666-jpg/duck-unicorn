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

  if (request.action === 'write') {
    return writeEntries(sheet, request.entries || []);
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
  if (!entry) {
    return jsonResponse({ success: false, error: 'Missing entry' });
  }
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
        timestamp: data[i][0],
        name: data[i][1],
        email: data[i][2],
        country: data[i][3],
        age: data[i][4],
        concern: data[i][5],
        message: data[i][6]
      });
    }
  }
  return jsonResponse({ entries });
}

function writeEntries(sheet, entries) {
  ensureHeaderRow(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  if (entries.length > 0) {
    const values = entries.map(e => [
      e.timestamp || '', e.name || '', e.email || '', e.country || '', e.age || '', e.concern || '', e.message || ''
    ]);
    sheet.getRange(2, 1, values.length, 7).setValues(values);
  }
  return jsonResponse({ success: true });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

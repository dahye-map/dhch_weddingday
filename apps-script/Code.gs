/**
 * 모바일 청첩장 백엔드 (Google Apps Script)
 * - "참석여부" 시트: 참석 여부 응답 저장
 * - "럭키드로우" 시트: 응모 저장 및 응모권 번호 순차 발급
 *
 * 배포: 확장 프로그램 > Apps Script 에 붙여넣기 → 배포 > 새 배포 > 웹 앱
 *       (실행 사용자: 나 / 액세스 권한: 모든 사용자) → URL을 config.js 의 apiUrl 에 입력
 */
const RSVP_SHEET = "참석여부";
const LUCKY_SHEET = "럭키드로우";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === "rsvp") return json(saveRsvp(data));
    if (data.type === "lucky") return json(enterLucky(data));
    return json({ ok: false, error: "unknown type" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function saveRsvp(d) {
  const name = clean(d.name);
  if (!name) return { ok: false, error: "name required" };
  const sheet = getSheet(RSVP_SHEET, ["시각", "구분", "성함", "참석여부", "인원", "식사"]);
  sheet.appendRow([new Date(), clean(d.side), name, clean(d.attend), Number(d.count) || 0, clean(d.meal)]);
  return { ok: true };
}

function enterLucky(d) {
  const name = clean(d.name);
  const phone4 = String(d.phone4 || "");
  if (!name || !/^\d{4}$/.test(phone4)) return { ok: false, error: "invalid input" };

  // 동시에 여러 명이 응모해도 번호가 겹치지 않도록 잠금
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet(LUCKY_SHEET, ["응모번호", "성함", "전화번호 뒷자리", "시각"]);
    const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues() : [];
    const found = rows.find((r) => r[1] === name && String(r[2]).padStart(4, "0") === phone4);
    if (found) return { ok: true, ticket: Number(found[0]), duplicate: true };

    const ticket = rows.length + 1;
    sheet.appendRow([ticket, name, "'" + phone4, new Date()]);
    return { ok: true, ticket: ticket, duplicate: false };
  } finally {
    lock.releaseLock();
  }
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 수식 주입 방지 + 길이 제한
function clean(v) {
  return String(v || "").trim().replace(/^[=+\-@]/, "'$&").slice(0, 30);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

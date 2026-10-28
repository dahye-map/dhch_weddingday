# dhch_weddingday

모바일 청첩장 (정적 웹페이지 + Google Sheets 저장)

## 기능
1. **참석 여부** — 신랑측/신부측, 참석/불참, 성함, 인원, 식사 여부
2. **럭키드로우** — 성함 + 전화번호 뒷자리 4자리로 응모 → 응모권 번호(No. 001…) 발급, 랜덤 한줄 응원 메세지 표시
   - 같은 이름 + 같은 뒷자리로 다시 응모하면 새 번호 대신 기존 번호를 보여줍니다.

## 파일
| 파일 | 설명 |
|---|---|
| `config.js` | 이름, 날짜, 장소, 인사말, 응원 메세지 목록, API 주소 — **여기만 수정** |
| `index.html` / `style.css` / `script.js` | 청첩장 화면 |
| `apps-script/Code.gs` | Google Sheets 저장용 백엔드 |

## 응답 저장 설정 (Google Sheets)
1. 새 구글 스프레드시트 생성 → **확장 프로그램 > Apps Script**
2. `apps-script/Code.gs` 내용 붙여넣고 저장
3. **배포 > 새 배포 > 유형: 웹 앱**, 실행 사용자 `나`, 액세스 권한 `모든 사용자` → 배포
4. 나오는 웹 앱 URL을 `config.js`의 `apiUrl`에 입력

`apiUrl`을 비워두면 **데모 모드**로 동작합니다 (응답이 그 기기 브라우저에만 저장되고 서버로 가지 않음).

응답은 스프레드시트의 `참석여부`, `럭키드로우` 시트에 쌓입니다. 당일 추첨은 `럭키드로우` 시트의 응모번호 중에서 뽑으면 됩니다.

## 배포 (GitHub Pages)
저장소 **Settings > Pages > Branch: main / (root)** 선택 → `https://<계정>.github.io/dhch_weddingday/`

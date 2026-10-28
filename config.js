// 청첩장 기본 정보 — 이 파일만 수정하면 됩니다.
window.WEDDING_CONFIG = {
  groom: { name: "신랑이름", parents: "아버지 · 어머니의 아들" },
  bride: { name: "신부이름", parents: "아버지 · 어머니의 딸" },
  date: "2026-12-12T12:30:00+09:00",
  venue: "OO웨딩홀 3층 그랜드홀",
  address: "서울특별시 OO구 OO로 123",
  tel: "02-000-0000",
  // 예식장 좌표 (지도 표시 · 티맵 길안내용). 네이버/카카오 지도에서 장소 우클릭 → 좌표 확인
  location: { lat: 37.5665, lng: 126.978 },

  // 오시는 길 안내
  transport: [
    { title: "지하철", text: "O호선 OO역 O번 출구 도보 5분" },
    { title: "버스", text: "OO정류장 하차 · 간선 000, 지선 0000" },
    { title: "주차", text: "건물 지하 주차장 2시간 무료" },
  ],

  // 사진 갤러리 — images/gallery 폴더에 사진을 넣고 경로를 적어주세요 (첫 9장이 먼저 보이고 나머지는 '더보기')
  gallery: [
    "images/gallery/01.svg",
    "images/gallery/02.svg",
    "images/gallery/03.svg",
    "images/gallery/04.svg",
    "images/gallery/05.svg",
    "images/gallery/06.svg",
    "images/gallery/07.svg",
    "images/gallery/08.svg",
    "images/gallery/09.svg",
    "images/gallery/10.svg",
    "images/gallery/11.svg",
    "images/gallery/12.svg",
  ],

  // 마음 전하실 곳
  accounts: {
    groom: [
      { role: "신랑", name: "신랑이름", bank: "OO은행", number: "000-0000-0000-00" },
      { role: "신랑 아버지", name: "아버지", bank: "OO은행", number: "000-000000-00-000" },
      { role: "신랑 어머니", name: "어머니", bank: "OO은행", number: "000000-00-000000" },
    ],
    bride: [
      { role: "신부", name: "신부이름", bank: "OO은행", number: "000-0000-0000-00" },
      { role: "신부 아버지", name: "아버지", bank: "OO은행", number: "000-000000-00-000" },
      { role: "신부 어머니", name: "어머니", bank: "OO은행", number: "000000-00-000000" },
    ],
  },

  greeting:
    "서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n\n귀한 걸음 하시어 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.",

  // 예식 소요 시간(분) — 캘린더 일정 길이
  durationMinutes: 90,

  // 카카오톡 공유 — developers.kakao.com 에서 앱 생성 후 JavaScript 키 입력
  // (플랫폼 > Web 사이트 도메인에 배포 주소 등록 필요). 비워두면 '링크 복사'로 대신 동작합니다.
  kakaoKey: "",
  share: {
    title: "신랑이름 ♥ 신부이름 결혼합니다",
    description: "12월 12일 토요일 오후 12시 30분, OO웨딩홀",
    // 공유 카드 대표 이미지 — 반드시 https:// 로 시작하는 전체 주소 (권장 800x400 이상)
    imageUrl: "https://example.github.io/dhch_weddingday/images/share.jpg",
  },

  // Google Apps Script 웹앱 URL (apps-script/Code.gs 배포 후 입력)
  // 비워두면 데모 모드로 동작하며, 데이터는 이 브라우저에만 저장됩니다.
  apiUrl: "",

  // 응모 완료 시 랜덤으로 보여줄 한줄 응원 메세지
  cheers: [
    "오늘의 행운은 당신 거예요! 🍀",
    "당첨 기운이 느껴져요, 두근두근 ✨",
    "와주셔서 이미 저희에겐 1등 하객이에요 💐",
    "행운의 여신이 미소 짓고 있어요 😊",
    "좋은 일만 가득하길, 당첨까지 가즈아! 🎉",
    "축하해 주셔서 고마워요. 행운이 함께하길! 💕",
    "이 번호, 왠지 느낌이 좋은데요? 👀",
    "오늘 웃음도, 경품도 다 챙겨가세요 🎁",
    "당신의 축하가 저희에게는 최고의 선물이에요 🌷",
    "두 손 모아 당첨을 기원합니다 🙏",
  ],
};

(function () {
  const C = window.WEDDING_CONFIG;
  const $ = (id) => document.getElementById(id);

  // ---------- 기본 정보 ----------
  const date = new Date(C.date);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const hour = date.getHours();
  const timeText = `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}시${date.getMinutes() ? ` ${date.getMinutes()}분` : ""}`;

  $("groomName").textContent = $("groomName2").textContent = C.groom.name;
  $("brideName").textContent = $("brideName2").textContent = C.bride.name;
  $("groomParents").textContent = C.groom.parents;
  $("brideParents").textContent = C.bride.parents;
  $("dateText").textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일 ${timeText}`;
  $("venueText").textContent = C.venue;
  $("greeting").textContent = C.greeting;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);
  $("dday").textContent =
    diff > 0 ? `결혼식까지 D-${diff}` : diff === 0 ? "오늘 결혼합니다 💍" : "축복해 주셔서 감사합니다";

  // ---------- 공통 ----------
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return null;
    }
  }

  // 서버(Google Apps Script) 호출. apiUrl이 없으면 데모 모드로 브라우저에 저장.
  async function api(payload) {
    if (!C.apiUrl) return demoApi(payload);
    const res = await fetch(C.apiUrl, {
      method: "POST",
      // text/plain 으로 보내야 CORS preflight 없이 Apps Script에 전달됩니다.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "요청에 실패했어요.");
    return data;
  }

  function demoApi(payload) {
    if (payload.type === "rsvp") return Promise.resolve({ ok: true });
    if (payload.type === "guestbook_list") {
      return Promise.resolve({ ok: true, items: store("demo_guestbook") || [] });
    }
    if (payload.type === "guestbook_write") {
      const items = store("demo_guestbook") || [];
      const item = { name: payload.name, message: payload.message, time: new Date().toISOString() };
      items.unshift(item);
      store("demo_guestbook", items);
      return Promise.resolve({ ok: true, item });
    }
    const entries = store("demo_lucky_entries") || [];
    const found = entries.find((e) => e.name === payload.name && e.phone4 === payload.phone4);
    if (found) return Promise.resolve({ ok: true, ticket: found.ticket, duplicate: true });
    const ticket = entries.length + 1;
    entries.push({ name: payload.name, phone4: payload.phone4, ticket });
    store("demo_lucky_entries", entries);
    return Promise.resolve({ ok: true, ticket, duplicate: false });
  }

  function setBusy(form, busy, label) {
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = busy;
    if (busy) {
      btn.dataset.label = btn.textContent;
      btn.textContent = label;
    } else if (btn.dataset.label) {
      btn.textContent = btn.dataset.label;
    }
  }

  async function copyText(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // 일부 인앱 브라우저(카카오톡 등)는 clipboard API를 막아서 예전 방식으로 복사
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(msg);
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- 사진 갤러리 ----------
  const photos = C.gallery || [];
  const PREVIEW = 9;
  const grid = $("galleryGrid");

  photos.forEach((src, i) => {
    const btn = el("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `사진 ${i + 1} 크게 보기`);
    if (i >= PREVIEW) btn.hidden = true;
    const img = el("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(i));
    grid.appendChild(btn);
  });
  if (!photos.length) $("gallery").hidden = true;

  if (photos.length > PREVIEW) {
    $("galleryMore").hidden = false;
    $("galleryMore").addEventListener("click", () => {
      grid.querySelectorAll("button[hidden]").forEach((b) => (b.hidden = false));
      $("galleryMore").hidden = true;
    });
  }

  const lb = $("lightbox");
  let lbIndex = 0;

  function showPhoto(i) {
    lbIndex = (i + photos.length) % photos.length;
    $("lbImg").src = photos[lbIndex];
    $("lbCount").textContent = `${lbIndex + 1} / ${photos.length}`;
  }
  function openLightbox(i) {
    showPhoto(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }

  $("lbClose").addEventListener("click", closeLightbox);
  $("lbPrev").addEventListener("click", () => showPhoto(lbIndex - 1));
  $("lbNext").addEventListener("click", () => showPhoto(lbIndex + 1));
  lb.addEventListener("click", (e) => e.target === lb && closeLightbox());
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
  });

  // 좌우 스와이프
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // ---------- 오시는 길 ----------
  const loc = C.location;
  const q = encodeURIComponent(C.address);
  const venueQ = encodeURIComponent(C.venue.split(" ")[0]);

  $("locVenue").textContent = C.venue;
  $("locAddress").textContent = C.address;
  $("copyAddress").addEventListener("click", () => copyText(C.address, "주소가 복사되었어요"));
  if (C.tel) {
    $("locTel").textContent = `Tel. ${C.tel}`;
    $("locTel").href = `tel:${C.tel.replace(/[^\d+]/g, "")}`;
  }

  $("mapFrame").src = loc
    ? `https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
  $("naverMap").href = `https://map.naver.com/p/search/${q}`;
  $("kakaoMap").href = loc
    ? `https://map.kakao.com/link/map/${venueQ},${loc.lat},${loc.lng}`
    : `https://map.kakao.com/link/search/${q}`;

  // 티맵은 앱 전용이라 좌표가 있을 때만 길안내, 앱이 없으면 설치 페이지로
  $("tmap").addEventListener("click", (e) => {
    e.preventDefault();
    if (!loc) return copyText(C.address, "주소를 복사했어요. 티맵에 붙여넣어 주세요");
    const opened = Date.now();
    location.href = `tmap://route?goalname=${venueQ}&goalx=${loc.lng}&goaly=${loc.lat}`;
    setTimeout(() => {
      if (!document.hidden && Date.now() - opened < 2000) {
        toast("티맵 앱이 설치되어 있지 않아요");
      }
    }, 1500);
  });

  (C.transport || []).forEach((t) => {
    const row = el("div");
    row.append(el("dt", null, t.title), el("dd", null, t.text));
    $("transport").appendChild(row);
  });

  // ---------- 마음 전하실 곳 ----------
  function renderAccounts(list, target) {
    (list || []).forEach((a) => {
      const li = el("li");
      const info = el("div", "account-info");
      info.append(el("div", "role", `${a.role} · ${a.name}`), el("div", "num", `${a.bank} ${a.number}`));
      const btn = el("button", "chip", "복사");
      btn.type = "button";
      btn.addEventListener("click", () => copyText(`${a.bank} ${a.number}`, `${a.role} 계좌번호가 복사되었어요`));
      li.append(info, btn);
      $(target).appendChild(li);
    });
  }
  renderAccounts(C.accounts && C.accounts.groom, "groomAccounts");
  renderAccounts(C.accounts && C.accounts.bride, "brideAccounts");

  // ---------- 1. 참석 여부 ----------
  const rsvpForm = $("rsvpForm");
  const attendOnly = rsvpForm.querySelector(".attend-only");
  const countInput = rsvpForm.elements.count;

  rsvpForm.addEventListener("change", (e) => {
    if (e.target.name === "attend") attendOnly.hidden = e.target.value !== "참석";
  });

  rsvpForm.querySelectorAll("[data-step]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const v = Number(countInput.value) + Number(btn.dataset.step);
      countInput.value = Math.min(10, Math.max(1, v));
    })
  );

  function showRsvpDone(data) {
    const attending = data.attend === "참석";
    $("rsvpDoneTitle").textContent = `${data.name}님, 소중한 마음 감사합니다`;
    $("rsvpDoneSub").textContent = attending
      ? `${data.side} · ${data.count}명 참석 · ${data.meal === "식사함" ? "식사 예정" : "식사 안 함"}\n그날 뵙겠습니다!`
      : "함께하지 못하셔도\n보내주신 마음 잘 간직할게요.";
    rsvpForm.hidden = true;
    $("rsvpDone").hidden = false;
  }

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = rsvpForm.elements;
    const data = {
      type: "rsvp",
      side: f.side.value,
      attend: f.attend.value,
      name: f.name.value.trim(),
      count: f.attend.value === "참석" ? Number(f.count.value) : 0,
      meal: f.attend.value === "참석" ? f.meal.value : "-",
    };
    $("rsvpError").textContent = "";
    if (!data.name) {
      $("rsvpError").textContent = "성함을 입력해 주세요.";
      f.name.focus();
      return;
    }
    setBusy(rsvpForm, true, "전달하는 중…");
    try {
      await api(data);
      store("rsvp", data);
      showRsvpDone(data);
      toast("참석 여부가 전달되었어요");
    } catch (err) {
      $("rsvpError").textContent = "전송에 실패했어요. 잠시 후 다시 시도해 주세요.";
    } finally {
      setBusy(rsvpForm, false);
    }
  });

  $("rsvpEdit").addEventListener("click", () => {
    $("rsvpDone").hidden = true;
    rsvpForm.hidden = false;
  });

  const savedRsvp = store("rsvp");
  if (savedRsvp) {
    const f = rsvpForm.elements;
    f.side.value = savedRsvp.side;
    f.attend.value = savedRsvp.attend;
    f.name.value = savedRsvp.name;
    if (savedRsvp.count) f.count.value = savedRsvp.count;
    if (savedRsvp.meal !== "-") f.meal.value = savedRsvp.meal;
    attendOnly.hidden = savedRsvp.attend !== "참석";
    showRsvpDone(savedRsvp);
  }

  // ---------- 2. 럭키드로우 ----------
  const luckyForm = $("luckyForm");
  const phoneInput = luckyForm.elements.phone4;

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 4);
  });

  function randomCheer() {
    const list = C.cheers;
    let i = Math.floor(Math.random() * list.length);
    // 직전과 같은 메세지가 연속으로 나오지 않게
    if (list.length > 1 && i === randomCheer.last) i = (i + 1) % list.length;
    randomCheer.last = i;
    return list[i];
  }

  function showTicket(entry, note) {
    $("ticketNo").textContent = `No. ${String(entry.ticket).padStart(3, "0")}`;
    $("ticketWho").textContent = `${entry.name} · ****-${entry.phone4}`;
    $("cheer").textContent = randomCheer();
    $("ticketNote").textContent = note;
    luckyForm.hidden = true;
    const t = $("ticket");
    t.hidden = true;
    void t.offsetWidth; // 애니메이션 재실행
    t.hidden = false;
  }

  luckyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = luckyForm.elements.name.value.trim();
    const phone4 = phoneInput.value;
    $("luckyError").textContent = "";
    if (!name) {
      $("luckyError").textContent = "성함을 입력해 주세요.";
      luckyForm.elements.name.focus();
      return;
    }
    if (!/^\d{4}$/.test(phone4)) {
      $("luckyError").textContent = "전화번호 뒷자리 4자리를 입력해 주세요.";
      phoneInput.focus();
      return;
    }
    setBusy(luckyForm, true, "응모하는 중…");
    try {
      const res = await api({ type: "lucky", name, phone4 });
      const entry = { name, phone4, ticket: res.ticket };
      store("lucky", entry);
      showTicket(
        entry,
        res.duplicate
          ? "이미 응모하셨어요! 기존 응모권 번호를 보여드려요."
          : "응모 완료! 예식 당일 이 번호를 기억해 주세요."
      );
    } catch (err) {
      $("luckyError").textContent = "응모에 실패했어요. 잠시 후 다시 시도해 주세요.";
    } finally {
      setBusy(luckyForm, false);
    }
  });

  const savedLucky = store("lucky");
  if (savedLucky) showTicket(savedLucky, "이미 응모하셨어요! 예식 당일 이 번호를 기억해 주세요.");

  // ---------- 캘린더에 추가 ----------
  const end = new Date(date.getTime() + (C.durationMinutes || 90) * 60000);
  const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const calTitle = `${C.groom.name} ♥ ${C.bride.name} 결혼식`;
  const calPlace = `${C.venue} (${C.address})`;

  $("addGoogle").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(calTitle)}` +
    `&dates=${utc(date)}/${utc(end)}` +
    `&location=${encodeURIComponent(calPlace)}` +
    `&details=${encodeURIComponent(location.href.split("#")[0])}`;

  $("addIcs").addEventListener("click", () => {
    const esc = (t) => t.replace(/[\\,;]/g, "\\$&");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//wedding-invitation//KO",
      "BEGIN:VEVENT",
      `UID:${utc(date)}-wedding@invitation`,
      `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(date)}`,
      `DTEND:${utc(end)}`,
      `SUMMARY:${esc(calTitle)}`,
      `LOCATION:${esc(calPlace)}`,
      // 하루 전 알림
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(calTitle)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = el("a");
    a.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    a.download = "wedding.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // ---------- 방명록 ----------
  const gbForm = $("gbForm");
  const GB_PAGE = 5;
  let gbItems = [];
  let gbShown = GB_PAGE;

  function formatTime(iso) {
    const d = new Date(iso);
    return isNaN(d) ? "" : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function renderGuestbook() {
    const list = $("gbList");
    list.textContent = "";
    gbItems.slice(0, gbShown).forEach((it) => {
      const li = el("li");
      const head = el("div", "gb-head");
      head.append(el("b", null, it.name), el("span", null, formatTime(it.time)));
      li.append(head, el("p", null, it.message));
      list.appendChild(li);
    });
    $("gbEmpty").hidden = gbItems.length > 0;
    $("gbMore").hidden = gbItems.length <= gbShown;
  }

  $("gbMore").addEventListener("click", () => {
    gbShown += GB_PAGE;
    renderGuestbook();
  });

  gbForm.elements.message.addEventListener("input", (e) => {
    $("gbCounter").textContent = `${e.target.value.length}/200`;
  });

  gbForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = gbForm.elements.name.value.trim();
    const message = gbForm.elements.message.value.trim();
    $("gbError").textContent = "";
    if (!name) {
      $("gbError").textContent = "성함을 입력해 주세요.";
      gbForm.elements.name.focus();
      return;
    }
    if (!message) {
      $("gbError").textContent = "메세지를 입력해 주세요.";
      gbForm.elements.message.focus();
      return;
    }
    setBusy(gbForm, true, "남기는 중…");
    try {
      const res = await api({ type: "guestbook_write", name, message });
      gbItems.unshift(res.item);
      gbShown = Math.max(gbShown, GB_PAGE);
      renderGuestbook();
      gbForm.elements.message.value = "";
      $("gbCounter").textContent = "0/200";
      toast("축하 메세지가 등록되었어요 💌");
    } catch (err) {
      $("gbError").textContent = "등록에 실패했어요. 잠시 후 다시 시도해 주세요.";
    } finally {
      setBusy(gbForm, false);
    }
  });

  api({ type: "guestbook_list" })
    .then((res) => {
      gbItems = res.items || [];
      renderGuestbook();
    })
    .catch(() => {
      $("gbEmpty").textContent = "방명록을 불러오지 못했어요.";
      $("gbEmpty").hidden = false;
    });

  // ---------- 공유하기 ----------
  const pageUrl = location.href.split("#")[0];
  let kakaoReady = null;

  // 카카오 SDK는 키가 있을 때만 불러옴
  function loadKakao() {
    if (!C.kakaoKey) return Promise.reject(new Error("no key"));
    if (!kakaoReady) {
      kakaoReady = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
        s.onload = () => {
          if (!window.Kakao.isInitialized()) window.Kakao.init(C.kakaoKey);
          resolve(window.Kakao);
        };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return kakaoReady;
  }
  if (C.kakaoKey) loadKakao().catch(() => {});

  $("shareKakao").addEventListener("click", async () => {
    const share = C.share || {};
    try {
      const Kakao = await loadKakao();
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: share.title,
          description: share.description,
          imageUrl: share.imageUrl,
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
        buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }],
      });
    } catch (err) {
      // 키가 없거나 SDK를 못 불러오면 기기 기본 공유 → 그것도 안 되면 링크 복사
      if (navigator.share) {
        navigator.share({ title: share.title, text: share.description, url: pageUrl }).catch(() => {});
      } else {
        copyText(pageUrl, "링크가 복사되었어요. 카카오톡에 붙여넣어 주세요");
      }
    }
  });

  $("shareLink").addEventListener("click", () => copyText(pageUrl, "청첩장 링크가 복사되었어요"));
})();

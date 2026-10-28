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
})();

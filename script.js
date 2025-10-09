/* ==== Onde editar os dados do evento (variáveis) ====
   Preencha abaixo e a UI atualiza sozinha. O botão "Adicionar ao calendário"
   usa estes dados para gerar um arquivo .ics (duração padrão: 2h).
*/
const INVITE = {
  title: "Show • ANAVITÓRIA — Esquinas",
  date: "11/10/2025", // dd/mm/aaaa
  time: "21:00", // hh:mm
  place: "Vivo Rio",
  city: "Rio de Janeiro, RJ",
  note: "vamos viver nossas esquinas juntas? 💘 — thay",
};

/* ==== Utilidades ==== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function updateInviteUI() {
  $$("#inviteDetails [data-field='date']").forEach(
    (el) => (el.textContent = INVITE.date)
  );
  $$("#inviteDetails [data-field='time']").forEach(
    (el) => (el.textContent = INVITE.time)
  );
  $$("#inviteDetails [data-field='place']").forEach(
    (el) => (el.textContent = INVITE.place)
  );
  $$("#inviteDetails [data-field='city']").forEach(
    (el) => (el.textContent = INVITE.city)
  );
}
updateInviteUI();

/* ---- Navegação ativa ---- */
function setActiveNav() {
  const sections = $$(".section");
  const items = $$(".nav-item");
  const y = window.scrollY + 120;
  let current = "inicio";
  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    if (y >= top && y < bottom) current = sec.id;
  });
  items.forEach((a) =>
    a.classList.toggle("active", a.getAttribute("href") === "#" + current)
  );
}
document.addEventListener("scroll", setActiveNav);

/* ---- RSVP (mock) ---- */
$("#sendRSVP").addEventListener("click", () => {
  const name = $("#guest").value.trim();
  const answer = $("#answer").value;
  const msg = $("#message").value.trim();

  if (!name || !answer) {
    showToast("preenche o nome e a resposta 💛");
    return;
  }
  const human =
    answer === "Obaa! te busco, vida ✨🌙"
      ? "obaaa! te busco linda ✨"
      : answer === "talvez"
      ? "tudo bem, me avisa e eu me organizo 🌙"
      : "vou sentir saudade, mas te abraço depois 💌";

  const status = `✔ rsvp salvo: ${name} — ${answer}${
    msg ? " • “" + msg + "”" : ""
  }`;
  $("#rsvpStatus").textContent = status;
  showToast(human);
});

/* ---- Botão ACEITO + coraçõezinhos ---- */
$("#btnRSVP").addEventListener("click", async () => {
  heartRain();
  showToast("não acredito que você aceitou 💛");
  try { if (bgm && bgm.paused) { bgm.currentTime = 0; await bgm.play(); } } catch (e) { console.warn("som só inicia após interação extra:", e); }
});

/* ---- .ics: adicionar ao calendário ---- */
$("#btnCalendar").addEventListener("click", () => {
  const ics = buildICS();
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "convite-esquinas.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("evento salvo no seu calendário 📆");
});

function buildICS() {
  // converte DD/MM/AAAA HH:MM para UTC-ish local (sem TZ) no formato YYYYMMDDTHHMMSSZ
  const [d, m, y] = INVITE.date.split("/").map(Number);
  const [hh, mm] = INVITE.time.split(":").map(Number);
  const start = new Date(y, m - 1, d, hh, mm);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2h
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//lua&thay//esquinas-invite//PT-BR",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID ? crypto.randomUUID() : Date.now() + "@esquinas"}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${INVITE.title}`,
    `LOCATION:${INVITE.place}, ${INVITE.city}`,
    `DESCRIPTION:${INVITE.note}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ---- Toast ---- */
function showToast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

/* ---- Animação de corações ---- */
function heartRain() {
  const container = $("#heartRain");
  const N = 18;
  for (let i = 0; i < N; i++) {
    const span = document.createElement("span");
    span.className = "heart";
    span.textContent = Math.random() > 0.4 ? "💖" : "🧡";
    span.style.left = Math.random() * 88 + "%";
    span.style.animationDuration = 2.8 + Math.random() * 1.6 + "s";
    container.appendChild(span);
    setTimeout(() => span.remove(), 3600);
  }
}

/* ---- Play/Pause real com música de fundo ---- */
const bgm = document.getElementById("bgm");
const playBtn = document.getElementById("mockPlay");

// volume inicial
bgm.volume = 0.6;

playBtn.addEventListener("click", async (e) => {
  const isPlaying = !bgm.paused;

  if (!isPlaying) {
    try {
      await bgm.play();
      playBtn.textContent = "⏸";
      playBtn.setAttribute("aria-pressed", "true");
      showToast("tocando 💫");
    } catch (err) {
      console.warn("autoplay bloqueado até interação válida:", err);
      showToast("clique pra liberar o som 🎧");
    }
  } else {
    bgm.pause();
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-pressed", "false");
    showToast("pausado 🎵");
  }
});

/* ---- Acessibilidade: foco visível ---- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("show-focus");
  }
});


/* ---- Mensagens suaves por seção ---- */
const whispers = {
  inicio: "vem viver as esquinas comigo ✨",
  album: "essa trilha é nossa cara 🎶",
  nos: "teu sorriso é meu lugar favorito 🌙",
  convite: "prometo cuidar do seu coração 💌",
};
const toastOnce = new Set();
document.addEventListener("scroll", () => {
  const secs = document.querySelectorAll(".section");
  const y = window.scrollY + 140;
  secs.forEach((sec) => {
    const top = sec.offsetTop, bottom = top + sec.offsetHeight;
    if (y >= top && y < bottom && !toastOnce.has(sec.id) && whispers[sec.id]) {
      showToast(whispers[sec.id]);
      toastOnce.add(sec.id);
    }
  });
});

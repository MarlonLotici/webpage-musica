import * as C from "./config.js";
import { BLOCKS, PHASES, TAG_BADGES } from "./repertoireData.js";
import { getVotes, vote, myVotes, subscribe } from "./votesService.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const waLink = (text) => `https://wa.me/${C.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const icons = () => window.lucide && window.lucide.createIcons();

const state = {
  mode: location.hash === "#stage" ? "stage" : "show",
  query: "",
  votes: {},
  stageBlock: 1,
  stageSong: null, // índice da música aberta em tela cheia
  timer: { running: false, elapsed: 0, target: 60, last: 0, id: null },
};

/* ---------- Header / Footer ---------- */
function header() {
  const tab = (m, label) =>
    `<button data-mode="${m}" class="tap flex-1 px-3 rounded-full text-sm font-semibold ${state.mode === m ? "bg-amber text-black" : "text-gray-300"}">${label}</button>`;
  return `
  <header class="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F19]/85 border-b border-white/10 pt-[env(safe-area-inset-top)]">
    <div class="max-w-3xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h1 class="text-xl font-extrabold tracking-wide">MARLON LOTICI</h1>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-300 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5"><span class="live-dot">🔴</span> LIVE LOOP EXPERIENCE</span>
        </div>
        <a href="${C.INSTAGRAM_URL}" target="_blank" rel="noopener" class="tap inline-flex items-center gap-1.5 px-3 rounded-full glass text-sm"><i data-lucide="instagram" class="w-4 h-4"></i>${C.INSTAGRAM_HANDLE}</a>
      </div>
      <p class="text-xs text-gray-400 mt-1 italic">O impacto de uma banda completa. A versatilidade de um artista solo.</p>
      <nav class="mt-3 flex gap-1 p-1 rounded-full glass" aria-label="Modos">
        ${tab("show", "🎤 Ao Vivo no Show")}${tab("b2b", "🤝 Contrate p/ Eventos")}
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="max-w-3xl mx-auto px-4 pb-24 pt-8 text-center text-xs text-gray-500">
    © ${new Date().getFullYear()} Marlon Lotici · Florianópolis
    <button data-act="stage-open" class="tap ml-2 opacity-30 hover:opacity-100" aria-label="Stage view"><i data-lucide="lock" class="w-3 h-3 inline"></i></button>
  </footer>`;
}

/* ---------- MODO 1 ---------- */
function explainer() {
  const item = (e, t) => `<div class="flex-1 text-center"><div class="text-2xl">${e}</div><div class="text-[11px] leading-tight mt-1 text-gray-300">${t}</div></div>`;
  return `<section class="glass rounded-2xl p-4">
    <h2 class="text-sm font-bold text-amber mb-3">O que é Live Loop?</h2>
    <div class="flex gap-2">${item("🥁", "Beatbox na Voz")}${item("🎸", "Baixo & Violão Ao Vivo")}${item("🔁", "Loop Station RC-50<br><b>100% Sem Playback!</b>")}</div>
  </section>`;
}

function blockCard(b) {
  const v = state.votes[b.id] || 0;
  const mine = myVotes()[b.id] || 0;
  const q = norm(state.query);
  return `<article class="glass rounded-2xl p-4" data-block="${b.id}">
    <div class="flex justify-between items-start gap-2">
      <div>
        <div class="text-[11px] text-teal font-bold">BLOCO ${b.id}</div>
        <h3 class="font-bold leading-tight">${esc(b.name)}</h3>
        <div class="text-xs text-gray-400">${esc(b.bpm)} BPM</div>
      </div>
      <div class="text-right"><div class="text-2xl font-extrabold text-amber" data-count>${v}</div><div class="text-[10px] text-gray-400">votos</div></div>
    </div>
    <ol class="mt-3 space-y-1.5 text-sm">
      ${b.songs.map((s, i) => {
        const hit = q && norm(`${s.title} ${s.artist}`).includes(q);
        return `<li class="flex gap-2 ${hit ? "bg-amber/20 rounded-md px-1 -mx-1" : ""}">
          <span class="text-gray-500 w-4">${i + 1}.</span>
          <span><b>${esc(s.title)}</b> <span class="text-gray-400">— ${esc(s.artist)}</span> ${s.calm ? '<span class="text-[10px] text-teal ml-1">🌙 tranquila</span>' : '<span class="text-[10px] text-amber ml-1">⚡</span>'}</span>
        </li>`;
      }).join("")}
    </ol>
    <button data-act="vote" data-id="${b.id}" class="tap mt-3 w-full rounded-xl bg-gradient-to-r from-amber to-orange-500 text-black font-bold">🔥 Votar neste Bloco${mine ? ` <span class="text-xs font-normal">(você: ${mine})</span>` : ""}</button>
  </article>`;
}

function blocksList() {
  const q = norm(state.query.trim());
  let out = "";
  for (const phase of [1, 2, 3]) {
    const blocks = BLOCKS.filter((b) => b.phase === phase && (!q || b.songs.some((s) => norm(`${s.title} ${s.artist}`).includes(q) || norm(b.name).includes(q))));
    if (!blocks.length) continue;
    out += `<h2 class="text-sm font-bold text-teal mt-6 mb-2 px-1">${PHASES[phase]}</h2><div class="space-y-3">${blocks.map(blockCard).join("")}</div>`;
  }
  return out || `<p class="text-center text-gray-400 py-10">Nenhuma música encontrada 🎵 <br><span class="text-xs">Peça no botão "Destacar Pedido"!</span></p>`;
}

function showView() {
  return `<main class="view max-w-3xl mx-auto px-4 py-4 space-y-4">
    ${explainer()}
    <button data-act="modal" class="tap w-full rounded-2xl bg-gradient-to-r from-teal to-emerald-600 text-black font-bold py-3 shadow-lg shadow-emerald-500/20">🎶 Destacar Pedido + Caixinha Pix</button>
    <div class="relative"><i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <input id="search" type="search" value="${esc(state.query)}" placeholder="Buscar música ou artista…" class="w-full min-h-[44px] pl-9 pr-3 rounded-xl glass placeholder-gray-500 outline-none focus:border-amber"></div>
    <div id="blocks">${blocksList()}</div>
  </main>
  <button data-act="modal" class="tap fixed bottom-4 right-4 z-30 rounded-full bg-teal text-black font-bold px-4 shadow-xl pb-[env(safe-area-inset-bottom)]" aria-label="Pedir música">🎶 Pedir / Pix</button>`;
}

/* ---------- Modal de pedido ---------- */
function openModal() {
  const opts = BLOCKS.map((b) => `<optgroup label="Bloco ${b.id} — ${esc(b.name)}">${b.songs.map((s) => `<option>${esc(s.title)} — ${esc(s.artist)}</option>`).join("")}</optgroup>`).join("");
  const el = document.createElement("div");
  el.id = "modal";
  el.className = "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm";
  el.innerHTML = `<div class="view w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#111827] border border-white/10 p-5 space-y-3">
    <div class="flex justify-between items-center"><h2 class="font-bold text-lg">🎶 Pedido + Caixinha Pix</h2><button data-act="close" class="tap" aria-label="Fechar"><i data-lucide="x"></i></button></div>
    <input id="m-name" placeholder="Seu nome / Mesa" class="w-full min-h-[44px] px-3 rounded-xl glass outline-none">
    <select id="m-song" class="w-full min-h-[44px] px-3 rounded-xl bg-[#1f2937] border border-white/10"><option value="">Música ou bloco desejado…</option>${opts}</select>
    <input id="m-song-free" placeholder="…ou digite outra música" class="w-full min-h-[44px] px-3 rounded-xl glass outline-none">
    <textarea id="m-msg" rows="2" placeholder='Recado (ex: "Parabéns pra mesa 4!")' class="w-full px-3 py-2 rounded-xl glass outline-none"></textarea>
    <div><div class="text-xs text-gray-400 mb-1">Valor de apoio</div>
      <div class="flex gap-2" id="m-vals">${C.PIX_SUGGESTED.map((v) => `<button data-val="${v}" class="tap flex-1 rounded-xl glass font-semibold">R$ ${v}</button>`).join("")}<input id="m-val-free" inputmode="numeric" placeholder="Livre" class="w-20 min-h-[44px] text-center rounded-xl glass outline-none"></div></div>
    <button data-act="copy-pix" class="tap w-full rounded-xl border border-amber text-amber font-semibold">📋 Copiar Chave Pix</button>
    <div class="text-[11px] text-gray-500 text-center">Pix: ${esc(C.PIX_NAME)}</div>
    <button data-act="send-wa" class="tap w-full rounded-xl bg-teal text-black font-bold">Enviar Pedido direto pro WhatsApp do Palco</button>
  </div>`;
  document.body.appendChild(el);
  icons();
}
const closeModal = () => $("#modal")?.remove();

function sendWhatsApp() {
  const g = (id) => $(id).value.trim();
  const song = g("#m-song-free") || g("#m-song");
  const val = $("#m-vals .sel")?.dataset.val || g("#m-val-free");
  if (!song && !g("#m-msg")) return toast("Escolha uma música ou escreva um recado");
  const text = ["🎶 *PEDIDO — Live Loop*", `👤 ${g("#m-name") || "—"}`, `🎵 ${song || "—"}`, g("#m-msg") && `💬 ${g("#m-msg")}`, val && `💸 Apoio Pix: R$ ${val}`].filter(Boolean).join("\n");
  window.open(waLink(text), "_blank", "noopener");
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] glass bg-black/80 px-4 py-2 rounded-full text-sm";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* ---------- MODO 2 ---------- */
function b2bView() {
  const fmt = (icon, title, text, tags) => `<article class="glass rounded-2xl p-5"><div class="text-3xl">${icon}</div><h3 class="font-bold text-lg mt-2">${title}</h3><p class="text-sm text-gray-300 mt-1">${text}</p><div class="flex flex-wrap gap-1.5 mt-3">${tags.map((t) => `<span class="text-[11px] px-2 py-0.5 rounded-full bg-teal/15 text-teal">${t}</span>`).join("")}</div></article>`;
  const video = (v) => `<div class="shrink-0 w-44 snap-center"><div class="aspect-[9/16] rounded-2xl overflow-hidden glass flex items-center justify-center">${v.embed ? `<iframe src="${esc(v.embed)}" class="w-full h-full" loading="lazy" allowfullscreen title="${esc(v.title)}"></iframe>` : '<i data-lucide="play-circle" class="w-10 h-10 text-gray-500"></i>'}</div><div class="text-xs text-center mt-1 text-gray-400">${v.title}</div></div>`;
  return `<main class="view max-w-3xl mx-auto px-4 py-6 space-y-8">
    <section class="text-center space-y-3">
      <h2 class="text-3xl font-extrabold leading-tight">A Energia de uma <span class="text-amber">Banda Completa</span> no Espaço e Custo de um Artista Solo.</h2>
      <p class="text-gray-300">Bateria em beatbox, contrabaixo no violão, harmonias vocais e solos construídos 100% ao vivo na Boss RC-50. Do som elegante de recepção à pista de dança cheia.</p>
      <a href="#orcamento" class="tap inline-flex items-center px-6 rounded-full bg-amber text-black font-bold">Solicitar Proposta</a>
    </section>
    <section><div class="flex gap-3 overflow-x-auto snap-x pb-2">${C.VIDEOS.map(video).join("")}</div></section>
    <section class="space-y-3"><h2 class="text-xl font-bold">3 formatos de evento</h2>
      ${fmt("💼", "Corporate & Tech Happy Hour", "Ideal para empresas, confraternizações e eventos em Florianópolis. Montagem em 20 min, som JBL EON 712 próprio incluso.", ["Montagem 20 min", "JBL EON 712 incluso", "Florianópolis"])}
      ${fmt("🌅", "Sunset, Casamentos & Private Parties", "Recepção acústica sofisticada na 1ª hora, evoluindo para balada Pop/Disco/Carnaval.", ["Recepção acústica", "Pop / Disco / Carnaval"])}
      ${fmt("🍻", "Gastrobares & Cervejarias Premium", "Show de 3 horas com dinâmica planejada em blocos para aumentar a permanência e o consumo.", ["3 horas", "Show em blocos"])}
    </section>
    <section id="orcamento" class="glass rounded-2xl p-5 space-y-3 scroll-mt-40">
      <h2 class="text-xl font-bold">Solicite disponibilidade e proposta</h2>
      <select id="q-type" class="w-full min-h-[44px] px-3 rounded-xl bg-[#1f2937] border border-white/10"><option>Casamento</option><option>Corporativo</option><option>Aniversário</option><option>Bar/Pub</option></select>
      <input id="q-date" type="date" class="w-full min-h-[44px] px-3 rounded-xl bg-[#1f2937] border border-white/10">
      <input id="q-place" list="places" placeholder="Local / Bairro (ex: Lagoa, Jurerê)" class="w-full min-h-[44px] px-3 rounded-xl glass outline-none">
      <datalist id="places"><option>Florianópolis Centro</option><option>Lagoa da Conceição</option><option>Santa Mônica</option><option>Jurerê</option><option>Campeche</option><option>Itacorubi</option></datalist>
      <select id="q-dur" class="w-full min-h-[44px] px-3 rounded-xl bg-[#1f2937] border border-white/10"><option>2h</option><option>3h</option></select>
      <input id="q-name" placeholder="Seu nome / Empresa" class="w-full min-h-[44px] px-3 rounded-xl glass outline-none">
      <button data-act="send-quote" class="tap w-full rounded-xl bg-amber text-black font-bold">Solicitar Disponibilidade e Proposta</button>
    </section>
  </main>`;
}

function sendQuote() {
  const v = (id) => $(id).value.trim();
  const date = v("#q-date") ? v("#q-date").split("-").reverse().join("/") : "a definir";
  const text = ["*Solicitação de Proposta — Live Loop Experience*", `Contratante: ${v("#q-name") || "—"}`, `Tipo de evento: ${v("#q-type")}`, `Data estimada: ${date}`, `Local: ${v("#q-place") || "a definir"}`, `Duração: ${v("#q-dur")}`, "", "Gostaria de verificar disponibilidade e receber proposta."].join("\n");
  window.open(waLink(text), "_blank", "noopener");
}

/* ---------- MODO 3: Stage ---------- */
const fmtTime = (ms) => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

function stageTimerHtml() {
  const t = state.timer, remaining = t.target * 60000 - t.elapsed;
  return `<span id="t-elapsed">${fmtTime(t.elapsed)}</span> <span class="text-gray-500 text-sm">/ ${t.target}min · restam <span id="t-left" class="${remaining < 300000 ? "text-red-400" : ""}">${remaining < 0 ? "-" : ""}${fmtTime(Math.abs(remaining))}</span></span>`;
}

function badges(s) {
  return s.tags.map((t) => `<span class="inline-block px-2 py-1 rounded-md bg-amber text-black font-extrabold text-sm">[${TAG_BADGES[t]}]</span>`).join(" ");
}

function stageView() {
  const b = BLOCKS.find((x) => x.id === state.stageBlock);
  const patch = b.patch === 2 ? "PATCH 02 · ONE-SHOT" : "PATCH 01 · LOOP SYNC ON";
  const pills = BLOCKS.map((x) => `<button data-sblock="${x.id}" class="tap shrink-0 w-11 rounded-lg font-extrabold ${x.id === b.id ? "bg-amber text-black" : "bg-gray-900 text-gray-300 border border-gray-700"}">${x.id}</button>`).join("");
  const list = b.songs.map((s, i) => `
    <button data-song="${i}" class="block w-full text-left rounded-2xl border ${s.calm ? "border-teal/60" : "border-gray-700"} bg-gray-950 p-4 active:bg-gray-900">
      <div class="flex justify-between items-baseline gap-2"><span class="text-2xl font-extrabold">${i + 1}. ${esc(s.title)}</span><span class="text-gray-400 text-sm shrink-0">${esc(s.bpm || b.bpm)} BPM</span></div>
      <div class="text-gray-400">${esc(s.artist)}</div>
      <div class="text-3xl font-black text-yellow-300 mt-2 leading-snug">${esc(s.chords)}</div>
      <div class="mt-2 text-sm text-gray-300">${esc(s.notes)}</div>
      <div class="mt-2 flex flex-wrap gap-1.5">${badges(s)}</div>
    </button>`).join("");
  return `<div class="stage fixed inset-0 z-50 overflow-y-auto text-white p-3 pb-10">
    <div class="flex items-center justify-between gap-2 sticky top-0 bg-black pb-2 z-10">
      <div class="text-4xl font-black tabular-nums" id="timer">${stageTimerHtml()}</div>
      <div class="flex gap-1.5">
        <button data-act="t-toggle" class="tap px-4 rounded-lg bg-teal text-black font-bold" id="t-toggle">${state.timer.running ? "Pausar" : "Start"}</button>
        <button data-act="t-reset" class="tap px-3 rounded-lg bg-gray-800 font-bold">Reset</button>
        <button data-act="t-target" class="tap px-3 rounded-lg bg-gray-800 font-bold">${state.timer.target === 60 ? "1h" : "1h30"}</button>
        <button data-act="stage-exit" class="tap px-3 rounded-lg bg-red-900 font-bold" aria-label="Sair">✕</button>
      </div>
    </div>
    <div class="flex gap-1.5 overflow-x-auto pb-2">${pills}</div>
    <div class="my-2"><div class="text-xl font-extrabold text-yellow-300">BLOCO ${b.id} · ${esc(b.name)}</div>
      <div class="text-gray-300">${esc(b.bpm)} BPM · <b class="${b.patch === 2 ? "text-red-400" : "text-teal"}">${patch}</b> · ${PHASES[b.phase].split(":")[0]}</div></div>
    <div class="space-y-3">${list}</div>
    ${state.stageSong !== null ? stageFull(b, b.songs[state.stageSong]) : ""}
  </div>`;
}

function stageFull(b, s) {
  return `<div class="fixed inset-0 z-[60] bg-black p-5 flex flex-col justify-between overflow-y-auto" data-act="song-close">
    <div><div class="text-gray-400 text-lg">Bloco ${b.id} · ${esc(s.bpm || b.bpm)} BPM · ${b.patch === 2 ? "PATCH 02 ONE-SHOT" : "PATCH 01 LOOP SYNC ON"}</div>
      <div class="text-4xl font-black mt-2">${esc(s.title)}</div><div class="text-xl text-gray-400">${esc(s.artist)}</div>
      <div class="text-5xl font-black text-yellow-300 mt-6 leading-tight">${esc(s.chords)}</div>
      <div class="mt-6 space-y-2 text-xl">${s.notes.split(" | ").map((n) => `<div>• ${esc(n)}</div>`).join("")}</div>
      <div class="mt-6 flex flex-wrap gap-2 text-lg">${badges(s)}</div></div>
    <div class="text-center text-gray-600 mt-6 py-3">toque para voltar</div></div>`;
}

/* ---------- Timer ---------- */
function tick() {
  const t = state.timer, now = performance.now();
  t.elapsed += now - t.last; t.last = now;
  const el = $("#timer");
  if (el) el.innerHTML = stageTimerHtml();
}
function toggleTimer() {
  const t = state.timer;
  if (t.running) { clearInterval(t.id); t.running = false; }
  else { t.last = performance.now(); t.id = setInterval(tick, 500); t.running = true; }
  render();
}
function resetTimer() { clearInterval(state.timer.id); Object.assign(state.timer, { running: false, elapsed: 0 }); render(); }

/* ---------- Render / eventos ---------- */
function render() {
  const app = $("#app");
  if (state.mode === "stage") { app.innerHTML = stageView(); icons(); return; }
  app.innerHTML = header() + (state.mode === "show" ? showView() : b2bView()) + footer();
  icons();
}

function setMode(m) {
  state.mode = m;
  if (location.hash === "#stage") history.replaceState(null, "", location.pathname);
  window.scrollTo(0, 0);
  render();
}

function openStage() {
  const pin = prompt("PIN do palco:");
  if (pin === null) return;
  if (pin !== C.STAGE_PIN) return toast("PIN incorreto");
  state.mode = "stage"; state.stageSong = null; render();
}

document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-mode],[data-act],[data-sblock],[data-song],[data-val]");
  if (!t) return;
  if (t.dataset.mode) return setMode(t.dataset.mode);
  if (t.dataset.sblock) { state.stageBlock = +t.dataset.sblock; state.stageSong = null; return render(); }
  if (t.dataset.song !== undefined) { state.stageSong = +t.dataset.song; return render(); }
  if (t.dataset.val) {
    $("#m-vals").querySelectorAll("button").forEach((b) => b.classList.remove("sel", "bg-amber", "text-black"));
    t.classList.add("sel", "bg-amber", "text-black"); $("#m-val-free").value = ""; return;
  }
  switch (t.dataset.act) {
    case "vote": {
      const votes = await vote(+t.dataset.id);
      state.votes = votes; $("#blocks").innerHTML = blocksList(); icons();
      if (navigator.vibrate) navigator.vibrate(30);
      toast("Voto registrado! 🔥"); break;
    }
    case "modal": openModal(); break;
    case "close": closeModal(); break;
    case "copy-pix":
      try { await navigator.clipboard.writeText(C.PIX_KEY); toast("Chave Pix copiada ✅"); }
      catch { prompt("Copie a chave Pix:", C.PIX_KEY); }
      break;
    case "send-wa": sendWhatsApp(); break;
    case "send-quote": sendQuote(); break;
    case "stage-open": openStage(); break;
    case "stage-exit": clearInterval(state.timer.id); state.timer.running = false; setMode("show"); break;
    case "song-close": state.stageSong = null; render(); break;
    case "t-toggle": toggleTimer(); break;
    case "t-reset": resetTimer(); break;
    case "t-target": state.timer.target = state.timer.target === 60 ? 90 : 60; render(); break;
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "search") { state.query = e.target.value; $("#blocks").innerHTML = blocksList(); icons(); }
  if (e.target.id === "m-val-free") $("#m-vals")?.querySelectorAll("button").forEach((b) => b.classList.remove("sel", "bg-amber", "text-black"));
});

window.addEventListener("hashchange", () => {
  if (location.hash === "#stage") { state.mode = "stage"; render(); }
});

subscribe((v) => { state.votes = v; if (state.mode === "show" && $("#blocks")) { $("#blocks").innerHTML = blocksList(); icons(); } });
getVotes().then((v) => { state.votes = v; render(); });
render();

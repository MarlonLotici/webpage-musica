import * as C from "./config.js";
import { BLOCKS, PHASES, TAG_BADGES } from "./repertoireData.js";
import { getVotes, vote, myVote, subscribe } from "./votesService.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const waLink = (text) => `https://wa.me/${C.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const icons = () => window.lucide && window.lucide.createIcons();
const delay = (i) => `style="animation-delay:${Math.min(i, 12) * 60}ms"`;

const state = {
  mode: location.hash === "#stage" ? "stage" : "show",
  query: "",
  votes: {},
  stageBlock: 1,
  stageSong: null,
  timer: { running: false, elapsed: 0, target: 60, last: 0, id: null },
};

/* ---------- Header / Footer ---------- */
function header() {
  const b2b = state.mode === "b2b";
  const tab = (m, label) =>
    `<button data-mode="${m}" role="tab" aria-selected="${state.mode === m}" class="tap relative z-10 flex-1 px-4 text-[13px] font-semibold rounded-full ${state.mode === m ? "text-black" : "text-gray-400 hover:text-white"}">${label}</button>`;
  return `
  <header class="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/5 pt-[env(safe-area-inset-top)]">
    <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
      <a href="#" data-mode="show" class="text-white font-black tracking-[0.3em] text-sm">LOTICI</a>
      <nav role="tablist" aria-label="Modo" class="relative flex p-1 rounded-full bg-white/5 border border-white/10 w-[280px] max-w-[60vw]">
        <span class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ${b2b ? "left-[calc(50%+0px)] bg-amber-400" : "left-1 bg-emerald-400"}"></span>
        ${tab("show", "Público")}${tab("b2b", "Contratantes")}
      </nav>
      <a href="${C.INSTAGRAM_URL}" target="_blank" rel="noopener" class="tap inline-flex items-center justify-center text-gray-400 hover:text-white" aria-label="Instagram ${C.INSTAGRAM_HANDLE}"><i data-lucide="instagram" class="w-5 h-5"></i></a>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="max-w-5xl mx-auto px-4 pb-28 pt-12 text-center text-xs text-gray-600">
    © ${new Date().getFullYear()} Marlon Lotici · Florianópolis · ${C.INSTAGRAM_HANDLE}
    <button data-act="stage-open" class="tap ml-1 opacity-20 hover:opacity-80" aria-label="Stage view"><i data-lucide="lock" class="w-3 h-3 inline"></i></button>
  </footer>`;
}

/* ---------- MODO 1: Jukebox ---------- */
function showHero() {
  const chip = (icon, t) => `<div class="card flex items-center gap-2 px-3 py-2 text-xs text-gray-300 shrink-0"><i data-lucide="${icon}" class="w-4 h-4 text-emerald-400"></i>${t}</div>`;
  return `<section class="pt-8 pb-2 rise">
    <span class="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1"><span class="live-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>LIVE LOOP EXPERIENCE · AO VIVO</span>
    <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold text-white">Vote no próximo<br>bloco do show.</h1>
    <p class="mt-3 text-gray-400 max-w-md">O impacto de uma banda completa. A versatilidade de um artista solo. O mais votado vai pro palco.</p>
    <div class="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
      ${chip("mic-2", "Beatbox na voz")}${chip("guitar", "Baixo & violão ao vivo")}${chip("repeat", "Loop Station RC-50 · sem playback")}
    </div>
  </section>`;
}

function blockCard(b, i) {
  const v = state.votes[b.id] || 0;
  const mine = myVote() === b.id;
  const q = norm(state.query.trim());
  const top = Math.max(0, ...Object.values(state.votes));
  const leading = v > 0 && v === top;
  return `<article class="card glow-emerald relative overflow-hidden p-5 rise" ${delay(i)} data-block="${b.id}">
    <span class="ghost">${String(b.id).padStart(2, "0")}</span>
    <div class="relative">
      <div class="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-500">BLOCO ${String(b.id).padStart(2, "0")} · ${esc(b.bpm)} BPM ${leading ? '<span class="text-emerald-400">· 🔥 EM ALTA</span>' : ""}</div>
      <h3 class="mt-1 text-lg font-bold text-white leading-snug pr-16">${esc(b.name)}</h3>
      <ul class="mt-4 space-y-1.5">
        ${b.songs.map((s) => {
          const hit = q && norm(`${s.title} ${s.artist}`).includes(q);
          return `<li class="text-xs truncate ${hit ? "text-emerald-300" : "text-gray-500"}"><span class="${hit ? "text-emerald-200" : "text-gray-300"}">${esc(s.title)}</span> · ${esc(s.artist)}${s.calm ? " · 🌙" : ""}</li>`;
        }).join("")}
      </ul>
      <div class="mt-5 flex items-center justify-between">
        <div class="text-sm"><span class="text-white font-bold tabular-nums">${v}</span> <span class="text-gray-500">voto${v === 1 ? "" : "s"}${mine ? " · seu voto" : ""}</span></div>
        <button data-act="vote" data-id="${b.id}" aria-label="${mine ? "Seu voto está neste bloco" : "Votar no bloco " + b.id}" class="tap w-12 h-12 rounded-full flex items-center justify-center ${mine ? "bg-white text-black" : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"}"><i data-lucide="${mine ? "check" : "play"}" class="w-5 h-5 ${mine ? "" : "fill-current"}"></i></button>
      </div>
    </div>
  </article>`;
}

function blocksList() {
  const q = norm(state.query.trim());
  let out = "", n = 0;
  for (const phase of [1, 2, 3]) {
    const blocks = BLOCKS.filter((b) => b.phase === phase && (!q || b.songs.some((s) => norm(`${s.title} ${s.artist}`).includes(q)) || norm(b.name).includes(q)));
    if (!blocks.length) continue;
    out += `<h2 class="mt-10 mb-4 text-xs font-semibold tracking-widest uppercase text-gray-500">${PHASES[phase]}</h2>
      <div class="grid gap-3 sm:grid-cols-2">${blocks.map((b) => blockCard(b, n++)).join("")}</div>`;
  }
  return out || `<p class="text-center text-gray-500 py-16">Nada encontrado 🎵<br><span class="text-xs">Peça no botão "Destacar pedido".</span></p>`;
}

function showView() {
  return `<main class="max-w-5xl mx-auto px-4">
    ${showHero()}
    <div class="relative mt-6"><i data-lucide="search" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
      <input id="search" type="search" value="${esc(state.query)}" placeholder="Buscar música ou artista" class="w-full min-h-[48px] pl-11 pr-4 rounded-full bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 outline-none focus:border-white/30 transition-colors"></div>
    <div id="blocks">${blocksList()}</div>
  </main>
  <button data-act="modal" aria-label="Destacar pedido com Pix" class="tap fixed z-30 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] h-14 pl-4 pr-5 rounded-full bg-emerald-500 text-black font-bold text-sm flex items-center gap-2 shadow-2xl shadow-emerald-500/30">
    <span class="absolute inset-0 rounded-full bg-emerald-400 ping-ring -z-10"></span>
    <i data-lucide="sparkles" class="w-5 h-5"></i>Destacar pedido · Pix
  </button>`;
}

/* ---------- Modal de pedido ---------- */
function openModal() {
  const opts = BLOCKS.map((b) => `<optgroup label="Bloco ${b.id} — ${esc(b.name)}">${b.songs.map((s) => `<option>${esc(s.title)} — ${esc(s.artist)}</option>`).join("")}</optgroup>`).join("");
  const el = document.createElement("div");
  el.id = "modal";
  el.className = "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md";
  el.innerHTML = `<div class="rise w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0F0F0F] border border-white/10 p-6 space-y-4">
    <div class="flex justify-between items-center"><h2 class="text-xl font-bold text-white">Destacar pedido</h2><button data-act="close" class="tap flex items-center justify-center text-gray-400 hover:text-white" aria-label="Fechar"><i data-lucide="x"></i></button></div>
    <input id="m-name" placeholder="Seu nome / Mesa" class="field">
    <select id="m-song" class="field text-gray-300"><option value="">Música ou bloco desejado</option>${opts}</select>
    <input id="m-song-free" placeholder="…ou digite outra música" class="field">
    <textarea id="m-msg" rows="2" placeholder='Recado (ex: "Parabéns pra mesa 4!")' class="field resize-none"></textarea>
    <div><div class="text-xs text-gray-500 mb-2">Valor de apoio</div>
      <div class="flex gap-2" id="m-vals">${C.PIX_SUGGESTED.map((v) => `<button data-val="${v}" class="tap flex-1 rounded-full border border-white/10 text-white font-semibold hover:border-white/30">R$ ${v}</button>`).join("")}<input id="m-val-free" inputmode="numeric" placeholder="Livre" class="w-20 min-h-[44px] text-center rounded-full bg-transparent border border-white/10 text-white outline-none focus:border-white/30"></div></div>
    <button data-act="copy-pix" class="tap w-full rounded-full border border-white/15 text-white font-semibold flex items-center justify-center gap-2 hover:border-white/30"><i data-lucide="copy" class="w-4 h-4"></i>Copiar chave Pix</button>
    <div class="text-[11px] text-gray-600 text-center -mt-2">Pix · ${esc(C.PIX_NAME)}</div>
    <button data-act="send-wa" class="tap w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2"><i data-lucide="send" class="w-4 h-4"></i>Enviar pro WhatsApp do palco</button>
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
  t.className = "rise fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-white text-black font-medium px-4 py-2 rounded-full text-sm shadow-xl";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* ---------- MODO 2: B2B ---------- */
function b2bView() {
  const stat = (n, l) => `<div class="card p-6 flex flex-col justify-end"><div class="text-4xl font-extrabold text-white tracking-tight">${n}</div><div class="text-xs mt-1 text-gray-500">${l}</div></div>`;
  const video = (v) => `<div class="shrink-0 w-48 snap-center"><div class="aspect-[9/16] rounded-2xl overflow-hidden card flex items-center justify-center">${v.embed ? `<iframe src="${esc(v.embed)}" class="w-full h-full" loading="lazy" allowfullscreen title="${esc(v.title)}"></iframe>` : '<i data-lucide="play-circle" class="w-10 h-10 text-gray-700"></i>'}</div><div class="text-xs text-center mt-2 text-gray-500">${esc(v.title)}</div></div>`;
  const tag = (t) => `<span class="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-gray-400">${t}</span>`;
  return `<main>
    <section class="relative min-h-[calc(100vh-4rem)] flex items-end md:items-center overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(251,191,36,.12),transparent),radial-gradient(50%_40%_at_10%_60%,rgba(255,255,255,.05),transparent)]"></div>
      ${C.HERO_VIDEO ? `<div class="absolute inset-0 md:hidden"><video class="w-full h-full object-cover opacity-50" src="${esc(C.HERO_VIDEO)}" autoplay loop muted playsinline></video></div>` : ""}
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent md:hidden"></div>
      <div class="relative max-w-5xl mx-auto px-4 pb-16 pt-24 w-full grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
        <span class="rise inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest text-amber-400 border border-amber-400/20 bg-amber-400/5 rounded-full px-3 py-1">LIVE LOOP EXPERIENCE · FLORIANÓPOLIS</span>
        <h1 class="rise mt-6 text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.02]" ${delay(1)}>A pressão de uma banda.<br><span class="text-gray-500">A logística de um artista solo.</span></h1>
        <p class="rise mt-6 max-w-xl text-lg text-gray-400" ${delay(2)}>Bateria em beatbox, contrabaixo no violão, harmonias vocais e solos construídos 100% ao vivo na Boss RC-50. Do som elegante de recepção à pista de dança cheia.</p>
        <div class="rise mt-8 flex flex-wrap gap-3" ${delay(3)}>
          <a href="#orcamento" class="tap inline-flex items-center gap-2 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold">Solicitar proposta <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
          <a href="#formatos" class="tap inline-flex items-center px-6 rounded-full border border-white/15 text-white hover:border-white/30">Ver formatos</a>
        </div>
        </div>
        ${C.HERO_VIDEO ? `<div class="rise hidden md:block w-[290px] aspect-[9/16] max-h-[72vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-400/10" ${delay(2)}><video class="w-full h-full object-cover" src="${esc(C.HERO_VIDEO)}" autoplay loop muted playsinline></video></div>` : ""}
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 py-16">
      <div class="flex gap-4 overflow-x-auto snap-x no-scrollbar md:justify-center">${C.VIDEOS.map(video).join("")}</div>
    </section>

    <section id="formatos" class="max-w-5xl mx-auto px-4 pb-20 scroll-mt-24">
      <h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Três formatos.<br><span class="text-gray-500">Uma assinatura.</span></h2>
      <div class="mt-10 grid gap-3 md:grid-cols-6">
        <article class="card glow-amber p-8 md:col-span-4 md:row-span-2 flex flex-col justify-between min-h-[320px]">
          <div><i data-lucide="building-2" class="w-7 h-7 text-amber-400"></i>
            <h3 class="mt-6 text-2xl font-bold text-white">Corporate & Tech Happy Hour</h3>
            <p class="mt-3 text-gray-400 max-w-md">Ideal para empresas, confraternizações e eventos em Florianópolis. Montagem em 20 minutos, som JBL EON 712 próprio incluso.</p></div>
          <div class="mt-8 flex flex-wrap gap-2">${tag("Montagem 20 min")}${tag("JBL EON 712 incluso")}${tag("Florianópolis")}</div>
        </article>
        ${stat("20 min", "para montar e soar")}
        ${stat("100%", "ao vivo, zero playback")}
        <article class="card glow-amber p-8 md:col-span-3 min-h-[240px] flex flex-col justify-between">
          <div><i data-lucide="sunset" class="w-7 h-7 text-amber-400"></i>
            <h3 class="mt-5 text-xl font-bold text-white">Sunset, Casamentos & Private Parties</h3>
            <p class="mt-2 text-sm text-gray-400">Recepção acústica sofisticada na 1ª hora, evoluindo para balada Pop/Disco/Carnaval.</p></div>
        </article>
        <article class="card glow-amber p-8 md:col-span-3 min-h-[240px] flex flex-col justify-between">
          <div><i data-lucide="beer" class="w-7 h-7 text-amber-400"></i>
            <h3 class="mt-5 text-xl font-bold text-white">Gastrobares & Cervejarias Premium</h3>
            <p class="mt-2 text-sm text-gray-400">Show de 3 horas com dinâmica planejada em blocos para aumentar a permanência e o consumo.</p></div>
        </article>
      </div>
    </section>

    <section id="orcamento" class="max-w-xl mx-auto px-4 pb-24 scroll-mt-24">
      <h2 class="text-3xl font-extrabold text-white tracking-tight">Vamos conversar<span class="text-amber-400">.</span></h2>
      <p class="mt-2 text-gray-400">Informe os detalhes e receba disponibilidade e proposta no WhatsApp.</p>
      <div class="mt-8 space-y-5">
        <input id="q-name" placeholder="Seu nome / Empresa" class="field">
        <select id="q-type" class="field"><option>Casamento</option><option>Corporativo</option><option>Aniversário</option><option>Bar/Pub</option></select>
        <input id="q-date" type="date" class="field text-gray-300" style="color-scheme:dark">
        <input id="q-place" list="places" placeholder="Local / Bairro (ex: Lagoa, Jurerê)" class="field">
        <datalist id="places"><option>Florianópolis Centro</option><option>Lagoa da Conceição</option><option>Santa Mônica</option><option>Jurerê</option><option>Campeche</option><option>Itacorubi</option></datalist>
        <select id="q-dur" class="field"><option>2h</option><option>3h</option></select>
        <button data-act="send-quote" class="tap w-full mt-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold flex items-center justify-center gap-2">Solicitar disponibilidade e proposta <i data-lucide="arrow-up-right" class="w-4 h-4"></i></button>
      </div>
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
const YELLOW = "text-[#FBBF24]";
const fmtTime = (ms) => { const s = Math.floor(Math.max(0, ms) / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

function stageTimerHtml() {
  const t = state.timer, remaining = t.target * 60000 - t.elapsed;
  return `${fmtTime(t.elapsed)} <span class="text-gray-600 text-base font-semibold">/ ${t.target}min · restam <span class="${remaining < 300000 ? "text-red-500" : "text-gray-400"}">${remaining < 0 ? "-" : ""}${fmtTime(Math.abs(remaining))}</span></span>`;
}

const badges = (s) => s.tags.map((t) => `<span class="inline-block px-3 py-1.5 rounded-lg bg-[#FBBF24] text-black font-extrabold text-base">[${TAG_BADGES[t]}]</span>`).join(" ");
const patchLabel = (b) => (b.patch === 2 ? "PATCH 02 · ONE-SHOT" : "PATCH 01 · LOOP SYNC ON");

function stageView() {
  const b = BLOCKS.find((x) => x.id === state.stageBlock);
  const pills = BLOCKS.map((x) => `<button data-sblock="${x.id}" class="tap shrink-0 w-12 rounded-xl font-black text-lg ${x.id === b.id ? "bg-[#FBBF24] text-black" : "bg-[#111] text-gray-400 border border-white/10"}">${x.id}</button>`).join("");
  const list = b.songs.map((s, i) => `
    <button data-song="${i}" class="block w-full text-left rounded-2xl border ${s.calm ? "border-emerald-500/50" : "border-white/15"} bg-[#0A0A0A] p-5 active:bg-[#151515]">
      <div class="flex justify-between items-baseline gap-3"><span class="text-3xl font-black text-white leading-tight">${i + 1}. ${esc(s.title)}</span><span class="${YELLOW} text-2xl font-black shrink-0">${esc(s.bpm || b.bpm)}<span class="text-sm"> BPM</span></span></div>
      <div class="text-gray-500 text-lg">${esc(s.artist)}</div>
      <div class="text-4xl font-black ${YELLOW} mt-3 leading-snug">${esc(s.chords)}</div>
      <div class="mt-3 text-lg text-gray-300">${esc(s.notes)}</div>
      <div class="mt-3 flex flex-wrap gap-2">${badges(s)}</div>
    </button>`).join("");
  return `<div class="fixed inset-0 z-50 overflow-y-auto bg-black text-white p-3 pb-12">
    <div class="flex items-center justify-between gap-2 sticky top-0 bg-black py-2 z-10">
      <div class="text-4xl font-black tabular-nums" id="timer">${stageTimerHtml()}</div>
      <div class="flex gap-1.5">
        <button data-act="t-toggle" class="tap px-4 rounded-xl bg-emerald-500 text-black font-bold">${state.timer.running ? "Pausar" : "Start"}</button>
        <button data-act="t-reset" class="tap px-3 rounded-xl bg-[#1a1a1a] font-bold">Reset</button>
        <button data-act="t-target" class="tap px-3 rounded-xl bg-[#1a1a1a] font-bold">${state.timer.target === 60 ? "1h" : "1h30"}</button>
        <button data-act="stage-exit" class="tap px-3 rounded-xl bg-red-900 font-bold" aria-label="Sair">✕</button>
      </div>
    </div>
    <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">${pills}</div>
    <div class="my-3"><div class="text-2xl font-black ${YELLOW}">BLOCO ${b.id} · ${esc(b.name)}</div>
      <div class="text-xl text-gray-300 mt-1">${esc(b.bpm)} BPM · <b class="${b.patch === 2 ? "text-red-500" : "text-emerald-400"}">${patchLabel(b)}</b></div></div>
    <div class="space-y-3">${list}</div>
    ${state.stageSong !== null ? stageFull(b, b.songs[state.stageSong]) : ""}
  </div>`;
}

function stageFull(b, s) {
  return `<div class="fixed inset-0 z-[60] bg-black p-6 flex flex-col justify-between overflow-y-auto" data-act="song-close">
    <div><div class="text-gray-400 text-xl">Bloco ${b.id} · <span class="${YELLOW} font-black">${esc(s.bpm || b.bpm)} BPM</span> · <b class="${b.patch === 2 ? "text-red-500" : "text-emerald-400"}">${patchLabel(b)}</b></div>
      <div class="text-5xl font-black mt-3 text-white leading-tight">${esc(s.title)}</div><div class="text-2xl text-gray-500">${esc(s.artist)}</div>
      <div class="text-6xl font-black ${YELLOW} mt-8 leading-tight">${esc(s.chords)}</div>
      <div class="mt-8 space-y-3 text-2xl text-gray-200">${s.notes.split(" | ").map((n) => `<div>• ${esc(n)}</div>`).join("")}</div>
      <div class="mt-8 flex flex-wrap gap-3 text-xl">${badges(s)}</div></div>
    <div class="text-center text-gray-700 mt-8 py-3">toque para voltar</div></div>`;
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
  if (t.dataset.mode) { e.preventDefault(); return setMode(t.dataset.mode); }
  if (t.dataset.sblock) { state.stageBlock = +t.dataset.sblock; state.stageSong = null; return render(); }
  if (t.dataset.song !== undefined) { state.stageSong = +t.dataset.song; return render(); }
  if (t.dataset.val) {
    $("#m-vals").querySelectorAll("button").forEach((b) => b.classList.remove("sel", "bg-emerald-500", "text-black"));
    t.classList.add("sel", "bg-emerald-500", "text-black"); $("#m-val-free").value = ""; return;
  }
  switch (t.dataset.act) {
    case "vote": {
      document.body.classList.add("settled");
      const res = await vote(+t.dataset.id);
      state.votes = res.votes;
      $("#blocks").innerHTML = blocksList(); icons();
      if (navigator.vibrate) navigator.vibrate(30);
      toast(!res.changed ? "Você já votou neste bloco ✅" : res.moved ? "Voto movido pra este bloco 🔁" : "Voto registrado 🔥"); break;
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
  if (e.target.id === "search") { document.body.classList.add("settled"); state.query = e.target.value; $("#blocks").innerHTML = blocksList(); icons(); }
  if (e.target.id === "m-val-free") $("#m-vals")?.querySelectorAll("button").forEach((b) => b.classList.remove("sel", "bg-emerald-500", "text-black"));
});

window.addEventListener("hashchange", () => {
  if (location.hash === "#stage") { state.mode = "stage"; render(); }
});

subscribe((v) => { state.votes = v; if (state.mode === "show" && $("#blocks")) { $("#blocks").innerHTML = blocksList(); icons(); } });
getVotes().then((v) => { state.votes = v; if (state.mode === "show" && !$("#modal")) render(); });
render();

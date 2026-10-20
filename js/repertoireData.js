// 12 blocos / 48 músicas. `calm: true` = a música tranquila do bloco (3 animadas + 1 tranquila).
// tags: oct1 | delay | chimbal | oneshot | allstop  (viram badges no Stage View)

export const PHASES = {
  1: "Fase 1: Brasilidades, Reggae & Vibe",
  2: "Fase 2: Pop Rock, Groove & Clássicos Internacionais",
  3: "Fase 3: Balada, Soul & Carnaval",
};

export const TAG_BADGES = {
  oct1: "🎸 LIGAR OCT-1 BAIXO",
  delay: "✨ LIGAR DELAY",
  chimbal: "🥁 TRACK 3: CHIMBAL",
  oneshot: "💥 TRACK 3: ONE-SHOT",
  allstop: "🛑 ALL STOP NO FINAL",
};

export const BLOCKS = [
  {
    id: 1, phase: 1, name: "Nordeste & Xote Groove", bpm: "108-118", patch: 1,
    songs: [
      { title: "La Belle de Jour / Girassol", artist: "Alceu Valença", chords: "G - D - Em - C", notes: "T1: Bumbo tampo + aro | T3: Coro Ôôô", tags: [] },
      { title: "Morena Tropicana", artist: "Alceu Valença", chords: "Am - G - F - E7", notes: "T1: Overdub Xote | T3: Shaker vocal", tags: [] },
      { title: "Xote dos Milagres", artist: "Falamansa", chords: "C - G - Am - F", notes: "T2: Gravar 4 acordes no refrão | T3: Shaker + Hey! | ALL STOP no fim", tags: ["allstop"] },
      { title: "Chão de Giz", artist: "Zé Ramalho", chords: "G - D/F# - Em - C", bpm: "75", calm: true, notes: "75 BPM Tranquila | Delay ON | Dedilhado livre sem T1", tags: ["delay"] },
    ],
  },
  {
    id: 2, phase: 1, name: "Reggae Roots", bpm: "92-96", patch: 1,
    songs: [
      { title: "Pisando Descalço", artist: "Maneva", chords: "C#m - F#m", notes: "T1: Beatbox Reggae One Drop + Inward K | T3: Chimbal no refrão", tags: ["chimbal"] },
      { title: "Sorri, Sou Rei", artist: "Natiruts", chords: "F#m - Bm - E - A", notes: "T1: Mantém | T2: Base p/ solar na intro", tags: [] },
      { title: "Quero Ser Feliz Também", artist: "Natiruts", chords: "Dm - Gm - A7", notes: "T2: Base p/ solo | T3: Coro Ôôô | ALL STOP no fim", tags: ["allstop"] },
      { title: "Is This Love", artist: "Bob Marley", chords: "F#m - D - E - C#m", bpm: "82", calm: true, notes: "82 BPM Tranquila | Groove macio no tampo", tags: [] },
    ],
  },
  {
    id: 3, phase: 1, name: "Acoustic Hip-Hop & Vibe", bpm: "95-100", patch: 1,
    songs: [
      { title: "Sitting, Waiting, Wishing", artist: "Jack Johnson", chords: "Am - G - F - C", notes: "T1: Beatbox Boom-Bap seco | Violão na mão nos versos", tags: [] },
      { title: "Pescador de Ilusões", artist: "O Rappa", chords: "F#m - E - D - E", notes: "T1: Mantém beat | T2: Grava 4 acordes na intro e canta livre", tags: [] },
      { title: "Anjos / Vapor Barato", artist: "O Rappa", chords: "Cm - Bb - Ab - G7", notes: "Delay ON | Pause Pedal 2+3 no grito 'Anjos!' | ALL STOP no fim", tags: ["delay", "allstop"] },
      { title: "Deixe-me Ir", artist: "1Kilo", chords: "Bm - A - Em - G", bpm: "86", calm: true, notes: "86 BPM Tranquila | T2: Grava dedilhado primeiro -> T1: Bumbo + estalo lento", tags: [] },
    ],
  },
  {
    id: 4, phase: 1, name: "Surf Music & Floripa Vibe", bpm: "106-114", patch: 1,
    songs: [
      { title: "Vagabundo Confesso / Dia Lindo", artist: "Dazaranha", chords: "G - D - Em - C", notes: "T1: Beatbox praiano | T2: Base p/ riffs", tags: [] },
      { title: "Rosa Norte", artist: "Armandinho", chords: "C - G - Am - F", notes: "T1: Mantém | T2: 4 acordes + dedilhado agudo ao vivo", tags: [] },
      { title: "Vamos Fugir", artist: "Skank", chords: "F#m - E - Bm - D", notes: "T1: Dobra bumbo | T3: Coro Tê-rê-rê | ALL STOP no fim", tags: ["allstop"] },
      { title: "Outra Vida", artist: "Armandinho", chords: "C - Em - Am - F", bpm: "95", calm: true, notes: "95 BPM Tranquila | Começa voz e violão -> solo com Delay no fim", tags: ["delay"] },
    ],
  },
  {
    id: 5, phase: 2, name: "Pop Rock BR Clássico", bpm: "118-122", patch: 1,
    songs: [
      { title: "O Papa é Pop", artist: "Engenheiros do Hawaii", chords: "G - D - Am - C", notes: "T1: Beatbox Rock 4x4 | T2: Acordes + OCT-1 Baixo | T3: Vocal 'O Papa é Pop!'", tags: ["oct1"] },
      { title: "À Sua Maneira", artist: "Capital Inicial", chords: "Bm - G - D - A", notes: "T1: Mantém 120 BPM | T2: 4 acordes + OCT-1 Baixo | Break Pedal 2+3 antes do refrão", tags: ["oct1"] },
      { title: "Tempos Modernos", artist: "Lulu Santos", chords: "D - G - A", notes: "T1: Mantém | T3: Chimbal no refrão | ALL STOP no fim", tags: ["chimbal", "allstop"] },
      { title: "Refrão de um Bolero", artist: "Engenheiros do Hawaii", chords: "D - A - Bm - F#m - G", bpm: "95", calm: true, notes: "95 BPM Tranquila | Começa violão solo -> beat lento na 2ª parte", tags: [] },
    ],
  },
  {
    id: 6, phase: 2, name: "Skate Rock & Sensual Groove", bpm: "102-108", patch: 1,
    songs: [
      { title: "Me Encontra / Só os Loucos Sabem", artist: "Charlie Brown Jr.", chords: "E - G#m - C#m - A", notes: "T1: Beatbox Skate/Rock | T2: 4 acordes no refrão", tags: [] },
      { title: "Samba Makossa", artist: "Charlie Brown Jr.", chords: "Em7 - A7", notes: "T1: Overdub percussão vocal | T3: Grito 'Samba Makossa!'", tags: [] },
      { title: "Zóio de Lula / Deixe Viver", artist: "Charlie Brown Jr.", chords: "Gm - Cm", notes: "T2: Grava 2 acordes em 4 comp. e canta rap livre | ALL STOP no fim", tags: ["allstop"] },
      { title: "Mania de Você", artist: "Rita Lee", chords: "Am7 - Bm7", calm: true, notes: "Tranquila Sensual | Delay ON | T1: Bumbo profundo no tampo + T3: Backing Uh-uh", tags: ["delay"] },
    ],
  },
  {
    id: 7, phase: 2, name: "Loopers Hipnóticos Internacionais", bpm: "108-114", patch: 1,
    songs: [
      { title: "A Horse With No Name", artist: "America", chords: "Em - D6/9 [GRAVAR 4 COMPASSOS!]", notes: "T1: 4 comp. Bumbo + Shaker | T2: Violão + OCT-1 Baixo | T3: La-la-la", tags: ["oct1"] },
      { title: "Stolen Dance", artist: "Milky Chance", chords: "Bm - G - D - A", notes: "T1: Mantém 4 comp. + aro K | T2: Violão + OCT-1 Baixo obrigatório! | T3: Coro Ooh", tags: ["oct1"] },
      { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", chords: "D - C - G - G", notes: "T1: Mantém | T2: Base p/ solos country | Limpa T2/T3 no fim", tags: [] },
      { title: "With or Without You", artist: "U2", chords: "D - A - Bm - G", bpm: "110", calm: true, notes: "110 BPM Épica | T1: Só bumbo 8ths contínuo | T2: OCT-1 Baixo primeiro + Violão Delay depois | T3: Ooooh clímax", tags: ["oct1", "delay"] },
    ],
  },
  {
    id: 8, phase: 2, name: "Bloco Assinatura: Latin Pop & Disco", bpm: "116", patch: 1,
    songs: [
      { title: "Corazón Espinado", artist: "Santana", chords: "F#m - C#7", notes: "T1: Beatbox 116 BPM | T2: Base no refrão p/ solo com Delay | T3: Grava Shaker e guarda!", tags: ["delay"] },
      { title: "Morena", artist: "Vitor Kley", chords: "F#m - D - A - E", notes: "T1: Mantém 116 BPM | No refrão: só pisa PLAY na T3 que veio de Santana!", tags: [] },
      { title: "Get Lucky", artist: "Daft Punk", chords: "Bm7 - D - F#m7 - E", notes: "T1: Mantém 116 BPM | T2: Violão Funk + OCT-1 Baixo logo na intro! | Solta o violão no verso 1 | ALL STOP em Bm", tags: ["oct1", "allstop"] },
      { title: "Wicked Game", artist: "Chris Isaak", chords: "Bm - A - E - E", bpm: "112", calm: true, notes: "112 BPM Lento | Mesmo tom Bm! | Delay ON | T2: Violão + OCT-1 Baixo longo | T3: Falsete Ooh", tags: ["delay", "oct1"] },
    ],
  },
  {
    id: 9, phase: 3, name: "Pop Funk Internacional", bpm: "98-108", patch: 1,
    songs: [
      { title: "Watermelon Sugar", artist: "Harry Styles", chords: "Dm7 - Am7 - C - G", notes: "T1: Beatbox Pop | T2: 4 acordes circulares | T3: Sopro + palma no refrão", tags: [] },
      { title: "This Love / Sugar", artist: "Maroon 5", chords: "Cm - Fm - G7", notes: "T1: Mantém | T2: Base no refrão | T3: Chimbal aberto", tags: ["chimbal"] },
      { title: "Seven Days in Sunny June", artist: "Jamiroquai", chords: "Bm7 - E7 - Em7 - F#m7", notes: "T1: Mantém + chimbal | Levada funk de mão direita | ALL STOP no fim", tags: ["allstop"] },
      { title: "Wonderwall", artist: "Oasis", chords: "Em7 - G - Dsus4 - A7sus4", bpm: "87", calm: true, notes: "87 BPM Coro | Começa só violão -> Coro a capella da galera no final", tags: [] },
    ],
  },
  {
    id: 10, phase: 3, name: "Balada, Arena & Formatura", bpm: "116->148", patch: 2,
    songs: [
      { title: "Adventure of a Lifetime", artist: "Coldplay", chords: "Dm7 - G - Am - Am", notes: "MUDAR P/ PATCH 02! | Começa gravando Riff Agudo na T2! | T1: Beat 4x4 | T3 One-Shot: Virada + Woo-hoo!", tags: ["oneshot"] },
      { title: "Treasure", artist: "Bruno Mars", chords: "Dm7 - G7 - Em7 - Am7", notes: "T1: Mantém 4x4 | T2: Violão Funk + OCT-1 Baixo Slap! | T3 One-Shot: Dispara virada 'Tu-ku-tu-PÁ!' antes do refrão | ALL STOP", tags: ["oct1", "oneshot", "allstop"] },
      { title: "Sex on Fire", artist: "Kings of Leon", chords: "E - C#m / Refrão: A - E - C#m", bpm: "148", notes: "148 BPM | T1: Beat Rock Rápido | NÃO loopar acordes na T2 (só nota Mi aguda pedal) | T3 One-Shot: Virada pro refrão | ALL STOP", tags: ["oneshot", "allstop"] },
      { title: "Céu Azul", artist: "Charlie Brown Jr.", chords: "Em7 - D - Bm7 - C", bpm: "95", calm: true, notes: "95 BPM Tranquila | Dedilhado limpo p/ coro do público -> Voltar p/ Patch 01 no fim", tags: [] },
    ],
  },
  {
    id: 11, phase: 3, name: "Groove Brasil & Soul", bpm: "114", patch: 1,
    songs: [
      { title: "Toda Forma de Amor", artist: "Lulu Santos", chords: "A - D - E - D", notes: "Abre no refrão a capella + violão -> Grava T1 Pop/Soul 114 BPM", tags: [] },
      { title: "Boa Noite", artist: "Djavan", chords: "Bm7 - E7", notes: "T1: Mantém + bumbo sincopado | T2: Riff Violão + OCT-1 Baixo Funk Obrigatório! | Solos livres", tags: ["oct1"] },
      { title: "Felicidade", artist: "Seu Jorge", chords: "Am7 - Dm7 - G7 - C7M", notes: "T1: Mantém | T2: Acordes + OCT-1 Walking Bass | T3: Coro 'Lá-iá, lá-iá' | ALL STOP no fim", tags: ["oct1", "allstop"] },
      { title: "Tive Razão", artist: "Seu Jorge", chords: "F#m7 - B7 - Em7 - A7", bpm: "90", calm: true, notes: "90 BPM Tranquila | Samba lento 100% orgânico na mão sem loop para descanso auditivo", tags: [] },
    ],
  },
  {
    id: 12, phase: 3, name: "Gran Finale: Baile do Tim, Jorge Ben & Carnaval", bpm: "124-132", patch: 1,
    songs: [
      { title: "Sossego / Não Quero Dinheiro", artist: "Tim Maia", chords: "Am7 - Dm7 -> A - F#m - D - E", notes: "Abre gravando OCT-1 Baixo de Sossego na T2! | Na metade: limpa T2 e toca Não Quero Dinheiro na mão mantendo T1!", tags: ["oct1"] },
      { title: "País Tropical / Taj Mahal", artist: "Jorge Ben Jor", chords: "G - C - D - C", notes: "T1: Overdub percussão timbalada | T2: Grava G-C-D + OCT-1 em Taj Mahal | T3: Coro Tê-tê-rê | ALL STOP dramático", tags: ["oct1", "allstop"] },
      { title: "Eva / Sou Praieiro", artist: "Banda Eva / Jammil", chords: "A - C#m - D - E -> G - D - Em - C", notes: "Começa Eva só violão no silêncio -> No refrão 'Minha pequena Eva!' pisa PLAY na T1 e T3 explodindo o Carnaval! | Em Sou Praieiro grava T2 e puxa palmas!", tags: [] },
      { title: "Cheia de Manias", artist: "Raça Negra", chords: "Gm - F - Eb - D7", bpm: "87", calm: true, notes: "87 BPM Apoteótica | T1: Beat Raça Negra | T2: 4 acordes + OCT-1 Baixo | T3: 'Didididiê!' | Deixa loop rodando no fim p/ agradecer no mic!", tags: ["oct1"] },
    ],
  },
];

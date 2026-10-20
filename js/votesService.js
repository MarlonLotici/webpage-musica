// Camada de serviço de votos. A UI só usa getVotes/vote/subscribe.
// Para Supabase Realtime: implemente `supabaseBackend` (tabela block_votes: block_id int pk, votes int)
// e mude VOTES_BACKEND em config.js.
import { VOTES_BACKEND } from "./config.js";

const KEY = "ll_votes_v1";
const VOTED_KEY = "ll_myvote_v2";
const listeners = new Set();

const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage bloqueado */ } };

// Regra: 1 voto por aparelho. Votar em outro bloco MOVE o voto (o anterior é descontado).
// Obs: com backend "local" isso vale só neste aparelho; para trava real entre pessoas, use Supabase.
const localBackend = {
  async getVotes() { return read(KEY, {}); },
  async vote(blockId) {
    const votes = read(KEY, {});
    const prev = read(VOTED_KEY, null);
    if (prev === blockId) return { votes, changed: false };
    if (prev != null) votes[prev] = Math.max(0, (votes[prev] || 0) - 1);
    votes[blockId] = (votes[blockId] || 0) + 1;
    write(KEY, votes);
    write(VOTED_KEY, blockId);
    return { votes, changed: true, moved: prev != null };
  },
  subscribe(cb) {
    const onStorage = (e) => { if (e.key === KEY) cb(read(KEY, {})); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
};

const backend = VOTES_BACKEND === "local" ? localBackend : localBackend; // TODO: supabaseBackend

export const getVotes = () => backend.getVotes();
export async function vote(blockId) {
  const res = await backend.vote(blockId);
  if (res.changed) listeners.forEach((cb) => cb(res.votes));
  return res;
}
export const myVote = () => read(VOTED_KEY, null);
export function subscribe(cb) {
  listeners.add(cb);
  const off = backend.subscribe(cb);
  return () => { listeners.delete(cb); off(); };
}

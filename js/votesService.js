// Camada de serviço de votos. A UI só usa getVotes/vote/subscribe.
// Para Supabase Realtime: implemente `supabaseBackend` (tabela block_votes: block_id int pk, votes int)
// e mude VOTES_BACKEND em config.js.
import { VOTES_BACKEND } from "./config.js";

const KEY = "ll_votes_v1";
const VOTED_KEY = "ll_voted_v1";
const listeners = new Set();

const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage bloqueado */ } };

const localBackend = {
  async getVotes() { return read(KEY, {}); },
  async vote(blockId) {
    const votes = read(KEY, {});
    votes[blockId] = (votes[blockId] || 0) + 1;
    write(KEY, votes);
    return votes;
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
  const votes = await backend.vote(blockId);
  write(VOTED_KEY, { ...read(VOTED_KEY, {}), [blockId]: (read(VOTED_KEY, {})[blockId] || 0) + 1 });
  listeners.forEach((cb) => cb(votes));
  return votes;
}
export const myVotes = () => read(VOTED_KEY, {});
export function subscribe(cb) {
  listeners.add(cb);
  const off = backend.subscribe(cb);
  return () => { listeners.delete(cb); off(); };
}

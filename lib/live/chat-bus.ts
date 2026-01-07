type Listener = (event: { type: string; payload: any }) => void;

const rooms = new Map<string, Set<Listener>>();

export function subscribe(roomKey: string, listener: Listener): () => void {
  const set = rooms.get(roomKey) || new Set<Listener>();
  set.add(listener);
  rooms.set(roomKey, set);
  return () => {
    const s = rooms.get(roomKey);
    if (s) {
      s.delete(listener);
      if (s.size === 0) rooms.delete(roomKey);
    }
  };
}

export function publish(roomKey: string, type: string, payload: any) {
  const set = rooms.get(roomKey);
  if (!set) return;
  for (const listener of set) {
    try {
      listener({ type, payload });
    } catch {}
  }
}


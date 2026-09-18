import { useCallback, useEffect, useState } from "react";

const KEY = "pgnj.compare";
const EVENT = "pgnj.compare.changed";
const MAX = 3;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    if (current.includes(id)) {
      write(current.filter((x) => x !== id));
      return "removed" as const;
    }
    if (current.length >= MAX) return "full" as const;
    write([...current, id]);
    return "added" as const;
  }, []);

  const clear = useCallback(() => write([]), []);

  return { ids, toggle, clear, max: MAX, isComparing: (id: string) => ids.includes(id) };
}

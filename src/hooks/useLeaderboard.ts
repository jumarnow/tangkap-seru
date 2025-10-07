import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "tangkap-seru-leaderboard";
const LAST_NAME_KEY = "tangkap-seru-last-player-name";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  createdAt: number;
}

interface StoredLeaderboard {
  timed?: LeaderboardEntry[];
  untimed?: LeaderboardEntry[];
}

const safeParse = (value: string | null): StoredLeaderboard => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as StoredLeaderboard;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    console.warn("Gagal membaca leaderboard dari storage", error);
    return {};
  }
};

const safeStringify = (value: StoredLeaderboard) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("Gagal menyimpan leaderboard ke storage", error);
    return null;
  }
};

const generateId = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

export const useLeaderboard = (mode: "timed" | "untimed") => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const storageCacheRef = useRef<StoredLeaderboard>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw);
    storageCacheRef.current = parsed;
    setEntries(parsed[mode] ?? []);
  }, [mode]);

  const persist = useCallback((nextEntries: LeaderboardEntry[]) => {
    if (typeof window === "undefined") return;

    storageCacheRef.current = {
      ...storageCacheRef.current,
      [mode]: nextEntries,
    };

    const raw = safeStringify(storageCacheRef.current);
    if (raw) {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  }, [mode]);

  const reset = useCallback(() => {
    setEntries([]);

    if (typeof window === "undefined") return;

    storageCacheRef.current = {
      ...storageCacheRef.current,
      [mode]: [],
    };

    const raw = safeStringify(storageCacheRef.current);
    if (raw) {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  }, [mode]);

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, "id" | "createdAt">) => {
    const nextEntry: LeaderboardEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };

    let createdEntry = nextEntry;

    setEntries(prev => {
      const next = [...prev, nextEntry].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.level !== a.level) return b.level - a.level;
        return a.createdAt - b.createdAt;
      });

      persist(next);

      // Jika entri terpotong (misalnya karena storage korup), cari kembali.
      const fallback = next.find(item => item.id === nextEntry.id);
      createdEntry = fallback ?? nextEntry;
      return next;
    });

    return createdEntry;
  }, [persist]);

  const savedName = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(LAST_NAME_KEY) ?? "";
  }, []);

  const storeName = useCallback((name: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LAST_NAME_KEY, name);
  }, []);

  return {
    entries,
    addEntry,
    savedName,
    storeName,
    reset,
  };
};

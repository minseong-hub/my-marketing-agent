"use client";
import { useEffect, useState } from "react";

export type AuthState = {
  loggedIn: boolean | null; // null = unknown (initial)
};

let cached: AuthState = { loggedIn: null };
const subscribers = new Set<(s: AuthState) => void>();

function notify() {
  subscribers.forEach((fn) => fn(cached));
}

async function loadSession(): Promise<void> {
  try {
    const res = await fetch("/api/auth/check", { cache: "no-store" });
    if (!res.ok) {
      cached = { loggedIn: false };
    } else {
      const data = (await res.json()) as { loggedIn: boolean };
      cached = { loggedIn: !!data.loggedIn };
    }
  } catch {
    cached = { loggedIn: false };
  }
  notify();
}

let inFlight: Promise<void> | null = null;

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(cached);

  useEffect(() => {
    subscribers.add(setState);
    if (cached.loggedIn === null && !inFlight) {
      inFlight = loadSession().finally(() => {
        inFlight = null;
      });
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return state;
}

export function refreshAuth() {
  cached = { loggedIn: null };
  inFlight = loadSession().finally(() => {
    inFlight = null;
  });
}

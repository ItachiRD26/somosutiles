"use client";

import { useEffect, useState } from "react";

export function useNetworkStatus(pingUrl = "https://firebase.google.com", intervalMs = 5000) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        await fetch(pingUrl, { mode: "no-cors" });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    check(); // al montar
    const interval = setInterval(check, intervalMs);
    return () => clearInterval(interval);
  }, [pingUrl, intervalMs]);

  return isOnline;
}

// src/components/SyncListener.tsx
"use client";

import { useEffect } from "react";
import { sincronizarRegistrosOffline } from "@/lib/offline-sync";

export default function SyncListener() {
  useEffect(() => {
    const handler = () => {
      if (navigator.onLine) {
        console.log("Conexión detectada, intentando sincronizar...");
        sincronizarRegistrosOffline();
      }
    };

    window.addEventListener("online", handler);

    return () => {
      window.removeEventListener("online", handler);
    };
  }, []);

  return null;
}

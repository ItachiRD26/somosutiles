// src/lib/offline-sync.ts
import { getFirebaseDatabase } from "./firebase";
import { guardarLocalmente, obtenerLocal } from "./utils";
import { ref, push } from "firebase/database";
import type { Registro, RegistroLocal } from "@/types";

const CACHE_KEY = "registrosLocalCache";
const PENDING_KEY = "registrosOfflinePendientes";

export function guardarRegistroOffline(registro: Registro) {
  const registrosPendientes: RegistroLocal[] = obtenerLocal<RegistroLocal[]>(PENDING_KEY) || [];

  const registroConId: RegistroLocal = {
    ...registro,
    _id: `id-${Date.now()}`,
  };

  // Evitar duplicados exactos en PENDING
  const yaExistePendiente = registrosPendientes.some(
    (r) =>
      r.nombre === registro.nombre &&
      r.edad === registro.edad &&
      r.fechaRegistro === registro.fechaRegistro
  );

  if (!yaExistePendiente) {
    registrosPendientes.push(registroConId);
    guardarLocalmente(PENDING_KEY, registrosPendientes);
    console.log("Guardado offline:", registroConId);
  }

  // Actualizar caché visible sin duplicados
  const cacheActual: Registro[] = obtenerLocal<Registro[]>(CACHE_KEY) || [];

  const yaExisteEnCache = cacheActual.some(
    (r) =>
      r.nombre === registro.nombre &&
      r.edad === registro.edad &&
      r.fechaRegistro === registro.fechaRegistro
  );

  if (!yaExisteEnCache) {
    const nuevaCache = [registro, ...cacheActual].sort((a, b) =>
      (b.fechaRegistro || "").localeCompare(a.fechaRegistro || "")
    );
    actualizarCacheLocal(nuevaCache);
  }
}

export async function sincronizarRegistrosOffline() {
  const db = getFirebaseDatabase();
  const registrosPendientes: RegistroLocal[] = obtenerLocal<RegistroLocal[]>(PENDING_KEY) || [];

  if (registrosPendientes.length === 0) return;

  for (const registro of registrosPendientes) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _, ...registroSinId } = registro;
    try {
      await push(ref(db, "children"), registroSinId);
    } catch (error) {
      console.error("Error al sincronizar registro:", registro, error);
      continue;
    }
  }

  guardarLocalmente(PENDING_KEY, []);
}

export function actualizarCacheLocal(registros: Registro[]) {
  // Evitar duplicados antes de guardar
  const mapa = new Map<string, Registro>();
  for (const r of registros) {
    const clave = `${r.nombre}-${r.fechaRegistro}`;
    if (!mapa.has(clave)) {
      mapa.set(clave, r);
    }
  }
  const sinDuplicados = Array.from(mapa.values()).sort((a, b) =>
    (b.fechaRegistro || "").localeCompare(a.fechaRegistro || "")
  );
  guardarLocalmente(CACHE_KEY, sinDuplicados);
}

export function obtenerCacheLocal(): Registro[] {
  return obtenerLocal<Registro[]>(CACHE_KEY) || [];
}

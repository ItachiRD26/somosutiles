const EDIT_KEY = "edit_pending";

export type EditData = {
  id: string;
  field: string;
  value: string | number;
};

export function guardarEdicionOffline(id: string, field: string, value: string | number) {
  const edits: EditData[] = JSON.parse(localStorage.getItem(EDIT_KEY) || "[]");
  edits.push({ id, field, value });
  localStorage.setItem(EDIT_KEY, JSON.stringify(edits));
}

export function obtenerEdicionesOffline(): EditData[] {
  return JSON.parse(localStorage.getItem(EDIT_KEY) || "[]");
}

export function limpiarEdicionesSincronizadas(sincronizadas: EditData[]) {
  const edits = obtenerEdicionesOffline();
  const restantes = edits.filter(
    (e) => !sincronizadas.some((s) => s.id === e.id && s.field === e.field && s.value === e.value)
  );
  localStorage.setItem(EDIT_KEY, JSON.stringify(restantes));
}

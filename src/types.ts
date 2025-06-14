export interface Child {
  nombre: string;
  edad: number;
  escuela: string;
  genero?: string;
  sector: string;
  entregado?: boolean;
  id?: string;
  fechaRegistro: string; // requerido ahora
}

export interface Registro {
  nombre: string;
  edad: number;
  escuela: string;
  sector: string;
  genero?: string; // ✅ agregado aquí para evitar el error
  entregado?: boolean;
  fechaRegistro: string;
  _id?: string;
}

export interface RegistroLocal extends Registro {
  _id: string;
}

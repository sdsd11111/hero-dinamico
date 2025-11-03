import { Platos } from '@/lib/supabase';

export interface Plato extends Platos {}

export interface PlatoFormData {
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  activo?: boolean;
}

export interface PlatoUpdateData extends Partial<PlatoFormData> {}

// Tipos para las respuestas de la API
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  status: number;
};

export type PlatoResponse = ApiResponse<Plato>;
export type PlatosResponse = ApiResponse<Plato[]>;

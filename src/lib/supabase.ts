import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Tipos de tablas
export type Tables = {
  platos: Database['public']['Tables']['platos']['Row'];
};

export type Platos = Tables['platos'];

// Tipos de la base de datos
type Database = {
  public: {
    Tables: {
      platos: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          precio: number;
          imagen_url: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descripcion: string;
          precio: number;
          imagen_url: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          descripcion?: string;
          precio?: number;
          imagen_url?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

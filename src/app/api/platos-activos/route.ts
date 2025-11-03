import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or service role key');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('=== Iniciando solicitud de platos activos ===');
  
  try {
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Error: Faltan variables de entorno de Supabase');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Usar el cliente de Supabase con la clave de servicio
    // Using the existing supabase client with service role
    
    console.log('Realizando consulta a la base de datos...');
    
    const { data: platos, error } = await supabase
      .from('platos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error en la consulta de Supabase:', error);
      return NextResponse.json(
        { 
          error: 'Error al obtener los platos',
          details: error.message,
          code: error.code,
          hint: error.hint,
          detailsFull: error.details
        },
        { status: 500 }
      );
    }

    console.log(`Se encontraron ${platos.length} platos activos`);
    
    if (platos.length === 0) {
      console.log('No se encontraron platos activos en la base de datos');
    } else {
      console.log('Platos encontrados:', platos.map(p => ({
        id: p.id,
        titulo: p.titulo,
        activo: p.activo,
        tiene_imagen: !!p.imagen_url
      })));
    }

    return NextResponse.json(platos);
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    console.log('=== Finalizada solicitud de platos activos ===');
  }
}

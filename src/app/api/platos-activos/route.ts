import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('=== Iniciando solicitud de platos activos desde MySQL ===');

  try {
    console.log('Realizando consulta a la base de datos MySQL...');

    interface Plato {
      id: number;
      titulo: string;
      descripcion: string;
      precio: number;
      imagen_url: string;
      activo: number | boolean;
      created_at: string;
    }

    const platos = await query<Plato[]>('SELECT * FROM platos WHERE activo = 1 ORDER BY created_at DESC');

    console.log(`Se encontraron ${platos.length} platos activos en MySQL`);

    // Convert id to string and activo to boolean for frontend compatibility
    const formattedPlatos = platos.map(p => ({
      ...p,
      id: p.id.toString(),
      precio: Number(p.precio),
      activo: Boolean(p.activo)
    }));

    return NextResponse.json(formattedPlatos);
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  } finally {
    console.log('=== Finalizada solicitud de platos activos ===');
  }
}


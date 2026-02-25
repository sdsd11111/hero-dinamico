import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const params = await (typeof context.params === 'object' && 'then' in context.params ? context.params : Promise.resolve(context.params as any));
  const id = params.id;
  try {
    const platos = await query<any[]>('SELECT * FROM platos WHERE id = ?', [id]);
    const plato = platos[0];

    if (!plato) {
      return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ...plato,
      id: plato.id.toString(),
      precio: Number(plato.precio),
      activo: Boolean(plato.activo)
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const params = await (typeof context.params === 'object' && 'then' in context.params ? context.params : Promise.resolve(context.params as any));
  let id = params.id;

  if (!id || id === '[id]') {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    id = pathSegments[pathSegments.length - 1];
  }

  try {
    const formData = await request.formData();
    const titulo = formData.get('titulo') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio = parseFloat(formData.get('precio') as string);
    const activo = formData.get('activo') === 'true';
    const imagen = formData.get('imagen') as File | null;
    const imagen_url = formData.get('imagen_url') as string | null;

    if (!titulo || !descripcion || isNaN(precio)) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Obtener imagen actual para limpieza si es necesario
    const currentPlatos = await query<any[]>('SELECT imagen_url FROM platos WHERE id = ?', [id]);
    if (currentPlatos.length === 0) {
      return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
    }
    const currentImagenUrl = currentPlatos[0].imagen_url;

    let finalImagenUrl = imagen_url || null;

    if (imagen && imagen.size > 0) {
      const fileExt = imagen.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `plato_${Date.now()}_${uuidv4().substring(0, 8)}.${fileExt}`;
      const relativePath = `/uploads/platos/${fileName}`;
      const absolutePath = join(process.cwd(), 'public', 'uploads', 'platos', fileName);

      try {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(absolutePath, buffer);
        finalImagenUrl = relativePath;
        console.log('Nueva imagen guardada localmente en:', absolutePath);

        // Limpiar imagen anterior si existía localmente
        if (currentImagenUrl && currentImagenUrl.startsWith('/uploads/')) {
          try {
            const oldPath = join(process.cwd(), 'public', currentImagenUrl);
            await unlink(oldPath);
            console.log('Imagen anterior eliminada:', oldPath);
          } catch (e) { console.error('Error cleaning old local image:', e); }
        }
      } catch (uploadError) {
        console.error('Error al guardar la imagen localmente:', uploadError);
        return NextResponse.json({ error: 'Error al guardar la imagen en el servidor' }, { status: 500 });
      }
    }

    // Actualizar en MySQL
    await query(
      'UPDATE platos SET titulo = ?, descripcion = ?, precio = ?, activo = ?, imagen_url = ? WHERE id = ?',
      [titulo, descripcion, precio, activo ? 1 : 0, finalImagenUrl, id]
    );

    const updatedPlatos = await query<any[]>('SELECT * FROM platos WHERE id = ?', [id]);
    const updatedPlato = updatedPlatos[0];

    return NextResponse.json({
      ...updatedPlato,
      id: updatedPlato.id.toString(),
      precio: Number(updatedPlato.precio),
      activo: Boolean(updatedPlato.activo)
    });

  } catch (error) {
    console.error('Error PUT:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const params = await (typeof context.params === 'object' && 'then' in context.params ? context.params : Promise.resolve(context.params as any));
  let id = params.id;

  if (!id || id === '[id]') {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    id = pathSegments[pathSegments.length - 1];
  }

  try {
    const currentPlatos = await query<any[]>('SELECT imagen_url FROM platos WHERE id = ?', [id]);
    if (currentPlatos.length === 0) {
      return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 });
    }

    const plato = currentPlatos[0];

    // Eliminar imagen local
    if (plato.imagen_url && plato.imagen_url.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', plato.imagen_url);
        await unlink(filePath);
        console.log('Imagen eliminada:', filePath);
      } catch (e) { console.error('Error removing local image:', e); }
    }

    // Eliminar de MySQL
    await query('DELETE FROM platos WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Plato eliminado exitosamente', id });
  } catch (error) {
    console.error('Error DELETE:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}



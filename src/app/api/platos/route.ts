import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Fetching all platos from MySQL...');

    interface Plato {
      id: number;
      titulo: string;
      descripcion: string;
      precio: number;
      imagen_url: string;
      activo: number | boolean;
      created_at: string;
    }

    const platos = await query<Plato[]>('SELECT * FROM platos ORDER BY created_at DESC');

    console.log(`Found ${platos.length} platos in total from MySQL`);

    // Convert id to string and activo to boolean for frontend compatibility
    const formattedPlatos = platos.map(p => ({
      ...p,
      id: p.id.toString(),
      precio: Number(p.precio),
      activo: Boolean(p.activo)
    }));

    return NextResponse.json(formattedPlatos);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('Iniciando solicitud POST para crear plato en MySQL (con Local Storage)...');

    // Verificar el tipo de contenido
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Tipo de contenido no soportado. Se esperaba multipart/form-data' },
        { status: 400 }
      );
    }

    // Obtener datos del formulario
    const formData = await request.formData();

    // Obtener y validar campos requeridos
    const titulo = formData.get('titulo')?.toString()?.trim() || '';
    const descripcion = formData.get('descripcion')?.toString()?.trim() || '';
    const precioStr = formData.get('precio')?.toString() || '';
    const precio = parseFloat(precioStr);
    const activo = formData.get('activo') === 'true';
    const imagen = formData.get('imagen') as File | null;
    const imagen_url = formData.get('imagen_url')?.toString() || '';

    // Validar campos requeridos
    const validationErrors: Record<string, string> = {};
    if (!titulo) validationErrors.titulo = 'El título es requerido';
    if (!descripcion) validationErrors.descripcion = 'La descripción es requerida';
    if (isNaN(precio)) validationErrors.precio = 'El precio debe ser un número válido';
    if (!imagen?.size && !imagen_url) validationErrors.imagen = 'Debe proporcionar una imagen o una URL de imagen';

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ error: 'Error de validación', validationErrors }, { status: 400 });
    }

    let finalImagenUrl = imagen_url || '';

    // Manejar carga de imagen Local
    if (imagen && imagen.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imagen.type)) {
        return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
      }

      const fileExt = imagen.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `plato_${Date.now()}_${uuidv4().substring(0, 8)}.${fileExt}`;
      const relativePath = `/uploads/platos/${fileName}`;
      const absolutePath = join(process.cwd(), 'public', 'uploads', 'platos', fileName);

      try {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(absolutePath, buffer);
        finalImagenUrl = relativePath;
        console.log('Imagen guardada localmente en:', absolutePath);
      } catch (uploadError) {
        console.error('Error al guardar la imagen localmente:', uploadError);
        throw new Error('Error al guardar la imagen en el servidor');
      }
    }

    try {
      // Insertar en MySQL
      const result = await query<{ insertId: number }>(
        'INSERT INTO platos (titulo, descripcion, precio, activo, imagen_url) VALUES (?, ?, ?, ?, ?)',
        [titulo, descripcion, precio, activo ? 1 : 0, finalImagenUrl]
      );

      // Obtener el plato recién creado
      const newPlatoRows = await query<any[]>('SELECT * FROM platos WHERE id = ?', [result.insertId]);
      const newPlato = newPlatoRows[0];

      return NextResponse.json({
        ...newPlato,
        id: newPlato.id.toString(),
        precio: Number(newPlato.precio),
        activo: Boolean(newPlato.activo)
      }, { status: 201 });

    } catch (dbError) {
      console.error('Error MySQL:', dbError);
      return NextResponse.json({ error: 'Error al guardar en MySQL' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}



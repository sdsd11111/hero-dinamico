import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or service role key');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const platoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
  imagen_url: z.string().url('La URL de la imagen no es válida'),
  activo: z.boolean().default(true),
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Fetching all platos...');
    
    const { data: platos, error } = await supabase
      .from('platos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching platos:', error);
      return NextResponse.json(
        { 
          error: 'Error al obtener los platos',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log(`Found ${platos.length} platos in total`);
    console.log('Active platos:', platos.filter(p => p.activo).map(p => p.titulo));
    
    return NextResponse.json(platos);
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
    console.log('Iniciando solicitud POST para crear plato...');
    
    // Verificar el tipo de contenido
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('Tipo de contenido no soportado:', contentType);
      return NextResponse.json(
        { error: 'Tipo de contenido no soportado. Se esperaba multipart/form-data' },
        { status: 400 }
      );
    }

    // Obtener datos del formulario
    const formData = await request.formData();
    console.log('Datos del formulario recibidos');
    
    // Validar que se recibieron los datos del formulario
    if (!formData) {
      console.error('No se recibieron datos del formulario');
      return NextResponse.json(
        { error: 'No se recibieron datos del formulario' },
        { status: 400 }
      );
    }
    
    // Obtener y validar campos requeridos
    const titulo = formData.get('titulo')?.toString()?.trim() || '';
    const descripcion = formData.get('descripcion')?.toString()?.trim() || '';
    const precioStr = formData.get('precio')?.toString() || '';
    const precio = parseFloat(precioStr);
    const activo = formData.get('activo') === 'true';
    const imagen = formData.get('imagen') as File | null;
    const imagen_url = formData.get('imagen_url')?.toString() || '';

    console.log('Datos del formulario:', { 
      titulo, 
      descripcion, 
      precio,
      activo,
      tieneImagen: !!imagen
    });

    // Validar campos requeridos
    const validationErrors: Record<string, string> = {};
    
    if (!titulo) validationErrors.titulo = 'El título es requerido';
    else if (titulo.length < 3) validationErrors.titulo = 'El título debe tener al menos 3 caracteres';
    
    if (!descripcion) validationErrors.descripcion = 'La descripción es requerida';
    else if (descripcion.length < 10) validationErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    
    if (isNaN(precio)) validationErrors.precio = 'El precio debe ser un número válido';
    else if (precio < 0) validationErrors.precio = 'El precio no puede ser negativo';
    
    // Validar que al menos haya una imagen o una URL de imagen
    if (!imagen?.size && !imagen_url) {
      validationErrors.imagen = 'Debe proporcionar una imagen o una URL de imagen';
    }
    
    // Si hay errores de validación, devolverlos
    if (Object.keys(validationErrors).length > 0) {
      console.error('Errores de validación:', validationErrors);
      return NextResponse.json(
        { 
          error: 'Error de validación',
          validationErrors,
          receivedData: { 
            titulo: titulo || 'No proporcionado', 
            descripcion: descripcion || 'No proporcionada',
            precio: isNaN(precio) ? 'No válido' : precio,
            tieneImagen: !!imagen?.size,
            tieneImagenUrl: !!imagen_url
          }
        },
        { status: 400 }
      );
    }

    let imagenUrl = imagen_url || '';

    // Manejar carga de imagen si está presente y es un archivo nuevo
    if (imagen && imagen.size > 0) {
      console.log('Procesando imagen adjunta...');
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imagen.type)) {
        console.error('Tipo de archivo no permitido:', imagen.type);
        return NextResponse.json(
          { 
            error: 'Tipo de archivo no permitido',
            details: 'Solo se permiten imágenes JPEG, JPG, PNG o WebP',
            receivedType: imagen.type
          },
          { status: 400 }
        );
      }
      
      // Validar tamaño del archivo (máx 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imagen.size > maxSize) {
        console.error('Archivo demasiado grande:', imagen.size, 'bytes');
        return NextResponse.json(
          { 
            error: 'Archivo demasiado grande',
            details: `El tamaño máximo permitido es de 5MB. Tamaño actual: ${(imagen.size / (1024 * 1024)).toFixed(2)}MB`
          },
          { status: 400 }
        );
      }
      
      const fileExt = imagen.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `plato_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `platos/${fileName}`;

      console.log('Subiendo imagen a Supabase Storage:', { 
        fileName, 
        filePath,
        size: imagen.size,
        type: imagen.type
      });

      try {
        // Subir el archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('platos')
          .upload(filePath, imagen, {
            cacheControl: '3600',
            upsert: false, // No sobrescribir archivos existentes
            contentType: imagen.type || 'image/jpeg',
          });

        if (uploadError) {
          console.error('Error al subir la imagen a Supabase Storage:', uploadError);
          throw new Error(`Error al subir la imagen: ${uploadError.message}`);
        }

        // Obtener la URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('platos')
          .getPublicUrl(filePath);

        if (!publicUrl) {
          throw new Error('No se pudo obtener la URL pública de la imagen después de subirla');
        }

        console.log('URL pública de la imagen generada:', publicUrl);
        imagenUrl = publicUrl;
        
      } catch (error) {
        const uploadError = error as Error & { code?: string; hint?: string };
        console.error('Error en el proceso de carga de imagen:', uploadError);
        return NextResponse.json(
          { 
            error: 'Error al procesar la imagen',
            details: uploadError.message || 'Error desconocido',
            code: uploadError.code,
            hint: uploadError.hint
          },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, max-age=0'
            }
          }
        );
      }
    }

    console.log('Insertando nuevo plato en la base de datos...');
    
    try {
      // Insertar el nuevo plato en la base de datos
      const { data: plato, error } = await supabase
        .from('platos')
        .insert([
          {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            precio,
            activo,
            imagen_url: imagenUrl || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error al insertar en la base de datos:', {
          error,
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message
        });
        
        // Intentar eliminar la imagen si se subió pero falló la inserción
        if (imagenUrl) {
          try {
            const fileName = imagenUrl.split('/').pop();
            if (fileName) {
              await supabase.storage
                .from('platos')
                .remove([`platos/${fileName}`]);
              console.log('Imagen eliminada después de error en la base de datos');
            }
          } catch (cleanupError) {
            console.error('Error al limpiar la imagen después del error:', cleanupError);
          }
        }
        
        return NextResponse.json(
          { 
            error: 'Error al guardar el plato en la base de datos',
            details: error.message,
            code: error.code,
            hint: error.hint
          },
          { status: 500 }
        );
      }

      console.log('Plato creado exitosamente:', plato);
      return NextResponse.json(plato, { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
      
    } catch (dbError) {
      console.error('Error inesperado al insertar en la base de datos:', dbError);
      return NextResponse.json(
        { 
          error: 'Error interno del servidor al procesar la solicitud',
          details: dbError instanceof Error ? dbError.message : 'Error desconocido'
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error inesperado en el endpoint POST /api/platos:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}

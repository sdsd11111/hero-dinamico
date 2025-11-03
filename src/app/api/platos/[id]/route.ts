import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

const platoUpdateSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres').optional(),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo').optional(),
  imagen_url: z.string().url('La URL de la imagen no es válida').optional(),
  activo: z.boolean().optional(),
});

export const dynamic = 'force-dynamic';


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Using the existing supabase client with service role
    
    const { data: plato, error } = await supabase
      .from('platos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching plato:', error);
      return NextResponse.json(
        { error: 'Plato no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(plato);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log('Solicitud PUT recibida');
  console.log('URL de la solicitud:', request.url);
  
  console.log('ID del plato a actualizar:', id);
  
  if (!id || id === '[id]') {
    console.error('ID no proporcionado o inválido en la URL');
    return new Response(
      JSON.stringify({ 
        error: 'ID del plato no proporcionado o inválido',
        receivedId: id || 'undefined',
        url: request.url
      }), 
      { status: 400 }
    );
  }
  
  try {
    const formData = await request.formData();
    console.log('Datos del formulario recibidos:', Object.fromEntries(formData.entries()));
    
    const titulo = formData.get('titulo') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio = parseFloat(formData.get('precio') as string);
    const activo = formData.get('activo') === 'true';
    const imagen = formData.get('imagen') as File | null;
    const imagen_url = formData.get('imagen_url') as string | null;
    
    console.log('Datos procesados:', {
      titulo,
      descripcion,
      precio,
      activo,
      tieneImagen: !!imagen,
      imagenSize: imagen?.size,
      imagenType: imagen?.type,
      imagenName: imagen?.name,
      imagen_url
    });
    
    console.log('Datos recibidos:', {
      titulo,
      descripcion,
      precio,
      activo,
      tieneImagen: !!imagen,
      tieneImagenUrl: !!imagen_url,
      id
    });

    // Validar campos requeridos
    if (!titulo || !descripcion || isNaN(precio)) {
      return new Response(
        JSON.stringify({ 
          error: 'Faltan campos requeridos',
          details: { 
            titulo: !titulo, 
            descripcion: !descripcion, 
            precio: isNaN(precio) 
          }
        }), 
        { status: 400 }
      );
    }
    
    console.log('ID del plato a actualizar:', id);
    
    if (!id || id === '[id]') {
      console.error('ID no proporcionado o inválido:', id);
      return new Response(
        JSON.stringify({ 
          error: 'ID del plato no proporcionado o inválido',
          receivedId: id || 'undefined',
          params: { id }
        }), 
        { status: 400 }
      );
    }

    let imagenUrl = imagen_url || null;

    try {
      // Manejar la carga de imagen si se proporciona una nueva
      if (imagen && imagen.size > 0) {
        console.log('Iniciando subida de imagen...');
        
        // Convertir el archivo a ArrayBuffer
        const fileBuffer = await imagen.arrayBuffer();
        const fileExt = imagen.name.split('.').pop();
        const fileName = `plato_${Date.now()}.${fileExt}`;
        const filePath = `platos/${fileName}`;

        console.log('Subiendo imagen a Supabase Storage...', {
          bucket: 'platos',
          filePath,
          size: imagen.size,
          type: imagen.type
        });

        // Subir la imagen
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('platos')
          .upload(filePath, fileBuffer, {
            contentType: imagen.type,
            cacheControl: '3600',
            upsert: true  // Permitir sobrescribir si ya existe
          });

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          return new Response(
            JSON.stringify({ 
              error: 'Error al subir la imagen a Supabase Storage',
              details: {
                message: uploadError.message,
                // Usar una propiedad segura que exista en StorageError
                code: 'storage_error'
              }
            }), 
            { status: 500 }
          );
        }

        console.log('Imagen subida exitosamente:', uploadData);

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('platos')
          .getPublicUrl(filePath);

        console.log('URL pública generada:', publicUrl);
        imagenUrl = publicUrl;
      }

      // Usar el ID del parámetro de la ruta
      const platoId = id; // Ya extraído al inicio de la función
      console.log('Actualizando plato con ID:', platoId);
      
      if (!platoId) {
        throw new Error('ID del plato no proporcionado');
      }

      // Datos a actualizar
      const updateData: any = {
        titulo,
        descripcion,
        precio,
        activo,
        // No incluimos actualizado_el ya que no existe en la base de datos
      };

      console.log('Datos a actualizar:', updateData);
      
      // Manejo de la imagen
      if (imagen && imagen.size > 0) {
        // Si hay una nueva imagen, usamos la URL generada
        updateData.imagen_url = imagenUrl;
        console.log('Actualizando con nueva imagen:', imagenUrl);
      } else if (imagen_url) {
        // Si no hay imagen nueva pero hay una URL existente, la mantenemos
        updateData.imagen_url = imagen_url;
        console.log('Manteniendo imagen existente:', imagen_url);
      } else {
        // Si no hay imagen, la establecemos como null
        updateData.imagen_url = null;
        console.log('No hay imagen asociada');
      }

      // Actualizar el plato en Supabase
      console.log('Actualizando plato en Supabase con datos:', {
        platoId,
        updateData,
        hasImageUrl: !!imagenUrl
      });

      const { data: updatedPlato, error: updateError } = await supabase
        .from('platos')
        .update(updateData)
        .eq('id', platoId)
        .select()
        .single();

      console.log('Resultado de la actualización en Supabase:', {
        updatedPlato,
        updateError,
        hasUpdateError: !!updateError
      });

      if (updateError) {
        console.error('Error de Supabase al actualizar:', updateError);
        return new Response(
          JSON.stringify({ 
            error: 'Error al actualizar el plato en la base de datos',
            details: updateError,
            code: updateError.code
          }), 
          { status: 400 }
        );
      }

      if (!updatedPlato) {
        return new Response(
          JSON.stringify({ 
            error: 'No se encontró el plato para actualizar',
            id: id
          }), 
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(updatedPlato), { status: 200 });
      
    } catch (error) {
      console.error('Error en el proceso de actualización:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Error durante el proceso de actualización',
          details: error instanceof Error ? error.message : String(error)
        }), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error inesperado en el servidor:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      }), 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log('Solicitud DELETE recibida');
  
  console.log('URL de la solicitud:', request.url);
  console.log('ID del plato a eliminar:', id);
  
  if (!id) {
    console.error('ID no proporcionado o inválido en la URL');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'ID del plato no proporcionado o inválido',
        receivedId: id || 'undefined',
        url: request.url
      }), 
      { status: 400 }
    );
  }
  
  console.log('ID del plato a eliminar:', id);
  
  try {

    try {
      // 1. Obtener el plato para obtener la URL de la imagen
      console.log('Buscando plato con ID:', id);
      const { data: plato, error: fetchError } = await supabase
        .from('platos')
        .select('id, imagen_url')
        .eq('id', id)
        .single();

      if (fetchError || !plato) {
        console.error('Error al buscar el plato:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Plato no encontrado',
            details: fetchError,
            id
          }), 
          { status: 404 }
        );
      }

      // 2. Si el plato tiene una imagen, eliminarla del almacenamiento
      if (plato.imagen_url) {
        console.log('Eliminando imagen asociada al plato:', plato.imagen_url);
        try {
          // Extraer el nombre del archivo de la URL
          const urlParts = plato.imagen_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          if (fileName && fileName !== 'undefined') {
            console.log('Eliminando archivo de almacenamiento:', fileName);
            const { error: deleteError } = await supabase.storage
              .from('platos')
              .remove([fileName]);
            
            if (deleteError) {
              console.error('Error eliminando imagen del almacenamiento:', deleteError);
              // Continuar con la eliminación del plato incluso si falla la eliminación de la imagen
            } else {
              console.log('Imagen eliminada exitosamente del almacenamiento');
            }
          }
        } catch (storageError) {
          console.error('Error procesando eliminación de imagen:', storageError);
          // Continuar con la eliminación del plato incluso si falla el procesamiento de la imagen
        }
      }

      // 3. Eliminar el plato de la base de datos
      console.log('Eliminando plato de la base de datos...');
      const { error: deleteError } = await supabase
        .from('platos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error de Supabase al eliminar:', deleteError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Error al eliminar el plato de la base de datos',
            details: deleteError,
            code: deleteError.code
          }), 
          { status: 400 }
        );
      }

      console.log('Plato eliminado exitosamente');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Plato eliminado exitosamente',
          id
        }), 
        { status: 200 }
      );
      
    } catch (error) {
      console.error('Error durante el proceso de eliminación:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Error durante el proceso de eliminación',
          details: error instanceof Error ? error.message : String(error)
        }), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error inesperado en el servidor:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      }), 
      { status: 500 }
    );
  }
}

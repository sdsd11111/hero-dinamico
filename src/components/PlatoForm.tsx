'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Loader2, Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const platoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  precio: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'El precio debe ser un número válido',
  }),
  imagen: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, 'La imagen debe pesar menos de 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Solo se permiten imágenes .jpg, .jpeg, .png y .webp'
    ),
  imagen_url: z.string().optional(),
  activo: z.boolean(),
});

type PlatoFormValues = z.infer<typeof platoSchema>;

interface PlatoFormProps {
  plato?: {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    activo: boolean;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PlatoForm({ plato, onSuccess, onCancel }: PlatoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(plato?.imagen_url || '');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PlatoFormValues>({
    resolver: zodResolver(platoSchema),
    defaultValues: {
      titulo: plato?.titulo || '',
      descripcion: plato?.descripcion || '',
      precio: plato?.precio.toString() || '0',
      activo: plato?.activo ?? true,
      imagen_url: plato?.imagen_url || '',
    },
  });

  const activo = watch('activo');
  const imagenUrl = watch('imagen_url');

  useEffect(() => {
    if (imagenUrl) {
      setPreviewImage(imagenUrl);
      setImageError('');
    }
  }, [imagenUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Formato de imagen no soportado. Use JPG, PNG o WebP.');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setImageError('La imagen es demasiado grande (máx. 5MB)');
      return;
    }

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setValue('imagen', file);
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage('');
    setValue('imagen', null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Subiendo archivo:', { fileName, fileSize: file.size, fileType: file.type });

      // 1. Subir el archivo
      const { data, error: uploadError } = await supabase.storage
        .from('platos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Cambiado a true para permitir sobrescribir
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Error al subir el archivo:', uploadError);
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
      }

      if (!data) {
        throw new Error('No se recibieron datos al subir la imagen');
      }

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('platos')
        .getPublicUrl(data.path);

      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      console.log('Archivo subido correctamente:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error; // Relanzar el error para manejarlo en el componente padre
    }
  };

  const onSubmit = async (formData: PlatoFormValues) => {
    console.log('Iniciando envío del formulario', { formData, plato });
    
    setIsLoading(true);
    setIsUploading(true);
    setImageError('');
    
    try {
      const isUpdate = !!plato?.id;
      console.log('Modo:', isUpdate ? 'Actualización' : 'Creación', 'ID:', plato?.id);
      
      // Validación de campos requeridos
      if (!formData.titulo || !formData.descripcion || !formData.precio) {
        const errorMsg = 'Todos los campos son obligatorios';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo.trim());
      formDataToSend.append('descripcion', formData.descripcion.trim());
      formDataToSend.append('precio', formData.precio.toString());
      formDataToSend.append('activo', formData.activo.toString());
      
      // Si es una actualización, asegurarnos de incluir el ID
      if (isUpdate && plato?.id) {
        formDataToSend.append('id', plato.id);
      }
      
      console.log('Datos del formulario preparados:', {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: formData.precio,
        activo: formData.activo,
        tieneImagen: !!formData.imagen,
        tieneImagenUrl: !!plato?.imagen_url,
        isUpdate
      });
      
      // Manejo de la imagen
      if (formData.imagen) {
        console.log('Procesando imagen...');
        if (formData.imagen instanceof File) {
          console.log('Añadiendo archivo de imagen al formulario');
          formDataToSend.append('imagen', formData.imagen);
        } else if (typeof formData.imagen === 'string' && formData.imagen.startsWith('http')) {
          console.log('Usando URL de imagen existente:', formData.imagen);
          formDataToSend.append('imagen_url', formData.imagen);
        }
      } else if (plato?.imagen_url) {
        // Siempre incluir la URL de la imagen existente, incluso si no se cambia
        console.log('Incluyendo URL de imagen existente:', plato.imagen_url);
        formDataToSend.append('imagen_url', plato.imagen_url);
      } else {
        // Si no hay imagen, asegurarse de que no se pierda la existente
        console.log('No se incluye imagen en la actualización');
      }
      
      const url = isUpdate ? `/api/platos/${plato.id}` : '/api/platos';
      
      console.log('Enviando solicitud a:', url, 'con método:', isUpdate ? 'PUT' : 'POST');
      console.log('Datos del formulario:', {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: formData.precio,
        activo: formData.activo,
        tieneImagen: !!formData.imagen,
        tieneImagenUrl: !!plato?.imagen_url,
        isUpdate,
        platoId: plato?.id
      });
      
      console.log('Enviando datos a la API:', {
        url,
        method: isUpdate ? 'PUT' : 'POST',
        hasImage: !!formDataToSend.get('imagen'),
        hasImageUrl: !!formDataToSend.get('imagen_url'),
        formData: Object.fromEntries(formDataToSend.entries())
      });

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        body: formDataToSend,
      });
      
      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Error en la respuesta:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        
        let errorMessage = `Error al ${isUpdate ? 'actualizar' : 'crear'} el plato`;
        
        if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (response.status === 400) {
          errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
        } else if (response.status === 404) {
          errorMessage = 'No se encontró el plato solicitado.';
        } else if (response.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('Plato guardado exitosamente:', responseData);
      onSuccess();
    } catch (error) {
      console.error('Error en onSubmit:', error);
      setError('titulo', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Error al guardar el plato',
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleImageError = () => {
    setImageError('No se pudo cargar la imagen. Verifica la URL.');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado');
    
    try {
      setIsLoading(true);
      const formValues = getValues();
      console.log('Datos del formulario:', formValues);
      
      // Validación básica
      if (!formValues.titulo || !formValues.descripcion || formValues.precio === undefined) {
        console.error('Faltan campos requeridos');
        setError('titulo', {
          type: 'manual',
          message: 'Todos los campos son obligatorios'
        });
        return;
      }
      
      // Crear FormData para el envío
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formValues.titulo);
      formDataToSend.append('descripcion', formValues.descripcion);
      formDataToSend.append('precio', formValues.precio.toString());
      formDataToSend.append('activo', formValues.activo.toString());
      
      // Si hay una imagen, agregarla al FormData
      if (formValues.imagen) {
        if (formValues.imagen instanceof File) {
          formDataToSend.append('imagen', formValues.imagen);
        } else if (typeof formValues.imagen === 'string' && formValues.imagen.startsWith('http')) {
          formDataToSend.append('imagen_url', formValues.imagen);
        }
      } else if (plato?.imagen_url) {
        // Mantener la imagen existente si no se sube una nueva
        formDataToSend.append('imagen_url', plato.imagen_url);
      }
      
      // Determinar la URL y el método HTTP
      const url = plato?.id ? `/api/platos/${plato.id}` : '/api/platos';
      const method = plato?.id ? 'PUT' : 'POST';
      
      console.log(`Enviando ${method} a ${url}`);
      console.log('Datos a enviar:', Object.fromEntries(formDataToSend.entries()));
      
      // Enviar la solicitud
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.error || 'Error al guardar el plato');
      }
      
      // Éxito
      console.log('Plato guardado exitosamente');
      onSuccess();
      
    } catch (error) {
      console.error('Error al guardar el plato:', error);
      // Mostrar mensaje de error al usuario
      setError('titulo', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Error al guardar el plato'
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
      {errors.titulo?.type === 'manual' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.titulo.message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="titulo">
              Título *
            </label>
            <Input
              id="titulo"
              placeholder="Ej: Paella Valenciana"
              {...register('titulo')}
              error={errors.titulo?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="descripcion">
              Descripción *
            </label>
            <Textarea
              id="descripcion"
              placeholder="Describe el plato en detalle"
              rows={4}
              {...register('descripcion')}
              error={errors.descripcion?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="precio">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                className="pl-8"
                {...register('precio')}
                error={errors.precio?.message}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={(checked: boolean) => setValue('activo', checked)}
            />
            <label htmlFor="activo" className="text-sm font-medium">
              {activo ? 'Activo' : 'Inactivo'}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="imagen">
              Imagen del plato *
            </label>
            
            <input
              type="file"
              id="imagen"
              ref={fileInputRef}
              accept="image/jpeg, image/jpg, image/png, image/webp"
              className="hidden"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            
            <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-64 bg-gray-50">
              {previewImage ? (
                <div className="relative w-full h-full group">
                  <Image
                    src={previewImage}
                    alt="Vista previa"
                    fill
                    className="object-cover rounded-md"
                    onError={() => setImageError('Error al cargar la imagen')}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 mb-3">
                    <Upload className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      disabled={isUploading}
                    >
                      Sube una imagen
                    </button>
                    <p className="pl-1">o arrástrala aquí</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP hasta 5MB
                  </p>
                </div>
              )}
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              
              {imageError && (
                <p className="mt-2 text-sm text-red-500 text-center">{imageError}</p>
              )}
              
              {!previewImage && watch('imagen_url') && (
                <div className="mt-4 text-sm">
                  <p className="text-gray-600">URL de imagen actual:</p>
                  <p className="text-blue-600 truncate max-w-xs">{watch('imagen_url')}</p>
                </div>
              )}
              
              <input type="hidden" {...register('imagen_url')} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading || isUploading}
        >
          {isLoading || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {plato?.id ? 'Actualizando...' : 'Creando...'}
            </>
          ) : plato?.id ? (
            'Actualizar Plato'
          ) : (
            'Crear Plato'
          )}
        </Button>
      </div>
    </form>
  );
}

# Variables de Entorno Necesarias para el Despliegue

## Configuración de Supabase
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_supabase
```

## Configuración de Next.js
```
NODE_ENV=production
```

## Configuración de la Aplicación
```
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

### Instrucciones para Vercel:
1. Ve a la configuración de tu proyecto en Vercel
2. Navega a "Environment Variables"
3. Agrega cada una de las variables mencionadas arriba con sus valores correspondientes
4. Asegúrate de que todas las variables estén marcadas como "Production"
5. Realiza un nuevo despliegue para que los cambios surtan efecto

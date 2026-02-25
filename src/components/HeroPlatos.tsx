'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Define the Plato interface
interface Plato {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  activo: boolean;
  created_at?: string;
}

export default function HeroPlatos() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Fetch platos activos from the API
  const fetchPlatosActivos = async () => {
    try {
      console.log('Fetching platos activos...');
      const response = await fetch('/api/platos-activos', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(`Error al cargar los platos: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido recibido del servidor');
      }

      console.log('Platos activos recibidos:', data);

      if (data.length === 0) {
        console.log('No hay platos activos en la base de datos');
      } else {
        console.log(`Se encontraron ${data.length} platos activos`);
      }

      setPlatos(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching platos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los platos';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPlatosActivos();
  }, []);

  // Auto-rotate platos
  useEffect(() => {
    if (!isAutoRotating || platos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === platos.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [platos.length, isAutoRotating]);

  // Handle image loading errors
  const handleImageError = (platoId: string) => {
    console.log(`Error loading image for plato ${platoId}`);
    setImageError(prev => ({
      ...prev,
      [platoId]: true
    }));
  };

  // Navigation functions
  const goToNextPlato = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === platos.length - 1 ? 0 : prevIndex + 1
    );
    // Pause auto-rotation for a while after manual navigation
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 30000); // Resume after 30 seconds
  };

  const goToPrevPlato = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? platos.length - 1 : prevIndex - 1
    );
    // Pause auto-rotation for a while after manual navigation
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 30000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando menú del día</h2>
          <p className="text-gray-500">Estamos preparando los platos más deliciosos para ti...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Reintentar
            </button>
            <a
              href="/admin"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Ir al panel
            </a>
          </div>
        </div>
      </div>
    );
  }

  // No active dishes state
  if (platos.length === 0) {
    return (
      <div className="relative w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">¡Próximamente!</h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-6">Nuestro menú está en preparación</h2>
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-200 max-w-lg mx-auto">
            <p className="text-gray-600">Actualmente no hay platos disponibles en el menú.</p>
            <p className="text-sm text-gray-500 mt-2">Vuelve pronto para descubrir nuestras delicias culinarias.</p>

            <div className="mt-6">
              <a
                href="/admin"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <span>Ir al panel de administración</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlato = platos[currentIndex];
  const hasImageError = currentPlato && imageError[currentPlato.id];

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {currentPlato?.imagen_url && !hasImageError ? (
          <div className="relative w-full h-full">
            <Image
              src={currentPlato.imagen_url}
              alt={currentPlato.titulo}
              fill
              className="object-cover transition-opacity duration-500"
              style={{ opacity: 0.9 }}
              priority
              sizes="100vw"
              unoptimized={true} // Deshabilitar optimización temporalmente
              onError={(e) => {
                console.error('Error al cargar la imagen:', currentPlato.imagen_url, e);
                handleImageError(currentPlato.id);
              }}
              onLoad={() => console.log('Imagen cargada correctamente:', currentPlato.imagen_url)}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400">Imagen no disponible</p>
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-20 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 leading-tight">
              Almuerzos
            </h1>
            <div className="w-24 h-1 bg-yellow-400 mx-auto my-4"></div>
            <h2 className="text-3xl md:text-4xl text-yellow-400 font-medium mb-6">
              Plato del día
            </h2>

            <div className="mb-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-yellow-300 [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">
                {currentPlato.titulo}
              </h3>
              <p className="text-lg text-white/90 mb-4 [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">
                {currentPlato.descripcion}
              </p>
              <div className="text-2xl font-bold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">
                ${Number(currentPlato.precio).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <button
                className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2 group"
                onClick={() => {
                  alert(`¡Gracias por tu pedido de ${currentPlato.titulo}! Pronto nos pondremos en contacto contigo.`);
                }}
              >
                <span>Pide tu plato del día</span>
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>

            {platos.length > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                {platos.map((plato, index) => (
                  <button
                    key={plato.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                        ? 'bg-yellow-400 w-8 scale-110'
                        : 'bg-white/50 hover:bg-white/70'
                      }`}
                    aria-label={`Ver ${plato.titulo}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than one dish */}
      {platos.length > 1 && (
        <>
          <button
            onClick={goToPrevPlato}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            aria-label="Plato anterior"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNextPlato}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            aria-label="Siguiente plato"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

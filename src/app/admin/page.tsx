'use client';

import { useState, useEffect } from 'react';
import AdminPlatosList from '../../components/AdminPlatosList';
import PlatoForm from '../../components/PlatoForm';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

type Plato = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  activo: boolean;
  created_at: string;
};

export default function AdminPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlato, setSelectedPlato] = useState<Plato | null>(null);

  const fetchPlatos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/platos');
      if (!response.ok) {
        throw new Error('Error al cargar los platos');
      }
      const data = await response.json();
      setPlatos(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los platos. Por favor, intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatos();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPlato(null);
    fetchPlatos();
  };

  const handleEdit = (plato: Plato) => {
    setSelectedPlato(plato);
    setShowForm(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append('activo', (!currentStatus).toString());
      
      const response = await fetch(`/api/platos/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el estado');
      }

      // Actualizar el estado local sin necesidad de recargar todo
      setPlatos(platos.map(plato => 
        plato.id === id ? { ...plato, activo: !currentStatus } : plato
      ));
      
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el estado');
      // Recargar los datos para asegurar consistencia
      fetchPlatos();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/platos/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el plato');
      }

      // Actualizar el estado local sin necesidad de recargar todo
      setPlatos(platos.filter(plato => plato.id !== id));
      
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar el plato');
      // Recargar los datos para asegurar consistencia
      fetchPlatos();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Administración de Platos</h1>
        <Button onClick={() => {
          setSelectedPlato(null);
          setShowForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Plato
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPlato ? 'Editar Plato' : 'Nuevo Plato'}
            </h2>
            <PlatoForm 
              plato={selectedPlato} 
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setSelectedPlato(null);
              }}
            />
          </div>
        </div>
      )}

      <AdminPlatosList 
        platos={platos} 
        isLoading={isLoading} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}

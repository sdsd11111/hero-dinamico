import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Switch } from './ui/switch';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

type Plato = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  activo: boolean;
  created_at: string;
};

interface AdminPlatosListProps {
  platos: Plato[];
  isLoading: boolean;
  onEdit: (plato: Plato) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export default function AdminPlatosList({
  platos,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: AdminPlatosListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (platos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay platos registrados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platos.map((plato) => (
            <TableRow key={plato.id}>
              <TableCell>
                <div className="relative w-16 h-16">
                  <Image
                    src={plato.imagen_url || '/placeholder.jpg'}
                    alt={plato.titulo}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{plato.titulo}</TableCell>
              <TableCell className="max-w-xs truncate">
                {plato.descripcion}
              </TableCell>
              <TableCell className="text-right">
                ${plato.precio.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end space-x-2 items-center">
                  <div className="flex items-center space-x-2 mr-4">
                    <span className="text-sm text-muted-foreground">
                      {plato.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onToggleStatus(plato.id, plato.activo)}
                      title={plato.activo ? 'Desactivar' : 'Activar'}
                      className={plato.activo ? 'hover:bg-yellow-50' : 'hover:bg-green-50'}
                    >
                      {plato.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(plato)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(plato.id)}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

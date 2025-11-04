import { redirect } from 'next/navigation';

export default function AdminPlatosPage() {
  // Redirigir a la página de administración principal
  redirect('/admin');
  
  return null;
}

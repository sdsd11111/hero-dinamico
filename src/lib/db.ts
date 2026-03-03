import mysql from 'mysql2/promise';

// Configuración de la conexión desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5, // Reducido para entornos Serverless para prevenir agotamiento
  queueLimit: 0,
};

// Singleton para mantener la conexión en entornos Serverless/Next.js
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

// Crear o reutilizar el pool de conexiones
export const pool = globalForDb.pool ?? mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// Función auxiliar para ejecutar consultas
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params || []);
  return rows as unknown as T;
}

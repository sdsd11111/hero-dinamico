import mysql from 'mysql2/promise';

// Configuración de la conexión desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crear pool de conexiones
export const pool = mysql.createPool(dbConfig);

// Función auxiliar para ejecutar consultas
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params || []);
  return rows as unknown as T;
}

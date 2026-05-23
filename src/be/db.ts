import mysql from "mysql2/promise";
import { env } from "./env";

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_POOL_LIMIT,
  queueLimit: env.DB_QUEUE_LIMIT,
  ssl: env.DB_SSL ? {} : undefined,
});

export default pool;

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { initUserModel } from '../models/user.model';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'billing_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mariadb',
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 5,
      min: Number(process.env.DB_POOL_MIN) || 0,
      acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: Number(process.env.DB_POOL_IDLE) || 10000
    },
    logging: false // ponelo en true si querés ver las queries en consola
  }
);

// Inicializar modelos
initUserModel(sequelize);

export default sequelize;

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { initModels } from '../models';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'billing_service',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mariadb',
    logging: false
  }
);

// Inicializa todos los modelos y relaciones
initModels(sequelize);

export default sequelize;

import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return sequelize.sync({ force: true })
  })
  .then(() => console.log('✅ Base de datos sincronizada'))
  .catch(err => console.error('❌ Error al conectar o sincronizar DB:', err));

  console.log('Conectado en el puerto ', PORT);
  

export default app;

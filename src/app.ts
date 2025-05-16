import express from 'express';
import authRoutes from './routes/auth.routes';
// import billingRoutes from './routes/billing.routes';
import dotenv from 'dotenv';
import sequelize from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
// app.use('/api/billing', billingRoutes);

// Conexión y sincronización
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return sequelize.sync({ force: false }); // Solo sincroniza si se conecta bien
  })
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar o sincronizar DB:', err);
  });

export default app;

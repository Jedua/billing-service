import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import { requireRoles } from './middlewares/role.middleware';
import openstackVmsRoutes from './routes/openstack-vms.routes';
import openstackVmsUptimeHistoryRoutes from './routes/openstack-vms-uptime-history.routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/openstack/vms', openstackVmsRoutes);
app.use('/api/openstack/vms', openstackVmsUptimeHistoryRoutes);
// app.use('/api/billing', authMiddleware, billingRoutes);

// Admin
app.get('/api/reports', authMiddleware, requireRoles(['admin', 'superuser']), (req, res) => {
  res.json({ message: 'Admins o Superusers pueden ver esto' });
});

// Conexión a DB y arranque
sequelize.authenticate()
  .then(() => sequelize.sync(/*{ force: true } opcional*/))
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('DB error:', err));
  

export default app;

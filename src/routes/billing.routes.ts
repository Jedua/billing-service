// src/routes/billing.routes.ts
import { Router } from 'express';
import { createCustomer,getCustomerFiscalData,updateCustomer } from '../controllers/billing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleCreateProduct, handleGetProduct, handleListProductsByCustomer, handleUpdateProduct } from '../controllers/product.controller';

const router = Router();

// 1) Crear customer
router.post('/customers', createCustomer);

// 2) Actualizar customer por virwoUserId
router.put('/customers/:virwoUserId', updateCustomer);

// 3) obtener datos de facturacion.
router.get('/customers/:virwoUserId', authMiddleware, getCustomerFiscalData)

// Productos
router.post('/products', handleCreateProduct);
router.get('/products/customer/:customerId', handleListProductsByCustomer);
router.get('/products/:id', handleGetProduct);
router.put(
  '/products/:productId',authMiddleware, handleUpdateProduct);


export default router;

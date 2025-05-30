// src/routes/billing.routes.ts
import { Router } from 'express';
import { createCustomer,getCustomerFiscalData,updateCustomer } from '../controllers/billing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleCreateProduct, handleGetProduct, handleListProductsByCustomer, handleUpdateProduct } from '../controllers/product.controller';

const router = Router();

// Customer
router.post('/customers', createCustomer);
router.put('/customers/:virwoUserId', updateCustomer);
router.get('/customers/:virwoUserId', authMiddleware, getCustomerFiscalData)

// Productos
router.post('/products', handleCreateProduct);
router.get('/products/:id', handleGetProduct);
router.put('/products/:productId',authMiddleware, handleUpdateProduct);
// Listar productos por el virwoUserId
router.get('/products/customer/:virwoUserId', authMiddleware, handleListProductsByCustomer);


export default router;

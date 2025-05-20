import express from 'express';
import { createInvoice, getCustomerFiscalData, saveCustomerFiscalData } from '../controllers/billing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Guarda datos fiscales del cliente autenticado
router.post('/customers', authMiddleware, saveCustomerFiscalData);
router.get('/customers', authMiddleware, getCustomerFiscalData);
router.post('/invoices', createInvoice);
export default router;

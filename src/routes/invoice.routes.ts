import { Router } from 'express';
import {
  handleCreateInvoice,
  handleGetInvoice,
  handleIssueInvoice,
  handleListInvoicesByCustomer,
  handleUpdateInvoice
} from '../controllers/invoice.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/invoices',                       authMiddleware, handleCreateInvoice);
router.get('/invoices/:invoiceId',            authMiddleware, handleGetInvoice);
router.get('/invoices/customer/:customerId',  authMiddleware, handleListInvoicesByCustomer);
router.put('/invoices/:invoiceId',            authMiddleware, handleUpdateInvoice);


// “issue”
router.post('/invoices/issue', authMiddleware, handleIssueInvoice);
export default router;

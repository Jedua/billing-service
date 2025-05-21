import { Router } from 'express';
import * as facturapiService from '../services/facturapi.service';

// Puedes agregar middlewares de auth si lo necesitas
const router = Router();

router.post('/customer/sync', async (req, res) => {
  try {
    const { customerData, existingFacturapiId } = req.body;
    const result = await facturapiService.syncCustomer(customerData, existingFacturapiId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Error syncing customer', error: err.message });
  }
});

router.post('/invoice', async (req, res) => {
  try {
    const invoiceData = req.body;
    const result = await facturapiService.createInvoice(invoiceData);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating invoice', error: err.message });
  }
});

router.get('/invoice/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await facturapiService.getInvoicePDF(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ message: 'Error downloading PDF', error: err.message });
  }
});

router.get('/invoice/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await facturapiService.getInvoiceStatus(id);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ message: 'Error getting invoice status', error: err.message });
  }
});

export default router;

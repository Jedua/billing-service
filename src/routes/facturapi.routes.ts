import { Router } from 'express';
import * as facturapiService from '../services/facturapi.service';
import { facturapi } from '../config/facturapi';

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

// PUT facturapi/customers/:customer_id
router.put('/customers/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const customerData = req.body;

    console.log('[DEBUG] customer_id:', customer_id);
    console.log('[DEBUG] customerData:', JSON.stringify(customerData, null, 2));

    const updated = await facturapiService.updateCustomer(customer_id, customerData);
    res.json(updated);
  } catch (err: any) {
    console.error('[Facturapi] Error al actualizar cliente:', err.message);
    res.status(500).json({
      message: 'Error al actualizar cliente en Facturapi',
      error: err.message,
    });
  }
});

// GET /api/facturapi/customers
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    const result = await facturapi.customers.list({
      page: Number(page),
      limit: Number(limit)
    });

    res.json(result);
  } catch (err: any) {
    console.error('[Facturapi] ❌ Error al listar clientes:', err.message);
    res.status(500).json({ message: 'Error al obtener clientes', error: err.message });
  }
});

// GET /api/facturapi/customers/all
router.get('/customers/all', async (req, res) => {
  try {
    let allCustomers: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await facturapi.customers.list({
        page,
        limit: 100
      });

      allCustomers = allCustomers.concat(result.data);
      hasMore = result.data.length === 100;
      page++;
    }

    res.json({ total: allCustomers.length, data: allCustomers });
  } catch (err: any) {
    console.error('[Facturapi] ❌ Error al obtener todos los clientes:', err.message);
    res.status(500).json({ message: 'Error al obtener todos los clientes', error: err.message });
  }
});


export default router;

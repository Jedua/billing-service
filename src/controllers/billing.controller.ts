import { Request, Response } from 'express';
import { createCustomerFiscalData, createInvoiceWithItems, getCustomerFiscalDataByUser } from '../services/billing.service';

export async function saveCustomerFiscalData(req: Request, res: Response) {
  try {
    const { name, taxId, address, email, phone } = req.body;
    if (!name || !taxId || !email) {
      return res.status(400).json({ message: 'name, taxId and email are required.' });
    }

    // El userId viene del middleware de autenticación (token)
    const userId = (req as any).user.id;
    const customer = await createCustomerFiscalData({
      name,
      taxId,
      address,
      email,
      phone,
      userId
    });

    return res.status(201).json({
      id: customer.id,
      name: customer.name,
      taxId: customer.taxId,
      address: customer.address,
      email: customer.email,
      phone: customer.phone
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}


export async function getCustomerFiscalData(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const customers = await getCustomerFiscalDataByUser(userId);
    return res.json(customers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { userId, customerId, items } = req.body;
    if (!userId || !customerId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Missing data' });
    }
    const invoice = await createInvoiceWithItems({ userId, customerId, items });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error });
  }
};
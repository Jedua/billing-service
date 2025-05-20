import { Request, Response } from 'express';
import { createCustomerFiscalData, getCustomerFiscalDataByUser } from '../services/billing.service';

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
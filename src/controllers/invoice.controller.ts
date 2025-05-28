// src/controllers/invoice.controller.ts
import { Request, Response } from 'express';
import { issueInvoiceHandler, CreateInvoicePayload } from '../services/invoice.service';

export async function issueInvoice(req: Request, res: Response) {
  try {
    const payload = req.body as CreateInvoicePayload;
    const result  = await issueInvoiceHandler(payload);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

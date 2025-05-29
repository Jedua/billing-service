import { NextFunction, Request, Response } from 'express';
import {
  createInvoice,
  CreateInvoicePayload,
  getInvoiceById,
  issueInvoiceHandler,
  listInvoicesByVirwoUserId,
  updateInvoice
} from '../services/invoice.service';

export async function handleCreateInvoice(req: Request, res: Response) {
  try {
    const dto = req.body;
    const inv = await createInvoice(dto);
    return res.status(201).json({ success: true, data: inv });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function handleGetInvoice(req: Request, res: Response) {
  const id = Number(req.params.invoiceId);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'invoiceId inválido' });
  }
  const inv = await getInvoiceById(id);
  if (!inv) {
    return res.status(404).json({ success: false, message: 'Factura no encontrada' });
  }
  return res.json({ success: true, data: inv });
}

export async function handleListInvoicesByCustomer(req: Request, res: Response) {
  const virwoUserId = Number(req.params.virwoUserId);
  if (isNaN(virwoUserId)) {
    return res.status(400).json({ success: false, message: 'virwoUserId inválido' });
  }
  const list = await listInvoicesByVirwoUserId(virwoUserId);
  return res.json({ success: true, data: list });
}

export async function handleUpdateInvoice(req: Request, res: Response) {
  const id = Number(req.params.invoiceId);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'invoiceId inválido' });
  }
  try {
    const inv = await updateInvoice(id, req.body);
    return res.json({ success: true, data: inv });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

export async function issueInvoice(req: Request, res: Response) {
  try {
    const payload = req.body as CreateInvoicePayload;
    const result  = await issueInvoiceHandler(payload);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


export async function handleIssueInvoice(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Aquí el body debe tener exactamente la interfaz CreateInvoicePayload
    const payload = req.body as CreateInvoicePayload;
    const result  = await issueInvoiceHandler(payload);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    // Pass to error‐handler o devolvemos un 500
    return res.status(500).json({ success: false, message: err.message });
  }
}
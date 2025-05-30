// src/controllers/product.controller.ts
import { Request, Response } from 'express';
import {
  createProduct,
  updateProduct,
  listProductsByCustomer,
  getProductById
} from '../services/product.service';
import { getCustomerByVirwoId } from '../services/billing.service';

export async function handleListProductsByCustomer(req: Request, res: Response) {
  const virwoUserId = Number(req.params.virwoUserId);
  if (isNaN(virwoUserId)) {
    return res.status(400).json({
      success: false,
      message: 'virwoUserId inválido',
    });
  }

  // 1) buscamos al customer por virwoUserId
  const customer = await getCustomerByVirwoId(virwoUserId);
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: `No existe customer con virwoUserId=${virwoUserId}`,
    });
  }

  // 2) con customer.id traemos sus productos
  const products = await listProductsByCustomer(customer.id);
  return res.json({
    success: true,
    data: products,
  });
}
export async function handleCreateProduct(req: Request, res: Response) {
  try {
    const dto = req.body;
    const prod = await createProduct(dto);
    res.status(201).json({ success: true, data: prod });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
}

export async function handleUpdateProduct(req: Request, res: Response) {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).json({ success: false, message: 'productId inválido' });
  }

  try {
    const updated = await updateProduct(productId, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function handleGetProduct(req: Request, res: Response) {
  const id = Number(req.params.productId);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'productId inválido' });
  }
  const prod = await getProductById(id);
  if (!prod) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.json({ success: true, data: prod });
}

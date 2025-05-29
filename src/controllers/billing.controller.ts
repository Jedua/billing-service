// src/controllers/billing.controller.ts
import { Request, Response } from 'express';
import * as billingService from '../services/billing.service';
import { Customer } from '../models/customer.model';
import { getCustomerByVirwoId } from '../services/billing.service';

export async function createCustomer(req: Request, res: Response) {
  try {
    const dto = req.body as billingService.CreateCustomerDto;
    const customer = await billingService.createCustomer(dto);
    res.status(201).json({
      id:   customer.id,
      virwoUserId: customer.virwoUserId,
      name: customer.name,
      email: customer.email,
      taxId: customer.taxId,
      address: customer.address,
      phone: customer.phone
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateCustomer(req: Request, res: Response) {
  try {
    const virwoUserId = Number(req.params.virwoUserId);
    const dto = req.body as billingService.UpdateCustomerDto;
    const customer = await billingService.updateCustomer(virwoUserId, dto);
    res.json({
      id:   customer.id,
      virwoUserId: customer.virwoUserId,
      name: customer.name,
      email: customer.email,
      taxId: customer.taxId,
      address: customer.address,
      phone: customer.phone
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getCustomerFiscalData(
  req: Request,
  res: Response
) {
  try {
    const virwoId = Number(req.params.virwoUserId);
    if (isNaN(virwoId)) {
      return res.status(400).json({ message: 'virwoUserId inválido' });
    }

    const customer = await getCustomerByVirwoId(virwoId);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Devolvemos sólo los campos que queramos exponer
    return res.json({
      id:                 customer.id,
      virwoUserId:        customer.virwoUserId,
      name:               customer.name,
      email:              customer.email,
      taxId:              customer.taxId,
      address:            customer.address,
      phone:              customer.phone,
      facturapiCustomerId: customer.facturapiCustomerId
    });
  } catch (err: any) {
    console.error('ERROR getCustomerFiscalData:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
}
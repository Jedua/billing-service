// src/services/billing.service.ts
import { Customer } from '../models/customer.model';
import * as facturapiService from './facturapi.service'; // Asegurate de importar correctamente
import { FacturapiCustomerData } from './facturapi.service'; // Si tenés types definidos ahí

export interface CreateCustomerDto {
  virwoUserId: number;  // el ID del usuario en VirwoCloud
  name:        string;
  email:       string;
  taxId:       string;
  address?:    string;
  phone?:      string;
}

export interface UpdateCustomerDto {
  name?:     string;
  email?:    string;
  taxId?:    string;
  address?:  string;
  phone?:    string;
}

/**
 * 1) Create a brand-new Customer (error if one exists).
 */
export async function createCustomer(dto: CreateCustomerDto) {
  // look up by virwoUserId, not userId
  const existing = await Customer.findOne({
    where: { virwoUserId: dto.virwoUserId }
  });
  if (existing) {
    throw new Error(`Customer for virwoUserId=${dto.virwoUserId} already exists`);
  }

  return Customer.create({
    virwoUserId:        dto.virwoUserId,
    name:               dto.name,
    email:              dto.email,
    taxId:              dto.taxId,
    address:            dto.address ?? undefined,
    phone:              dto.phone   ?? undefined,
    facturapiCustomerId: undefined 
  });
}

/**
 * 2) Update an existing Customer by virwoUserId.
 */
export async function updateCustomer(
  virwoUserId: number,
  dto: UpdateCustomerDto
) {
  const customer = await Customer.findOne({
    where: { virwoUserId }
  });
  if (!customer) {
    throw new Error(`No customer found for virwoUserId=${virwoUserId}`);
  }

  // build an updates object
  const updates: Partial<{
    name: string;
    email: string;
    taxId: string;
    address: string;
    phone: string;
    updatedAt: Date;
  }> = {};

  if (dto.name    !== undefined) updates.name    = dto.name;
  if (dto.email   !== undefined) updates.email   = dto.email;
  if (dto.taxId   !== undefined) updates.taxId   = dto.taxId;
  if (dto.address !== undefined) updates.address = dto.address;
  if (dto.phone   !== undefined) updates.phone   = dto.phone;

  if (Object.keys(updates).length) {
    updates.updatedAt = new Date();
    await customer.update(updates);
  }

  return customer;
}

export async function getCustomerByVirwoId(
  virwoUserId: number
): Promise<Customer | null> {
  // Busca en la tabla customers por el campo virwoUserId
  const customer = await Customer.findOne({
    where: { virwoUserId }
  });
  return customer;  // puede ser null si no existe
}
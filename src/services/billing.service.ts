import { Customer } from '../models/customer.model';

interface FiscalData {
  name: string;
  taxId: string;
  address?: string;
  email: string;
  phone?: string;
  userId: number;
}

export async function createCustomerFiscalData(data: FiscalData) {
  // Verifica que no exista un cliente con ese taxId para ese usuario
  const exists = await Customer.findOne({
    where: { userId: data.userId, taxId: data.taxId }
  });
  if (exists) throw new Error('Customer with this taxId already exists for this user.');

  const customer = await Customer.create({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return customer;
}

export async function getCustomerFiscalDataByUser(userId: number) {
  return await Customer.findAll({
    attributes: ['id', 'name', 'taxId', 'address', 'email', 'phone', 'createdAt', 'updatedAt']
  });
}

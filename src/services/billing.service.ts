import { Customer } from '../models/customer.model';
import { InvoiceItem } from '../models/invoice-item.model';
import { Invoice } from '../models/invoice.model';

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

// Calcula total de factura sumando los items
const calculateInvoiceTotal = (items: Array<{ quantity: number, unitPrice: number }>) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

export async function createInvoiceWithItems({ userId, customerId, items }: {
  userId: number;
  customerId: number;
  items: Array<{ productId: number, quantity: number, unitPrice: number }>;
}) {
  return await Invoice.sequelize!.transaction(async (t) => {
    // Calcula total de la factura
    const total = calculateInvoiceTotal(items);

    // Crea la factura
    const invoice = await Invoice.create({
      userId,
      customerId,
      total,
      status: 'draft'
    }, { transaction: t });

    // Crea los items
    for (const item of items) {
      await InvoiceItem.create({
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }, { transaction: t });
    }

    return invoice;
  });
}

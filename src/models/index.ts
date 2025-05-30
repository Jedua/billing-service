// src/models/index.ts

import { Sequelize } from 'sequelize';
import { initUserModel, User } from './user.model';
import { initCustomerModel, Customer } from './customer.model';
import { initProductModel, Product } from './product.model';
import { initInvoiceModel, Invoice } from './invoice.model';
import { initInvoiceItemModel, InvoiceItem } from './invoice-item.model';
import { initInvoiceLogModel, InvoiceLog } from './invoice-log.model'; // <—

export const initModels = (sequelize: Sequelize) => {
  initUserModel(sequelize);
  initCustomerModel(sequelize);
  initProductModel(sequelize);
  initInvoiceModel(sequelize);
  initInvoiceItemModel(sequelize);
  initInvoiceLogModel(sequelize); // <—

  // Relaciones
  Customer.hasMany(Product,  { foreignKey: 'customerId' });
  Product.belongsTo(Customer, { foreignKey: 'customerId' });

  Customer.hasMany(Invoice,    { foreignKey: 'customerId' });
  Invoice.belongsTo(Customer,  { foreignKey: 'customerId' });

  Invoice.hasMany(InvoiceItem,   { foreignKey: 'invoiceId' });
  InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

  Product.hasMany(InvoiceItem,   { foreignKey: 'productId' });
  InvoiceItem.belongsTo(Product, { foreignKey: 'productId' });

  // y… finalmente la relación log
  Invoice.hasMany(InvoiceLog,    { foreignKey: 'invoiceId' });
  InvoiceLog.belongsTo(Invoice,  { foreignKey: 'invoiceId' });
};

import { Sequelize } from 'sequelize';
import { initUserModel, User } from './user.model';
import { initCustomerModel, Customer } from './customer.model';
import { initProductModel, Product } from './product.model';
import { initInvoiceModel, Invoice } from './invoice.model';
import { initInvoiceItemModel, InvoiceItem } from './invoice-item.model';

export const initModels = (sequelize: Sequelize) => {
  // Inicializa modelos
  initUserModel(sequelize);
  initCustomerModel(sequelize);
  initProductModel(sequelize);
  initInvoiceModel(sequelize);
  initInvoiceItemModel(sequelize);

  // Relaciones
  User.hasMany(Customer, { foreignKey: 'userId' });
  Customer.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Product, { foreignKey: 'userId' });
  Product.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Invoice, { foreignKey: 'userId' });
  Customer.hasMany(Invoice, { foreignKey: 'customerId' });
  Invoice.belongsTo(User, { foreignKey: 'userId' });
  Invoice.belongsTo(Customer, { foreignKey: 'customerId' });

  Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });
  InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

  Product.hasMany(InvoiceItem, { foreignKey: 'productId' });
  InvoiceItem.belongsTo(Product, { foreignKey: 'productId' });
};


import { DataTypes, Model, Sequelize } from 'sequelize';

export class InvoiceItem extends Model {
  public id!: number;
  public invoiceId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public total!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initInvoiceItemModel = (sequelize: Sequelize) => {
  InvoiceItem.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      tableName: 'invoice_items',
      modelName: 'InvoiceItem',
    }
  );
};

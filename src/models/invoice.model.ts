import { DataTypes, Model, Sequelize } from 'sequelize';

export class Invoice extends Model {
  public id!: number;
  public userId!: number;
  public customerId!: number;
  public externalId?: string; // ID de FacturAPI
  public status!: string;
  public total!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initInvoiceModel = (sequelize: Sequelize) => {
  Invoice.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      externalId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de factura en FacturAPI',
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'draft',
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      tableName: 'invoices',
      modelName: 'Invoice',
    }
  );
};

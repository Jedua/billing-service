import { DataTypes, Model, Sequelize } from 'sequelize';

export class InvoiceLog extends Model {
  public id!: number;
  public invoiceId!: number;
  public event!: string;
  public details?: string;
  public createdAt!: Date;
}

export const initInvoiceLogModel = (sequelize: Sequelize) => {
  InvoiceLog.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      invoiceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      event: { type: DataTypes.STRING(100), allowNull: false },
      details: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'invoice_logs',
      modelName: 'InvoiceLog',
      updatedAt: false
    }
  );
};

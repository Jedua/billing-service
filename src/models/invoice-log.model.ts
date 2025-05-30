import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface InvoiceLogAttributes {
  id: number;
  invoiceId: number;
  event: string;
  details?: string | null;
  createdAt: Date;
}

export interface InvoiceLogCreationAttributes
  extends Optional<InvoiceLogAttributes, 'id' | 'details' | 'createdAt'> {}

export class InvoiceLog
  extends Model<InvoiceLogAttributes, InvoiceLogCreationAttributes>
  implements InvoiceLogAttributes {
  public id!: number;
  public invoiceId!: number;
  public event!: string;
  public details?: string | null;
  public createdAt!: Date;
}

export function initInvoiceLogModel(sequelize: Sequelize): typeof InvoiceLog {
  InvoiceLog.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Factura asociada',
        references: {
          model: 'invoices',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'invoice_logs',
      modelName: 'InvoiceLog',
      timestamps: false,      // No updatedAt
    }
  );

  return InvoiceLog;
}

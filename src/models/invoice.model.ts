import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface InvoiceAttributes {
  id: number;
  userId: number;
  customerId: number;
  externalId?: string | null;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceCreationAttributes
  extends Optional<InvoiceAttributes, 'id' | 'externalId' | 'createdAt' | 'updatedAt'> {}

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!: number;
  public userId!: number;
  public customerId!: number;
  public externalId?: string | null;
  public status!: string;
  public total!: number;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initInvoiceModel(sequelize: Sequelize): typeof Invoice {
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
        comment: 'ID local de usuario que emite',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Cliente facturado',
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      createdAt: '',
      updatedAt: ''
    },
    {
      sequelize,
      tableName: 'invoices',
      modelName: 'Invoice',
      timestamps: true,
    }
  );

  return Invoice;
}

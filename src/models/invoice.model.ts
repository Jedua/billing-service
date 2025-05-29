// src/models/invoice.model.ts

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface InvoiceAttributes {
  id: number;
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
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Cliente facturado',
      },
      externalId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID en FacturAPI',
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
      }
      ,
      createdAt: '',
      updatedAt: ''
    },
    {
      sequelize,
      tableName: 'invoices',
      modelName: 'Invoice',
      timestamps: true // Sequelize gestionará createdAt / updatedAt
    }
  );

  return Invoice;
}

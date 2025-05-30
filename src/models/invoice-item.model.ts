import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface InvoiceItemAttributes {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItemCreationAttributes
  extends Optional<InvoiceItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class InvoiceItem
  extends Model<InvoiceItemAttributes, InvoiceItemCreationAttributes>
  implements InvoiceItemAttributes {
  public id!: number;
  public invoiceId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public total!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initInvoiceItemModel(sequelize: Sequelize): typeof InvoiceItem {
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
        comment: 'Factura asociada',
        references: {
          model: 'invoices',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Producto facturado',
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'invoice_items',
      modelName: 'InvoiceItem',
      timestamps: true,
    }
  );

  return InvoiceItem;
}

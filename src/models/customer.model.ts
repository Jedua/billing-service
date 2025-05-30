import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface CustomerAttributes {
  id: number;
  virwoUserId: number | null;
  name: string;
  email: string;
  taxId: string;
  address?: string;
  phone?: string;
  facturapiCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Hacemos opcionales id, virwoUserId, createdAt y updatedAt
export interface CustomerCreationAttributes
  extends Optional<CustomerAttributes,
    'id' | 'virwoUserId' | 'createdAt' | 'updatedAt'
  > {}

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: number;
  public virwoUserId!: number | null;
  public name!: string;
  public email!: string;
  public taxId!: string;
  public address?: string;
  public phone?: string;
  public facturapiCustomerId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCustomerModel(sequelize: Sequelize) {
  Customer.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      virwoUserId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'ID de usuario en VirwoCloud',
      },
      name:       { type: DataTypes.STRING(100), allowNull: false },
      email:      { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
      taxId:      { type: DataTypes.STRING(13), allowNull: false },
      address:    { type: DataTypes.STRING(255), allowNull: true },
      phone:      { type: DataTypes.STRING(20), allowNull: true },
      facturapiCustomerId: {
        type: DataTypes.STRING(40),
        allowNull: true,
        comment: 'ID en Facturapi',
      },
      createdAt:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'customers',
      modelName: 'Customer',
      timestamps: true,  // importante
    }
  );
}

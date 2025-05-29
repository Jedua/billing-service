import { DataTypes, Model, Sequelize } from 'sequelize';

export class Product extends Model {
  public id!: number;
  public customerId!: number;      // ahora FK a customers
  public name!: string;
  public description?: string;
  public price!: number;
  public taxRate!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initProductModel = (sequelize: Sequelize) => {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {                                       // <-- nuevo campo
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      tableName: 'products',
      modelName: 'Product',
      timestamps: true,
    }
  );
};

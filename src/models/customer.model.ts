import { DataTypes, Model, Sequelize } from 'sequelize';

export class Customer extends Model {
    public id!: number;
    public userId!: number;
    public name!: string;
    public email!: string;
    public taxId!: string; // RFC
    public address?: string;
    public phone?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const initCustomerModel = (sequelize: Sequelize) => {
    Customer.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },
            taxId: {
                type: DataTypes.STRING(13),
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'customers',
            modelName: 'Customer',
        }
    );
};

import { DataTypes, Model, Sequelize } from 'sequelize';
import * as bcrypt from 'bcrypt';

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(50),
        defaultValue: 'user',
      },
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
      hooks: {
        // Antes de crear: hashea password
        beforeCreate: async (user: User) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        },
        // Antes de actualizar: si cambió password, vuelve a hashear
        beforeUpdate: async (user: User) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
};

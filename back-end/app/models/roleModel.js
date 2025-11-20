import {sequelize} from '../config/database.js';
import {DataTypes} from 'sequelize';

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    permission: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'isActive'
    },
}, {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Role;
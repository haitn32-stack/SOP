import {sequelize} from '../config/database.js';
import {DataTypes} from 'sequelize';

const DepartmentModel = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Department',
    underscored: false,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

export default DepartmentModel;
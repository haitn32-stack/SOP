import {sequelize} from '../config/database.js';
import {DataTypes} from 'sequelize';

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'locations',
    timestamps: true,
    underscored: true,
});

export default Location;
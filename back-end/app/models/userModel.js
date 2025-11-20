import {sequelize} from '../config/database.js';
import {DataTypes} from 'sequelize';

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    hashPwd: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: true
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    mobilePhone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    jobTitle: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    jobCode: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    supervisorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    locationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'locations',
            key: 'id'
        }
    },
    parentDepartmentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    childDepartment1Id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    childDepartment2Id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 14,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: Date.now()
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: Date.now()
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

export default User;
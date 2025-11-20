import dotenv from 'dotenv';
import {Sequelize} from "sequelize";

dotenv.config();

// Cấu hình
const dbConfig = {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'High199118!',
    database: process.env.DB_NAME || 'SOP_DB',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

// Dùng object cấu hình đó để tạo instance Sequelize cho ứng dụng
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

// Test Connection to MySQL
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully');
        return true;
    } catch (error) {
        console.error('Unable to connect to database:', error.message);
        return false;
    }
};

// Export instance
export {sequelize, testConnection};

// Export default object cấu hình cho sequelize-cli
export default {
    development: dbConfig,
    test: dbConfig,
    production: dbConfig
};
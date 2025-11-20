import winston from 'winston';
import 'winston-mongodb';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

// Tạo __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'info';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'white'
};

winston.addColors(colors);

// Format cho console
const consoleFormat = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.colorize({all: true}),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

//
const transports = [
    new winston.transports.Console({format: consoleFormat}),

    new winston.transports.MongoDB({
        level: 'info',
        db: process.env.ATLAS_URL,
        options: {
            useUnifiedTopology: true // Tùy chọn kết nối của Mongoose/MongoDB
        },
        collection: 'logs_SOP',
        format: winston.format.combine(
            winston.format.timestamp(), // Thêm timestamp vào log
            winston.format.metadata(),  // Gom các thông tin phụ vào object metadata
            winston.format.json()     // Lưu log dưới dạng JSON
        )
    })
];

const logger = winston.createLogger({
    level: level(),
    levels,
    transports
});

export default logger;
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import {testConnection} from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import roleRoutes from "./routes/roleRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import testConnectionMongo from "./config/mongoDB.js";
import locationRoutes from "./routes/locationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test database connection on startup
testConnection().then(connected => {
    if (!connected) {
        console.error('Kết nối DB thất bại');
        process.exit(1);
    }
});

// Test mongoDB connection
testConnectionMongo().then(connected => {
    if (!connected) {
        console.error('Fail to connect to MongoDB');
        process.exit(1);
    }
})

// Routes
app.use('/api', routes);
app.use('/api/users', userRoutes);
app.use('/api', roleRoutes);
app.use('/api', departmentRoutes);
app.use('/api', locationRoutes);
app.use('/api', adminRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
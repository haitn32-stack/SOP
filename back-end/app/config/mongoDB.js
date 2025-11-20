import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config();

const DB_URL = process.env.ATLAS_URL;
mongoose.connect(DB_URL);
const connection = mongoose.connection;

const testConnectionMongo = async () => {
    try {
        await connection.once('open', () => {
            console.log('Connected to MongoDB');
        })
        return true;
    } catch (err) {
        console.log('MongoDB connection error');
    }
}

export default testConnectionMongo;
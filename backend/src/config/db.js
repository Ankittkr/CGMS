import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        const connectInstance = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`\n MongoDB connected !! DB HOST: ${connectInstance.connection.host}`);
        return connectInstance;
    } catch (error) {
        console.error("MongoDB connection failed: ", error.message);
        throw error;
    }
};

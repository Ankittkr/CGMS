import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 8000;

const startServer = () => {
    app.on("error", (error) => {
        console.error("App runtime error:", error);
    });
    app.listen(PORT, () => {
        console.log(`🚀 CGMS Server is running at http://localhost:${PORT}`);
        console.log(`🩺 Health API: http://localhost:${PORT}/api/v1/health`);
    });
};

connectDB()
    .then(() => {
        startServer();
    })
    .catch((err) => {
        console.warn(`⚠️ Warning: MongoDB connection failed (${err.message}). Starting server in development mode.`);
        startServer();
    });

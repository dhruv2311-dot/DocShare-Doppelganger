const mongoose = require('mongoose');

// Cache the connection across invocations in the same serverless instance
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
    }
    try {
        cached.conn = await cached.promise;
        console.log('MongoDB Connected successfully...');
    } catch (err) {
        cached.promise = null;
        console.error(err.message);
        process.exit(1);
    }
    return cached.conn;
};

module.exports = connectDB;

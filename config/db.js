import mongoose from 'mongoose';

const connectDB = async () => {
  // Disable command buffering globally so queries fail fast if connection is down
  mongoose.set('bufferCommands', false);

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/readers_library';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // fail connection after 2 seconds
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('Falling back to local filesystem JSON database at backend/data/db.json.');
  }
};

export default connectDB;

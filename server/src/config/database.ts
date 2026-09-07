import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viz_digital_expo';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}`);
    return true;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection warning (${error.message}). Running with in-memory sync / connected mock store fallback.`);
    return false;
  }
};

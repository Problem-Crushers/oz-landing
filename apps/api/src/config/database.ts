import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/musicflow';
    
    await mongoose.connect(mongoUri);
    
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}
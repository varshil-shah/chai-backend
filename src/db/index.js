import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("Database connected successfully...");
  } catch (error) {
    console.log("Failed to connected... ", error);
    process.exit(1);
  }
};

export default connectDB;

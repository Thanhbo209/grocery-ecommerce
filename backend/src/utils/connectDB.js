import mongoose from "mongoose";

export const connectDB = async (connectionString) => {
  if (!connectionString) {
    throw new Error("MONGO_URI environment variable is required");
  }
  await mongoose.connect(connectionString);
  console.log("Connected Successfully");
};

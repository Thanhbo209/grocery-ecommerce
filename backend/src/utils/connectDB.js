import mongoose from "mongoose";

export const connectDB = async (connectionString) => {
  try {
    if (!connectionString) {
      console.log("Connection string error in .env");
    }
    await mongoose.connect(connectionString);
    console.log("Connected Successfully");
  } catch (err) {
    console.log("Error while connecting...", err);
  }
};

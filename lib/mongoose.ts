import mongoose from "mongoose";
let isConnected: boolean = false;
export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("Missing MONGODB_URL");
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "codeoverflow",
    });
    isConnected = true;
    console.log("MongoDB is connected");
  } catch (error: any) {
    console.log("MongoDB connection failed:", error);
  }
};

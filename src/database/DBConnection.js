import mongoose from "mongoose";

export const DBConnection = async () => {
  try {
    const response = await mongoose.connect(process.env.DB_URl);
    console.log("Database Connection response:", response.connection.host);
  } catch (error) {
    console.log("Error To Connect Database:", error);
  }
};

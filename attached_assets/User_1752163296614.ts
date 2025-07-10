import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Optional fields for password reset
    resetToken: { type: String },
    resetTokenExpiry: { type: Number }
  },
  { timestamps: true }
);

// Export the User model
export default mongoose.model("User", userSchema);

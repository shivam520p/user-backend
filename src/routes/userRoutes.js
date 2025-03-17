import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserProfile,
  registerUser,
  sendOtpInEmail,
  userLoginWithEmail,
  userLoginWithMobile,
  verifyEmailOTP,
} from "../controller/userController.js";

export const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login-with-email", userLoginWithEmail);
userRoutes.post("/login-with-mobile", userLoginWithMobile);
userRoutes.post("/send-email-otp", sendOtpInEmail);
userRoutes.post("/verify-email-otp", verifyEmailOTP);
userRoutes.get("/get-user-profile", getUserProfile);
userRoutes.get("/get-all-users", getAllUsers);
userRoutes.delete("/delete-user/:id", deleteUser);

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/userSchema.js";
import { generateOtp } from "../utils/Provider.js";
import OTP from "../models/otpSchema.js";

//API Call to register new user in database
export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile_no, password } = req.body;
    if (!name || !email || !mobile_no || !password) {
      return res
        .status(400)
        .json({ message: "All Fields are required!!", success: false });
    }

    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res
        .status(400)
        .json({ message: "Email already exists!!", success: false });
    }

    const userMobile = await User.findOne({ mobile_no });
    if (userMobile) {
      return res
        .status(400)
        .json({ message: "Mobile number already exists!!", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createNewUser = await User.create({
      name,
      email,
      mobile_no,
      password: hashedPassword,
    });

    if (!createNewUser) {
      return res
        .status(400)
        .json({ message: "Failed to create user!!", success: false });
    }

    const payload = {
      userId: createNewUser._id,
      email: createNewUser.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .json({ message: "User Created Successfully!!", success: true, token });
  } catch (error) {
    console.log("Error To Register User:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//API call to login user with email and password
export const userLoginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        name: user.name,
        mobile_no: user.mobile_no,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "User Login successfully!!",
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        mobile_no: user.mobile_no,
      },
    });
  } catch (error) {
    console.log("Error To Login User:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//API call to login user with mobile number and password
export const userLoginWithMobile = async (req, res) => {
  try {
    const { mobile_no, password } = req.body;

    if (!mobile_no || !password) {
      return res.status(400).json({
        message: "Mobile No and password are required",
        success: false,
      });
    }

    const user = await User.findOne({ mobile_no });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        name: user.name,
        mobile_no: user.mobile_no,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "User Login successfully!!",
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        mobile_no: user.mobile_no,
      },
    });
  } catch (error) {
    console.log("Error To Login User:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Api call to send otp in user email
export const sendOtpInEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }
  const otp = generateOtp();
  const otpExit = await OTP.findOne({ email: email });
  let record = otpExit;
  if (otpExit) {
    await OTP.findOneAndUpdate({ _id: otpExit._id }, { $set: { otp: otp } });
  } else {
    record = await OTP.create({ otp, email });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "webdevshivam02@gmail.com",
      pass: "caou yamz lspa hzja",
    },
  });

  const mailOptions = {
    from: "webdevshivam02@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Api call to verify user otp with email
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }
    if (!otp) {
      return res
        .status(400)
        .json({ message: "OTP is required", success: false });
    }
    const optVerify = await OTP.findOne({ otp, email });
    if (!optVerify) {
      return res.status(400).json({
        message: "Invalid OTP!! Please try Again!!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        name: user.name,
        mobile_no: user.mobile_no,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    return res.status(200).json({
      message: "OTP Verify successfully!!",
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        mobile_no: user.mobile_no,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to Verify OTP" });
  }
};

//API call to get all user without user token
export const getAllUsers = async (req, res) => {
  try {
    const user = await User.find().select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not found!!", success: false });
    }
    return res.status(200).json({
      message: "All User Fetch Successfully!!",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error Fetching user:", error);
    return res.status(400).json({ message: "Failed to Fetch user" });
  }
};

//API call to get user profile with user token
export const getUserProfile = async (req, res) => {
  const token = req.headers.token;
  if (!token) {
    return res.status(400).json({ error: "Token is missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ _id: decoded.id }).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User Fetch Successfully!!",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error Fetching user:", error);
    return res.status(400).json({ message: "Failed to Fetch user" });
  }
};

//API call to delete user with user id and user token
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "User Id is missing" });
    }
    const token = req.headers.token;
    if (!token) {
      return res.status(400).json({ error: "Token is missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not found!!", success: false });
    }
    const deleteUserInfo = await User.findOneAndDelete({ _id: user._id });
    return res.status(200).json({
      message: "User Deleted Successfully!!",
      success: true,
    });
  } catch (error) {
    console.log("Error to Delete user", error);
  }
};

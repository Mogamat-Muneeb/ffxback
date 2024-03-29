import express, { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User";
import ResetToken from "../models/ResetToken";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();
const router = express.Router();

console.log("testing env", process.env.ACCESS_TOKEN_SECRET);

// !LOGIN_ROUTE
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ accessToken: null, message: "Invalid Password!" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: 86400,
      }
    );

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
      accessToken: token,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// !REGISTER_ROUTE
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("🚀 ~ router.post ~ req.body:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id, role: newUser.role },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: 86400,
      }
    );

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      phone_number: newUser.phone_number,
      accessToken: token,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// !FORGOT-PASSWORD_ROUTE
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    const userId = existingUser._id.toString();
    const resetToken = new ResetToken({ token, expiry, email, userId });

    await resetToken.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "noreply@yourdomain.com",
      to: email,
      subject: "Forgot Password",
      text: `Click here to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// !RESET-PASSWORD_ROUTE
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;

    const resetToken = await ResetToken.findOne({ token });
    console.log("🚀 ~ router.post ~ resetToken:", resetToken);

    if (!resetToken || resetToken.used || resetToken.expiry < new Date()) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    resetToken.used = true;
    await resetToken.save();

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = resetToken.userId;
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

export default router;

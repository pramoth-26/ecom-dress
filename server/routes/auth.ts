import { RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";

const usersFilePath = path.join(__dirname, "../data/users.json");

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  state: string;
  pincode: string;
  password: string;
}

const readUsersFile = (): User[] => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeUsersFile = (users: User[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

export const handleSignUp: RequestHandler = (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      district,
      state,
      pincode,
      password,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const users = readUsersFile();

    const userExists = users.some((u) => u.email === email);
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      district,
      state,
      pincode,
      password,
    };

    users.push(newUser);
    writeUsersFile(users);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Server error during signup. Please try again."
    });
  }
};

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = readUsersFile();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server error during login. Please try again."
    });
  }
};

export const handleGetUserInfo: RequestHandler = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const users = readUsersFile();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      district: user.district,
      state: user.state,
      pincode: user.pincode,
    },
  });
};

interface OTPRecord {
  email: string;
  otp: string;
  createdAt: number;
  expiresAt: number;
}

const otpsFilePath = path.join(__dirname, "../data/otps.json");

const readOTPsFile = (): OTPRecord[] => {
  try {
    const data = fs.readFileSync(otpsFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeOTPsFile = (otps: OTPRecord[]) => {
  fs.writeFileSync(otpsFilePath, JSON.stringify(otps, null, 2));
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const handleForgotPassword: RequestHandler = (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const users = readUsersFile();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "Email not found in our system" });
    }

    const otp = generateOTP();
    const otps = readOTPsFile();
    const now = Date.now();

    otps.push({
      email,
      otp,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000,
    });

    writeOTPsFile(otps);

    console.log(`OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP has been sent to your email",
      email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Server error. Please try again.",
    });
  }
};

export const handleVerifyOTP: RequestHandler = (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const otps = readOTPsFile();
    const otpRecord = otps.find((o) => o.email === email && o.otp === otp);

    if (!otpRecord) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    if (Date.now() > otpRecord.expiresAt) {
      const updatedOtps = otps.filter((o) => !(o.email === email && o.otp === otp));
      writeOTPsFile(updatedOtps);
      return res.status(401).json({ error: "OTP has expired" });
    }

    const token = `reset-${Date.now()}-${email}`;

    const updatedOtps = otps.filter((o) => !(o.email === email && o.otp === otp));
    writeOTPsFile(updatedOtps);

    res.json({
      success: true,
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      error: "Server error. Please try again.",
    });
  }
};

export const handleResetPassword: RequestHandler = (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (!token.startsWith("reset-")) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const users = readUsersFile();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users[userIndex].password = newPassword;
    writeUsersFile(users);

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      error: "Server error. Please try again.",
    });
  }
};

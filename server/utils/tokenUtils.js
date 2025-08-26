import crypto from "crypto";

// Generate verification token
export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate password reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

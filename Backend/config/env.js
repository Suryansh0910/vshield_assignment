require("dotenv").config();




module.exports = {
  
  DATABASE_URL: process.env.DATABASE_URL,
  
  
  JWT_SECRET: process.env.JWT_SECRET || "default_secret_key",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "15m",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
  
  
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  
  AADHAAR_API_URL: process.env.AADHAAR_API_URL,
  PAN_API_URL: process.env.PAN_API_URL,
  
  
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
};

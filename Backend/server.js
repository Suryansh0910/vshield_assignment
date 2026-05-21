const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const mockApiRoutes = require("./routes/mockApiRoutes");

const app = express();

// Trust Render/proxy's X-Forwarded-For so rate limiters use the real client IP
app.set("trust proxy", 1);

// ============ MIDDLEWARE ============

// CORS - Must be before helmet
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  // Support comma-separated list: FRONTEND_URL=https://a.vercel.app,https://preview.vercel.app
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
    : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Return false instead of an Error so CORS headers are still absent
    // (browser will show a CORS error, not a server crash)
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Security middleware - After CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Body parser & Cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 100,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 50,
  message: "Too many verification requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ ROUTES ============

// Preflight handler — reuse the same options so allowed origins stay in sync
app.options("*", cors(corsOptions));

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Auth routes (with rate limiting)
app.use("/api/auth", authLimiter, authRoutes);

// Candidate routes
app.use("/api/candidates", candidateRoutes);

// Verification routes (with rate limiting)
app.use("/api/verifications", verificationLimiter, verificationRoutes);

// Report routes
app.use("/api/reports", reportRoutes);

// Mock API routes
app.use("/mock-api", mockApiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ============ SERVER START ============

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});
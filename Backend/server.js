const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");


const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const mockApiRoutes = require("./routes/mockApiRoutes");

const app = express();
app.set("trust proxy", 1);




app.use(helmet());


app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000", 
      "https://vshield-assignment.vercel.app"
    ],
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/reports", express.static(path.join(__dirname, "reports")));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 10,
  message: "Too many authentication attempts, please try again later",
});

const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 5,
  message: "Too many verification requests, please try again later",
});



app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/verifications", verificationLimiter, verificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/mock-api", mockApiRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});


app.use(errorHandler);



const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`📄 Reports served at http://localhost:${PORT}/reports/`);
});

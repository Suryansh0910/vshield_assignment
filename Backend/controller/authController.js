const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/database");
const env = require("../config/env");
const { registerSchema, loginSchema } = require("../utils/validations");


const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        verified: true, 
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }



    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const refreshToken = jwt.sign(
      { id: user.id, jti: crypto.randomUUID() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    const refreshTokenHash = hashToken(refreshToken);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, sessionId: session.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found or invalid",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revoked: false,
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, sessionId: session.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, jti: crypto.randomUUID() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    const newRefreshTokenHash = hashToken(newRefreshToken);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found or invalid",
      });
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revoked: false,
      },
    });

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revoked: true },
    });

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found or invalid",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    await prisma.session.updateMany({
      where: {
        userId: decoded.id,
        revoked: false,
      },
      data: { revoked: true },
    });

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refresh,
  logout,
  logoutAll,
};

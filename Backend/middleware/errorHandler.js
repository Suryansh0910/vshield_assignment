
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  
  if (err.name === "ZodError") {
    const formattedErrors = err.errors.reduce((acc, curr) => {
      const field = curr.path.join(".");
      acc[field] = curr.message;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: formattedErrors,
    });
  }

  
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;

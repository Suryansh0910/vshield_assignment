const { z } = require("zod");


const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const createCandidateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  aadhaarNumber: z
    .string()
    .regex(aadhaarRegex, "Invalid Aadhaar number (12 digits required)"),
  panNumber: z
    .string()
    .regex(panRegex, "Invalid PAN number format"),
  dob: z.preprocess((val) => {
    if (typeof val === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(val).toISOString();
      }
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
    return val;
  }, z.string().datetime({ message: "Invalid date format. Expected YYYY-MM-DD or ISO 8601 datetime string" })),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const updateCandidateSchema = createCandidateSchema.partial();

const refreshSchema = z.object({
  
});

module.exports = {
  
  registerSchema,
  loginSchema,
  refreshSchema,
  
  
  createCandidateSchema,
  updateCandidateSchema,
  
  
  aadhaarRegex,
  panRegex,
};

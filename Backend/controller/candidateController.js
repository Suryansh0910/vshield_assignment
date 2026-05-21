const prisma = require("../config/database");
const { sanitizeCandidateData } = require("../utils/helpers");
const {
  createCandidateSchema,
  updateCandidateSchema,
} = require("../utils/validations");

/**
 * Create a new candidate
 * POST /api/candidates
 */
const createCandidate = async (req, res, next) => {
  try {
    // Validate input
    const validatedData = createCandidateSchema.parse(req.body);

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        ...validatedData,
        dob: new Date(validatedData.dob),
        createdById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: sanitizeCandidateData(candidate),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all candidates with pagination and search
 * GET /api/candidates
 */
const getAllCandidates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      createdById: req.user.id,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    if (status) {
      const validStatuses = ["PENDING", "VERIFIED", "FAILED"];
      if (validStatuses.includes(status.toUpperCase())) {
        where.status = status.toUpperCase();
      }
    }

    // Get total count
    const total = await prisma.candidate.count({ where });

    // Get candidates
    const candidates = await prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        verificationLogs: true,
      },
    });

    const sanitized = candidates.map(sanitizeCandidateData);

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: {
        candidates: sanitized,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate by ID
 * GET /api/candidates/:id
 */
const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        verificationLogs: true,
      },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Check ownership
    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      message: "Candidate retrieved successfully",
      data: sanitizeCandidateData(candidate),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update candidate
 * PUT /api/candidates/:id
 */
const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate input
    const validatedData = updateCandidateSchema.parse(req.body);

    // Check if candidate exists and user owns it
    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...validatedData,
        dob: validatedData.dob ? new Date(validatedData.dob) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      data: sanitizeCandidateData(updatedCandidate),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete candidate
 * DELETE /api/candidates/:id
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if candidate exists and user owns it
    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Delete candidate (cascade delete for verification logs)
    await prisma.candidate.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
};

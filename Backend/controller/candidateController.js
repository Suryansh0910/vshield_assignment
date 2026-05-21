const prisma = require("../config/database");
const { sanitizeCandidateData } = require("../utils/helpers");
const {
  createCandidateSchema,
  updateCandidateSchema,
} = require("../utils/validations");

const createCandidate = async (req, res, next) => {
  try {
    
    const validatedData = createCandidateSchema.parse(req.body);

    
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

    
    const total = await prisma.candidate.count({ where });

    
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

const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    
    const validatedData = updateCandidateSchema.parse(req.body);

    
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

const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    
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

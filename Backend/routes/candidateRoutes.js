const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getDashboardStats,
} = require("../controller/candidateController");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/candidates/stats
 * Dashboard stats — must be before /:id to avoid param collision
 */
router.get("/stats", getDashboardStats);

/**
 * POST /api/candidates
 * Create a new candidate
 */
router.post("/", createCandidate);

/**
 * GET /api/candidates
 * Get all candidates with pagination and search
 */
router.get("/", getAllCandidates);

/**
 * GET /api/candidates/:id
 * Get candidate by ID
 */
router.get("/:id", getCandidateById);

/**
 * PUT /api/candidates/:id
 * Update candidate
 */
router.put("/:id", updateCandidate);

/**
 * DELETE /api/candidates/:id
 * Delete candidate
 */
router.delete("/:id", deleteCandidate);

module.exports = router;

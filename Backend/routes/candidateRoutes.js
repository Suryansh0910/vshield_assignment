const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} = require("../controller/candidateController");

const router = express.Router();


router.use(authMiddleware);

router.post("/", createCandidate);

router.get("/", getAllCandidates);

router.get("/:id", getCandidateById);

router.put("/:id", updateCandidate);

router.delete("/:id", deleteCandidate);

module.exports = router;

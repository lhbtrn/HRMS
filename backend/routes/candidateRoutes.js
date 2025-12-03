const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");
const { auth, authorize } = require("../middleware/auth");

// Xem chi tiết hồ sơ
router.get(
  "/:id",
  auth,
  authorize(["Manager", "Admin"]),
  candidateController.getCandidateDetail
);

// Cập nhật trạng thái + ghi chú
router.put(
  "/:id/status",
  auth,
  authorize(["Manager", "Admin"]),
  candidateController.updateCandidateStatus
);

module.exports = router;

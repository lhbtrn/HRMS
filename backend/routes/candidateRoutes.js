const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");
const { auth, checkRole } = require("../middleware/auth");
const pool = require("../config/database");

// Lấy danh sách ứng viên
router.get("/", candidateController.getAllCandidates);

// Xem chi tiết
router.get("/:id", auth, candidateController.getCandidateDetail);

// Cập nhật trạng thái
router.put(
  "/:id/status",
  auth,
  checkRole("Admin", "Manager"),
  candidateController.updateStatus
);

// Gửi email tùy chỉnh
router.post(
  "/:id/send-email",
  auth,
  checkRole("Admin", "Manager"),
  candidateController.sendEmail
);
router.get(
  "/:id/notes",
  auth,
  checkRole("Manager", "Admin"),
  candidateController.getNotes
);

module.exports = router;

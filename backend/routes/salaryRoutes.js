// routes/salaryRoutes.js
const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { auth, checkRole } = require("../middleware/auth");

// ---------- Lấy danh sách nhân viên ----------
router.get(
  "/",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getAllEmployees
);

// ---------- Lấy danh sách phòng ban ----------
router.get(
  "/data/departments",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getDepartments
);

// ---------- Lấy bảng lương theo filter ----------
router.get(
  "/filter",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getSalariesByFilter
);

// ---------- Lấy bảng lương theo nhân viên ----------
router.get("/by-employee", auth, salaryController.getByEmployee);

// ---------- Lấy thưởng/phạt theo nhân viên ----------
router.get(
  "/reward-penalty",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getRewardPenalty
);

// ---------- Tạo hoặc cập nhật bảng lương ----------
// Middleware auth + checkRole: Admin và Manager mới được thao tác
router.post(
  "/create",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.createSalary
);

module.exports = router;

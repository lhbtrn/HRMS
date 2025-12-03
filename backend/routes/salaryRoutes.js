const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { auth, checkRole } = require("../middleware/auth");

// Lấy danh sách nhân viên
router.get(
  "/",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getAllEmployees
);

// Lấy danh sách phòng ban
router.get(
  "/data/departments",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getDepartments
);

// Lấy bảng lương theo filter tháng, năm, phòng ban
router.get(
  "/filter",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getSalariesByFilter
);
// Lưu bảng lương
router.post(
  "/create",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.createSalary
);

router.get("/by-employee", auth, salaryController.getByEmployee);
router.get(
  "/reward-penalty",
  auth,
  checkRole("Manager", "Admin"),
  salaryController.getRewardPenalty
);
module.exports = router;

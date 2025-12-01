const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const db = require("../config/database");

// Lấy danh sách phòng ban
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Employee.getDepartments();
    res.json(departments);
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy bảng lương theo filter (API chính)
exports.getSalariesByFilter = async (req, res) => {
  try {
    const { month, year, department } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Vui lòng chọn tháng và năm" });
    }

    const filters = {
      month: parseInt(month),
      year: parseInt(year),
      departmentId: department || null,
    };

    // Gọi model
    const salaries = await Salary.getSalariesByFilter(filters);

    // Format dữ liệu
    const formatted = salaries.map((s) => ({
      MaBangLuong: s.MaBangLuong,
      NhanVienID: s.NhanVienID,
      HoTen: s.HoTen,
      TenPhongBan: s.TenPhongBan || "",
      TenChucVu: s.TenChucVu || "",
      Thang: s.Thang,
      Nam: s.Nam,
      LuongCoBan: s.LuongCoBan || 0,
      Thuong: s.Thuong || 0,
      Phat: s.Phat || 0,
      KhauTru: s.KhauTru || 0,
      BaoHiem: s.BaoHiem || 0,
      Thue: s.Thue || 0,
      TongThuNhap: s.TongThuNhap || 0,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get salaries error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Tạo bảng lương
exports.createSalary = async (req, res) => {
  try {
    const {
      NhanVienID,
      LuongCoBan,
      Thuong,
      Phat,
      KhauTru,
      BaoHiem,
      Thue,
      Thang,
      Nam,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO BangLuong 
      (NhanVienID, LuongCoBan, Thuong, Phat, KhauTru, BaoHiem, Thue, Thang, Nam)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [NhanVienID, LuongCoBan, Thuong, Phat, KhauTru, BaoHiem, Thue, Thang, Nam]
    );

    res.status(201).json({
      message: "Lưu bảng lương thành công",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Lỗi khi lưu bảng lương:", err);
    res.status(500).json({ message: "Lỗi khi lưu bảng lương" });
  }
};

// Lấy bảng lương theo nhân viên
exports.getByEmployee = async (req, res) => {
  try {
    const employeeId = req.user.id; // ID của user đang đăng nhập
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: "Chọn tháng và năm" });
    }

    const [rows] = await db.execute(
      `SELECT * FROM BangLuong WHERE NhanVienID = ? AND Thang = ? AND Nam = ?`,
      [employeeId, month, year]
    );

    if (rows.length === 0) {
      return res.json({
        message: "Chưa có bảng lương tháng này",
        data: null,
      });
    }

    res.json({ data: rows[0] }); // Trả về data
  } catch (err) {
    console.error("Lỗi lấy lương theo nhân viên:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAll(); // hoặc model phù hợp của bạn
    res.json(employees);
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

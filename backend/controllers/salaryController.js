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

// Tạo hoặc cập nhật bảng lương
exports.createSalary = async (req, res) => {
  try {
    const {
      NhanVienID,
      LuongCoBan,
      Thuong = 0,
      Phat = 0,
      Thang,
      Nam,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!NhanVienID || !LuongCoBan || !Thang || !Nam) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Tính tổng thu nhập
    const TongThuNhap = Number(LuongCoBan) + Number(Thuong) - Number(Phat);
    // Khấu trừ = Lương cơ bản - Phạt
    const KhauTru = Number(LuongCoBan) - Number(Phat);

    // Kiểm tra xem bảng lương tháng/năm đã có chưa
    const [existing] = await db.execute(
      `SELECT * FROM BangLuong WHERE NhanVienID = ? AND Thang = ? AND Nam = ?`,
      [NhanVienID, Thang, Nam]
    );

    if (existing.length > 0) {
      // Nếu đã có → update dữ liệu
      await db.execute(
        `UPDATE BangLuong 
         SET LuongCoBan = ?, Thuong = ?, Phat = ?, KhauTru = ?, TongThuNhap = ?
         WHERE NhanVienID = ? AND Thang = ? AND Nam = ?`,
        [LuongCoBan, Thuong, Phat, KhauTru, TongThuNhap, NhanVienID, Thang, Nam]
      );

      return res
        .status(200)
        .json({ message: "Cập nhật bảng lương thành công" });
    }

    // Nếu chưa có → insert dữ liệu mới
    const [result] = await db.execute(
      `INSERT INTO BangLuong 
      (NhanVienID, Thang, Nam, LuongCoBan, Thuong, Phat, KhauTru, TongThuNhap)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [NhanVienID, Thang, Nam, LuongCoBan, Thuong, Phat, KhauTru, TongThuNhap]
    );

    res.status(201).json({
      message: "Lưu bảng lương thành công",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Lỗi khi lưu bảng lương:", err);
    res.status(500).json({ message: "Lỗi server khi tạo bảng lương" });
  }
};

// Lấy bảng lương theo nhân viên
exports.getByEmployee = async (req, res) => {
  try {
    const employeeId = req.query.employeeId || req.user.maNhanVien;

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

    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Lỗi lấy lương theo nhân viên:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    const userRole = req.user.vaiTro;
    const userPhongBanId = req.user.phongBanId;

    let employees = await Employee.getAll();
    if (userRole === "Manager") {
      // Manager chỉ xem nhân viên cùng phòng
      employees = employees.filter((emp) => emp.PhongBanID === userPhongBanId);
    }

    res.json(employees);
  } catch (err) {
    console.error("Get all employees error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy thưởng + phạt theo nhân viên & tháng/năm
exports.getRewardPenalty = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "Thiếu dữ liệu truy vấn!" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        SUM(CASE WHEN Loai = 'Thuong' THEN SoTien ELSE 0 END) AS Thuong,
        SUM(CASE WHEN Loai = 'Phat' THEN SoTien ELSE 0 END) AS Phat
      FROM ThuongPhat
      WHERE NhanVienID = ?
        AND MONTH(Ngay) = ?
        AND YEAR(Ngay) = ?
      `,
      [employeeId, month, year]
    );

    return res.json({
      data: {
        Thuong: rows[0].Thuong || 0,
        Phat: rows[0].Phat || 0,
      },
    });
  } catch (err) {
    console.error("Lỗi lấy thưởng/phạt:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy lương cá nhân theo ID nhân viên và tháng/năm
exports.getSalaryByEmployee = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;

    if (!employeeId)
      return res.status(400).json({ message: "Thiếu mã nhân viên" });

    const salary = await Salary.findByEmployeeAndMonth(employeeId, month, year);

    if (!salary) return res.json({ message: "Không có dữ liệu!" });

    res.json({ data: salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

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

    if (!NhanVienID || !LuongCoBan || !Thang || !Nam) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // 1️⃣ Lấy thông tin nhân viên từ bảng NhanVien
    const [empRows] = await db.execute(
      `SELECT * FROM NhanVien WHERE MaNhanVien = ?`,
      [NhanVienID]
    );
    const emp = empRows[0];

    if (!emp) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }

    // 2️⃣ Kiểm tra role Manager và phòng ban
    if (req.user.role === "Manager") {
      if (emp.PhongBanID !== req.user.PhongBanID) {
        return res.status(403).json({
          message:
            "Bạn không có quyền thao tác bảng lương của nhân viên phòng khác",
        });
      }
    }

    // 3️⃣ Tính tổng thu nhập và khấu trừ
    const TongThuNhap = Number(LuongCoBan) + Number(Thuong) - Number(Phat);
    const KhauTru = Number(LuongCoBan) - Number(Phat);

    // 4️⃣ Kiểm tra bảng lương đã tồn tại chưa
    const [existing] = await db.execute(
      `SELECT * FROM BangLuong WHERE NhanVienID = ? AND Thang = ? AND Nam = ?`,
      [NhanVienID, Thang, Nam]
    );

    if (existing.length > 0) {
      // Update bảng lương
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

    // Insert bảng lương mới
    const [result] = await db.execute(
      `INSERT INTO BangLuong
       (NhanVienID, Thang, Nam, LuongCoBan, Thuong, Phat, KhauTru, TongThuNhap)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [NhanVienID, Thang, Nam, LuongCoBan, Thuong, Phat, KhauTru, TongThuNhap]
    );

    res
      .status(201)
      .json({ message: "Lưu bảng lương thành công", id: result.insertId });
  } catch (err) {
    console.error("Lỗi khi lưu bảng lương:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
//1

// Lấy bảng lương theo nhân viên
exports.getByEmployee = async (req, res) => {
  try {
    const employeeId = req.query.employeeId || req.user.id; // sửa dòng này
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
    const userRole = req.user.role; // 'Manager' hoặc 'Admin'
    const userPhongBanId = req.user.PhongBanID;

    let employees = await Employee.getAll(); // lấy tất cả nhân viên

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
//1

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

const db = require("../config/database");

class Salary {
  static async getAll(filters = {}) {
    let query = `
      SELECT nv.*, pb.TenPhongBan, cv.TenChucVu
      FROM NhanVien nv
      LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
      LEFT JOIN ChucVu cv ON nv.ChucVuID = cv.MaChucVu
      WHERE 1=1
    `;
    const params = [];

    if (filters.phongBan) {
      query += " AND nv.PhongBanID = ?";
      params.push(filters.phongBan);
    }

    if (filters.phongBanId && filters.vaiTro === "Manager") {
      query += " AND nv.PhongBanID = ?";
      params.push(filters.phongBanId);
    }

    query += " ORDER BY nv.MaNhanVien DESC";

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getDepartments() {
    const [rows] = await db.query(
      "SELECT * FROM PhongBan ORDER BY TenPhongBan ASC"
    );
    return rows;
  }

  // Lấy bảng lương theo filter (tháng/năm/phòng ban)
  static async getSalariesByFilter({ month, year, departmentId }) {
    let sql = `
      SELECT bl.*, nv.HoTen, pb.TenPhongBan, cv.TenChucVu
      FROM BangLuong bl
      JOIN NhanVien nv ON bl.NhanVienID = nv.MaNhanVien
      LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
      LEFT JOIN ChucVu cv ON nv.ChucVuID = cv.MaChucVu
      WHERE bl.Thang = ? AND bl.Nam = ?
    `;
    const params = [month, year];

    if (departmentId) {
      sql += " AND nv.PhongBanID = ?";
      params.push(departmentId);
    }

    const [rows] = await db.execute(sql, params);

    return rows.map((s) => ({
      ...s,
      LuongCoBan: s.LuongCoBan || 0,
      Thuong: s.Thuong || 0,
      Phat: s.Phat || 0,
      KhauTru: s.KhauTru || 0,
      TongThuNhap:
        (s.LuongCoBan || 0) +
        (s.Thuong || 0) -
        (+(s.KhauTru || 0) + (s.Phat || 0)),
    }));
  }

  // Lấy bảng lương theo nhân viên
  static async getByEmployee(employeeId, month, year) {
    const [rows] = await db.execute(
      `SELECT bl.*, nv.HoTen, nv.PhongBanID, pb.TenPhongBan, cv.TenChucVu
       FROM BangLuong bl
       JOIN NhanVien nv ON bl.NhanVienID = nv.MaNhanVien
       LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
       LEFT JOIN ChucVu cv ON nv.ChucVuID = cv.MaChucVu
       WHERE bl.NhanVienID = ? AND bl.Thang = ? AND bl.Nam = ?`,
      [employeeId, month, year]
    );

    if (rows.length === 0) return null;

    const s = rows[0];

    return {
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
    };
  }
}

module.exports = Salary;

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

  static async getSalariesByFilter({ month, year, departmentId }) {
    let sql = `
      SELECT bl.*, nv.HoTen, pb.TenPhongBan
      FROM BangLuong bl
      JOIN NhanVien nv ON bl.NhanVienID = nv.MaNhanVien
      LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
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
      BaoHiem: s.BaoHiem || 0,
      Thue: s.Thue || 0,
      TongThuNhap:
        (s.LuongCoBan || 0) +
        (s.Thuong || 0) -
        ((s.BaoHiem || 0) + (s.KhauTru || 0) + (s.Phat || 0) + (s.Thue || 0)),
    }));
  }
}

module.exports = Salary;

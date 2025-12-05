const db = require("../config/database");

class Candidate {
  static async findById(maHoSo) {
    const [rows] = await db.execute(
      "SELECT * FROM HoSoUngVien WHERE MaHoSo = ?",
      [maHoSo]
    );
    return rows[0];
  }

  static async updateStatus(maHoSo, newStatus) {
    await db.execute("UPDATE HoSoUngVien SET TrangThai = ? WHERE MaHoSo = ?", [
      newStatus,
      maHoSo,
    ]);
  }

  static async addNote(maHoSo, userId, note) {
    // giả sử có bảng Notes lưu ghi chú
    await db.execute(
      "INSERT INTO Notes (MaHoSo, UserId, NoiDung) VALUES (?, ?, ?)",
      [maHoSo, userId, note]
    );
  }

  static async getNotes(maHoSo) {
    const [rows] = await db.execute(
      `SELECT 
        g.NoiDung, 
        g.NgayTao, 
        u.HoTen AS UserName,
        u.Role AS UserRole
     FROM GhiChuUngVien g
     JOIN Users u ON g.NguoiCapNhatID = u.MaNguoiDung
     WHERE g.HoSoUngVienID = ?
     ORDER BY g.NgayTao DESC`,
      [maHoSo]
    );
    return rows;
  }
}

module.exports = Candidate;

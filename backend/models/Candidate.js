const db = require("../config/database");

class Candidate {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT cv.*, nd.Email as EmailNguoiDung
       FROM Candidate cv
       LEFT JOIN NguoiDung nd ON cv.NguoiDungID = nd.MaNguoiDung
       WHERE cv.MaCandidate = ?`,
      [id]
    );
    return rows[0];
  }

  static async updateStatus(id, newStatus) {
    await db.query(`UPDATE Candidate SET TrangThai = ? WHERE MaCandidate = ?`, [
      newStatus,
      id,
    ]);
  }
}

module.exports = Candidate;

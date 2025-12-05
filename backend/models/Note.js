const db = require("../config/database");

class Note {
  static async create(candidateId, userId, content) {
    await db.query(
      `INSERT INTO Note (CandidateID, UserID, NoiDung) VALUES (?, ?, ?)`,
      [candidateId, userId, content]
    );
  }

  static async getByCandidateId(candidateId) {
    const [rows] = await db.query(
      `SELECT n.*, u.HoTen as UserName, u.VaiTro as UserRole
       FROM Note n
       LEFT JOIN NguoiDung u ON n.UserID = u.MaNguoiDung
       WHERE n.CandidateID = ?
       ORDER BY n.NgayTao ASC`,
      [candidateId]
    );
    return rows;
  }
}

module.exports = Note;

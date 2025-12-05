const pool = require("../config/database");
const sendEmail = require("../utils/sendEmail");

// ====== LẤY DANH SÁCH ỨNG VIÊN ======
exports.getAllCandidates = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        h.MaHoSo AS MaCandidate,
        h.HoTen,
        h.Email AS EmailNguoiDung,
        h.SoDienThoai,
        h.NgayNop,
        h.TrangThai,
        h.DuongDanCV,
        t.ViTri AS ViTriUngTuyen
      FROM HoSoUngVien h
      JOIN TinTuyenDung t ON h.TinTuyenDungID = t.MaTin
      ORDER BY h.NgayNop DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách ứng viên" });
  }
};

// ====== LẤY CHI TIẾT ỨNG VIÊN ======
exports.getCandidateDetail = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         h.MaHoSo AS MaCandidate,
         h.HoTen,
         h.Email AS EmailNguoiDung,
         h.SoDienThoai,
         h.NgayNop,
         h.TrangThai,
         h.DuongDanCV,
         t.ViTri AS ViTriUngTuyen
       FROM HoSoUngVien h
       JOIN TinTuyenDung t ON h.TinTuyenDungID = t.MaTin
       WHERE h.MaHoSo = ?`,
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy ứng viên" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết ứng viên" });
  }
};

// ====== CẬP NHẬT TRẠNG THÁI + GHI CHÚ + GỬI EMAIL ======
exports.updateStatus = async (req, res) => {
  const { newStatus, note } = req.body;
  const user = req.user; // auth middleware phải gắn req.user
  console.log("req.user:", req.user);

  if (!user || !user.id) {
    // sửa từ MaNguoiDung → id
    return res.status(401).json({ message: "Người dùng chưa xác thực" });
  }

  try {
    // Lấy thông tin ứng viên
    const [cRows] = await pool.execute(
      `SELECT 
         h.MaHoSo,
         h.Email,
         h.TrangThai,
         t.ViTri AS ViTriUngTuyen
       FROM HoSoUngVien h
       JOIN TinTuyenDung t ON h.TinTuyenDungID = t.MaTin
       WHERE h.MaHoSo = ?`,
      [req.params.id]
    );

    if (cRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });
    }

    const candidate = cRows[0];
    let updated = false;

    // Cập nhật trạng thái nếu khác trạng thái cũ
    if (newStatus && newStatus !== candidate.TrangThai) {
      await pool.execute(
        `UPDATE HoSoUngVien SET TrangThai = ? WHERE MaHoSo = ?`,
        [newStatus, req.params.id]
      );
      updated = true;
    }

    // Thêm ghi chú nếu có
    if (note && note.trim() !== "") {
      await pool.execute(
        `INSERT INTO GhiChuUngVien (HoSoUngVienID, NguoiCapNhatID, NoiDung)
         VALUES (?, ?, ?)`,
        [req.params.id, user.id, note.trim()] // dùng user.id
      );
      updated = true;
    }

    // Gửi email nếu trạng thái thay đổi
    if (newStatus && newStatus !== candidate.TrangThai) {
      let emailBody = "";
      if (newStatus === "PhongVan")
        emailBody = "Chúc mừng! Hồ sơ của bạn đã được chọn để phỏng vấn.";
      else if (newStatus === "DaTuyen")
        emailBody = `Chúc mừng! Bạn đã được tuyển dụng cho vị trí ${candidate.ViTriUngTuyen}.`;
      else if (newStatus === "TuChoi")
        emailBody = `Cảm ơn bạn đã quan tâm đến vị trí ${candidate.ViTriUngTuyen}.`;

      if (emailBody) {
        await sendEmail(
          candidate.Email,
          "Cập nhật trạng thái hồ sơ",
          emailBody
        );
      }
    }

    if (!updated) {
      return res.json({ message: "Không có thay đổi nào được thực hiện" });
    }

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật trạng thái/ghi chú" });
  }
};

// ====== GỬI EMAIL TÙY CHỈNH ======
exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    await sendEmail(to, subject, content);
    res.json({ message: "Email đã được gửi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi gửi email" });
  }
};

// ====== LẤY GHI CHÚ ỨNG VIÊN ======
exports.getNotes = async (req, res) => {
  try {
    const maHoSo = req.params.id;

    const [notes] = await pool.execute(
      `SELECT 
     g.NoiDung,
     g.ThoiGian,
     nd.TenDangNhap AS NguoiCapNhat
   FROM GhiChuUngVien g
   LEFT JOIN NguoiDung nd 
       ON g.NguoiCapNhatID = nd.MaNguoiDung
   WHERE g.HoSoUngVienID = ?
   ORDER BY g.ThoiGian DESC`,
      [maHoSo]
    );

    res.json(notes);
  } catch (error) {
    console.error("Lỗi getNotes:", error);
    res.status(500).json({ message: "Lỗi server khi lấy ghi chú" });
  }
};
//1

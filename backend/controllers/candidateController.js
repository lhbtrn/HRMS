const Candidate = require("../models/Candidate");
const Note = require("../models/Note");
const nodemailer = require("nodemailer");

exports.getCandidateDetail = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate)
      return res.status(404).json({ message: "Hồ sơ không tồn tại" });

    const notes = await Note.getByCandidateId(req.params.id);
    candidate.notes = notes;
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { newStatus, note } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate)
      return res.status(404).json({ message: "Hồ sơ không tồn tại" });

    if (newStatus && newStatus !== candidate.TrangThai) {
      await Candidate.updateStatus(req.params.id, newStatus);
      if (note) await Note.create(req.params.id, req.user.id, note);

      sendStatusEmail(candidate.EmailNguoiDung, candidate.ViTri, newStatus);
      return res.json({ message: "Cập nhật trạng thái và ghi chú thành công" });
    }

    res.status(400).json({ message: "Trạng thái không thay đổi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function sendStatusEmail(email, position, status) {
  let subject = "",
    text = "";
  if (status === "Phỏng vấn") {
    subject = "Thông báo phỏng vấn";
    text = `Chúc mừng! Hồ sơ của bạn đã được chọn để tham gia phỏng vấn. Chúng tôi sẽ liên hệ với bạn sớm.`;
  } else if (status === "Đã tuyển") {
    subject = "Bạn đã được tuyển dụng";
    text = `Bạn đã được tuyển dụng cho vị trí ${position}. Vui lòng liên hệ HR để hoàn tất thủ tục.`;
  } else if (status === "Từ chối") {
    subject = "Kết quả tuyển dụng";
    text = `Rất tiếc, bạn chưa được tuyển dụng cho vị trí ${position}.`;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  });
}

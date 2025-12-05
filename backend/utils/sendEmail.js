const nodemailer = require("nodemailer");

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // SMTP của Gmail
  port: 465, // SSL
  secure: true,
  auth: {
    user: "youremail@gmail.com", // đổi thành email của bạn
    pass: "your-app-password", // password ứng dụng (App password)
  },
});

// Hàm gửi email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"HR Team" <youremail@gmail.com>', // người gửi
      to, // người nhận
      subject, // tiêu đề
      text, // nội dung
      // html: "<b>Nội dung html</b>"          // nếu muốn dùng html
    });
    console.log(`Email đã gửi đến ${to}`);
  } catch (err) {
    console.error("Lỗi gửi email:", err);
  }
};

module.exports = sendEmail;

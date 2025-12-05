import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import dayjs from "dayjs";
import {
  FiPaperclip,
  FiFileText,
  FiArrowLeft,
  FiDownload,
  FiEye,
} from "react-icons/fi";

const statusMapping = {
  Moi: "Mới",
  PhongVan: "Phỏng vấn",
  DaTuyen: "Đã tuyển",
  TuChoi: "Từ chối",
};

const statusColors = {
  Moi: "bg-green-500",
  PhongVan: "bg-blue-500",
  DaTuyen: "bg-orange-500",
  TuChoi: "bg-red-500",
};

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    loadDetail();
    loadNotes();
  }, [id]);

  const loadDetail = async () => {
    try {
      const res = await api.get(`/candidates/${id}`);
      setCandidate(res.data);
    } catch (err) {
      console.error("Lỗi load chi tiết:", err);
      navigate("/recruitment");
    }
  };

  const loadNotes = async () => {
    try {
      const res = await api.get(`/candidates/${id}/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error("Không tải được ghi chú:", err);
      setNotes([]);
    }
  };

  const handleSave = async () => {
    // Nếu không chọn trạng thái mới và không nhập note → không làm gì
    if (!newStatus && !noteText.trim()) return;

    try {
      // Log token để kiểm tra
      const token = localStorage.getItem("token");
      console.log("Token đang dùng:", token);

      if (!token) {
        console.warn("Token không tồn tại, cần login lại!");
        window.location.href = "/login";
        return;
      }

      // Gọi API cập nhật trạng thái + ghi chú
      const res = await api.put(`/candidates/${id}/status`, {
        newStatus,
        note: noteText.trim(),
      });

      console.log("API response:", res.data);

      // Reset form
      setNewStatus("");
      setNoteText("");

      // Load lại chi tiết và ghi chú
      await loadDetail();
      await loadNotes();

      alert("Cập nhật thành công!");
    } catch (err) {
      // Log lỗi chi tiết
      console.error("Lỗi cập nhật:", err.response || err);

      if (err.response) {
        if (err.response.status === 401) {
          alert("Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng login lại.");
          window.location.href = "/login";
        } else if (err.response.status === 403) {
          alert("Bạn không có quyền thực hiện hành động này.");
        } else {
          alert(
            `Có lỗi xảy ra: ${err.response.status} - ${err.response.data.message}`
          );
        }
      } else {
        alert("Không thể kết nối tới server, vui lòng thử lại sau.");
      }
    }
  };

  if (!candidate) return <p className="p-4">Đang tải...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold mb-8">
        Chi tiết hồ sơ ứng viên #{candidate.MaHoSo || ""}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thông tin cá nhân */}
        <div className="bg-white shadow rounded-xl p-6 border">
          <h3 className="font-semibold text-xl mb-4">Thông tin cá nhân</h3>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="font-medium">Họ và tên</p>
              <input
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                value={candidate.HoTen || ""}
                disabled
              />
            </div>
            <div>
              <p className="font-medium">Email</p>
              <input
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                value={candidate.EmailNguoiDung || ""}
                disabled
              />
            </div>
            <div>
              <p className="font-medium">Số điện thoại</p>
              <input
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                value={candidate.SoDienThoai || ""}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Thông tin ứng tuyển */}
        <div className="bg-white shadow rounded-xl p-6 border">
          <h3 className="font-semibold text-xl mb-4">Thông tin ứng tuyển</h3>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="font-medium">Vị trí ứng tuyển</p>
              <input
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                value={candidate.ViTriUngTuyen || ""}
                disabled
              />
            </div>
            <div>
              <p className="font-medium">Ngày nộp</p>
              <input
                className="w-full mt-1 p-2 border rounded bg-gray-100"
                value={
                  candidate.NgayNop
                    ? dayjs(candidate.NgayNop).format("DD/MM/YYYY")
                    : ""
                }
                disabled
              />
            </div>
            <div>
              <p className="font-medium">Trạng thái</p>
              <span
                className={`inline-block mt-1 text-white px-3 py-1 rounded-full font-medium ${
                  statusColors[candidate.TrangThai] || "bg-gray-400"
                }`}
              >
                {statusMapping[candidate.TrangThai] ||
                  candidate.TrangThai ||
                  "Chưa có"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CV đính kèm */}
      <div className="bg-white shadow rounded-xl p-6 border mt-8">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
          <FiPaperclip /> CV đính kèm
        </h3>
        {candidate.DuongDanCV ? (
          <div className="bg-orange-50 p-4 rounded-xl border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText size={22} />
              <span className="font-medium">{candidate.DuongDanCV || ""}</span>
            </div>
            <div className="flex gap-3">
              <a
                href={`http://localhost:5000/uploads/${candidate.DuongDanCV}`}
                target="_blank"
                className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-2"
              >
                <FiEye /> Xem trước CV
              </a>
              <a
                href={`http://localhost:5000/uploads/${candidate.DuongDanCV}`}
                download
                className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-2"
              >
                <FiDownload /> Tải xuống CV
              </a>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Không có CV</p>
        )}
      </div>

      {/* Cập nhật trạng thái + ghi chú */}
      <div className="bg-white shadow rounded-xl p-6 border mt-8">
        <h3 className="font-semibold text-xl mb-4">Cập nhật trạng thái</h3>
        <div className="bg-cyan-50 p-4 rounded-xl border">
          <select
            className="border rounded-lg p-3 w-full bg-white"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="">-- Chọn trạng thái mới --</option>
            <option value="Moi">Mới</option>
            <option value="PhongVan">Phỏng vấn</option>
            <option value="DaTuyen">Đã tuyển</option>
            <option value="TuChoi">Từ chối</option>
          </select>
        </div>

        <h3 className="font-semibold text-xl mt-6 flex items-center gap-2">
          <FiFileText /> Ghi chú đánh giá
        </h3>
        <textarea
          className="border rounded-lg p-3 h-32 resize-none w-full mt-2"
          placeholder="Nhập ghi chú đánh giá về ứng viên..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />

        <div className="flex justify-end mt-4 gap-4">
          <button
            onClick={() => navigate("/recruitment")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            <FiArrowLeft className="inline-block mr-2" /> Quay lại
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Lịch sử ghi chú */}
      <div className="bg-white shadow rounded-xl p-6 border mt-8">
        <h3 className="font-semibold text-xl mb-4">Lịch sử ghi chú</h3>
        {notes.length === 0 ? (
          <p className="text-gray-500">Chưa có ghi chú</p>
        ) : (
          <div className="space-y-4">
            {notes.map((n, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-100 border">
                <p className="text-gray-500 text-sm mb-1">
                  {n.ThoiGian
                    ? dayjs(n.ThoiGian).format("DD/MM/YYYY HH:mm")
                    : ""}
                </p>
                <p className="text-gray-700">{n.NoiDung || ""}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetail;
//5

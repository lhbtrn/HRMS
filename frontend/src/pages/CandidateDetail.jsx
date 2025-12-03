import { useState, useEffect } from "react";
import api from "../services/api";

export default function CandidateDetail({ id, navigateBack }) {
  const [candidate, setCandidate] = useState(null);
  const [newStatus, setNewStatus] = useState("-- Chọn trạng thái mới --");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/candidates/${id}`)
      .then((res) => setCandidate(res.data))
      .catch((err) => alert(err.response?.data?.message || err.message));
  }, [id]);

  const handleSave = async () => {
    if (newStatus === "-- Chọn trạng thái mới --")
      return alert("Vui lòng chọn trạng thái mới");
    try {
      setLoading(true);
      const res = await api.put(`/candidates/${id}/status`, {
        newStatus,
        note,
      });
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!candidate)
    return <p className="text-center mt-10">Đang tải dữ liệu...</p>;

  const statusColor = (status) => {
    switch (status) {
      case "Mới":
        return "text-green-600";
      case "Phỏng vấn":
        return "text-blue-600";
      case "Đã tuyển":
        return "text-orange-600";
      case "Từ chối":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">
        Chi tiết hồ sơ ứng viên #{candidate.MaCandidate}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-2">Thông tin cá nhân</h2>
        <p>Họ và tên: {candidate.HoTen}</p>
        <p>Email: {candidate.EmailNguoiDung}</p>
        <p>Số điện thoại: {candidate.SoDienThoai || "-"}</p>
        <p>Vị trí ứng tuyển: {candidate.ViTri}</p>
        <p>Ngày nộp: {new Date(candidate.NgayNop).toLocaleDateString()}</p>
        <p>
          Trạng thái:{" "}
          <span className={`font-bold ${statusColor(candidate.TrangThai)}`}>
            {candidate.TrangThai}
          </span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-2">CV đính kèm</h2>
        <p>{candidate.CVFile}</p>
        <div className="flex gap-4 mt-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() =>
              window.open(`/uploads/${candidate.CVFile}`, "_blank")
            }
          >
            Xem trước CV
          </button>
          <a href={`/uploads/${candidate.CVFile}`} download>
            <button className="bg-green-600 text-white px-4 py-2 rounded">
              Tải xuống CV
            </button>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-2">Cập nhật trạng thái</h2>
        <div className="flex gap-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border rounded p-2"
          >
            <option>-- Chọn trạng thái mới --</option>
            <option>Mới</option>
            <option>Phỏng vấn</option>
            <option>Đã tuyển</option>
            <option>Từ chối</option>
          </select>
          <textarea
            placeholder="Nhập ghi chú..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="border rounded p-2 flex-1"
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            onClick={navigateBack}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Lịch sử ghi chú</h2>
        {candidate.notes?.length === 0 ? (
          <p>Chưa có ghi chú</p>
        ) : (
          candidate.notes.map((n, i) => (
            <div key={i} className="border-t pt-2 mt-2">
              <p className="font-medium">
                {n.UserName} ({n.UserRole}) -{" "}
                {new Date(n.NgayTao).toLocaleString()}
              </p>
              <p>{n.NoiDung}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

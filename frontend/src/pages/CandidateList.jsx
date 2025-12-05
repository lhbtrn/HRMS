// src/pages/CandidateList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get("/candidates");
        setCandidates(res.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách ứng viên:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách ứng viên</h1>

      <table className="min-w-full divide-y divide-gray-200 bg-white rounded shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2">Mã hồ sơ</th>
            <th className="px-4 py-2">Họ tên</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">SĐT</th>
            <th className="px-4 py-2">Ngày nộp</th>
            <th className="px-4 py-2">Trạng thái</th>
            <th className="px-4 py-2">Chi tiết</th>
          </tr>
        </thead>

        <tbody>
          {candidates.map((c) => (
            <tr key={c.MaCandidate}>
              <td className="px-4 py-2">{c.MaCandidate}</td>
              <td className="px-4 py-2">{c.HoTen}</td>
              <td className="px-4 py-2">{c.EmailNguoiDung}</td>
              <td className="px-4 py-2">{c.SoDienThoai}</td>
              <td className="px-4 py-2">
                {new Date(c.NgayNop).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{c.TrangThai}</td>

              <td className="px-4 py-2">
                <button
                  onClick={() =>
                    navigate(`/recruitment/detail/${c.MaCandidate}`)
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateList;

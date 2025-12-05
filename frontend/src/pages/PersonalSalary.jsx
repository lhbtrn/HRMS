import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const PersonalSalary = () => {
  const { token } = useAuth();
  const [date, setDate] = useState("");
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));
  const employeeId = userData?.maNhanVien;

  const handleFetchSalary = async () => {
    if (!date) return alert("Vui lòng chọn tháng!");
    const [year, month] = date.split("-");

    try {
      setLoading(true);
      const res = await api.get(`/salary/by-employee`, {
        params: { month, year, employeeId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setSalary(res.data?.data || null);
    } catch (err) {
      alert("Không thể kết nối server!");
      setSalary(null);
    } finally {
      setLoading(false);
    }
  };

  const totalSalary =
    (Number(salary?.LuongCoBan) || 0) +
    (Number(salary?.Thuong) || 0) -
    (Number(salary?.Phat) || 0);

  const salaryItems = [
    { label: "Lương cơ bản", value: Number(salary?.LuongCoBan) || 0 },
    { label: "Khấu trừ", value: Number(salary?.KhauTru) || 0 },
    { label: "Thưởng", value: Number(salary?.Thuong) || 0 },
    { label: "Phạt", value: Number(salary?.Phat) || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Bảng lương cá nhân
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Xem chi tiết thu nhập theo từng tháng
        </p>
      </div>

      {/* Filter Section */}
      <div className="w-full max-w-4xl bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8 flex items-end gap-6">
        <div className="flex flex-col w-56">
          <label className="text-gray-700 font-medium mb-1 text-sm">
            Chọn tháng
          </label>
          <input
            type="month"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 h-10"
          />
        </div>

        <button
          onClick={handleFetchSalary}
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg text-sm shadow hover:bg-blue-700 h-10 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang tải..." : "Xem lương"}
        </button>
      </div>

      {/* Salary Cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {salaryItems.map((item) => (
          <div
            key={item.label}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
          >
            <p className="font-medium text-gray-600 text-sm">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {item.value.toLocaleString()} đ
            </p>
          </div>
        ))}
      </div>

      {/* Total Salary */}
      <div className="w-full max-w-4xl">
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
          <p className="text-gray-600 font-medium text-sm">Tổng thu nhập</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {totalSalary.toLocaleString()} đ
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalSalary;

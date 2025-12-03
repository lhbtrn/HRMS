import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const PersonalSalary = () => {
  const { token } = useAuth();
  const [date, setDate] = useState("");
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchSalary = async () => {
    if (!date) return alert("Vui lòng chọn tháng!");
    const [year, month] = date.split("-");

    try {
      setLoading(true);
      const res = await api.get(`/salary/by-employee`, {
        params: { month, year },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.data) {
        setSalary(res.data.data);
      } else {
        alert(res.data?.message || "Không có dữ liệu!");
        setSalary(null);
      }
    } catch (err) {
      console.error("Lỗi fetch lương cá nhân:", err);
      alert("Không thể kết nối server!");
      setSalary(null);
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng thu nhập trực tiếp
  const totalSalary =
    (Number(salary?.LuongCoBan) || 0) +
    (Number(salary?.Thuong) || 0) -
    ((Number(salary?.KhauTru) || 0) + (Number(salary?.Phat) || 0));

  const salaryItems = [
    { label: "Lương cơ bản", value: Number(salary?.LuongCoBan) || 0 },
    { label: "Khấu trừ", value: Number(salary?.KhauTru) || 0 },
    { label: "Thưởng", value: Number(salary?.Thuong) || 0 },
    { label: "Phạt", value: Number(salary?.Phat) || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {" "}
      <div className="mb-8">
        {" "}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Xem bảng lương cá nhân
        </h1>{" "}
        <p className="text-gray-600">
          Xem thông tin lương cá nhân của bạn theo từng tháng
        </p>{" "}
      </div>
      <div className="card mb-8 p-6 bg-white rounded-lg shadow">
        {/* SELECT MONTH */}
        <div className="flex items-end gap-3 mb-10">
          <div className="flex flex-col w-48">
            <label className="text-gray-700 font-medium mb-1">Tháng</label>
            <input
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 h-10 w-64"
            />
          </div>

          <button
            onClick={handleFetchSalary}
            disabled={loading}
            className={`bg-blue-600 text-white px-4 rounded-lg shadow hover:bg-blue-700 h-10 flex items-center text-sm ml-20 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang tải..." : "Xác nhận"}
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {salaryItems.map((item) => (
            <div
              key={item.label}
              className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-200"
            >
              <p className="font-medium text-gray-700">{item.label}</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {item.value != null ? item.value.toLocaleString() : "--"} đ
              </p>
            </div>
          ))}
        </div>

        {/* TOTAL INCOME */}
        <div className="flex justify-end">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-md w-72">
            <p className="font-medium text-gray-700">Tổng thu nhập</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {totalSalary.toLocaleString()} đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSalary;

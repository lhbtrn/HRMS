import { useState, useEffect } from "react";
import api from "../services/api";

const SalaryCalculator = ({ userRole = "Admin", userPhongBanId = null }) => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [luongCoBan, setLuongCoBan] = useState(0);
  const [thuong, setThuong] = useState(0);
  const [phat, setPhat] = useState(0);
  const [khauTru, setKhauTru] = useState(0);
  const [tongLuong, setTongLuong] = useState(0);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ---------- Fetch Thưởng/Phạt ----------
  const fetchRewardPenalty = async (empId) => {
    try {
      const res = await api.get("/salary/reward-penalty", {
        headers: { Authorization: `Bearer ${token}` },
        params: { employeeId: empId, month, year },
      });
      return res.data?.data || { Thuong: 0, Phat: 0 };
    } catch (err) {
      console.error("Lỗi lấy thưởng/phạt:", err);
      return { Thuong: 0, Phat: 0 };
    }
  };

  // ---------- Fetch Phòng ban ----------
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/salary/data/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy phòng ban:", err);
    }
  };

  // ---------- Fetch Nhân viên ----------
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/salary/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy nhân viên:", err);
    }
  };

  // ---------- Fetch Lương theo nhân viên ----------
  const fetchSalaryByEmployee = async (empId) => {
    try {
      const res = await api.get("/salary/by-employee", {
        headers: { Authorization: `Bearer ${token}` },
        params: { employeeId: empId, month, year },
      });
      return res.data?.data || null;
    } catch (err) {
      console.error("Không tìm thấy bảng lương:", err);
      return null;
    }
  };

  // ---------- Load lần đầu ----------
  useEffect(() => {
    const loadData = async () => {
      await fetchDepartments();
      await fetchEmployees();
      setLoading(false);
    };
    loadData();
  }, []);

  // ---------- Khi chọn nhân viên ----------
  useEffect(() => {
    if (!selectedEmployee) {
      setLuongCoBan(0);
      setThuong(0);
      setPhat(0);
      setKhauTru(0);
      setTongLuong(0);
      setSelectedDept("");
      return;
    }

    const loadSalary = async () => {
      const salary = await fetchSalaryByEmployee(selectedEmployee);
      const rewardPenalty = await fetchRewardPenalty(selectedEmployee);

      const emp = employees.find(
        (e) => Number(e.MaNhanVien) === Number(selectedEmployee)
      );

      setSelectedDept(emp?.PhongBanID || "");

      // Lương cơ bản: ưu tiên bảng Lương → nếu chưa có thì lấy từ nhân viên
      const baseSalary = Number(salary?.LuongCoBan ?? emp?.LuongCoBan ?? 0);
      setLuongCoBan(baseSalary);

      // Thưởng / Phạt lấy từ DB
      setThuong(Number(rewardPenalty.Thuong ?? 0));
      setPhat(Number(rewardPenalty.Phat ?? 0));

      // Khấu trừ = Lương cơ bản - Phạt (Phương án B)
      const calculatedKhauTru = baseSalary - (rewardPenalty.Phat ?? 0);
      setKhauTru(calculatedKhauTru >= 0 ? calculatedKhauTru : 0);
    };

    loadSalary();
  }, [selectedEmployee, month, year, employees]);

  // ---------- Tính tổng lương ----------
  useEffect(() => {
    const total = Number(luongCoBan) + Number(thuong) - Number(phat);
    setTongLuong(total >= 0 ? total : 0);
  }, [luongCoBan, thuong, phat]);

  // ---------- Lưu bảng lương ----------
  const handleSave = async () => {
    if (!selectedEmployee) return alert("Vui lòng chọn nhân viên");

    const payload = {
      NhanVienID: selectedEmployee,
      LuongCoBan: Number(luongCoBan),
      Thuong: Number(thuong),
      Phat: Number(phat),
      KhauTru: Number(khauTru),
      Thang: month,
      Nam: year,
    };

    try {
      await api.post("/salary/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Lưu bảng lương thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lưu thất bại");
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  // Manager chỉ xem nhân viên phòng mình
  const visibleEmployees =
    userRole === "Manager" && userPhongBanId
      ? employees.filter((e) => e.PhongBanID == userPhongBanId)
      : employees;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Tính lương nhân viên</h1>

      {/* Chọn tháng / năm */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm text-gray-600">Tháng:</label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value) || 1)}
            className="border px-3 py-2 rounded-md bg-gray-50"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Năm:</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) =>
              setYear(Number(e.target.value) || new Date().getFullYear())
            }
            className="border px-3 py-2 rounded-md bg-gray-50"
          />
        </div>
      </div>

      {/* Chọn nhân viên */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin nhân viên</h2>

        <label className="text-sm text-gray-600 mb-1">Nhân viên</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-gray-50 mb-4"
        >
          <option value="">-- Chọn nhân viên --</option>
          {visibleEmployees.map((emp) => (
            <option key={emp.MaNhanVien} value={emp.MaNhanVien}>
              {emp.HoTen} — {emp.TenPhongBan}
            </option>
          ))}
        </select>

        {/* Form nhập lương */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Lương cơ bản</label>
            <input
              type="number"
              value={luongCoBan}
              onChange={(e) => setLuongCoBan(Number(e.target.value))}
              className="border px-3 py-2 rounded-md bg-gray-50"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Thưởng</label>
            <input
              type="number"
              value={thuong}
              readOnly
              className="border px-3 py-2 rounded-md bg-gray-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Phạt</label>
            <input
              type="number"
              value={phat}
              readOnly
              className="border px-3 py-2 rounded-md bg-gray-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Khấu trừ</label>
            <input
              type="number"
              value={khauTru}
              readOnly
              className="border px-3 py-2 rounded-md bg-gray-200"
            />
          </div>
        </div>

        <div className="mt-4 text-lg font-semibold">
          Tổng thu nhập:{" "}
          <span className="text-green-600">
            {tongLuong.toLocaleString()} VNĐ
          </span>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
          >
            Lưu bảng lương
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;

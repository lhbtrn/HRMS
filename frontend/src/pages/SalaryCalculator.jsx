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

  const fetchRewardPenalty = async (empId) => {
    try {
      const res = await api.get("/salary/reward-penalty", {
        headers: { Authorization: `Bearer ${token}` },
        params: { employeeId: empId, month, year },
      });
      return res.data?.data || { Thuong: 0, Phat: 0 };
    } catch {
      return { Thuong: 0, Phat: 0 };
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/salary/data/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data || []);
    } catch {}
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/salary/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let emps = res.data || [];
      if (userRole === "Manager" && userPhongBanId) {
        emps = emps.filter((emp) => emp.PhongBanID == userPhongBanId);
      }
      setEmployees(emps);
    } catch {}
  };

  const fetchSalaryByEmployee = async (empId) => {
    try {
      const res = await api.get("/salary/by-employee", {
        headers: { Authorization: `Bearer ${token}` },
        params: { employeeId: empId, month, year },
      });
      return res.data?.data || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchDepartments();
      await fetchEmployees();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      setLuongCoBan(0);
      setThuong(0);
      setPhat(0);
      setKhauTru(0);
      setTongLuong(0);
      return;
    }

    const loadSalary = async () => {
      const salary = await fetchSalaryByEmployee(selectedEmployee);
      const rewardPenalty = await fetchRewardPenalty(selectedEmployee);

      const emp = employees.find(
        (e) => Number(e.MaNhanVien) === Number(selectedEmployee)
      );
      setSelectedDept(emp?.PhongBanID || "");

      const baseSalary = Number(salary?.LuongCoBan ?? emp?.LuongCoBan ?? 0);
      setLuongCoBan(baseSalary);

      setThuong(Number(rewardPenalty.Thuong));
      setPhat(Number(rewardPenalty.Phat));
      setKhauTru(baseSalary * 0.105);
    };

    loadSalary();
  }, [selectedEmployee, month, year, employees]);

  useEffect(() => {
    const total = Number(luongCoBan) + Number(thuong) - Number(phat);
    setTongLuong(total >= 0 ? total : 0);
  }, [luongCoBan, thuong, phat]);

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
      alert(err.response?.data?.message || "Lưu thất bại!");
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#eef2ff] to-[#f8fafc]">
      <h1 className="text-4xl font-black mb-8 text-slate-700">
        Tính lương nhân viên
      </h1>

      {/* Chọn tháng/năm */}
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">Tháng</label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white shadow border"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">Năm</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white shadow border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card chọn nhân viên */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            👤 Nhân viên
          </h2>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border shadow"
          >
            <option value="">-- Chọn nhân viên --</option>
            {employees.map((emp) => (
              <option key={emp.MaNhanVien} value={emp.MaNhanVien}>
                {emp.HoTen} — {emp.TenPhongBan}
              </option>
            ))}
          </select>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="Lương cơ bản" value={luongCoBan} />
            <Card title="Thưởng" value={thuong} />
            <Card title="Phạt" value={phat} />
            <Card title="Khấu trừ" value={khauTru} />
          </div>
        </div>

        {/* Card tổng lương */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-6 text-slate-700">
              Tổng thu nhập
            </h2>

            <div className="text-5xl font-bold text-green-600">
              {tongLuong.toLocaleString()} VNĐ
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-8 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg hover:scale-[1.02] transition"
          >
            Lưu bảng lương
          </button>
        </div>
      </div>
    </div>
  );
};

/* Component nhỏ để làm UI đẹp */
const Card = ({ title, value }) => (
  <div className="p-4 bg-gray-50 rounded-xl border shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-lg font-semibold text-slate-700">
      {Number(value).toLocaleString()} VNĐ
    </p>
  </div>
);

export default SalaryCalculator;

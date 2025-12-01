import { useState, useEffect } from "react";
import api from "../services/api";

const SalaryCalculator = () => {
  const [departments, setDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [luongCoBan, setLuongCoBan] = useState(0);
  const [thuong, setThuong] = useState(0);
  const [baoHiem, setBaoHiem] = useState(0);
  const [khauTru, setKhauTru] = useState(0);
  const [phat, setPhat] = useState(0);
  const [thue, setThue] = useState(0);
  const [tongLuong, setTongLuong] = useState(0);

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem("token");

  // ---------------- FETCH DỮ LIỆU ----------------
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

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/salary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const emps = (res.data.data || res.data).map((e) => ({
        id: e.MaNhanVien,
        hoTen: e.HoTen,
        departmentId: e.PhongBanID,
        departmentName: e.TenPhongBan,
        luongCoBan: e.LuongCoBan ?? 0,
        thuong: e.Thuong ?? 0,
        baoHiem: e.BaoHiem ?? 0,
        khauTru: e.KhauTru ?? 0,
        phat: e.Phat ?? 0,
        thue: e.Thue ?? 0,
      }));
      setAllEmployees(emps);
    } catch (err) {
      console.error("Lỗi lấy nhân viên:", err);
    }
  };

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (selectedDept) params.phongBan = selectedDept;

      const response = await api.get("/salary", { params });
      setSalaries(response.data); // giống setEmployees
    } catch (error) {
      console.error("Error fetching salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryByEmployee = async (empId) => {
    try {
      const res = await api.get("/salary/by-employee", {
        headers: { Authorization: `Bearer ${token}` },
        params: { employeeId: empId, month, year },
      });
      return res.data;
    } catch (err) {
      console.error("Không tìm thấy bảng lương tháng này:", err);
      return null;
    }
  };

  // ---------------- MOUNT LẦN ĐẦU ----------------
  useEffect(() => {
    const loadData = async () => {
      await fetchDepartments();
      await fetchEmployees();
      await fetchSalaries();
    };
    loadData();
  }, []);

  // ---------------- LẤY BẢNG LƯƠNG NHÂN VIÊN ----------------
  useEffect(() => {
    if (!selectedEmployee) {
      setLuongCoBan(0);
      setThuong(0);
      setBaoHiem(0);
      setKhauTru(0);
      setPhat(0);
      setThue(0);
      setSelectedDept("");
      return;
    }

    const emp = allEmployees.find(
      (e) => Number(e.id) === Number(selectedEmployee)
    );
    if (emp) setSelectedDept(emp.departmentId);

    const loadSalary = async () => {
      const salary = await fetchSalaryByEmployee(selectedEmployee);
      setLuongCoBan(salary?.LuongCoBan ?? emp?.luongCoBan ?? 0);
      setThuong(salary?.Thuong ?? emp?.thuong ?? 0);
      setBaoHiem(salary?.BaoHiem ?? emp?.baoHiem ?? 0);
      setKhauTru(salary?.KhauTru ?? emp?.khauTru ?? 0);
      setPhat(salary?.Phat ?? emp?.phat ?? 0);
      setThue(salary?.Thue ?? emp?.thue ?? 0);
    };
    loadSalary();
  }, [selectedEmployee, allEmployees, month, year]);

  // ---------------- TÍNH TỔNG LƯƠNG ----------------
  useEffect(() => {
    const total =
      Number(luongCoBan) +
      Number(thuong) -
      (Number(baoHiem) + Number(khauTru) + Number(phat) + Number(thue));
    setTongLuong(total >= 0 ? total : 0);
  }, [luongCoBan, thuong, baoHiem, khauTru, phat, thue]);

  // ---------------- LƯU BẢNG LƯƠNG ----------------
  const handleSave = async () => {
    if (!selectedEmployee) return alert("Vui lòng chọn nhân viên");

    const payload = {
      NhanVienID: selectedEmployee,
      LuongCoBan: Number(luongCoBan),
      Thuong: Number(thuong),
      Phat: Number(phat),
      KhauTru: Number(khauTru),
      BaoHiem: Number(baoHiem),
      Thue: Number(thue),
      Thang: month,
      Nam: year,
    };

    try {
      const res = await api.post("/salary/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Lưu bảng lương thành công!`);

      // Reset form
      setSelectedEmployee("");
      setSelectedDept("");
      setLuongCoBan(0);
      setThuong(0);
      setBaoHiem(0);
      setKhauTru(0);
      setPhat(0);
      setThue(0);
      setTongLuong(0);

      // Load lại danh sách giống EmployeeList
      fetchSalaries();
    } catch (err) {
      alert(err.response?.data?.message || "Lưu thất bại");
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {" "}
      <h1 className="text-3xl font-bold mb-6">Tính lương nhân viên</h1>
      {/* Chọn tháng/năm */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Tháng:</label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value) || 1)}
            className="border px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Năm:</label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) =>
              setYear(Number(e.target.value) || new Date().getFullYear())
            }
            className="border px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      {/* Form thông tin nhân viên */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin nhân viên</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 font-medium">
              Nhân viên
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Chọn nhân viên --</option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.hoTen} - {emp.departmentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chi tiết lương */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Lương cơ bản", value: luongCoBan, setter: setLuongCoBan },
            { label: "Thưởng", value: thuong, setter: setThuong },
            { label: "Bảo hiểm", value: baoHiem, setter: setBaoHiem },
            { label: "Khấu trừ", value: khauTru, setter: setKhauTru },
            { label: "Phạt", value: phat, setter: setPhat },
            { label: "Thuế", value: thue, setter: setThue },
          ].map((item, i) => (
            <div key={i} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1 font-medium">
                {item.label}
              </label>
              <input
                type="number"
                value={item.value ?? 0}
                onChange={(e) => item.setter(Number(e.target.value) || 0)}
                className="border px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 text-lg font-semibold">
          Tổng lương:{" "}
          <span className="text-green-600">
            {tongLuong.toLocaleString()} VNĐ
          </span>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 text-base rounded-lg shadow hover:bg-blue-700 transition"
          >
            Lưu bảng lương
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;

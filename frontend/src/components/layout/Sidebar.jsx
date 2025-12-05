import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  Shield,
  LogOut,
  //
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
//
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  //
  const [openSalary, setOpenSalary] = useState(true);

  const menuItems = [
    {
      path: "/dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
      roles: ["Admin"],
    },
    {
      path: "/employees",
      label: "Nhân viên",
      icon: Users,
      roles: ["Admin", "Manager"],
    },
    {
      path: "/attendance",
      label: "Chấm công",
      icon: Clock,
      roles: ["Admin", "Manager", "Employee"],
    },
    {
      path: "/leave",
      label: "Nghỉ phép",
      icon: Calendar,
      roles: ["Admin", "Manager", "Employee"],
    },
    {
      path: "/salary",
      label: "Lương",
      icon: DollarSign,
      roles: ["Admin", "Manager", "Employee"],
      children: [
        {
          path: "/salary/calculator",
          label: "Tính lương",
          roles: ["Admin", "Manager"],
        },
        {
          path: "/salary/personal",
          label: "Lương cá nhân",
          roles: ["Employee", "Manager"],
        },
      ],
    },
    {
      path: "/recruitment",
      label: "Tuyển dụng",
      icon: Briefcase,
      roles: ["Admin"],
      children: [
        {
          path: "/recruitment", // Danh sách ứng viên
          label: "Danh sách ứng viên",
          roles: ["Admin"],
        },
      ],
    },
    {
      path: "/reports",
      label: "Báo cáo",
      icon: FileText,
      roles: ["Admin", "Manager"],
    },
    {
      path: "/permissions",
      label: "Phân quyền",
      icon: Shield,
      roles: ["Admin"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.vaiTro)
  );

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
    }
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl z-50 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold tracking-wider">HRMS</h1>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-blue-700">
        <Link
          to="/profile"
          className="flex items-center space-x-3 hover:bg-blue-700/30 p-2 rounded-lg transition-colors"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-blue-200">Xin chào,</p>
            <p className="font-semibold truncate">
              {user?.hoTen || user?.username}
            </p>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      {/*<nav className="flex-1 py-6 overflow-y-auto">
                {filteredMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                                isActive
                                    ? 'bg-blue-700 border-l-4 border-white'
                                    : 'hover:bg-blue-700/50'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>*/}
      <nav className="flex-1 py-6 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            // Kiểm tra quyền cho ít nhất 1 mục con
            const accessibleChildren = item.children.filter((child) =>
              child.roles
                .map((r) => r.toLowerCase())
                .includes(user?.vaiTro?.toLowerCase())
            );

            if (accessibleChildren.length === 0) return null;

            return (
              <div key={item.label}>
                {/* Mục cha */}
                <button
                  onClick={() => setOpenSalary(!openSalary)}
                  className="flex items-center w-full space-x-3 px-6 py-3 hover:bg-blue-700/50 transition-colors"
                >
                  <Icon size={20} />
                  <span className="font-medium flex-1">{item.label}</span>
                  {openSalary ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>

                {/* Mục con */}
                {openSalary && (
                  <div className="ml-10 mt-1 space-y-1">
                    {accessibleChildren.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-4 py-2 rounded-lg transition-colors ${
                          location.pathname === child.path
                            ? "bg-blue-700 border-l-4 border-white"
                            : "hover:bg-blue-700/40"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Mục bình thường
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                isActive
                  ? "bg-blue-700 border-l-4 border-white"
                  : "hover:bg-blue-700/50"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

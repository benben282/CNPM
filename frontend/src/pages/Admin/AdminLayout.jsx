import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Admin.css';
import {
  FiHome, FiBox, FiShoppingBag, FiUsers, FiLogOut,
  FiMenu, FiX, FiTag, FiGrid
} from 'react-icons/fi';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Kiểm tra quyền truy cập admin khi load trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      alert('Từ chối truy cập! Bắt buộc phải là Admin.');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Danh sách menu sidebar — thêm 2 mục Danh mục & Khuyến mãi
  const navLinks = [
    { to: '/admin', label: 'Tổng quan', icon: <FiHome />, end: true },
    { to: '/admin/products', label: 'Sản phẩm', icon: <FiBox /> },
    { to: '/admin/categories', label: 'Danh mục', icon: <FiGrid /> },
    { to: '/admin/orders', label: 'Đơn hàng', icon: <FiShoppingBag /> },
    { to: '/admin/users', label: 'Khách hàng', icon: <FiUsers /> },
    { to: '/admin/vouchers', label: 'Khuyến mãi', icon: <FiTag /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex admin-root">
      {/* ============ Sidebar ============ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-black text-orange-500 tracking-tight">PETSHOP ADMIN</span>
            </div>
            <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all duration-200 ${isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                  }`
                }
                style={{ fontSize: '20px' }}
              >
                <span>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold"
              style={{ fontSize: '20px' }}
            >
              <FiLogOut /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ============ Main Content ============ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            className="md:hidden p-2 -ml-2 text-gray-500 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              AD
            </div>
            <span className="hidden sm:block font-semibold text-gray-700 text-base">Administrator</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1 overflow-auto">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

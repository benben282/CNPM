import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaMapMarkerAlt, FaBoxOpen, FaTicketAlt, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';

import ProfileInfo from '../components/profile/ProfileInfo';
import AddressBook from '../components/profile/AddressBook';
import OrderHistory from '../components/profile/OrderHistory';
import WalletCoupons from '../components/profile/WalletCoupons';
import SecuritySettings from '../components/profile/SecuritySettings';

export default function Profile() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!loading && !user) navigate('/');
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [user, loading, navigate, location]);

  if (loading || !user) return <div className="text-center py-20 font-bold text-gray-500">Đang tải dữ liệu...</div>;

  const tabs = [
    { id: 'info', label: 'Hồ sơ của tôi', icon: <FaUser /> },
    { id: 'address', label: 'Sổ địa chỉ', icon: <FaMapMarkerAlt /> },
    { id: 'orders', label: 'Đơn hàng mua', icon: <FaBoxOpen /> },
    { id: 'wallet', label: 'Ví Voucher', icon: <FaTicketAlt /> },
    { id: 'security', label: 'Bảo mật tài khoản', icon: <FaShieldAlt /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'info': return <ProfileInfo user={user} />;
      case 'address': return <AddressBook />;
      case 'orders': return <OrderHistory />;
      case 'wallet': return <WalletCoupons />;
      case 'security': return <SecuritySettings />;
      default: return <ProfileInfo user={user} />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page-bg">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-header">
            <img 
              src={user.avatar || 'https://placehold.co/100x100/FFB347/fff?text=' + (user.fullName?.[0] || user.username?.[0] || 'U').toUpperCase()} 
              alt="Avatar" 
              className="w-14 h-14 rounded-full object-cover border-2 border-orange-100 shadow-sm" 
            />
            <div>
              <div className="font-bold text-gray-800 text-lg">{user.fullName || user.username || 'Khách hàng'}</div>
              <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-1">Thành viên PetShop</div>
            </div>
          </div>
          <nav className="profile-nav-menu">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`profile-nav-item ${
                  activeTab === tab.id ? 'profile-nav-item-active' : 'profile-nav-item-inactive'
                }`}
              >
                <span className={`text-lg transition-colors ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'}`}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <div className="h-px bg-gray-100 my-2"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left text-red-500 hover:bg-red-50"
            >
              <span className="text-lg"><FaSignOutAlt /></span>
              Đăng xuất
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="profile-content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

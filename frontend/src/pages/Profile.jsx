import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaBoxOpen, FaTicketAlt, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { Avatar, Skeleton } from '../components/profile/ProfileUI';
import '../components/profile/ProfileVip.css';

import ProfileInfo from '../components/profile/ProfileInfo';
import AddressBook from '../components/profile/AddressBook';
import OrderHistory from '../components/profile/OrderHistory';
import WalletCoupons from '../components/profile/WalletCoupons';
import SecuritySettings from '../components/profile/SecuritySettings';

/* Thêm tab mới: chỉ cần thêm 1 dòng vào đây */
const TABS = [
  { id: 'info',     label: 'Hồ sơ của tôi',     icon: <FaUser />,         Component: ProfileInfo },
  { id: 'address',  label: 'Sổ địa chỉ',        icon: <FaMapMarkerAlt />, Component: AddressBook },
  { id: 'orders',   label: 'Đơn hàng của tôi',  icon: <FaBoxOpen />,      Component: OrderHistory },
  { id: 'wallet',   label: 'Ví voucher',        icon: <FaTicketAlt />,    Component: WalletCoupons },
  { id: 'security', label: 'Bảo mật tài khoản', icon: <FaShieldAlt />,    Component: SecuritySettings },
];

export default function Profile() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab hiện tại lấy từ địa chỉ (?tab=orders), nên tải lại trang vẫn giữ nguyên tab
  const requested = searchParams.get('tab') || location.state?.tab;
  const active = TABS.find(t => t.id === requested) || TABS[0];

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="pv-page">
        <div className="pv-layout">
          <Skeleton height={380} />
          <Skeleton height={380} />
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.username || user.email || 'Khách hàng';
  const ActiveTab = active.Component;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pv-page">
      <div className="pv-layout">
        {/* ===== Menu bên trái ===== */}
        <aside className="pv-side pv-card">
          <div className="pv-side-head">
            <Avatar src={user.avatar} name={displayName} size={56} />
            <div>
              <div className="pv-side-name">{displayName}</div>
              <div className="pv-side-mail">{user.email}</div>
            </div>
          </div>

          <nav className="pv-nav" aria-label="Menu tài khoản">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`pv-nav-item${active.id === tab.id ? ' on' : ''}`}
                aria-current={active.id === tab.id ? 'page' : undefined}
                onClick={() => setSearchParams({ tab: tab.id })}
              >
                <span className="pv-nav-ic">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="pv-nav-sep" />

            <button type="button" className="pv-nav-item danger" onClick={handleLogout}>
              <span className="pv-nav-ic"><FaSignOutAlt /></span>
              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* ===== Nội dung tab ===== */}
        <main className="pv-content">
          <ActiveTab />
        </main>
      </div>
    </div>
  );
}
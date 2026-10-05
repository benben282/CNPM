import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserOrders } from '../services/api';
import OrderTab from '../components/MyOrders/OrderTab';
import OrderCard from '../components/MyOrders/OrderCard';
import { FaUserCircle, FaShoppingBag, FaMapMarkerAlt, FaSignOutAlt, FaBoxOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getUserOrders(user.id);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab);

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <FaBoxOpen size={80} style={{ color: '#d1d5db' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>Bạn cần đăng nhập</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: 8 }}>Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>

          {/* Left Sidebar */}
          <aside style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', padding: 28 }}>
              {/* User Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(251,146,60,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', flexShrink: 0
                }}>
                  {user.fullName.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { icon: <FaUserCircle />, label: 'Thông tin tài khoản', href: '#' },
                  { icon: <FaShoppingBag />, label: 'Đơn hàng của tôi', href: '/my-orders', active: true },
                  { icon: <FaMapMarkerAlt />, label: 'Sổ địa chỉ', href: '#' },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px', borderRadius: 12, textDecoration: 'none',
                      fontSize: '0.95rem', fontWeight: item.active ? 700 : 500,
                      color: item.active ? 'var(--primary)' : 'var(--text-muted)',
                      background: item.active ? 'rgba(251,146,60,0.08)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    {item.label}
                  </a>
                ))}

                <div style={{ height: 1, background: '#f3f4f6', margin: '12px 0' }} />

                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 12,
                    fontSize: '0.95rem', fontWeight: 500,
                    color: '#ef4444', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                  }}
                >
                  <FaSignOutAlt style={{ fontSize: '1.1rem' }} /> Đăng xuất
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Orders */}
          <main>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: 24 }}>
              Đơn hàng của tôi
            </h1>

            <OrderTab activeTab={activeTab} onTabChange={setActiveTab} />

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-box" style={{ height: 180, borderRadius: 20 }} />
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} onOrderUpdated={fetchOrders} />
                ))}
              </div>
            ) : (
              <div style={{
                background: '#fff', borderRadius: 20, padding: '60px 24px',
                textAlign: 'center', border: '1px solid #f3f4f6',
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: 80, height: 80, background: '#f9fafb', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <FaBoxOpen size={40} style={{ color: '#d1d5db' }} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                  Chưa có đơn hàng nào
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                  Có vẻ như bạn chưa đặt mua sản phẩm nào từ PetShop.
                </p>
                <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>
                  Mua sắm ngay
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

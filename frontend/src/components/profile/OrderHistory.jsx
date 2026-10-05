import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUserOrders } from '../../services/api';
import OrderTab from '../MyOrders/OrderTab';
import OrderCard from '../MyOrders/OrderCard';
import { FaBoxOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function OrderHistory() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) fetchOrders();
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

  return (
    <div className="profile-tab-card">
      <h2 className="profile-tab-title">Đơn hàng của tôi</h2>
      
      <div className="mb-6 -mx-2">
        <OrderTab activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-box" style={{ height: 180, borderRadius: 20, background: '#f3f4f6' }} />
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
          textAlign: 'center', border: '1px dashed #e5e7eb'
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
            Có vẻ như bạn chưa đặt mua sản phẩm nào từ danh mục này.
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
}

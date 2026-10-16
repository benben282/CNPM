import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { getUserOrders } from '../../services/api';
import OrderCard from '../MyOrders/OrderCard';
import { PageHeader, PillTabs, EmptyState, Skeleton } from './ProfileUI';
import './ProfileVip.css';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'AwaitingPayment', label: 'Chờ thanh toán' },
  { id: 'Pending', label: 'Chờ xác nhận' },
  { id: 'Shipping', label: 'Đang giao' },
  { id: 'Delivered', label: 'Đã giao' },
  { id: 'Canceled', label: 'Đã hủy' },
];

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

  // Mỗi nút lọc kèm số đơn. "Chờ thanh toán" chỉ hiện khi đang có đơn như vậy
  const tabs = useMemo(
    () => FILTERS
      .map(f => ({
        ...f,
        count: f.id === 'all' ? orders.length : orders.filter(o => o.status === f.id).length
      }))
      .filter(f => f.id !== 'AwaitingPayment' || f.count > 0),
    [orders]
  );

  const current = tabs.some(t => t.id === activeTab) ? activeTab : 'all';
  const filteredOrders = current === 'all' ? orders : orders.filter(o => o.status === current);

  return (
    <div className="pv-wrap">
      <PageHeader
        icon={<FaBoxOpen />}
        title="Đơn hàng của tôi"
        subtitle="Theo dõi và quản lý các đơn bạn đã đặt"
      />

      <PillTabs tabs={tabs} active={current} onChange={setActiveTab} />

      {loading ? (
        <>
          <Skeleton height={190} />
          <Skeleton height={190} />
        </>
      ) : filteredOrders.length > 0 ? (
        <div className="pv-order-list">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} onOrderUpdated={fetchOrders} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FaBoxOpen />}
          title={current === 'all' ? 'Chưa có đơn hàng nào' : 'Không có đơn hàng ở trạng thái này'}
          text={current === 'all'
            ? 'Có vẻ như bạn chưa đặt mua sản phẩm nào từ PetShop.'
            : 'Thử chọn trạng thái khác để xem các đơn còn lại.'}
          action={current === 'all' && <Link to="/" className="pv-btn pv-btn-solid">Mua sắm ngay</Link>}
        />
      )}
    </div>
  );
}
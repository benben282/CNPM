import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTruck, FaClipboardCheck, FaTimesCircle } from 'react-icons/fa';
import OrderStatusBadge from './OrderStatusBadge';
import OrderStepper from './OrderStepper';
import { Button } from '../profile/ProfileUI';
import { cancelOrder } from '../../services/api';
import { useToast } from '../../hooks/useToast';

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const PLACEHOLDER = 'https://placehold.co/72x72?text=?';

export default function OrderCard({ order, onOrderUpdated }) {
  const showToast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const items = order.items || [];

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    setCanceling(true);
    try {
      await cancelOrder(order.id);
      showToast('Thành công', 'Đã hủy đơn hàng', 'success');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      showToast('Lỗi', err.response?.data?.message || 'Không thể hủy đơn hàng', 'error');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <article className="pv-order">
      {/* Đầu thẻ */}
      <div className="pv-order-head">
        <div>
          <div className="pv-order-code">Mã đơn: <b>{order.orderNumber}</b></div>
          <small>Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</small>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Sản phẩm (hiện tối đa 2) */}
      <div className="pv-order-items">
        {items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="pv-order-item">
            <div className="pv-order-thumb">
              <img
                src={item.productImage || PLACEHOLDER}
                alt={item.productName}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
              />
            </div>
            <div className="pv-order-info">
              <div className="pv-order-name">{item.productName}</div>
              <small>Số lượng: {item.quantity}</small>
            </div>
            <div className="pv-order-price">{formatVND(item.price)}</div>
          </div>
        ))}
        {items.length > 2 && (
          <div className="pv-order-more">... và {items.length - 2} sản phẩm khác</div>
        )}
      </div>

      {/* Chân thẻ: tổng tiền + nút */}
      <div className="pv-order-foot">
        <div>
          <small>Tổng số tiền</small>
          <b>{formatVND(order.totalAmount)}</b>
        </div>
        <div className="pv-order-actions">
          {order.status === 'Pending' && (
            <Button variant="danger" icon={<FaTimesCircle />} loading={canceling} onClick={handleCancel}>
              {canceling ? 'Đang hủy...' : 'Hủy đơn'}
            </Button>
          )}
          <Button variant="soft" icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />} onClick={() => setIsExpanded(v => !v)}>
            {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
          </Button>
        </div>
      </div>

      {/* Chi tiết */}
      {isExpanded && (
        <div className="pv-order-detail">
          <OrderStepper status={order.status} />

          <div className="pv-order-boxes">
            <div className="pv-order-box">
              <h4><FaClipboardCheck /> Thông tin nhận hàng</h4>
              <p><b>{order.fullName}</b></p>
              <p>{order.phoneNumber}</p>
              <p>{order.shippingAddress}, {order.shippingCity}</p>
            </div>
            <div className="pv-order-box">
              <h4><FaTruck /> Thanh toán &amp; ghi chú</h4>
              <p>
                <b>Phương thức:</b>{' '}
                {order.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản / Ví điện tử'}
              </p>
              <p style={{ fontStyle: 'italic' }}>"{order.note || 'Không có ghi chú'}"</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
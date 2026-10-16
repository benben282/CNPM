import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5237/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle standardized response format { success, data }
      if (res.data && res.data.success !== undefined) {
        setOrders(res.data.data || []);
      } else {
        setOrders(res.data || []);
      }
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5237/api/admin/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Cập nhật lỗi!');
    }
  };

  const viewDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5237/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setSelectedOrder(res.data.data);
        setIsModalOpen(true);
      } else {
        alert(res.data.message || 'Lỗi tải chi tiết đơn hàng');
      }
    } catch (err) {
      alert('Không thể tải chi tiết đơn hàng!');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="admin-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Đơn hàng</h1>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Tổng Tiền</th>
                <th>Thanh Toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.orderNumber || o.id}</td>
                    <td>
                      <p className="font-bold text-gray-800">{o.fullName}</p>
                      <p className="text-sm text-gray-500 mt-1">{o.phoneNumber}</p>
                    </td>
                    <td className="font-bold text-orange-600">{formatCurrency(o.totalAmount)}</td>
                    <td className="text-gray-600 uppercase text-base font-semibold">{o.paymentMethod || 'COD'}</td>
                    <td>
                      {o.status === 'AwaitingPayment' ? (
                        // Đơn QR chưa thanh toán — chỉ hiển thị badge, không cho chỉnh sửa
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-bold bg-purple-50 text-purple-700 border-2 border-purple-200">
                          ⏳ Chờ thanh toán
                        </span>
                      ) : (
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`px-4 py-2.5 rounded-xl text-base font-bold border-2 cursor-pointer outline-none transition-colors ${o.status === 'Hoàn thành' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300' :
                            o.status === 'Đang giao' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300' :
                              o.status === 'Đã hủy' ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-300' :
                                'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300'
                            }`}
                        >
                          <option value="Pending">Chờ Xuất Hàng</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Hoàn thành">Hoàn thành</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => viewDetails(o.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="order-modal-backdrop">
          <div className="order-modal-container">
            {/* Header */}
            <div className="order-modal-header">
              <h2 className="order-modal-title">
                Chi tiết đơn hàng <span className="text-blue-600">#{selectedOrder.orderNumber || selectedOrder.id}</span>
              </h2>
              <button onClick={closeModal} className="order-modal-close-btn">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="order-modal-body">
              <div className="order-modal-grid">
                <div className="order-modal-card-blue">
                  <h3 className="order-modal-card-title-blue">
                    <span className="text-lg">👤</span> Thông tin khách hàng
                  </h3>
                  <div className="order-modal-card-content">
                    <p className="font-bold text-xl text-gray-800">{selectedOrder.fullName}</p>
                    <p className="flex items-center gap-3"><span>📞</span> {selectedOrder.phoneNumber}</p>
                    {selectedOrder.email && (
                      <p className="flex items-center gap-3 xl:truncate"><span>✉️</span> {selectedOrder.email}</p>
                    )}
                  </div>
                </div>
                <div className="order-modal-card-orange">
                  <h3 className="order-modal-card-title-orange">
                    <span className="text-lg">📍</span> Địa chỉ giao hàng
                  </h3>
                  <div className="order-modal-card-content">
                    <p className="font-medium">{selectedOrder.address}</p>
                    <p>{selectedOrder.city}, {selectedOrder.postalCode}</p>
                  </div>
                </div>
              </div>

              <h3 className="order-modal-products-title">Sản phẩm đã đặt</h3>
              <div className="order-modal-product-list">
                {selectedOrder.items && selectedOrder.items.map(item => (
                  <div key={item.id} className="order-modal-product-item">
                    <div className="order-modal-product-info">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="order-modal-product-img" />
                      ) : (
                        <div className="order-modal-product-no-img">No img</div>
                      )}
                      <div className="order-modal-product-details">
                        <p className="order-modal-product-name">{item.productName}</p>
                        <p className="order-modal-product-price-qty">{formatCurrency(item.price)} <span className="mx-4 text-gray-300">|</span> Số lượng: <span className="font-bold text-gray-800">{item.quantity}</span></p>
                      </div>
                    </div>
                    <div className="order-modal-product-total">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-modal-summary-box">
                <span className="order-modal-summary-label">Tổng thanh toán</span>
                <span className="order-modal-summary-value">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="order-modal-footer">
              <button 
                onClick={closeModal} 
                className="order-modal-footer-btn"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;

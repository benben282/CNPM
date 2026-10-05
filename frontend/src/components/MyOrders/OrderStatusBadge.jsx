import React from 'react';

const statusConfig = {
  'Pending': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  'Processing': { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' },
  'Shipping': { label: 'Đang giao', color: 'bg-orange-100 text-orange-700' },
  'Đang giao': { label: 'Đang giao', color: 'bg-orange-100 text-orange-700' },
  'Delivered': { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  'Hoàn thành': { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  'Canceled': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  'Đã hủy': { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
      {config.label}
    </span>
  );
}

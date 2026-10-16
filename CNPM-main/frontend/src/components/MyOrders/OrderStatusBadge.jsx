import React from 'react';
import { Badge } from '../profile/ProfileUI';

// Thêm trạng thái mới: chỉ cần thêm 1 dòng. tone: warn | info | orange | ok | danger | muted
const STATUS = {
  AwaitingPayment: { label: 'Chờ thanh toán', tone: 'warn' },
  Pending: { label: 'Chờ xác nhận', tone: 'warn' },
  Processing: { label: 'Đang xử lý', tone: 'info' },
  Shipping: { label: 'Đang giao', tone: 'orange' },
  'Đang giao': { label: 'Đang giao', tone: 'orange' },
  Delivered: { label: 'Đã giao', tone: 'ok' },
  'Hoàn thành': { label: 'Hoàn thành', tone: 'ok' },
  Canceled: { label: 'Đã hủy', tone: 'danger' },
  'Đã hủy': { label: 'Đã hủy', tone: 'danger' },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS[status] || { label: status, tone: 'muted' };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
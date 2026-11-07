import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaRegClock, FaCopy } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { PageHeader, Badge, Button, EmptyState, Skeleton } from './ProfileUI';
import './ProfileVip.css';

// Dữ liệu dự phòng khi server không có mã (giống bên Checkout)
const LOCAL_MOCK_COUPONS = [
  { code: 'PETLOVE20', discountType: 'fixed', discountValue: 50000, minOrderValue: 200000, expirationDate: '2026-12-31' },
  { code: 'DOGFOOD10', discountType: 'percent', discountValue: 10, minOrderValue: 200000, categoryRestriction: 1, expirationDate: '2026-12-31' },
  { code: 'WHISKAS50K', discountType: 'fixed', discountValue: 50000, minOrderValue: 150000, categoryRestriction: 2, expirationDate: '2026-12-31' },
  { code: 'MEOWTOY5', discountType: 'percent', discountValue: 5, minOrderValue: 50000, categoryRestriction: 4, expirationDate: '2026-12-31' },
  { code: 'PETSPA5', discountType: 'percent', discountValue: 5, minOrderValue: 100000, categoryRestriction: 3, expirationDate: '2026-12-31' }
];

// Id danh mục (cố định theo seed_data.sql)
const CATEGORY_NAMES = {
  1: 'Thức ăn cho Chó',
  2: 'Thức ăn cho Mèo',
  3: 'Chăm sóc & Vệ sinh',
  4: 'Phụ kiện & Đồ chơi'
};

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const isExpired = (c) => {
  if (!c.expirationDate) return false;
  const end = new Date(c.expirationDate);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
};

export default function WalletCoupons() {
  const showToast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      const savedCodes = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      if (savedCodes.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const promises = savedCodes.map(code =>
          api.get(`/vouchers/check?code=${code}`)
            .then(res => res.data)
            .catch(() => LOCAL_MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase()) || null)
        );
        const results = (await Promise.all(promises)).filter(c => c !== null);
        // Mã còn hạn xếp trước, mã hết hạn xuống cuối
        results.sort((a, b) => Number(isExpired(a)) - Number(isExpired(b)));
        setCoupons(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Đã sao chép', `Mã ${code} đã được chép`, 'success');
    } catch {
      showToast('Lỗi', `Không thể sao chép, hãy nhập tay mã ${code}`, 'error');
    }
  };

  return (
    <div className="pv-wrap">
      <PageHeader
        icon={<FaTicketAlt />}
        title="Ví voucher"
        subtitle={loading ? 'Đang tải mã giảm giá...' : `${coupons.length} mã giảm giá đang lưu trong ví`}
      />

      {loading ? (
        <>
          <Skeleton height={130} />
          <Skeleton height={130} />
        </>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={<FaTicketAlt />}
          title="Ví của bạn đang rỗng"
          text="Hãy thu thập mã giảm giá ở trang chủ rồi quay lại đây nhé!"
          action={<Link to="/" className="pv-btn pv-btn-solid">Săn mã ngay</Link>}
        />
      ) : (
        <div className="pv-ticket-grid">
          {coupons.map((c) => {
            const expired = isExpired(c);
            const value = c.discountType === 'percent'
              ? `${c.discountValue}%`
              : `${Math.round(c.discountValue / 1000)}K`;
            return (
              <article key={c.code} className={`pv-ticket${expired ? ' expired' : ''}`}>
                <div className="pv-ticket-stub">
                  <small>GIẢM</small>
                  <b>{value}</b>
                </div>

                <div className="pv-ticket-body">
                  <div className="pv-ticket-code">{c.code}</div>
                  <p className="pv-ticket-desc">
                    Đơn tối thiểu {formatVND(c.minOrderValue)}
                    {c.categoryRestriction ? ` · Áp dụng cho ${CATEGORY_NAMES[c.categoryRestriction] || 'một số sản phẩm'}` : ''}
                  </p>

                  <div className="pv-ticket-foot">
                    {expired
                      ? <Badge tone="danger" icon={<FaRegClock />}>Đã hết hạn</Badge>
                      : (
                        <Badge tone="muted" icon={<FaRegClock />}>
                          HSD: {c.expirationDate ? new Date(c.expirationDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                        </Badge>
                      )}
                    {!expired && (
                      <Button variant="soft" size="sm" icon={<FaCopy />} onClick={() => handleCopy(c.code)}>
                        Sao chép
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CouponModal from './CouponModal';

const promotions = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600',
    title: 'Giảm giá 10%',
    subtitle: 'Áp dụng cho thức ăn cho chó',
    badge: 'HOT',
    coupon: {
      code: 'DOGFOOD10',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 200000,
      categoryRestrictionName: 'Thức ăn cho chó',
      expirationDate: '2026-12-31'
    }
  },
  {
    id: 2,
    image: '/images/hat_whiskas_ca_ngu.png',
    title: 'Giảm sốc 50K',
    subtitle: 'Hạt Whiskas Vị Cá Ngừ',
    badge: 'NEW',
    coupon: {
      code: 'WHISKAS50K',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderValue: 150000,
      categoryRestrictionName: 'Hạt Whiskas Cá Ngừ',
      expirationDate: '2026-12-31'
    }
  },
  {
    id: 3,
    image: '/images/can_cau_meo.png',
    title: 'Đồ Chơi Cho Mèo',
    subtitle: 'Giảm 5% cho các món đồ chơi cho mèo',
    badge: 'LIMIT',
    coupon: {
      code: 'MEOWTOY5',
      discountType: 'percent',
      discountValue: 5,
      minOrderValue: 50000,
      categoryRestrictionName: 'Đồ chơi cho mèo',
      expirationDate: '2026-12-31'
    }
  },
  {
    id: 4,
    image: '/images/sua_tam_sos.png',
    title: 'Pet cưng ống mượt',
    subtitle: 'Giảm 5% cho các loại sữa tắm cho thú cưng',
    badge: 'SALE',
    coupon: {
      code: 'PETSPA5',
      discountType: 'percent',
      discountValue: 5,
      minOrderValue: 100000,
      categoryRestrictionName: 'Sữa tắm / Vệ sinh',
      expirationDate: '2026-12-31'
    }
  }
];

export default function PromotionsScroll() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const handleOpenModal = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const goToSlide = (index) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + promotions.length) % promotions.length);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % promotions.length);

  // Auto scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promotions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="promotions" className="promotions-banner-section">
      <h2 className="section-title">KHUYẾN MÃI CỰC SỐC</h2>

      <div
        className="promotions-banner"
      >
        <div
          className="promo-scroll"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {promotions.map((promo, idx) => (
            <div className="promo-banner-card" key={idx}>
              <div className="promo-banner-text">
                <span className="promo-badge-top">{promo.badge}</span>
                <h1>{promo.title}</h1>
                <p>{promo.subtitle}</p>
                <button 
                  className="btn-primary"
                  onClick={() => promo.coupon ? handleOpenModal(promo.coupon) : window.scrollTo({ top: 800, behavior: 'smooth' })}
                >
                  {promo.coupon ? "Nhận mã ngay" : "Mua ngay"}
                </button>
              </div>
              <div className="promo-banner-img">
                <img src={promo.image} alt={promo.title} />
              </div>
            </div>
          ))}
        </div>

        <button className="promo-arrow promo-arrow-left" onClick={prevSlide} aria-label="Previous slide">
          <FaChevronLeft />
        </button>
        <button className="promo-arrow promo-arrow-right" onClick={nextSlide} aria-label="Next slide">
          <FaChevronRight />
        </button>

        <div className="promo-nav-dots">
          {promotions.map((_, idx) => (
            <button
              key={idx}
              className={`promo-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to promotion ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <CouponModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        coupon={selectedCoupon} 
      />
    </section>
  );
}

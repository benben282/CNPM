import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CouponModal from './CouponModal';

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const promoCoupon = { 
    code: 'PETLOVE20', 
    minOrderValue: 200000, 
    categoryRestriction: null, 
    discountType: 'fixed', 
    discountValue: 50000, 
    expirationDate: '2026-12-31' 
  };

  const slides = [
    {
      title: "Chào mừng đến với PetShop",
      subtitle: "Tại đây cung cấp cho bạn nhứng thứ cần thiết cho pet của bạn",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
      buttonText: "MUA NGAY",
      action: "shop"
    },
    {
      title: "🎁 Nhận Mã Giảm Giá 50K!",
      subtitle: "Áp dụng cho mọi đơn hàng từ 200k. Số lượng có hạn!",
      image: "/banner_cat.png",
      buttonText: "NHẬN VÍ NGAY",
      action: "promo"
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);

  return (
    <div className="banner">
      <div
        className="banner-scroll"
        style={{ transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.5s ease-in-out' }}
      >
        {slides.map((slide, idx) => (
          <div className="banner-card" key={idx}>
            <div className="banner-text">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <button 
                className="btn-primary"
                onClick={() => {
                  if (slide.action === 'promo') setIsModalOpen(true);
                  else window.scrollTo({ top: 800, behavior: 'smooth' });
                }}
              >
                {slide.buttonText || "MUA NGAY"}
              </button>
            </div>
            <div className="banner-img">
              <img src={slide.image} alt={slide.title} />
            </div>
          </div>
        ))}
      </div>

      <button className="banner-arrow banner-arrow-left" onClick={prevSlide}>
        <FaChevronLeft />
      </button>
      <button className="banner-arrow banner-arrow-right" onClick={nextSlide}>
        <FaChevronRight />
      </button>

      <div className="banner-nav">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`nav-dot ${idx === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <CouponModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        coupon={promoCoupon} 
      />
    </div>
  );
}

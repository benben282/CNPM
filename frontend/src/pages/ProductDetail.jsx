import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft, FaTag, FaBoxOpen, FaStar } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import ProductReviewsSection from '../components/ProductReviewsSection';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const showToast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(product, quantity);
    if (success) {
      showToast('Thành công', `Đã thêm ${product.name} vào giỏ`, 'success');
    } else {
      showToast('Lỗi', 'Không thể thêm vào giỏ hàng', 'error');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="skeleton-box" style={{ width: 300, height: 300, margin: '0 auto 24px' }} />
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <FaBoxOpen size={64} style={{ color: 'var(--text-muted)' }} />
        <h2>Không tìm thấy sản phẩm</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Quay lại cửa hàng</button>
      </div>
    );
  }

  const mockReviews = [
    {
      name: 'Thanh Trúc',
      avatar: 'https://placehold.co/100x100/FFB347/fff?text=T',
      rating: 5,
      content: 'Chất lượng quá ổn, boss nhà mình rất thích. Đóng gói cẩn thận giao hàng nhanh. Sẽ ủng hộ shop dài dài nha!',
      isVerified: true,
      date: '12/03/2026',
      images: ['https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=200']
    },
    {
      name: 'Hải Đăng',
      avatar: 'https://placehold.co/100x100/A2D149/fff?text=D',
      rating: 4,
      content: 'Sản phẩm tốt nhưng giao hàng hơi chậm mất 3 ngày mới tới. Bù lại CSKH nhiệt tình, bé cún ăn rất ngon miệng.',
      isVerified: true,
      date: '08/03/2026',
      images: []
    },
    {
      name: 'Minh Thư',
      avatar: 'https://placehold.co/100x100/FF6B6B/fff?text=M',
      rating: 5,
      content: 'Gói hàng siêu kỹ, mùi thơm lắm, vừa bóc ra là đàn mèo chạy lại rần rần. 10 điểm không có nhưng!',
      isVerified: true,
      date: '01/03/2026',
      images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200']
    }
  ];

  // Logic SQL Database: Dựa vào API node/csharp trả về biến canReview (hasPurchasedAndReceived)
  const canReview = product?.canReview ?? true;

  return (
    <div className="container" style={{ padding: '32px 20px', maxWidth: 1100 }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Trang chủ</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-muted)' }}>{product.categoryName || 'Sản phẩm'}</span>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{product.name}</span>
      </nav>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 48,
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '1px solid var(--border)'
      }}>
        {/* Left: Product Image */}
        <div style={{ position: 'relative' }}>
          <img
            src={imgError ? 'https://placehold.co/500x500?text=No+Image' : (product.imageUrl || 'https://placehold.co/500x500?text=No+Image')}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%', aspectRatio: '1', objectFit: 'cover',
              borderRadius: 16, border: '1px solid var(--border)'
            }}
          />
        </div>

        {/* Right: Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category */}
          {product.categoryName && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)',
              background: 'rgba(var(--primary-rgb, 255, 119, 0), 0.1)',
              padding: '4px 12px', borderRadius: 20, width: 'fit-content'
            }}>
              <FaTag size={10} /> {product.categoryName}
            </span>
          )}

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.3, margin: 0 }}>{product.name}</h1>

          {/* Rating placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[1,2,3,4,5].map(i => (
              <FaStar key={i} style={{ color: i <= 4 ? '#FFD700' : '#ddd', fontSize: '1rem' }} />
            ))}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(4.0 / 5.0)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
              {formatPrice(product.originalPrice || product.price)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: product.stock > 0 ? '#2ED573' : '#FF4757',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.9rem', color: product.stock > 0 ? '#2ED573' : '#FF4757', fontWeight: 600 }}>
              {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
            </span>
          </div>

          {/* Quantity + Add to cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              border: '2px solid var(--border)', borderRadius: 12, overflow: 'hidden'
            }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ padding: '10px 18px', background: 'var(--surface)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text)' }}
              >−</button>
              <span style={{ padding: '10px 16px', fontWeight: 700, fontSize: '1rem', minWidth: 40, textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                style={{ padding: '10px 18px', background: 'var(--surface)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text)' }}
              >+</button>
            </div>

            <button
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{ flex: 1, justifyContent: 'center', fontSize: '1rem', padding: '12px 24px', gap: 10 }}
            >
              <FaShoppingCart /> THÊM VÀO GIỎ
            </button>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginTop: 8
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>
      </div>

      {/* Review Section */}
      <ProductReviewsSection reviews={mockReviews} hasPurchasedAndReceived={canReview} />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

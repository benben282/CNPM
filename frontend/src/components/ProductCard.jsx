import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { useToast } from '../hooks/useToast';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const showToast = useToast();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const success = await addToCart(product, 1);
    if (success) {
      showToast('Thành công', `Đã thêm ${product.name} vào giỏ`, 'success');
    } else {
      showToast('Lỗi', 'Không thể thêm vào giỏ hàng', 'error');
    }
  };

  const isHot = product.categoryId === 1;
  const isNew = product.categoryId === 2;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card-img-wrapper">
          {isHot && <span className="product-badge badge-hot">HOT</span>}
          {!isHot && isNew && <span className="product-badge badge-new">MỚI</span>}
          <img
            src={product.imageUrl || 'https://placehold.co/300x300?text=No+Image'}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=No+Image'; }}
          />
        </div>
        <div className="product-info">
          <h4>{product.name}</h4>
          <div className="price-row">
            <span className="price">{formatPrice(product.originalPrice || product.price)}</span>
          </div>
          <p className="desc">{product.description}</p>
        </div>
      </Link>
      <button className="btn-add-cart" onClick={handleAddToCart}>
        <FaShoppingCart />
        THÊM VÀO GIỎ
      </button>
    </div>
  );
}

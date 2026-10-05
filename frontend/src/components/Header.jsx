import React, { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaPaw, FaSearch, FaUser, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Navbar from './Navbar';

export default function Header({ openLogin }) {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, setCartOpen } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="main-header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <i className="fa-solid fa-paw"><FaPaw /></i>
          <span>Pet<span>Shop</span></span>
        </Link>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm thức ăn, đồ chơi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <i className="fa-solid fa-search"><FaSearch /></i>
          </button>
        </form>
        <div className="header-icons">
          {user ? (
            <div className="user-section">
              <Link to="/profile" id="userName" style={{textDecoration: 'none', cursor: 'pointer'}}>{user.fullName}</Link>
              <button id="logoutBtn" onClick={logout} className="header-icon-btn" style={{width: 'auto', padding: '0 10px', fontSize: '0.9rem', color: 'var(--error)'}}>
                <FaSignOutAlt /> Đăng Xuất
              </button>
            </div>
          ) : (
            <button className="header-icon-btn" onClick={openLogin}>
              <i className="fa-regular fa-user"><FaUser /></i>
            </button>
          )}
          
          <div className="cart-icon">
            <button className="header-icon-btn" onClick={() => setCartOpen(true)}>
              <i className="fa-solid fa-cart-shopping"><FaShoppingCart /></i>
            </button>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </div>
        </div>
      </div>
      <Navbar />
    </header>
  );
}

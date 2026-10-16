import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaPaw, FaSearch, FaUser, FaShoppingCart, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Navbar from './Navbar';

export default function Header({ openLogin }) {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, setCartOpen } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

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
            <div className="user-menu" ref={menuRef}>
              <button className="user-menu-trigger" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen}>
                <span className="user-avatar">{(user.fullName || '?').charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.fullName}</span>
              </button>
            {menuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}><FaUser /> Tài khoản của tôi</Link>
                  <Link to="/profile?tab=orders" onClick={() => setMenuOpen(false)}><FaClipboardList /> Đơn hàng của tôi</Link>
                  <button className="logout-item" onClick={() => { setMenuOpen(false); logout(); }}>
                    <FaSignOutAlt /> Đăng xuất
                  </button>
            </div>
          )}
            </div>
          ) : (
            <button className="header-icon-btn with-label" onClick={openLogin}>
              <i className="fa-regular fa-user"><FaUser /></i>
              <span className="header-btn-label">Đăng nhập</span>
            </button>
          )}
          
        <div className="cart-icon">
          <button className="header-icon-btn with-label" onClick={() => setCartOpen(true)}>
            <i className="fa-solid fa-cart-shopping"><FaShoppingCart /></i>
            <span className="header-btn-label">Giỏ hàng</span>
          </button>
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </div>
        </div>
      </div>
      <Navbar />
    </header>
  );
}

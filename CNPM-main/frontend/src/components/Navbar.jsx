import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="main-nav">
      <div className="container">
        <ul>
          <li><NavLink to="/" end onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Trang Chủ</NavLink></li>
          <li><NavLink to="/#cho-cho">Cho Chó</NavLink></li>
          <li><NavLink to="/#cho-meo">Cho Mèo</NavLink></li>
          <li><NavLink to="/#promotions">Khuyến Mãi</NavLink></li>
          <li><NavLink to="/contact">Liên Hệ</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

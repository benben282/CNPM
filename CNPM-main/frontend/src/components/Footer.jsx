import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaPhone } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', paddingBottom: '20px', backgroundColor: 'var(--bg-card)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>PetShop Premium</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Nơi cung cấp các sản phẩm thức ăn, phụ kiện cho thú cưng chất lượng cao nhất với giá cả phải chăng.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px' }}>Liên kết</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Về chúng tôi</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Chính sách đổi trả</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px' }}>Liên hệ</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}><FaPhone/> Hotline: 1900 1234</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email: hotro@petshop.vn</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px' }}>Mạng xã hội</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.5rem', transition: 'color 0.3s' }}><FaFacebook/></a>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.5rem', transition: 'color 0.3s' }}><FaInstagram/></a>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.5rem', transition: 'color 0.3s' }}><FaTiktok/></a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          © 2025 PetShop. Bản quyền thuộc về PetShop Premium.
        </div>
      </div>
    </footer>
  );
}

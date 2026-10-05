import React, { useState, useContext } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export default function RegisterModal({ onClose, openLogin }) {
  const { register } = useContext(AuthContext);
  const showToast = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      showToast('Thành công', 'Đăng ký thành công! Hãy đăng nhập', 'success');
      openLogin();
    } catch (err) {
      showToast('Lỗi đăng ký', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal active" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>
        
        <div className="modal-header">
          <h2>Tạo tài khoản</h2>
          <p>Tham gia cộng đồng yêu thú cưng tại PetShop ngay hôm nay</p>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Họ và Tên</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input 
                  id="fullName"
                  name="fullName"
                  type="text" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  placeholder="Nguyễn Văn A" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Số điện thoại</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input 
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  placeholder="09xx xxx xxx" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Ít nhất 6 ký tự" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-primary-full" 
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? (
                <span className="loader-dots">ĐANG TẠO TÀI KHOẢN...</span>
              ) : (
                'ĐĂNG KÝ NGAY'
              )}
            </button>

            <div className="auth-switch">
              Đã có tài khoản?{' '}
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); openLogin(); }} 
                className="switch-link"
              >
                Đăng nhập tại đây
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

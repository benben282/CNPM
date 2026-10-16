import React, { useState, useContext } from 'react';
import { FaTimes, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export default function LoginModal({ onClose, openRegister }) {
  const { login } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Thành công', 'Đăng nhập thành công! Chào mừng bạn trở lại 🐾', 'success');
      onClose();
      navigate('/profile');
    } catch (err) {
      showToast('Lỗi đăng nhập', err.response?.data?.message || err.message, 'error');
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
          <h2>Chào mừng quay lại!</h2>
          <p>Đăng nhập để trải nghiệm đầy đủ tiện ích từ PetShop</p>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email của bạn</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <FaLock className="input-icon" />
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Ghi nhớ tôi</label>
              </div>
              <a href="#" className="forgot-link">Quên mật khẩu?</a>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-primary-full" 
              disabled={loading}
            >
              {loading ? (
                <span className="loader-dots">ĐANG XỬ LÝ...</span>
              ) : (
                'ĐĂNG NHẬP NGAY'
              )}
            </button>

            <div className="auth-switch">
              Chưa có tài khoản?{' '}
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); openRegister(); }} 
                className="switch-link"
              >
                Đăng ký thành viên
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useContext } from 'react';
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebookSquare } from 'react-icons/fa';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { PageHeader, Card, TextField, Button, Badge } from './ProfileUI';
import './ProfileVip.css';

/* Ô mật khẩu có nút hiện/ẩn */
function PasswordField({ show, onToggle, ...props }) {
  return (
    <TextField
      icon={<FaLock />}
      type={show ? 'text' : 'password'}
      suffix={
        <button type="button" className="pv-eye" onClick={onToggle} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      }
      {...props}
    />
  );
}

export default function SecuritySettings() {
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = currentPassword && newPassword.length >= 6 && newPassword === confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Lỗi', 'Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${user.id}/password`, {
        currentPassword,
        newPassword
      });
      showToast('Thành công', 'Đổi mật khẩu thành công!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('Lỗi', err.response?.data?.message || 'Không thể đổi mật khẩu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = () => setShowPw(s => !s);

  return (
    <div className="pv-wrap">
      <PageHeader
        icon={<FaShieldAlt />}
        title="Bảo mật tài khoản"
        subtitle="Giữ tài khoản của bạn luôn an toàn"
      />

      <div className="pv-grid">
        <Card title="Đổi mật khẩu" icon={<FaLock />}>
          <form onSubmit={handleChangePassword}>
            <PasswordField label="Mật khẩu hiện tại" value={currentPassword} show={showPw} onToggle={toggle}
              onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required />

            <PasswordField label="Mật khẩu mới" value={newPassword} show={showPw} onToggle={toggle}
              onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required minLength={6} />
            <p className="pv-hint">Tối thiểu 6 ký tự.</p>

            <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} show={showPw} onToggle={toggle}
              onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required minLength={6} />
            {mismatch && <p className="pv-hint err">Mật khẩu xác nhận chưa khớp.</p>}

            <Button type="submit" className="pv-btn-block" disabled={!canSubmit} loading={saving}>
              {saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
          </form>
        </Card>

        <Card title="Liên kết mạng xã hội" icon={<FaShieldAlt />}>
          <p className="pv-note">Đăng nhập nhanh bằng Google hoặc Facebook sẽ sớm được hỗ trợ.</p>

          <div className="pv-row">
            <span className="pv-stat-icon pv-ic-red"><FaGoogle /></span>
            <div className="pv-row-text"><b>Google</b><small>Chưa liên kết</small></div>
            <Badge>Sắp ra mắt</Badge>
          </div>

          <div className="pv-row">
            <span className="pv-stat-icon pv-ic-blue"><FaFacebookSquare /></span>
            <div className="pv-row-text"><b>Facebook</b><small>Chưa liên kết</small></div>
            <Badge>Sắp ra mắt</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
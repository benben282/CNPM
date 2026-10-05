import React, { useState, useContext } from 'react';
import { FaShieldAlt, FaGoogle, FaFacebookSquare } from 'react-icons/fa';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export default function SecuritySettings() {
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Lỗi', 'Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    
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
    }
  };

  return (
    <div className="profile-tab-card">
      <h2 className="profile-tab-title">Bảo mật tài khoản</h2>
      
      <div className="profile-grid-2col">
        <div className="profile-info-box bg-gray-50">
          <h3 className="profile-box-title">
            <span className="text-orange-500"><FaShieldAlt /></span> Đổi mật khẩu
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mật khẩu hiện tại</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500" />
            </div>
            <button type="submit" disabled={!newPassword || newPassword !== confirmPassword} className="w-full mt-4 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl shadow-md hover:bg-black transition-colors disabled:bg-gray-300">Cập Nhật Mật Khẩu</button>
          </form>
        </div>

        <div className="profile-info-box bg-gray-50">
          <h3 className="profile-box-title !mb-2">Liên kết mạng xã hội</h3>
          <p className="text-sm text-gray-500 mb-6">Liên kết tài khoản để đăng nhập nhanh chóng bằng 1 chạm.</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <FaGoogle className="text-2xl text-red-500" />
                <div>
                  <div className="font-bold text-sm text-gray-800">Google</div>
                  <div className="text-xs text-gray-400 mt-0.5">Chưa liên kết</div>
                </div>
              </div>
              <button className="text-xs font-bold px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors">Liên kết</button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <FaFacebookSquare className="text-2xl text-blue-600" />
                <div>
                  <div className="font-bold text-sm text-gray-800">Facebook</div>
                  <div className="text-xs text-green-500 font-bold mt-0.5 flex items-center gap-1">Đã liên kết</div>
                </div>
              </div>
              <button className="text-xs font-bold px-4 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-red-500 transition-colors">Hủy liên kết</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

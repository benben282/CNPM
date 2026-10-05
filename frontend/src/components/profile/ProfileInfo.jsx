import React, { useState, useEffect, useContext } from 'react';
import { FaUserEdit, FaCamera, FaEnvelope, FaPhoneAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { AuthContext } from '../../context/AuthContext';

export default function ProfileInfo() {
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'Khác',
    avatar: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/users/${user.id}`).then(res => {
        const data = res.data;
        setProfile({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '', // Chuyển ISO sang YYYY-MM-DD
          gender: data.gender || 'Khác',
          avatar: data.avatar || ''
        });
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/users/${user.id}/profile`, profile);
      showToast('Thành công', 'Hồ sơ đã được cập nhật', 'success');
    } catch (err) {
      showToast('Lỗi', 'Không thể cập nhật hồ sơ', 'error');
    }
  };

  const handleVerifyOtp = async () => {
      // Giả lập OTP thành công
      setShowOtp(false);
      setIsEditingPhone(false);
      setProfile(prev => ({ ...prev, phoneNumber: newPhone }));
      // Lưu phone mới
      try {
        await api.put(`/users/${user.id}/profile`, { ...profile, phoneNumber: newPhone });
        showToast('Thành công', 'Đã lưu số điện thoại mới', 'success');
      } catch (err) {}
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải hồ sơ...</div>;

  return (
    <div className="profile-tab-card">
      <h2 className="profile-tab-title">Hồ sơ của tôi</h2>

      {/* Avatar Section */}
      <div className="profile-avatar-bg">
        <div className="relative group cursor-pointer" onClick={() => {
            const newAva = window.prompt("Nhập URL ảnh Avatar:", profile.avatar);
            if (newAva !== null) {
                setProfile(prev => ({ ...prev, avatar: newAva }));
            }
        }}>
          <img 
            src={profile.avatar || 'https://placehold.co/150x150/FFB347/fff?text=' + (profile.fullName?.[0] || 'U')} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-80 transition-opacity" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaCamera className="text-white text-xl" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-xl">{profile.fullName || user?.email}</h3>
          <p className="text-sm text-gray-500 mt-1">Chạm vào ảnh để thay đổi Avatar (URL)</p>
        </div>
      </div>

      <div className="profile-grid-2col">
        {/* Personal Info */}
        <div className="profile-info-box">
          <h3 className="profile-box-title">
            <span className="text-orange-500"><FaUserEdit /></span> Thông tin cá nhân
          </h3>
          
          <div className="profile-form-group">
            <div>
              <label className="profile-form-label">Họ và tên</label>
              <input type="text" name="fullName" value={profile.fullName} onChange={handleInputChange} className="profile-form-input" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="profile-form-label">Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleInputChange} className="profile-form-input" />
              </div>
              <div>
                <label className="profile-form-label">Giới tính</label>
                <select name="gender" value={profile.gender} onChange={handleInputChange} className="profile-form-input bg-white">
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>
            <button onClick={handleSaveProfile} className="mt-4 profile-btn-primary">Lưu Thay Đổi</button>
          </div>
        </div>

        {/* Contact Info (OTP requirement) */}
        <div className="profile-info-box">
          <h3 className="profile-box-title">
            <span className="text-orange-500"><FaPhoneAlt /></span> Thông tin liên hệ
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-full"><FaEnvelope /></div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Địa chỉ Email</div>
                  <div className="text-sm text-gray-500">{user?.email || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 text-green-500 rounded-full"><FaPhoneAlt /></div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Số điện thoại</div>
                  <div className="text-sm text-gray-500">{isEditingPhone ? '***' : (profile.phoneNumber || 'Thêm số điện thoại')}</div>
                </div>
              </div>
              {!isEditingPhone ? (
                <button onClick={() => setIsEditingPhone(true)} className="text-orange-500 font-bold text-sm bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100">Thay đổi</button>
              ) : (
                <span className="text-green-500 text-sm font-bold flex items-center gap-1"><FaCheckCircle/> Đang đổi</span>
              )}
            </div>

            {isEditingPhone && (
              <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                {!showOtp ? (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập số điện thoại mới</label>
                    <div className="flex gap-2">
                       <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="flex-1 border border-orange-200 rounded-lg px-3 py-2 outline-none" placeholder="09xxxxxxx" />
                       <button onClick={() => setShowOtp(true)} className="bg-orange-500 text-white px-4 rounded-lg font-bold text-sm hover:bg-orange-600">Gửi OTP</button>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập mã OTP (Giả lập: 123456)</label>
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 border border-orange-200 rounded-lg px-3 py-2 outline-none text-center tracking-widest font-bold" placeholder="------" maxLength={6}/>
                      <button onClick={handleVerifyOtp} className="bg-green-500 text-white px-4 rounded-lg font-bold text-sm hover:bg-green-600">Xác nhận</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

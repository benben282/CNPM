import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaCheck, FaTrash, FaEdit } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';

export default function AddressBook() {
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: 'Hồ Chí Minh', type: 'Nhà riêng', isDefault: false
  });

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/users/${user.id}/addresses`);
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
      showToast('Lỗi', 'Không thể tải sổ địa chỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev, [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: user?.fullName || '', phone: user?.phoneNumber || '', address: '', city: 'Hồ Chí Minh', type: 'Nhà riêng', isDefault: addresses.length === 0 });
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${user.id}/addresses/${editingId}`, formData);
        showToast('Thành công', 'Đã cập nhật địa chỉ', 'success');
      } else {
        await api.post(`/users/${user.id}/addresses`, formData);
        showToast('Thành công', 'Đã thêm địa chỉ mới', 'success');
      }
      setShowForm(false);
      fetchAddresses();
    } catch (err) {
      showToast('Lỗi', 'Không thể lưu địa chỉ', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await api.delete(`/users/${user.id}/addresses/${id}`);
      showToast('Thành công', 'Đã xóa địa chỉ', 'success');
      fetchAddresses();
    } catch (err) {
      showToast('Lỗi', 'Không thể xóa', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/users/${user.id}/addresses/${id}/default`);
      fetchAddresses();
      showToast('Thành công', 'Đã đặt làm mặc định', 'success');
    } catch (err) {
      showToast('Lỗi', 'Không thể đổi mặc định', 'error');
    }
  };

  return (
    <div className="profile-tab-card">
      <div className="flex justify-between items-center mb-8 border-b-2 border-orange-100 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-800">Sổ địa chỉ của tôi</h2>
        {!showForm && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-0.5">
            <FaPlus /> Thêm địa chỉ mới
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSave} className="bg-orange-50 p-6 rounded-2xl mb-8 border border-orange-100">
          <h3 className="font-bold text-lg mb-4">{editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Họ tên người nhận</label>
              <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-orange-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Số điện thoại</label>
              <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-orange-200 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Địa chỉ chi tiết (Số nhà, đường...)</label>
              <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-orange-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tỉnh / Thành phố</label>
              <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-orange-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Loại địa chỉ</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-orange-200 outline-none bg-white">
                <option>Nhà riêng</option>
                <option>Cơ quan</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-4 h-4 text-orange-500 accent-orange-500" />
            <span className="font-semibold text-gray-700">Đặt làm địa chỉ mặc định</span>
          </label>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50">Hủy</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md">Lưu Địa Chỉ</button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <p className="text-gray-500">Đang tải sổ địa chỉ...</p>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Bạn chưa lưu địa chỉ nào.</p>
              <button onClick={handleOpenAdd} className="text-orange-500 font-bold hover:underline">Thêm ngay</button>
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className={`address-card ${addr.isDefault ? 'address-card-default' : 'address-card-normal'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-extrabold text-gray-800 text-lg">{addr.name}</h3>
                      <span className="text-gray-400">|</span>
                      <span className="font-semibold text-gray-600">{addr.phone}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{addr.address}, {addr.city}</p>
                    
                    <div className="flex gap-2">
                      <span className="address-tag">{addr.type}</span>
                      {addr.isDefault && (
                        <span className="address-tag-default">
                          <FaCheck size={10} /> Mặc định
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <div className="flex gap-4 border-l border-gray-200 pl-4">
                      <button onClick={() => handleOpenEdit(addr)} className="text-orange-500 font-bold hover:text-orange-600 flex items-center gap-1"><FaEdit/> Sửa</button>
                      {!addr.isDefault && (
                        <button onClick={() => handleDelete(addr.id)} className="text-red-500 font-bold hover:text-red-600 flex items-center gap-1"><FaTrash/> Xóa</button>
                      )}
                    </div>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} className="mt-2 px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors">Thiết lập mặc định</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

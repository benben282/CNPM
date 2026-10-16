import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaCheck, FaTrash, FaEdit, FaMapMarkerAlt, FaUser, FaPhoneAlt, FaHome } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { PageHeader, Card, TextField, SelectField, CheckRow, Button, Badge, EmptyState, Skeleton } from './ProfileUI';
import './ProfileVip.css';

const PHONE_REGEX = /^(0|\+84)\d{9}$/;
const EMPTY_FORM = { name: '', phone: '', address: '', city: 'Hồ Chí Minh', type: 'Nhà riêng', isDefault: false };

export default function AddressBook() {
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

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
    setFormData({
      ...EMPTY_FORM,
      name: user?.fullName || '',
      phone: user?.phoneNumber || '',
      isDefault: addresses.length === 0
    });
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!PHONE_REGEX.test((formData.phone || '').trim())) {
      showToast('Số không hợp lệ', 'Nhập số điện thoại 10 số, ví dụ 0912345678', 'error');
      return;
    }
    setSaving(true);
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
    } finally {
      setSaving(false);
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
    <div className="pv-wrap">
      <PageHeader
        icon={<FaMapMarkerAlt />}
        title="Sổ địa chỉ"
        subtitle="Lưu nơi nhận hàng để thanh toán nhanh hơn"
        action={!showForm && <Button icon={<FaPlus />} onClick={handleOpenAdd}>Thêm địa chỉ mới</Button>}
      />

      {showForm ? (
        <Card title={editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'} icon={<FaMapMarkerAlt />}>
          <form onSubmit={handleSave}>
            <div className="pv-form-grid">
              <div>
                <TextField label="Họ tên người nhận" icon={<FaUser />} name="name" required
                  value={formData.name} onChange={handleInputChange} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <TextField label="Số điện thoại" icon={<FaPhoneAlt />} name="phone" required inputMode="tel"
                  value={formData.phone} onChange={handleInputChange} placeholder="09xxxxxxxx" />
              </div>
              <div className="full">
                <TextField label="Địa chỉ chi tiết (số nhà, đường, phường...)" icon={<FaHome />} name="address" required
                  value={formData.address} onChange={handleInputChange} placeholder="123 Nguyễn Huệ, Phường Bến Nghé" />
              </div>
              <div>
                <TextField label="Tỉnh / Thành phố" icon={<FaMapMarkerAlt />} name="city" required
                  value={formData.city} onChange={handleInputChange} />
              </div>
              <div>
                <SelectField label="Loại địa chỉ" name="type" value={formData.type} onChange={handleInputChange}>
                  <option>Nhà riêng</option>
                  <option>Cơ quan</option>
                </SelectField>
              </div>
            </div>

            <CheckRow label="Đặt làm địa chỉ mặc định" name="isDefault"
              checked={formData.isDefault} onChange={handleInputChange} />

            <div className="pv-actions">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
              <Button type="submit" loading={saving}>{saving ? 'Đang lưu...' : 'Lưu địa chỉ'}</Button>
            </div>
          </form>
        </Card>
      ) : loading ? (
        <>
          <Skeleton height={120} />
          <Skeleton height={120} />
        </>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<FaMapMarkerAlt />}
          title="Bạn chưa lưu địa chỉ nào"
          text="Thêm địa chỉ để lần sau đặt hàng không phải nhập lại."
          action={<Button icon={<FaPlus />} onClick={handleOpenAdd}>Thêm địa chỉ đầu tiên</Button>}
        />
      ) : (
        <div className="pv-addr-list">
          {addresses.map(addr => (
            <article key={addr.id} className={`pv-addr${addr.isDefault ? ' default' : ''}`}>
              <div className="pv-addr-main">
                <div className="pv-addr-who">
                  <b>{addr.name}</b>
                  <span>|</span>
                  <span>{addr.phone}</span>
                </div>
                <p className="pv-addr-line">{addr.address}, {addr.city}</p>
                <div className="pv-addr-tags">
                  <Badge>{addr.type}</Badge>
                  {addr.isDefault && <Badge tone="orange" icon={<FaCheck size={10} />}>Mặc định</Badge>}
                </div>
              </div>

              <div className="pv-addr-actions">
                <Button variant="soft" size="sm" icon={<FaEdit />} onClick={() => handleOpenEdit(addr)}>Sửa</Button>
                {!addr.isDefault && (
                  <>
                    <Button variant="danger" size="sm" icon={<FaTrash />} onClick={() => handleDelete(addr.id)}>Xóa</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(addr.id)}>Đặt mặc định</Button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
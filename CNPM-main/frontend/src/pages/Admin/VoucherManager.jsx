import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag,
  FiToggleLeft, FiToggleRight, FiCalendar, FiPercent, FiDollarSign
} from 'react-icons/fi';

const API = 'http://localhost:5237/api';

// ---- Badge hiển thị loại khách hàng ----
const UserTypeBadge = ({ type }) => {
  const map = {
    All:    { label: 'Tất cả',     cls: 'bg-blue-50 text-blue-600' },
    Newbie: { label: 'Khách mới',  cls: 'bg-green-50 text-green-600' },
    VIP:    { label: 'VIP',        cls: 'bg-amber-50 text-amber-600' },
  };
  const { label, cls } = map[type] || map['All'];
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
};

// ---- Badge hiển thị loại giảm giá ----
const DiscountBadge = ({ type, value }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
    type === 'percent' ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-teal-600'
  }`}>
    {type === 'percent' ? <FiPercent className="w-3 h-3" /> : <FiDollarSign className="w-3 h-3" />}
    {type === 'percent' ? `${value}%` : `${Number(value).toLocaleString('vi-VN')}đ`}
  </span>
);

// ============================
// ---- Modal Thêm/Sửa Voucher ----
// ============================
const VoucherModal = ({ voucher, categories, products, onClose, onSaved }) => {
  const isEdit = !!voucher?.id;

  const [form, setForm] = useState({
    code: voucher?.code || '',
    discountType: voucher?.discountType || 'fixed',
    discountValue: voucher?.discountValue || '',
    maxDiscountLimit: voucher?.maxDiscountLimit || '',
    minOrderValue: voucher?.minOrderValue || 0,
    usageLimit: voucher?.usageLimit || 100,
    expirationDate: voucher?.expirationDate
      ? new Date(voucher.expirationDate).toISOString().slice(0, 10)
      : '',
    isActive: voucher?.isActive ?? true,
    // Điều kiện áp dụng
    targetUserType: voucher?.targetUserType || 'All',
    applicableScope: voucher?.applicableProductId ? 'product'
      : (voucher?.applicableCategoryId ? 'category' : 'all'),
    applicableCategoryId: voucher?.applicableCategoryId || '',
    applicableProductId: voucher?.applicableProductId || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { setError('Mã voucher không được để trống'); return; }
    if (!form.discountValue) { setError('Vui lòng nhập giá trị giảm'); return; }
    if (!form.expirationDate) { setError('Vui lòng chọn ngày hết hạn'); return; }
    setSaving(true);
    setError('');

    // Build payload — chỉ gửi đúng ID scope đã chọn
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscountLimit: form.maxDiscountLimit ? Number(form.maxDiscountLimit) : null,
      minOrderValue: Number(form.minOrderValue),
      usageLimit: Number(form.usageLimit),
      expirationDate: new Date(form.expirationDate).toISOString(),
      applicableCategoryId: form.applicableScope === 'category' ? Number(form.applicableCategoryId) || null : null,
      applicableProductId: form.applicableScope === 'product' ? Number(form.applicableProductId) || null : null,
    };

    try {
      if (isEdit) {
        await axios.put(`${API}/vouchers/${voucher.id}`, payload);
      } else {
        await axios.post(`${API}/vouchers`, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit ? '✏️ Chỉnh sửa voucher' : '🎫 Thêm voucher mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* ==== Thông tin cơ bản ==== */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">
              📋 Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mã voucher */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Mã voucher <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="VD: PETLOVE20"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Loại giảm giá */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại giảm giá</label>
                <div className="flex gap-2">
                  {[
                    { val: 'fixed', label: 'Số tiền cố định', icon: '💰' },
                    { val: 'percent', label: 'Phần trăm (%)', icon: '📊' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('discountType', opt.val)}
                      className={`flex-1 text-xs font-semibold py-2.5 px-3 rounded-xl border-2 transition ${
                        form.discountType === opt.val
                          ? 'border-orange-400 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Giá trị giảm */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Giá trị giảm {form.discountType === 'percent' ? '(%)' : '(VNĐ)'}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={form.discountType === 'percent' ? 100 : undefined}
                  value={form.discountValue}
                  onChange={(e) => set('discountValue', e.target.value)}
                  placeholder={form.discountType === 'percent' ? 'VD: 20' : 'VD: 50000'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Giảm tối đa (chỉ hiện khi là %) */}
              {form.discountType === 'percent' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscountLimit}
                    onChange={(e) => set('maxDiscountLimit', e.target.value)}
                    placeholder="VD: 100000 (để trống = không giới hạn)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              )}

              {/* Đơn hàng tối thiểu */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Đơn hàng tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderValue}
                  onChange={(e) => set('minOrderValue', e.target.value)}
                  placeholder="VD: 200000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Hạn sử dụng */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <FiCalendar className="inline mr-1" /> Ngày hết hạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.expirationDate}
                  onChange={(e) => set('expirationDate', e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Giới hạn lượt dùng */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  min={1}
                  value={form.usageLimit}
                  onChange={(e) => set('usageLimit', e.target.value)}
                  placeholder="100"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* ==== Điều kiện áp dụng ==== */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">
              🎯 Điều kiện áp dụng
            </h4>
            <div className="space-y-4">
              {/* Đối tượng khách hàng */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Đối tượng khách hàng</label>
                <div className="flex gap-2">
                  {[
                    { val: 'All',    label: 'Tất cả',     emoji: '👥' },
                    { val: 'Newbie', label: 'Khách mới',  emoji: '🌱' },
                    { val: 'VIP',    label: 'Khách VIP',  emoji: '👑' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('targetUserType', opt.val)}
                      className={`flex-1 text-xs font-semibold py-2 px-3 rounded-xl border-2 transition ${
                        form.targetUserType === opt.val
                          ? 'border-orange-400 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {form.targetUserType === 'Newbie' && '⚡ Khách mới = chưa có đơn hàng nào được giao'}
                  {form.targetUserType === 'VIP' && '⚡ Khách VIP = có ≥5 đơn đã giao hoặc role VIP'}
                </p>
              </div>

              {/* Phạm vi sản phẩm áp dụng */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Áp dụng cho</label>
                <div className="flex gap-2 mb-3">
                  {[
                    { val: 'all',      label: 'Toàn shop',           emoji: '🛒' },
                    { val: 'category', label: 'Danh mục cụ thể',     emoji: '📂' },
                    { val: 'product',  label: 'Sản phẩm cụ thể',     emoji: '📦' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('applicableScope', opt.val)}
                      className={`flex-1 text-xs font-semibold py-2 px-2 rounded-xl border-2 transition ${
                        form.applicableScope === opt.val
                          ? 'border-orange-400 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>

                {/* Dropdown Danh mục */}
                {form.applicableScope === 'category' && (
                  <select
                    value={form.applicableCategoryId}
                    onChange={(e) => set('applicableCategoryId', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}

                {/* Dropdown Sản phẩm */}
                {form.applicableScope === 'product' && (
                  <select
                    value={form.applicableProductId}
                    onChange={(e) => set('applicableProductId', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Trạng thái hoạt động */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Kích hoạt voucher</span>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  className={`text-2xl transition-colors ${form.isActive ? 'text-green-500' : 'text-gray-300'}`}
                >
                  {form.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>
            </div>
          </div>

          {/* Nút Submit */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md shadow-orange-300/40 disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================
// ---- Main VoucherManager ----
// ============================
const VoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Lấy dữ liệu cần thiết khi mount
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes, pRes] = await Promise.all([
        axios.get(`${API}/vouchers`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/admin/products?limit=200`, authHeader),
      ]);
      setVouchers(vRes.data.data || []);
      setCategories(cRes.data);
      setProducts(pRes.data.data?.items || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = () => { setModalOpen(false); fetchAll(); };
  const handleEdit = (v) => { setEditTarget(v); setModalOpen(true); };
  const handleAdd = () => { setEditTarget(null); setModalOpen(true); };

  const handleDelete = async (v) => {
    if (!window.confirm(`Xóa voucher "${v.code}"?`)) return;
    try {
      await axios.delete(`${API}/vouchers/${v.id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Định dạng ngày hết hạn
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  // Kiểm tra hết hạn
  const isExpired = (d) => new Date(d) < new Date();

  // Lọc theo từ khóa
  const filtered = vouchers.filter(v =>
    v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="admin-page-title mb-0">Quản lý Khuyến mãi</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-orange-300/40 transition"
        >
          <FiPlus className="text-lg" /> Thêm voucher
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã voucher..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Bảng voucher */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🎫</div>
            {search ? 'Không tìm thấy voucher phù hợp' : 'Chưa có voucher nào'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4">Mã / Giá trị</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4 hidden md:table-cell">Điều kiện</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4 hidden lg:table-cell">Đối tượng</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4">Lượt dùng</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4 hidden md:table-cell">Hạn dùng</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4">Trạng thái</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((v) => {
                  const expired = isExpired(v.expirationDate);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Mã + giá trị */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FiTag className="text-orange-400 flex-shrink-0" />
                          <div>
                            <p className="font-black text-gray-800 text-sm tracking-wide">{v.code}</p>
                            <div className="mt-1">
                              <DiscountBadge type={v.discountType} value={v.discountValue} />
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Điều kiện */}
                      <td className="px-5 py-4 text-xs text-gray-500 hidden md:table-cell">
                        <div>Đơn tối thiểu: <span className="font-semibold text-gray-700">{Number(v.minOrderValue).toLocaleString('vi-VN')}đ</span></div>
                        {v.maxDiscountLimit && (
                          <div>Giảm tối đa: <span className="font-semibold text-gray-700">{Number(v.maxDiscountLimit).toLocaleString('vi-VN')}đ</span></div>
                        )}
                      </td>
                      {/* Đối tượng */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <UserTypeBadge type={v.targetUserType || 'All'} />
                        {v.applicableCategoryId && (
                          <div className="text-xs text-gray-400 mt-1">
                            📂 {categories.find(c => c.id === v.applicableCategoryId)?.name || `Cat #${v.applicableCategoryId}`}
                          </div>
                        )}
                        {v.applicableProductId && (
                          <div className="text-xs text-gray-400 mt-1">
                            📦 {products.find(p => p.id === v.applicableProductId)?.name || `Sản phẩm #${v.applicableProductId}`}
                          </div>
                        )}
                      </td>
                      {/* Lượt dùng */}
                      <td className="px-5 py-4 text-center text-sm">
                        <span className="font-bold text-gray-700">{v.usedCount}</span>
                        <span className="text-gray-400">/{v.usageLimit}</span>
                      </td>
                      {/* Hạn dùng */}
                      <td className="px-5 py-4 text-xs hidden md:table-cell">
                        <span className={expired ? 'text-red-400 font-semibold' : 'text-gray-500'}>
                          {formatDate(v.expirationDate)}
                          {expired && ' (hết hạn)'}
                        </span>
                      </td>
                      {/* Trạng thái */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          v.isActive && !expired
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${v.isActive && !expired ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {v.isActive && !expired ? 'Hoạt động' : expired ? 'Hết hạn' : 'Tắt'}
                        </span>
                      </td>
                      {/* Thao tác */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(v)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <VoucherModal
          voucher={editTarget}
          categories={categories}
          products={products}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default VoucherManager;

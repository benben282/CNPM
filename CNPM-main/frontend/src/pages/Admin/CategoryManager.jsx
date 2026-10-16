import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight, FiImage, FiGrid } from 'react-icons/fi';

const API = 'http://localhost:5237/api';

// ---- Modal Thêm/Sửa Danh Mục ----
const CategoryModal = ({ category, onClose, onSaved }) => {
  const isEdit = !!category?.id;
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    imageUrl: category?.imageUrl || '',
    isActive: category?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Tự động tạo slug từ name khi nhập
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({
      ...f,
      name,
      // Chỉ auto-gen slug nếu người dùng chưa tự nhập
      slug: f.slug === generateSlug(f.name) || f.slug === '' ? generateSlug(name) : f.slug,
    }));
  };

  // Hàm tạo slug đơn giản phía frontend
  const generateSlug = (str) =>
    str.toLowerCase()
      .replace(/[àáảãạăắằẳẵặâấầẩẫậ]/g, 'a')
      .replace(/[đ]/g, 'd')
      .replace(/[èéẻẽẹêếềểễệ]/g, 'e')
      .replace(/[ìíỉĩị]/g, 'i')
      .replace(/[òóỏõọôốồổỗộơớờởỡợ]/g, 'o')
      .replace(/[ùúủũụưứừửữự]/g, 'u')
      .replace(/[ỳýỷỹỵ]/g, 'y')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Tên danh mục không được để trống'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await axios.put(`${API}/categories/${category.id}`, form);
      } else {
        await axios.post(`${API}/categories`, form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit ? '✏️ Chỉnh sửa danh mục' : '➕ Thêm danh mục mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={handleNameChange}
              placeholder="VD: Thức ăn cho Chó"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="thuc-an-cho-cho"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Tự động tạo từ tên, hoặc nhập thủ công</p>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về danh mục..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            />
          </div>

          {/* URL Ảnh */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <FiImage className="inline mr-1" /> URL Ảnh đại diện
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            {/* Preview ảnh */}
            {form.imageUrl && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Trạng thái */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Hiển thị danh mục</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`text-2xl transition-colors ${form.isActive ? 'text-green-500' : 'text-gray-300'}`}
            >
              {form.isActive ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>

          {/* Nút Submit */}
          <div className="flex gap-3 pt-2">
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
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================
// ---- Main Component ----
// ============================
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = tạo mới, object = sửa

  // Lấy danh sách danh mục từ API
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Mở modal sửa
  const handleEdit = (cat) => { setEditTarget(cat); setModalOpen(true); };

  // Mở modal thêm mới
  const handleAdd = () => { setEditTarget(null); setModalOpen(true); };

  // Đóng modal và reload danh sách
  const handleSaved = () => { setModalOpen(false); fetchCategories(); };

  // Xóa danh mục
  const handleDelete = async (cat) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?\n\nNếu danh mục đang có sản phẩm, nó sẽ chuyển sang trạng thái Ẩn thay vì xóa cứng.`)) return;
    try {
      await axios.delete(`${API}/categories/${cat.id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="admin-page-title mb-0">Quản lý Danh mục</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-orange-300/40 transition"
        >
          <FiPlus className="text-lg" /> Thêm danh mục
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Bảng danh mục */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📂</div>
            {search ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Danh mục</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Slug</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Mô tả</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Trạng thái</th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Tên + ảnh */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400 flex-shrink-0">
                            <FiGrid className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                      </div>
                    </td>
                    {/* Slug */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{cat.slug || '—'}</code>
                    </td>
                    {/* Mô tả */}
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    {/* Trạng thái */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                        cat.isActive !== false
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {cat.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    {/* Thao tác */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <CategoryModal
          category={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default CategoryManager;

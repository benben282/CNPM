import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import './Admin.css';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, originalPrice: 0,
    imageUrl: '', stock: 0, categoryId: 1, isActive: true
  });

  // For simplified UI, using generic states for adding/editing items
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5237/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5237/api/admin/products?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success !== undefined) {
        setProducts(res.data.data.items || []);
      } else {
        setProducts(res.data || []);
      }
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5237/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.message) {
        alert(res.data.message);
        setProducts(products.map(p => p.id === id ? { ...p, isActive: false } : p));
      } else {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      alert('Xoá thất bại: Gặp lỗi hệ thống hoặc ràng buộc dữ liệu.');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0, originalPrice: 0, imageUrl: '', stock: 0, categoryId: categories[0]?.id || 1, isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || 0,
      imageUrl: p.imageUrl, stock: p.stock, categoryId: p.categoryId, isActive: p.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingProduct) {
        const res = await axios.put(`http://localhost:5237/api/admin/products/${editingProduct.id}`, formData, config);
        const updatedProduct = res.data.success !== undefined ? res.data.data : res.data;
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        const res = await axios.post('http://localhost:5237/api/admin/products', formData, config);
        const newProduct = res.data.success !== undefined ? res.data.data : res.data;
        setProducts([newProduct, ...products]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu sản phẩm!');
      console.error(err);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5">
          <FiPlus className="w-5 h-5" /> Thêm Sản Phẩm
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              className="w-full pl-12 pr-6 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 text-lg transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-6 font-semibold">ID</th>
                <th className="p-6 font-semibold">Sản phẩm</th>
                <th className="p-6 font-semibold">Giá Bán</th>
                <th className="p-6 font-semibold">Tồn kho</th>
                <th className="p-6 font-semibold">Trạng thái</th>
                <th className="p-6 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chưa có sản phẩm nào.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-orange-50/50 transition-colors group">
                    <td className="p-6 text-gray-500 font-semibold text-lg">#{p.id}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={p.imageUrl || "https://placehold.co/100x100?text=No+Image"} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-100" />
                        <div>
                          <p className="font-bold text-lg text-gray-800 line-clamp-2">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-bold text-orange-600 text-xl">{formatCurrency(p.price)}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock} Có Sẵn
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${p.isActive ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                        {p.isActive ? 'Đang Bán' : 'Tạm Ẩn'}
                      </span>
                    </td>
                    <td className="p-6 flex items-center justify-center gap-3">
                      <button onClick={() => openEditModal(p)} className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                        <FiEdit2 className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2 className="admin-page-title">{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <FiTrash2 className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="md:col-span-2">
                  <label className="admin-form-label">Tên sản phẩm *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="admin-form-input" placeholder="Nhập tên SP..." />
                </div>
                <div>
                  <label className="admin-form-label">Giá bán (VNĐ) *</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="admin-form-input" />
                </div>
                <div>
                  <label className="admin-form-label">Giá gốc (Tùy chọn)</label>
                  <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} className="admin-form-input" />
                </div>
                <div>
                  <label className="admin-form-label">Hàng tồn kho *</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="admin-form-input" />
                </div>
                <div>
                  <label className="admin-form-label">Danh mục *</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})} className="admin-form-input cursor-pointer bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="admin-form-label">Đường dẫn hình ảnh (URL)</label>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="admin-form-input" placeholder="/images/san_pham.png" />
                </div>
                <div className="md:col-span-2">
                  <label className="admin-form-label">Mô tả sản phẩm</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="admin-form-input resize-none" placeholder="Viết mô tả cho sản phẩm này..."></textarea>
                </div>
                <div className="md:col-span-2 admin-form-checkbox-wrapper">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-6 h-6 accent-orange-500 cursor-pointer" />
                  <label htmlFor="isActive" className="text-gray-800 font-bold text-lg cursor-pointer select-none">Sản phẩm đang bán (Hiện trên web / Ẩn)</label>
                </div>
              </div>
              <div className="pt-10 border-t border-gray-100 flex justify-end gap-6 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary px-8 py-4 rounded-none text-lg">Hủy</button>
                <button type="submit" className="admin-btn-primary px-10 py-4 rounded-none text-lg">Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;

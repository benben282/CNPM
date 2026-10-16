import React from 'react';

export default function Sidebar({ categories, filters, setFilters }) {
  const handleCategoryChange = (catId) => {
    if (filters.categoryId === catId) {
      setFilters(prev => ({ ...prev, categoryId: null }));
    } else {
      setFilters(prev => ({ ...prev, categoryId: catId }));
    }
  };

  return (
    <aside className="sidebar">
      <h3>BỘ LỌC</h3>

      <div className="filter-group">
        <h4>DANH MỤC</h4>
        {categories.map(cat => (
          <label key={cat.id}>
            <input
              type="checkbox"
              checked={filters.categoryId === cat.id}
              onChange={() => handleCategoryChange(cat.id)}
            />
            {cat.name}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>KHOẢNG GIÁ</h4>
        <input
          type="range"
          min="0"
          max="1000000"
          step="50000"
          value={filters.maxPrice || 1000000}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
        />
        <div className="price-display">
          Dưới {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(filters.maxPrice || 1000000)}
        </div>
      </div>
    </aside>
  );
}

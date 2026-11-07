import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Banner from '../components/Banner';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import PromotionsScroll from '../components/PromotionsScroll';
import { getProducts, getCategories } from '../services/api';
import { FaSortAmountDown } from 'react-icons/fa';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState({
    categoryId: null,
    maxPrice: 1000000
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [catsRes, prodsRes] = await Promise.all([
          getCategories(),
          getProducts(filters.categoryId, searchQuery)
        ]);
        if (catsRes.data) setCategories(catsRes.data);
        if (prodsRes.data) setProducts(prodsRes.data);
      } catch (err) {
        console.error("Lỗi fetch data:", err);
        setError('Không thể kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters.categoryId, searchQuery, retryKey]);


  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location, loading]);

  const filteredProducts = (() => {
    let list = products.filter(p => !filters.maxPrice || p.price <= filters.maxPrice);
    switch (sortBy) {
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'name-az': return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      default: return list;
    }
  })();

  const SortBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0, justifyContent: 'flex-end' }}>
      <FaSortAmountDown style={{ color: 'var(--text-muted)' }} />
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        style={{
          padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
          background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', outline: 'none'
        }}
      >
        <option value="default">Mặc định</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
        <option value="name-az">Tên A → Z</option>
      </select>
    </div>
  );

  const renderProductGrid = (productList, title, id) => (
    <div className="products-frame" id={id} style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <SortBar />
      </div>
      {productList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
          Không có sản phẩm nào.
        </div>
      ) : (
        <div className="product-grid">
          {productList.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="container main-layout" style={{ display: 'block' }}>
      {!searchQuery && <Banner />}

      {/* SẢN PHẨM MỚI RA MẮT */}
      {!searchQuery && !loading && products.length > 0 && (
        <div style={{ margin: '40px 0 50px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '2px solid #fff3e0', paddingBottom: 10 }}>
            <h2 style={{ fontSize: '1.8rem', color: '#ea580c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2rem' }}>✨</span> SẢN PHẨM MỚI RA MẮT
            </h2>
          </div>
          <div className="product-grid">
            {[...products]
              .sort((a, b) => b.id - a.id) // Sắp xếp theo ID giảm dần (Sản phẩm mới nhất lên đầu)
              .slice(0, 4) // Lấy 4 sản phẩm mới nhất
              .map(product => (
                <ProductCard key={`new-${product.id}`} product={product} />
              ))
            }
          </div>
        </div>
      )}
      {searchQuery && (
        <div style={{ padding: '20px 0 10px', fontSize: '1rem', color: 'var(--text-muted)' }}>
          Kết quả tìm kiếm cho: <strong style={{ color: 'var(--text)' }}>"{searchQuery}"</strong>
          {' – '}<span style={{ color: 'var(--primary)', fontWeight: 700 }}>{filteredProducts.length} sản phẩm</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px' }}>
        <Sidebar categories={categories} filters={filters} setFilters={setFilters} />

        <div className="main-products-content">
          {loading ? (
            <div className="products-frame">
              <h2>ĐANG TẢI...</h2>
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="product-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                    <div className="skeleton-box" style={{ height: '190px' }}></div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="skeleton-box" style={{ height: '20px', width: '80%' }}></div>
                      <div className="skeleton-box" style={{ height: '24px', width: '50%' }}></div>
                      <div className="skeleton-box" style={{ height: '14px', width: '100%', marginTop: 'auto' }}></div>
                      <div className="skeleton-box" style={{ height: '40px', width: '100%', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="products-frame" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔌</div>
              <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Không thể tải sản phẩm</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
              <button
                className="btn-primary"
                onClick={() => setRetryKey(k => k + 1)}
                style={{ margin: '0 auto', display: 'inline-flex' }}
              >
                🔄 Thử lại
              </button>
            </div>
          ) : searchQuery ? (

            renderProductGrid(filteredProducts, `Tìm kiếm: "${searchQuery}"`)
          ) : filters.categoryId ? (
            renderProductGrid(
              filteredProducts,
              `SẢN PHẨM ${categories.find(c => c.id === filters.categoryId)?.name || ''}`
            )
          ) : (
            <>
              {renderProductGrid(
                filteredProducts.filter(p => p.categoryId === 1),
                'SẢN PHẨM CHO CHÓ',
                'cho-cho'
              )}
              {renderProductGrid(
                filteredProducts.filter(p => p.categoryId === 2),
                'SẢN PHẨM CHO MÈO',
                'cho-meo'
              )}
              {renderProductGrid(
                filteredProducts.filter(p => p.categoryId === 3),
                'VỆ SINH & CHĂM SÓC',
                've-sinh'
              )}
              {renderProductGrid(
                filteredProducts.filter(p => p.categoryId === 4),
                'ĐỒ CHƠI & PHỤ KIỆN',
                'do-choi'
              )}
            </>
          )}
        </div>
      </div>

      <PromotionsScroll />
    </main>
  );
}

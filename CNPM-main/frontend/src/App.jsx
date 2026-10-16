
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import ToastContainer from './components/ToastContainer';
import CartPanel from './components/CartPanel';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { useState } from 'react';

// Admin Pages
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import ProductsList from './pages/Admin/ProductsList';
import OrdersList from './pages/Admin/OrdersList';
import UsersList from './pages/Admin/UsersList';
import CategoryManager from './pages/Admin/CategoryManager';
import VoucherManager from './pages/Admin/VoucherManager';

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLogin = () => { setRegisterOpen(false); setLoginOpen(true); };
  const openRegister = () => { setLoginOpen(false); setRegisterOpen(true); };

  const Storefront = () => (
    <>
      <Header openLogin={openLogin} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<Navigate to="/profile?tab=orders" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
      <Footer />
      <ToastContainer />
      <CartPanel />
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} openRegister={openRegister} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} openLogin={openLogin} />}
    </>
  );

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="users" element={<UsersList />} />
        <Route path="vouchers" element={<VoucherManager />} />
      </Route>

      {/* Storefront Routes */}
      <Route path="*" element={<Storefront />} />
    </Routes>
  );
}

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useCart } from './context/CartContext';
import './App.css';

function App() {
  const { toastMsg, showToast } = useCart();
  
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/product/:id/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Global Toast Notification */}
      <div className={`global-toast ${showToast ? 'show' : ''}`}>
        <span style={{marginRight: '8px'}}>✅</span>
        {toastMsg}
      </div>
    </div>
  );
}

export default App;

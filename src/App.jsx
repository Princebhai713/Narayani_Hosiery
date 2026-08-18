import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useCart } from './context/CartContext';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  const { toastMsg, showToast } = useCart();
  
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>}>
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
        </Suspense>
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

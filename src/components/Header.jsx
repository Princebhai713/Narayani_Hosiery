import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import './Header.css';

function Header() {
  const { cartItems, isAuthenticated, currentUser, logout } = useCart();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const navigate = useNavigate();

  // Search logic
  const searchResults = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo-section">
          <h2>Narayani Hosiery</h2>
          <div className="pincode-selector">
            <span className="pincode-text">Deliver to: <strong>Maharajganj, UP</strong></span>
          </div>
        </Link>
        
        <div className="search-section" style={{position: 'relative'}}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for 'Kids', 'Vest', 'Underwear'" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSearchDropdown(true);
            }}
            onBlur={() => {
              // Delay hiding to allow clicking items
              setTimeout(() => setShowSearchDropdown(false), 200);
            }}
          />
          <button className="search-btn">
            <svg width="20" height="20" viewBox="0 0 17 18" xmlns="http://www.w3.org/2000/svg">
              <g fill="#2874F1" fillRule="evenodd">
                <path d="m11.618 9.897l4.225 4.212c.092.09.1.23.02.313l-1.465 1.46c-.08.08-.222.072-.314-.02L9.868 11.66M6.486 10.9c-2.42 0-4.38-1.956-4.38-4.368C2.105 4.12 4.065 2.164 6.486 2.164c2.42 0 4.38 1.956 4.38 4.368 0 2.413-1.96 4.368-4.38 4.368m0-10.835C2.9 .065 0 2.96 0 6.533 0 10.105 2.9 13 6.486 13s6.487-2.895 6.487-6.467c0-3.572-2.9-6.468-6.487-6.468"></path>
              </g>
            </svg>
          </button>

          {showSearchDropdown && (
            <div className="search-dropdown card">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 5).map(product => {
                  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                  return (
                    <div 
                      key={product.id} 
                      className="search-item"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      <img src={images?.[0]} alt="" width="40" height="40" style={{objectFit: 'contain', marginRight: '12px'}} />
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={{fontSize: '14px', color: '#212121'}}>{product.name}</span>
                        <span style={{fontSize: '12px', color: '#878787'}}>in {product.category}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{padding: '16px', color: '#878787'}}>No products found</div>
              )}
            </div>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated && currentUser ? (
            <button className="profile-btn" onClick={() => navigate('/profile')}>
              <span className="dropdown-icon" style={{marginRight: '8px', fontSize: '14px'}}>👤</span>
              {currentUser.name.split(' ')[0]}
            </button>
          ) : (
            <Link to="/login" className="login-btn" style={{textDecoration: 'none'}}>Login</Link>
          )}

          <Link to="/cart" className="cart-btn">
            <div className="cart-icon-wrapper">
              <svg viewBox="0 0 16 16" width="18" height="18" fill="white">
                <path d="M15.32 2.405H4.887C3 2.405 2.46.805 2.46.805L2.257.21C2.208.085 2.083 0 1.946 0H.336C.1 0-.064.24.024.46l.644 1.945L3.11 9.767c.047.137.175.23.32.23h8.418l-.493 1.958H3.768l.002.003c-.017 0-.033-.003-.05-.003-1.06 0-1.92.86-1.92 1.92s.86 1.92 1.92 1.92c.99 0 1.805-.75 1.91-1.712l5.55.076c.12.922.91 1.636 1.867 1.636 1.04 0 1.885-.844 1.885-1.885 0-.866-.584-1.593-1.38-1.814l2.423-8.832c.12-.433-.206-.86-.655-.86" />
              </svg>
              {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
            </div>
            <span>Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Profile.css';

function Profile() {
  const { currentUser, logout, login, isAuthenticated } = useCart();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    gstin: currentUser?.gstin || '',
    address: currentUser?.address || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Redirect to login if not authenticated
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.id}/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        login(data.user); // Update context and localStorage
        alert('Profile updated successfully');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <div className="profile-page container">
      <div className="profile-layout">
        
        {/* Sidebar */}
        <div className="profile-sidebar card">
          <div className="profile-header-sm">
            <div className="avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="greeting">Hello,</div>
              <div className="user-name">{currentUser.name}</div>
            </div>
          </div>
          
          <ul className="profile-nav">
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <span className="icon">📦</span> My Orders
            </li>
            <li className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>
              <span className="icon">👤</span> Business Details
            </li>
            <li onClick={handleLogout} className="logout-btn-li">
              <span className="icon">🚪</span> Logout
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          
          {activeTab === 'orders' && (
            <div className="orders-section card">
              <h2 style={{padding: '24px', borderBottom: '1px solid var(--border-color)'}}>My Orders</h2>
              <div className="orders-list">
                {loadingOrders ? (
                  <p style={{padding: '24px'}}>Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <div className="no-orders">
                    <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/empty-orders_9ffeb9.png" alt="No Orders" width="200" />
                    <p>You have no orders yet!</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>Shop Now</button>
                  </div>
                ) : (
                  orders.map(order => {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    const date = new Date(order.created_at).toLocaleDateString();
                    return (
                      <div key={order.id} className="order-item-block">
                        <div className="order-item-header d-flex justify-between">
                          <span className="order-id">Order ID: #{order.id}</span>
                          <span className="order-date">{date}</span>
                        </div>
                        <div className="order-items-preview">
                          {items.map((item, i) => (
                            <div key={i} className="order-product-row">
                              <img src={item.images ? item.images[0] : item.image} alt={item.name} />
                              <div className="order-product-details">
                                <p className="p-name">{item.name}</p>
                                <p className="p-qty">Qty: {item.quantity} Pcs</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="order-item-footer d-flex justify-between align-center">
                          <span className="order-total">Total: ₹{order.total_amount}</span>
                          <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-section card">
              <h2 style={{padding: '24px', borderBottom: '1px solid var(--border-color)'}}>Business Information</h2>
              <form onSubmit={handleSaveProfile} className="profile-form">
                
                <div className="floating-input-group">
                  <input type="text" name="name" className="floating-input" value={formData.name} onChange={handleInputChange} required />
                  <label className="floating-label">Full Name / Shop Name</label>
                </div>
                
                <div className="floating-input-group" style={{marginTop: '24px'}}>
                  <input type="tel" name="phone" className="floating-input" value={formData.phone} disabled style={{backgroundColor: '#f1f3f6'}} />
                  <label className="floating-label">Phone Number (Verified)</label>
                </div>

                <div className="floating-input-group" style={{marginTop: '24px'}}>
                  <input type="text" name="gstin" className="floating-input" value={formData.gstin} onChange={handleInputChange} />
                  <label className="floating-label">GSTIN (Optional)</label>
                </div>

                <div className="floating-input-group" style={{marginTop: '24px'}}>
                  <textarea name="address" className="floating-input" value={formData.address} onChange={handleInputChange} rows="3" required></textarea>
                  <label className="floating-label">Complete Delivery Address</label>
                </div>

                <button type="submit" className="btn-primary" style={{marginTop: '32px', width: 'auto', padding: '12px 32px'}} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;

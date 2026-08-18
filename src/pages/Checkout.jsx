import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './Checkout.css';

function Checkout() {
  const { cartItems, clearCart, updateQuantity, removeFromCart, isAuthenticated, currentUser, login } = useCart(); 
  const [loginStep, setLoginStep] = useState(1); 
  const [activeStep, setActiveStep] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [addressData, setAddressData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });

  const totalBaseNet = cartItems.reduce((acc, item) => acc + (item.netRate * item.quantity), 0);
  const totalGST = totalBaseNet * 0.05;
  const totalWeightKg = cartItems.reduce((acc, item) => acc + (item.quantity * 0.2), 0);
  
  let freightCharge = totalWeightKg <= 15 ? 250 : 750;
  if (totalWeightKg === 0) freightCharge = 0;
  
  const finalAmount = totalBaseNet + totalGST + freightCharge;

  if (paymentSuccess) {
    return (
      <div className="container" style={{padding: '60px 16px', textAlign: 'center'}}>
        <div className="card" style={{padding: '40px', maxWidth: '500px', margin: '0 auto'}}>
          <div style={{color: 'green', fontSize: '48px', margin: '0 auto 16px', width: '80px', height: '80px', border: '4px solid green', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
          <h2 style={{marginBottom: '12px'}}>Order Placed Successfully!</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>
            Your B2B wholesale order has been confirmed.
            <br />Order ID: NH-{Math.floor(Math.random() * 1000000)}
          </p>
          <button className="btn-primary" onClick={() => window.location.href = '/'}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <div className="container" style={{padding: '40px'}}><p>Your cart is empty.</p></div>;
  }

  const handleContinue = async () => {
    if (activeStep === 2) setActiveStep(3);
    else if (activeStep === 3) {
      try {
        const orderData = {
          userId: currentUser.id, // Using actual logged-in user
          items: cartItems,
          totalAmount: finalAmount,
          freight: freightCharge,
          gst: totalGST,
          customerDetails: addressData
        };
        
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        
        const data = await res.json();
        
        if (data.success) {
          setPaymentSuccess(true);
          clearCart();
        } else {
          alert('Failed to place order: ' + data.error);
        }
      } catch (err) {
        console.error("Order error", err);
        alert('An error occurred while placing the order.');
      }
    }
  };

  const renderLoginModal = () => (
    <div className="modal-overlay">
      <div className="flipkart-login-modal">
        <button className="modal-close-btn" onClick={() => window.history.back()}>✕</button>
        
        <div className="login-left-pane">
          <span className="login-heading">Login</span>
          <p className="login-subheading">Get access to B2B Wholesale Rates, Orders, and faster checkout</p>
          <div className="login-illustration">
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="Login" />
          </div>
        </div>

        <div className="login-right-pane">
          {loginStep === 1 && (
            <div className="login-form-content">
              <h3 style={{marginBottom: '24px', fontSize: '14px', color: '#878787'}}>Select Business Type</h3>
              <button className="btn-b2b-option" onClick={() => setLoginStep(2)}>I have a GSTIN (GST Business)</button>
              <button className="btn-b2b-option" onClick={() => setLoginStep(3)}>I don't have a GSTIN (Upload ID)</button>
              <div className="terms-text">By continuing, you agree to Narayani Hosiery's Terms of Use and Privacy Policy.</div>
            </div>
          )}

          {loginStep === 2 && (
            <div className="login-form-content">
              <div className="floating-input-group">
                <input type="text" className="floating-input" required />
                <label className="floating-label">Enter 15-digit GSTIN</label>
              </div>
              <div className="floating-input-group" style={{marginTop: '24px'}}>
                <input type="tel" className="floating-input" required />
                <label className="floating-label">Enter Mobile Number</label>
              </div>
              <div className="terms-text">By continuing, you agree to Narayani Hosiery's Terms of Use and Privacy Policy.</div>
              <button className="btn-request-otp" onClick={() => setLoginStep(4)}>Request OTP</button>
              <button className="btn-back-link" onClick={() => setLoginStep(1)}>Go Back</button>
            </div>
          )}

          {loginStep === 3 && (
            <div className="login-form-content">
              <div className="floating-input-group">
                <input type="text" className="floating-input" required />
                <label className="floating-label">Business / Shop Name</label>
              </div>
              <div className="floating-input-group" style={{marginTop: '24px'}}>
                <input type="tel" className="floating-input" required />
                <label className="floating-label">Enter Mobile Number</label>
              </div>
              <div className="upload-box-fk" style={{marginTop: '24px'}}>
                <label>Upload Aadhar / Trade License</label>
                <input type="file" />
              </div>
              <div className="terms-text" style={{marginTop: '24px'}}>By continuing, you agree to Narayani Hosiery's Terms of Use and Privacy Policy.</div>
              <button className="btn-request-otp" onClick={() => setLoginStep(4)}>Request OTP</button>
              <button className="btn-back-link" onClick={() => setLoginStep(1)}>Go Back</button>
            </div>
          )}

          {loginStep === 4 && (
            <div className="login-form-content text-center">
              <h3 style={{marginBottom: '16px', fontSize: '14px', color: '#878787'}}>Please enter the OTP sent to your number</h3>
              <div className="floating-input-group">
                <input type="text" className="floating-input" style={{textAlign: 'center', letterSpacing: '4px', fontSize: '18px'}} maxLength="6" required />
                <label className="floating-label" style={{left: '50%', transform: 'translateX(-50%)'}}>Enter OTP</label>
              </div>
              <button className="btn-request-otp" style={{marginTop: '24px'}} onClick={() => {
                // Not fully functional from here since it's just a dummy login step,
                // but let's navigate to /login if they click this in the mock modal
                window.location.href = '/login';
              }}>Go to Login</button>
              <button className="btn-back-link" onClick={() => setLoginStep(1)}>Change Method</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <div className="checkout-page container">
      {!isAuthenticated && renderLoginModal()}
      
      <div className={`checkout-content ${!isAuthenticated ? 'blurred' : ''}`}>
        
        <div className="checkout-main">
          
          {/* Horizontal Stepper */}
          <div className="checkout-stepper card">
            <div className={`stepper-item ${activeStep >= 1 ? 'completed' : ''}`}>
              <div className="step-circle">{activeStep > 1 ? '✓' : '1'}</div>
              <div className="step-label">Address</div>
            </div>
            <div className="stepper-line"></div>
            <div className={`stepper-item ${activeStep === 2 ? 'active' : (activeStep > 2 ? 'completed' : '')}`}>
              <div className="step-circle">{activeStep > 2 ? '✓' : '2'}</div>
              <div className="step-label">Order Summary</div>
            </div>
            <div className="stepper-line"></div>
            <div className={`stepper-item ${activeStep === 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <div className="step-label">Payment</div>
            </div>
          </div>

          {activeStep === 1 && (
            <div className="address-form-card card" style={{padding: '24px'}}>
              <h3 style={{marginBottom: '16px', color: 'var(--primary-color)'}}>Delivery Address</h3>
              <form 
                style={{display: 'flex', flexDirection: 'column', gap: '16px'}}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (addressData.name && addressData.phone && addressData.address) {
                    setActiveStep(2);
                  } else {
                    alert('Please fill out all address fields');
                  }
                }}
              >
                <input type="text" placeholder="Full Name (e.g. Shop Name or Your Name)" required value={addressData.name} onChange={e => setAddressData({...addressData, name: e.target.value})} className="input-field" style={{marginBottom: '0'}} />
                <input type="tel" placeholder="Phone Number" required value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} className="input-field" style={{marginBottom: '0'}} />
                <textarea placeholder="Complete Delivery Address (with Pincode)" required value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})} className="input-field" rows="3" style={{marginBottom: '0'}}></textarea>
                <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start'}}>Save and Deliver Here</button>
              </form>
            </div>
          )}

          {activeStep === 2 && (
            <>
              {/* Deliver To Block */}
              <div className="deliver-to-card card">
                <div className="deliver-header d-flex justify-between">
                  <div>
                    <span className="deliver-label">Deliver to:</span>
                    <h3 className="deliver-name">{addressData.name}</h3>
                    <p className="deliver-address">{addressData.address}</p>
                    <p className="deliver-phone">{addressData.phone}</p>
                  </div>
                  <button className="btn-outline-small" onClick={() => setActiveStep(1)}>Change</button>
                </div>
              </div>

              {/* Order Items */}
              {cartItems.map(item => (
                <div key={item.id} className="order-item-card card d-flex">
                  <div className="order-item-img">
                    <img src={item.images ? item.images[0] : item.image} alt={item.name} />
                    <div className="qty-dropdown">
                      <select 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      >
                        {[...Array(10)].map((_, i) => {
                          const q = item.moq * (i + 1);
                          return <option key={q} value={q}>Qty: {q}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="order-item-details">
                    <h3 className="order-item-title">{item.name}</h3>
                    <div className="order-item-price-block">
                      <span className="net-price">₹{item.netRate} / pc</span>
                      <span className="moq-info">MOQ: {item.moq}</span>
                    </div>
                    <p className="delivery-date">Delivery by Aug 20, Thu</p>
                    
                    <div className="open-box-delivery">
                      <span className="open-box-icon">📦</span>
                      <span className="open-box-text">Rest assured with B2B Verified Delivery</span>
                    </div>
                    <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>REMOVE</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeStep === 3 && (
            <div className="payment-card card" style={{padding: '24px'}}>
              <h3 style={{marginBottom: '16px', color: 'var(--primary-color)'}}>Select Payment Method</h3>
              <label className="radio-label" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '4px'}}>
                <input type="radio" name="payment" defaultChecked /> 
                <strong>Razorpay (UPI, Netbanking, Cards)</strong>
              </label>
            </div>
          )}

          {activeStep >= 2 && (
            <div className="continue-block card d-flex justify-between align-center">
              <div className="continue-price">
                <span className="continue-amount-label">Total Amount:</span>
                <span className="final-price">₹{finalAmount}</span>
              </div>
              <button className="btn-continue" onClick={handleContinue}>
                {activeStep === 2 ? 'CONTINUE' : 'PAY NOW'}
              </button>
            </div>
          )}

        </div>

        <div className="checkout-sidebar">
          <div className="price-details-card card">
            <div className="price-details-header">
              <h3>Price Details</h3>
            </div>
            <div className="price-details-body">
              <div className="price-row d-flex justify-between">
                <span>Total Net Wholesale (Base)</span>
                <span>₹{totalBaseNet}</span>
              </div>
              <div className="price-row d-flex justify-between">
                <span>Estimated GST (5%)</span>
                <span>₹{totalGST}</span>
              </div>
              <div className="price-row d-flex justify-between">
                <span>Freight & Handling</span>
                <span>₹{freightCharge}</span>
              </div>
              <div className="price-row total-row d-flex justify-between">
                <span>Total Amount</span>
                <span>₹{finalAmount}</span>
              </div>
              <div className="savings-msg">
                You are purchasing at wholesale B2B rates.
              </div>
            </div>
          </div>
          
          <div className="secure-payment-badge">
            <span className="shield-icon">🛡️</span>
            <span>Safe and secure payments. Easy tracking. 100% Authentic products.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;

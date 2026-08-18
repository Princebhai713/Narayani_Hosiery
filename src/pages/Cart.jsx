import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const totalBaseNet = cartItems.reduce((acc, item) => acc + (item.netRate * item.quantity), 0);
  
  // Dynamic GST calculation (Assume 5% for all products in demo for simplicity, or grab from product)
  const gstRate = 0.05; 
  const totalGST = totalBaseNet * gstRate;

  // Logistics (Freight vs Courier based on weight). 
  // Let's assume each piece is 200 grams (0.2kg).
  const totalWeightKg = cartItems.reduce((acc, item) => acc + (item.quantity * 0.2), 0);
  
  let freightCharge = 0;
  let deliveryType = "";
  if (totalWeightKg === 0) {
    freightCharge = 0;
  } else if (totalWeightKg <= 15) {
    freightCharge = 250;
    deliveryType = "Courier (Shiprocket/Delhivery)";
  } else {
    freightCharge = 750;
    deliveryType = "Heavy Parcel - Transport / Bilty";
  }

  const finalAmount = totalBaseNet + totalGST + freightCharge;

  return (
    <div className="cart-page container">
      <div className="cart-content d-flex">
        <div className="cart-items card">
          <h2>My Cart ({cartItems.length})</h2>
          <p className="strict-policy-notice">No Coupons or Discounts Applicable. Strictly Wholesale B2B Rates.</p>
          
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            <div className="items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item d-flex">
                  <div className="item-img">
                    <img src={item.images ? item.images[0] : item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <div className="item-price">
                      ₹{item.netRate} <span>Net Rate / pc</span>
                    </div>
                    <div className="item-actions d-flex align-center mt-2">
                      <div className="qty-selector d-flex align-center">
                        <button 
                          onClick={() => {
                            if (item.quantity > item.moq) updateQuantity(item.id, item.quantity - item.moq);
                          }}
                          disabled={item.quantity <= item.moq}
                        >-</button>
                        <input type="text" value={item.quantity} readOnly />
                        <button onClick={() => updateQuantity(item.id, item.quantity + item.moq)}>+</button>
                      </div>
                      <span className="moq-info">Step: {item.moq} Pcs (MOQ)</span>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                  <div className="item-total">
                    ₹{item.netRate * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary card">
            <h3>Price Details</h3>
            
            <div className="summary-row justify-between d-flex">
              <span>Total Net Wholesale (Base)</span>
              <span>₹{totalBaseNet}</span>
            </div>
            
            <div className="summary-row justify-between d-flex">
              <span>Estimated GST (5%)</span>
              <span>₹{totalGST}</span>
            </div>

            <div className="summary-row justify-between d-flex">
              <span>
                Delivery Charge <br/>
                <small className="text-secondary">{deliveryType} (Total: {totalWeightKg.toFixed(1)}kg)</small>
              </span>
              <span>₹{freightCharge}</span>
            </div>

            <div className="summary-row total justify-between d-flex">
              <span>Total Payable</span>
              <span>₹{finalAmount}</span>
            </div>

            <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="professional-footer">
      <div className="container footer-container">
        
        <div className="footer-col">
          <h3>Narayani Hosiery</h3>
          <p className="footer-desc">
            Premium B2B wholesale supplier of Kids Wear, Men's Innerwear, and Ladies Hosiery. Supplying quality products across India.
          </p>
          <div className="contact-details">
            <p>📞 +91 9889278967</p>
            <p>📧 contact@narayanihosiery.com</p>
            <p>📍 Gorakhpur Road, Jayprakash Nagar, Maharajganj, Uttar Pradesh</p>
          </div>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/checkout">Cart</Link></li>
            <li><Link to="/admin">Admin Panel</Link></li>
            <li><a href="#">B2B Policy</a></li>
            <li><a href="#">Track Order</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Categories</h3>
          <ul>
            <li><a href="#">Kids Wear</a></li>
            <li><a href="#">Men's Innerwear</a></li>
            <li><a href="#">Ladies Hosiery</a></li>
            <li><a href="#">Winter Wear</a></li>
            <li><a href="#">Socks & Accessories</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>100% Secure B2B Platform</h3>
          <p className="footer-desc">
            We use industry standard encryption to protect your personal information. GSTIN verification mandatory for all bulk orders.
          </p>
          <div className="secure-badges">
            <span className="badge">Verified Supplier</span>
            <span className="badge">Safe Checkout</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Narayani Hosiery. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

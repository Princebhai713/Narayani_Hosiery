import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Login.css';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { login, triggerToast } = useCart();
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      setStep(2);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber })
        });
        const data = await res.json();
        
        if (data.success) {
          login(data.user);
          triggerToast("Logged in successfully!");
          navigate('/');
        } else {
          alert(data.error);
        }
      } catch (err) {
        console.error("Login failed", err);
        alert("Server error, please try again");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a valid 4-digit OTP");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container card">
        <div className="login-left">
          <h2>Login</h2>
          <p>Get access to Wholesale Net Rates, B2B Offers and your Orders</p>
          <div className="login-illustration">
            <img src="https://via.placeholder.com/200x200/2874f0/ffffff?text=Narayani+Hosiery" alt="B2B Login" />
          </div>
        </div>
        
        <div className="login-right">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="login-form">
              <div className="input-group">
                <input 
                  type="tel" 
                  required 
                  maxLength="10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                />
                <label className={phoneNumber.length > 0 ? 'active' : ''}>Enter Mobile Number</label>
              </div>
              <p className="terms-text">
                By continuing, you agree to Narayani Hosiery's <Link to="#">Terms of Use</Link> and <Link to="#">Privacy Policy</Link>.
              </p>
              <button type="submit" className="btn-primary login-submit-btn">Request OTP</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <p style={{marginBottom: '16px', fontSize: '14px', color: '#212121'}}>
                Please enter the OTP sent to <strong>+91 {phoneNumber}</strong>. <span style={{color: '#2874f0', cursor: 'pointer'}} onClick={() => setStep(1)}>Change</span>
              </p>
              <div className="input-group">
                <input 
                  type="text" 
                  required 
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <label className={otp.length > 0 ? 'active' : ''}>Enter OTP (Any 4 digits for demo)</label>
              </div>
              <button type="submit" className="btn-primary login-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )}
          
          <div className="login-footer">
            <Link to="#" className="create-account-link">New to Narayani Hosiery? Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ImageLoader from '../components/ImageLoader';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, removeFromCart, updateQuantity } = useCart();
  const { products } = useProducts();
  
  const product = products.find(p => p.id === id);
  
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedQty, setSelectedQty] = useState(product ? parseInt(product.moq) : 0);

  const images = product ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];

  useEffect(() => {
    if (product) {
      setSelectedQty(parseInt(product.moq));
      document.title = `${product.name} | Narayani Hosiery B2B`;
      
      const setMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      setMetaTag('og:title', product.name);
      setMetaTag('og:description', product.description);
      
      const imgUrl = images[0].startsWith('http') 
        ? images[0] 
        : window.location.origin + images[0];
        
      setMetaTag('og:image', imgUrl);
      setMetaTag('og:url', window.location.href);
      setMetaTag('og:type', 'product');
    }
  }, [product, images]);

  const handleBuyNow = () => {
    addToCart(product, selectedQty);
    navigate('/checkout');
  };

  if (!product) {
    return <div className="container" style={{padding: '40px'}}><h2>Product not found</h2></div>;
  }

  return (
    <div className="product-detail-page container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <span>{product.category}</span> &gt; <span>{product.name}</span>
      </div>
      
      <div className="product-detail-card card">
        <div className="product-gallery">
          <div className="thumbnails">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail ${activeImg === idx ? 'active' : ''}`}
                onMouseEnter={() => setActiveImg(idx)}
              >
                <ImageLoader src={img} alt={`Thumb ${idx}`} />
              </div>
            ))}
          </div>
          <div className="main-image" onClick={() => setIsZoomModalOpen(true)}>
            <ImageLoader src={images[activeImg]} alt={product.name} />
          </div>
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-desc">{product.description}</p>
          
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this product on Narayani Hosiery B2B!\n\n*${product.name}*\nNet Rate: ₹${product.netRate}/pc\nMOQ: ${product.moq} Pcs\n\nView details: ${window.location.href}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#25D366', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </a>
          </div>
          
          <div className="price-box">
            <span className="net-rate-label">WHOLESALE NET RATE</span>
            <div className="net-rate-price">
              ₹{product.netRate} <span className="per-pc">/ pc</span>
            </div>
            <div className="moq-badge">MOQ: {product.moq} Pieces</div>
          </div>
          
          <div className="delivery-check">
            <p><strong>Delivery</strong></p>
            <div className="pincode-input-group">
              <input type="text" placeholder="Enter Pincode" defaultValue="273303" />
              <button className="text-btn">Check</button>
            </div>
            <p className="delivery-estimate">Usually delivered in 2-4 days.</p>
          </div>

          <div className="qty-selector-block" style={{marginBottom: '24px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Select Quantity:</label>
            <select 
              value={selectedQty} 
              onChange={(e) => setSelectedQty(parseInt(e.target.value))}
              style={{padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid var(--border-color)', minWidth: '150px'}}
            >
              {[...Array(10)].map((_, i) => {
                const q = product.moq * (i + 1);
                return <option key={q} value={q}>{q} Pieces</option>;
              })}
            </select>
          </div>

          <div className="action-buttons">
            {(() => {
              const cartItem = cartItems.find(item => item.id === product.id);
              if (cartItem) {
                return (
                  <div className="qty-control-inline" style={{flex: 1, height: '56px'}}>
                    <button 
                      className="qty-btn"
                      style={{height: '100%', width: '56px', fontSize: '24px'}}
                      onClick={() => {
                        const newQty = cartItem.quantity - product.moq;
                        if (newQty <= 0) removeFromCart(product.id);
                        else updateQuantity(product.id, newQty);
                      }}
                    >-</button>
                    <span className="qty-display" style={{fontSize: '18px'}}>{cartItem.quantity} Pieces in Cart</span>
                    <button 
                      className="qty-btn"
                      style={{height: '100%', width: '56px', fontSize: '24px'}}
                      onClick={() => updateQuantity(product.id, cartItem.quantity + product.moq)}
                    >+</button>
                  </div>
                );
              } else {
                return (
                  <button className="btn-primary add-to-cart-large" onClick={() => addToCart(product, selectedQty)}>
                    <svg viewBox="0 0 16 16" width="18" height="18" fill="white" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                      <path d="M15.32 2.405H4.887C3 2.405 2.46.805 2.46.805L2.257.21C2.208.085 2.083 0 1.946 0H.336C.1 0-.064.24.024.46l.644 1.945L3.11 9.767c.047.137.175.23.32.23h8.418l-.493 1.958H3.768l.002.003c-.017 0-.033-.003-.05-.003-1.06 0-1.92.86-1.92 1.92s.86 1.92 1.92 1.92c.99 0 1.805-.75 1.91-1.712l5.55.076c.12.922.91 1.636 1.867 1.636 1.04 0 1.885-.844 1.885-1.885 0-.866-.584-1.593-1.38-1.814l2.423-8.832c.12-.433-.206-.86-.655-.86" />
                    </svg>
                    ADD TO CART
                  </button>
                );
              }
            })()}

            <button className="btn-primary buy-now-large" onClick={handleBuyNow}>
              <svg viewBox="0 0 16 16" width="18" height="18" fill="white" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1z"/>
                <path d="M2 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .48.36l1.1 3.64 2.92.51V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H9.5a1.5 1.5 0 0 1-1.39-1H7.85l-2.6.46a.5.5 0 0 1-.58-.4L3.6 2.6H2.5a.5.5 0 0 1-.5-.5z"/>
                <path d="M4.5 11.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"/>
              </svg>
              BUY NOW
            </button>
          </div>
          
          <div className="strict-policy">
            <strong>B2B Wholesale Policy:</strong> No Coupons. No Retail Buyers. Goods will only be dispatched upon full MOQ compliance and GST/ID verification.
          </div>
        </div>
      </div>

      {isZoomModalOpen && (
        <div className="image-modal-overlay">
          <button className="modal-close-btn" onClick={() => { setIsZoomModalOpen(false); setZoomLevel(1); }}>✕</button>
          
          <div className="zoom-controls">
            <button onClick={() => setZoomLevel(prev => prev + 0.5)}>+</button>
            <button onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}>-</button>
            <button onClick={() => setZoomLevel(1)}>Reset</button>
          </div>
          
          <div className="image-modal-content">
            <img 
              src={product.images[activeImg]} 
              alt={product.name} 
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;

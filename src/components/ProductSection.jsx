import React, { useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import ImageLoader from './ImageLoader';
import './ProductSection.css';

const optimizeCloudinaryUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/c_scale,w_400,f_auto,q_auto/');
};

function ProductSection({ title, products, onViewAll, isGridView }) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const scrollRef = useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  

  if (!products || products.length === 0) return null;

  return (
    <div className="product-section card">
      <div className="section-header">
        <h2>{title}</h2>
        {onViewAll && <button className="btn-primary view-all-btn" onClick={onViewAll}>View All</button>}
      </div>

      <div className="product-scroll-container">
        {!isGridView && (
          <button className="scroll-btn left" onClick={() => scroll('left')} aria-label="Scroll left">❮</button>
        )}
        
        <div className={`product-grid ${isGridView ? 'grid-view' : ''}`} ref={scrollRef}>
          {products.map(product => {
            const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}/${slug}`} className="product-image">
                  <ImageLoader 
                    src={optimizeCloudinaryUrl(product.images[0])} 
                    alt={product.name} 
                    width={168} 
                    height={168} 
                  />
                </Link>
                <div className="product-details">
                  <Link to={`/product/${product.id}/${slug}`}>
                    <h3 className="product-name">{product.name}</h3>
                  </Link>
                <div className="price-section">
                  <span className="net-rate-label">Net Wholesale Rate</span>
                  <span className="net-rate-price">₹{product.netRate} <span className="per-pc">/ pc</span></span>
                  <span className="moq-badge">MOQ: {product.moq} Pcs</span>
                </div>
                
                {(() => {
                  const cartItem = cartItems.find(item => item.id === product.id);
                  if (cartItem) {
                    return (
                      <div className="qty-control-inline">
                        <button 
                          className="qty-btn"
                          onClick={() => {
                            const newQty = cartItem.quantity - product.moq;
                            if (newQty <= 0) removeFromCart(product.id);
                            else updateQuantity(product.id, newQty);
                          }}
                          aria-label="Decrease quantity"
                        >-</button>
                        <span className="qty-display">{cartItem.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(product.id, cartItem.quantity + product.moq)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                    );
                  } else {
                    return (
                      <button 
                        className="btn-primary add-to-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    );
                  }
                })()}

              </div>
            </div>
            );
          })}
        </div>
        
        {!isGridView && (
          <button className="scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll right">❯</button>
        )}
      </div>
    </div>
  );
}

export default ProductSection;

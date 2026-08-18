import React, { useState, useEffect } from 'react';
import './HeroSlider.css';

const BANNER_IMAGES = [
  "https://via.placeholder.com/1200x280/2874f0/ffffff?text=Summer+Collection+-+Wholesale+Net+Rates",
  "https://via.placeholder.com/1200x280/e58f00/ffffff?text=Mega+Stock+Clearance+-+No+Minimum+Order",
  "https://via.placeholder.com/1200x280/212121/ffffff?text=100%25+Original+Brands+-+Direct+from+Mill"
];

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-slider">
      <div 
        className="slider-track" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {BANNER_IMAGES.map((img, idx) => (
          <img key={idx} src={img} alt={`Banner ${idx + 1}`} className="slider-image" />
        ))}
      </div>
      
      <div className="slider-dots">
        {BANNER_IMAGES.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${currentIndex === idx ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;

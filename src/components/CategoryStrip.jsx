import React, { useRef, useState, useEffect } from 'react';
import './CategoryStrip.css';

const CATEGORIES = [
  { name: "All", icon: "/category-images/1st_Catogary.png" },
  { name: "Kids Wear", icon: "/category-images/2nd_catogary.png" },
  { name: "Mens Innerwear", icon: "/category-images/3rd_Catogary.png" },
  { name: "Womens Hosiery", icon: "/category-images/4th_Catogary.png" },
  { name: "Readymade", icon: "/category-images/5th_Catogary.png" },
  { name: "Winter Wear", icon: "/category-images/6th_Catogary.png" },
  { name: "Nightwear", icon: "/category-images/7th_Catogary.png" },
  { name: "Socks", icon: "/category-images/8th_Catogary.png" },
  { name: "Accessories", icon: "/category-images/9th_Catogary.png" }
];

function CategoryStrip({ activeCategory, onSelectCategory }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Check scroll position for arrows
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Track window scroll to hide/show images
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Calculate how much was scrolled
      const delta = currentScrollY - lastScrollY;

      // Only execute if scrolled past 100px (header area)
      if (currentScrollY > 100) {
        // If scrolled down by at least 5px, hide images
        if (delta > 5) {
          setIsScrolledDown(true);
        } 
        // If scrolled up by at least 5px, show images
        else if (delta < -5) {
          setIsScrolledDown(false);
        }
      } else {
        // Always show if near the top
        setIsScrolledDown(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`category-strip-wrapper ${isScrolledDown ? 'scrolled-down' : ''}`}>
      <div className="category-strip card">
        <div className="category-scroll-container">
          
          {canScrollLeft && (
            <button 
              className="scroll-arrow left-arrow" 
              onClick={() => scroll('left')}
              aria-label="Scroll categories left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <div 
            className="strip-container" 
            ref={scrollRef} 
            onScroll={checkScroll}
          >
            {CATEGORIES.map((cat, idx) => (
              <div 
                key={idx} 
                className={`category-item ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.name)}
              >
                <div className="category-icon-wrapper">
                  <div className="category-icon">
                    <img src={cat.icon} alt={cat.name} loading={idx < 5 ? "eager" : "lazy"} />
                  </div>
                </div>
                <span className="category-name">{cat.name}</span>
                {activeCategory === cat.name && <div className="active-indicator" />}
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button 
              className="scroll-arrow right-arrow" 
              onClick={() => scroll('right')}
              aria-label="Scroll categories right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
          
          {canScrollRight && <div className="edge-fade right-fade" />}
          {canScrollLeft && <div className="edge-fade left-fade" />}
        </div>
      </div>
    </div>
  );
}

export default CategoryStrip;

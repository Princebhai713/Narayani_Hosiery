import React, { useState } from 'react';
import CategoryStrip from '../components/CategoryStrip';
import TrustBadges from '../components/TrustBadges';
import ProductSection from '../components/ProductSection';
import { useProducts } from '../context/ProductContext';
import { DUMMY_PRODUCTS } from '../data/products'; // Fallback
import './Home.css';

function Home() {
  const { products: liveProducts, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');

  // Use live products if available, otherwise fallback to DUMMY_PRODUCTS
  const displayProducts = liveProducts.length > 0 ? liveProducts : DUMMY_PRODUCTS;

  // Select 10 random-looking products for the "For You" section
  const forYouProducts = displayProducts.slice(10, 20); 

  const kidsProducts = displayProducts.filter(p => p.category === "Kids Wear" || p.category === "Kids");
  const innerwearProducts = displayProducts.filter(p => p.category === "Mens Innerwear" || p.category === "Innerwear");
  const ladiesProducts = displayProducts.filter(p => p.category === "Womens Hosiery" || p.category === "Readymade" || p.category === "Ladies Hosiery");

  const handleCategorySelect = (categoryName) => {
    setActiveCategory(categoryName);
  };

  return (
    <div className="home-page">
      <CategoryStrip activeCategory={activeCategory} onSelectCategory={handleCategorySelect} />
      <TrustBadges />
      
      {loading && liveProducts.length === 0 ? (
        <div className="container sections-container">
          {[1,2,3].map(row => (
            <div key={row} className="product-section card" style={{padding: '16px', marginBottom: '16px'}}>
              <div className="skeleton-title" style={{height: '28px', width: '250px', backgroundColor: '#e0e0e0', marginBottom: '24px', borderRadius: '4px'}}></div>
              <div style={{display: 'flex', gap: '16px', overflow: 'hidden'}}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="skeleton-card" style={{minWidth: '240px', height: '340px', backgroundColor: '#f0f0f0', border: '1px solid #e8e8e8'}}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div key={activeCategory} className="container sections-container animate-slide-up">
          {activeCategory === 'All' && forYouProducts.length > 0 && (
            <div className="for-you-section">
              <ProductSection title="🌟 Handpicked For You" products={forYouProducts} isGridView={false} />
            </div>
          )}
          
          {(activeCategory === 'All' || activeCategory === 'Kids Wear') && kidsProducts.length > 0 && (
            <div className="deal-of-the-day">
              <ProductSection 
                title="Deal of the Day: Kids Wear" 
                products={kidsProducts} 
                onViewAll={activeCategory === 'All' ? () => handleCategorySelect('Kids Wear') : null} 
                isGridView={activeCategory !== 'All'}
              />
            </div>
          )}
          {(activeCategory === 'All' || activeCategory === 'Mens Innerwear') && innerwearProducts.length > 0 && (
            <ProductSection 
              title="Trending in Men's Innerwear" 
              products={innerwearProducts} 
              onViewAll={activeCategory === 'All' ? () => handleCategorySelect('Mens Innerwear') : null} 
              isGridView={activeCategory !== 'All'}
            />
          )}
          {(activeCategory === 'All' || activeCategory === 'Womens Hosiery' || activeCategory === 'Readymade') && ladiesProducts.length > 0 && (
            <ProductSection 
              title="Top Picks for Ladies Hosiery & Readymade" 
              products={ladiesProducts} 
              onViewAll={activeCategory === 'All' ? () => handleCategorySelect('Womens Hosiery') : null} 
              isGridView={activeCategory !== 'All'}
            />
          )}
          
          {/* Dynamic fallback for other categories not hardcoded above */}
          {activeCategory !== 'All' && 
           activeCategory !== 'Kids Wear' && 
           activeCategory !== 'Mens Innerwear' && 
           activeCategory !== 'Womens Hosiery' && 
           activeCategory !== 'Readymade' && (
            <ProductSection 
              title={`Products in ${activeCategory}`} 
              products={displayProducts.filter(p => p.category === activeCategory)} 
              isGridView={true}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Home;

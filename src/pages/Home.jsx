import React, { useState } from 'react';
import CategoryStrip from '../components/CategoryStrip';
import TrustBadges from '../components/TrustBadges';
import ProductSection from '../components/ProductSection';
import { useProducts } from '../context/ProductContext';
import './Home.css';

function Home() {
  const { products: liveProducts, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');

  const displayProducts = liveProducts;

  const topPickedProducts = displayProducts.filter(p => p.is_top_picked);

  const normalize = (cat) => (cat || "").trim().toLowerCase();

  const handleCategorySelect = (categoryName) => {
    setActiveCategory(categoryName);
  };

  // Group products by their normalized categories to avoid spelling/spacing issues
  const getProductsByCategory = (targetCategory) => {
    const target = normalize(targetCategory);
    return displayProducts.filter(p => {
      const pCat = normalize(p.category);
      if (target === 'ladies hosiery' || target === 'womens hosiery' || target === 'readymade') {
         return pCat === 'womens hosiery' || pCat === 'ladies hosiery' || pCat === 'readymade';
      }
      if (target === 'kids wear' || target === 'kids') {
         return pCat === 'kids wear' || pCat === 'kids';
      }
      if (target === 'mens innerwear' || target === 'innerwear') {
         return pCat === 'mens innerwear' || pCat === 'innerwear';
      }
      return pCat === target;
    });
  };

  const CATEGORY_TABS = [
    "Kids Wear", "Mens Innerwear", "Womens Hosiery", "Readymade", 
    "Winter Wear", "Nightwear", "Socks", "Accessories"
  ];

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
        <div key={activeCategory} className="container sections-container">
          {activeCategory === 'All' && topPickedProducts.length > 0 && (
            <div className="for-you-section">
              <ProductSection title="🌟 Top Picked For You" products={topPickedProducts} isGridView={false} />
            </div>
          )}
          
          {/* If a specific category is selected, just show that category */}
          {activeCategory !== 'All' && (
            <ProductSection 
              title={`Products in ${activeCategory}`} 
              products={getProductsByCategory(activeCategory)} 
              isGridView={true}
            />
          )}

          {/* If 'All' is selected, show grouped rows for all available categories dynamically */}
          {activeCategory === 'All' && CATEGORY_TABS.map(catName => {
             const prods = getProductsByCategory(catName);
             if (prods.length === 0) return null;
             
             // Avoid duplicating 'Readymade' if 'Womens Hosiery' already handled it in our group logic
             if (catName === 'Readymade' && getProductsByCategory('Womens Hosiery').length > 0) return null;
             
             let title = `Latest in ${catName}`;
             if (catName === 'Kids Wear') title = "Deal of the Day: Kids Wear";
             if (catName === 'Mens Innerwear') title = "Trending in Men's Innerwear";
             if (catName === 'Womens Hosiery') title = "Top Picks for Ladies Hosiery & Readymade";
             
             return (
               <ProductSection 
                 key={catName}
                 title={title} 
                 products={prods} 
                 onViewAll={() => handleCategorySelect(catName)} 
                 isGridView={false}
               />
             );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        // Map database columns to camelCase for frontend consistency
        const normalizedProducts = data.products.map(p => ({
          ...p,
          netRate: p.net_rate,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
        }));
        setProducts(normalizedProducts);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

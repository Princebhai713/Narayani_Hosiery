import React, { useState, useEffect } from 'react';
import './Admin.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    net_rate: '',
    moq: '',
    category: 'Kids Wear',
    images: [], // New File objects
    existingImages: [] // Strings (URLs) from DB
  });

  const [previewUrls, setPreviewUrls] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files).slice(0, 5); // Max 5
    setFormData(prev => ({ ...prev, images: [...prev.images, ...fileArray].slice(0, 5) }));
    
    // Generate previews for new files
    const newPreviews = fileArray.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveExistingImage = (index) => {
    setFormData(prev => {
      const updated = [...prev.existingImages];
      updated.splice(index, 1);
      return { ...prev, existingImages: updated };
    });
  };

  const handleRemoveNewImage = (index) => {
    setFormData(prev => {
      const updated = [...prev.images];
      updated.splice(index, 1);
      return { ...prev, images: updated };
    });
    setPreviewUrls(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index]);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    
    setFormData({
      name: product.name,
      description: product.description || '',
      net_rate: product.net_rate,
      moq: product.moq,
      category: product.category,
      is_top_picked: product.is_top_picked || false,
      images: [],
      existingImages: parsedImages || []
    });
    
    // Clear any previous new file previews
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully");
        fetchProducts(); // Refresh list
      } else {
        alert("Failed to delete: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const handleToggleTopPick = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}/top-pick`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_top_picked: !product.is_top_picked })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts(); // Refresh list to reflect changes
      } else {
        alert("Failed to update top pick: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating top pick");
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setFormData({ name: '', description: '', net_rate: '', moq: '', category: 'Kids Wear', is_top_picked: false, images: [], existingImages: [] });
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('net_rate', formData.net_rate);
    form.append('moq', formData.moq);
    form.append('category', formData.category);
    form.append('is_top_picked', formData.is_top_picked);
    
    if (editingProductId) {
      form.append('existingImages', JSON.stringify(formData.existingImages));
    }
    
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(image => {
        form.append('images', image);
      });
    }

    const url = editingProductId 
      ? `/api/products/${editingProductId}` 
      : '/api/products';
      
    const method = editingProductId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: form });
      const data = await res.json();
      
      if (data.success) {
        alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully! ID: ' + data.product.id);
        cancelEdit();
        fetchProducts();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</li>
          <li className={activeTab === 'top_picks' ? 'active' : ''} onClick={() => setActiveTab('top_picks')}>Manage Top Picks</li>
          <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders & Export</li>
        </ul>
      </div>

      <div className="admin-main">
        {activeTab === 'products' && (
          <div>
            <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
            <form className="admin-form card" onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} required style={{width: '100%'}} />
              </div>
             
              <div className="form-row">
                <input type="number" name="net_rate" placeholder="Wholesale Net Rate (₹)" value={formData.net_rate} onChange={handleInputChange} required />
                <input type="number" name="moq" placeholder="Minimum Order Quantity (MOQ)" value={formData.moq} onChange={handleInputChange} required />
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Kids Wear">Kids Wear</option>
                  <option value="Mens Innerwear">Mens Innerwear</option>
                  <option value="Womens Hosiery">Womens Hosiery</option>
                  <option value="Readymade">Readymade</option>
                  <option value="Winter Wear">Winter Wear</option>
                  <option value="Nightwear">Nightwear</option>
                  <option value="Socks">Socks</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" name="is_top_picked" checked={formData.is_top_picked || false} onChange={(e) => setFormData({...formData, is_top_picked: e.target.checked})} />
                  🌟 Top Picked
                </label>
              </div>
              
              <div style={{marginTop: '16px', marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Upload Images (Max 5)</label>
                
                <div 
                  className={`drag-drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <p>Drag & Drop images here or click to select files</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => handleFiles(e.target.files)} 
                  />
                </div>

                {/* Previews */}
                {(formData.existingImages.length > 0 || previewUrls.length > 0) && (
                  <div className="image-preview-container">
                    {/* Existing Images (when editing) */}
                    {formData.existingImages.map((url, idx) => (
                      <div key={`exist-${idx}`} className="image-preview-item">
                        <img src={url} alt={`Existing ${idx}`} />
                        <button type="button" className="remove-image-btn" onClick={() => handleRemoveExistingImage(idx)}>×</button>
                      </div>
                    ))}
                    {/* New Uploaded Images */}
                    {previewUrls.map((url, idx) => (
                      <div key={`new-${idx}`} className="image-preview-item">
                        <img src={url} alt={`New ${idx}`} />
                        <button type="button" className="remove-image-btn" onClick={() => handleRemoveNewImage(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingProductId ? 'Update Product' : 'Add Product')}
                </button>
                {editingProductId && (
                  <button type="button" className="btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 style={{marginTop: '32px'}}>Live Products ({products.length})</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Rate</th>
                  <th>MOQ</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                  return (
                    <tr key={p.id}>
                      <td><img src={images?.[0]} alt={p.name} width="50" height="50" style={{objectFit: 'contain'}} /></td>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>₹{p.net_rate}</td>
                      <td>{p.moq}</td>
                      <td>{p.category}</td>
                      <td>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button className="btn-secondary" style={{padding: '4px 12px', fontSize: '12px'}} onClick={() => handleEditClick(p)}>Edit</button>
                          <button className="btn-secondary" style={{padding: '4px 12px', fontSize: '12px', color: 'red', borderColor: 'red'}} onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && <tr><td colSpan="7">No products found in Neon Database. Add some above!</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'top_picks' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3>Manage Top Picks</h3>
              <span style={{padding: '8px 16px', background: '#e0e7ff', color: '#3730a3', borderRadius: '8px', fontWeight: 'bold'}}>
                Currently Showing: {products.filter(p => p.is_top_picked).length} Top Picked Products
              </span>
            </div>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>🌟 Top Picked Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                  return (
                    <tr key={p.id}>
                      <td><img src={images?.[0]} alt={p.name} width="50" height="50" style={{objectFit: 'contain'}} /></td>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>
                        <button 
                          onClick={() => handleToggleTopPick(p)}
                          style={{
                            padding: '8px 16px',
                            background: p.is_top_picked ? '#ffeb3b' : '#f1f5f9',
                            color: p.is_top_picked ? '#000' : '#64748b',
                            border: '1px solid',
                            borderColor: p.is_top_picked ? '#fbc02d' : '#cbd5e1',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {p.is_top_picked ? '🌟 Top Picked (ON)' : '☆ Set as Top Pick'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && <tr><td colSpan="5">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3>Orders Dashboard ({orders.length})</h3>
              <button className="btn-primary" style={{backgroundColor: '#388e3c'}}>Export to Marg ERP (CSV)</button>
            </div>
            {orders.length === 0 ? (
              <div className="card" style={{padding: '32px', textAlign: 'center', color: 'var(--text-secondary)'}}>
                No orders yet.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Items</th>
                    <th>Total (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    const details = typeof order.customer_details === 'string' ? JSON.parse(order.customer_details) : (order.customer_details || {});
                    const date = new Date(order.created_at).toLocaleString();
                    
                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{date}</td>
                        <td style={{fontWeight: 'bold'}}>{details.name || 'Unknown'}</td>
                        <td>{details.phone || '-'}</td>
                        <td style={{fontSize: '12px'}}>{details.address || '-'}</td>
                        <td>
                          {items.map((item, i) => (
                            <div key={i} style={{fontSize: '12px', marginBottom: '4px'}}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </td>
                        <td style={{fontWeight: 'bold', color: 'var(--primary-color)'}}>₹{order.total_amount}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px', 
                            backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#d4edda', 
                            color: order.status === 'PENDING' ? '#856404' : '#155724', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;

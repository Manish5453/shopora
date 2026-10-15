import { useEffect, useState } from 'react';
import API from '../services/api';
import { PlusCircle, PackageCheck, Trash2, Edit3, X } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    images: '',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all products for admin management
  const fetchAdminProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products?keyword=');
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const imageArray = formData.images
        .split(',')
        .map((img) => img.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: imageArray.length > 0 ? imageArray : ['https://via.placeholder.com/400'],
      };

      if (editingId) {
        // Update Product
        await API.put(`/products/${editingId}`, payload);
        setSuccessMsg('Product updated successfully!');
      } else {
        // Create Product
        await API.post('/products', payload);
        setSuccessMsg('Product added successfully to database!');
      }

      resetForm();
      fetchAdminProducts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed. Make sure you are logged in as admin.');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images.join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        setSuccessMsg('Product deleted successfully!');
        fetchAdminProducts();
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      price: '',
      category: 'Electronics',
      stock: '',
      images: '',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Add / Edit Form Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-3">
            <PlusCircle className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold">
              {editingId ? 'Edit Product' : 'Admin Dashboard: Add New Product'}
            </h1>
          </div>
          {editingId && (
            <button onClick={resetForm} className="flex items-center text-sm text-gray-500 hover:text-gray-800 cursor-pointer">
              <X className="h-4 w-4 mr-1" /> Cancel Edit
            </button>
          )}
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center space-x-2">
            <PackageCheck className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Product Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Slug (e.g. iphone-17)</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" required className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Price (₹)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Stock Quantity</label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Beauty">Beauty</option>
                <option value="Home">Home</option>
                <option value="Books">Books</option>
                <option value="Toys and Baby">Toys and Baby</option>
                <option value="Appliances">Appliances</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Image URLs (Comma separated for multiple images)</label>
            <input type="text" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://img1.jpg, https://img2.jpg" required className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg cursor-pointer">
            {editingId ? 'Update Product' : 'Publish Product'}
          </button>
        </form>
      </div>

      {/* Listed Products Management Table */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold">Listed Products Management</h2>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading listed products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No products listed in database yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 flex items-center space-x-3">
                      <img src={item.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border" />
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                        <span className="text-xs text-gray-400">ID: {item._id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.category}</td>
                    <td className="py-4 px-4 font-semibold">₹{item.price.toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="inline-files items-center px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
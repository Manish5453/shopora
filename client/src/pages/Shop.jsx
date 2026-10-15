import { useEffect, useState } from 'react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

export default function Shop({ selectedCategory, setSelectedCategory, searchQuery, setSearchQuery }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const catQuery = selectedCategory && selectedCategory !== 'All' ? selectedCategory : '';
        const { data } = await API.get(`/products?keyword=${searchQuery || ''}&category=${catQuery}&sort=${sortOrder}`);
        setProducts(data.products);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {selectedCategory && selectedCategory !== 'All' ? `${selectedCategory} Products` : 'All Products Catalog'}
          </h1>
          <p className="text-sm text-gray-500">Explore high-quality items curated for your daily lifestyle.</p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <SlidersHorizontal className="h-5 w-5 text-gray-500" />
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-medium"
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-200">
          <p className="text-lg font-semibold">No products found matching your criteria.</p>
          <p className="text-sm text-gray-400 mt-1">Try adding products via the Admin Dashboard!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.loadings ? null : products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
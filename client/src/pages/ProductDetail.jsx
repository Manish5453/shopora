import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading product...</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-emerald-600 mb-6 font-medium cursor-pointer">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
        
        {/* Flipkart Style Image Gallery (Thumbnails + Main Viewer) */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails Sidebar */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-112.5">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  selectedImageIndex === idx ? 'border-emerald-600 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Display Image */}
          <div className="flex-1 h-95 sm:h-112.5 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
            <img src={images[selectedImageIndex]} alt={product.title} className="max-h-full max-w-full object-contain transition-all duration-300" />
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{product.title}</h1>
            <p className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed border-t border-b py-4">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-sm">Quantity:</span>
              <select 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>{x + 1}</option>
                ))}
              </select>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
            </div>

            {/* Clearly Visible Add To Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center py-4 rounded-2xl font-bold text-white transition-all shadow-md cursor-pointer ${
                product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black shadow-lg'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-400" /> Added to Cart Successfully!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5 mr-2" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
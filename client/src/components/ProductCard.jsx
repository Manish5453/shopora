import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <Link to={`/product/${product._id}`} className="h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.images[0] || 'https://via.placeholder.com/300'} 
          alt={product.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4 flex flex-col grow">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">{product.category}</span>
        <Link to={`/product/${product._id}`} className="font-semibold text-gray-900 hover:text-brand-600 line-clamp-1 mb-2">
          {product.title}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          <Link 
            to={`/product/${product._id}`}
            className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
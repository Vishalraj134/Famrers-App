import React from 'react';
import { Link } from 'react-router-dom';
import { Package, User, DollarSign, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="glass p-6 rounded-3xl card-hover group shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-2xl mb-6 image-hover">
        {product.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.image_url}`}
            alt={product.name}
            className="w-full h-48 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {product.category}
          </span>
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex items-end justify-center pb-4">
          <div className="text-white text-center">
            <p className="text-sm font-medium">Click to view details</p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {truncateText(product.name, 50)}
          </h3>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateText(product.description, 100)}
          </p>
        )}

        {/* Farmer Info */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">by {product.farmer?.name}</span>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="text-sm text-gray-600 font-medium bg-white px-3 py-1 rounded-full">
            {product.quantity} available
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            onClick={() => { addItem(product, 1); toast.success('Added to cart'); }}
            className="btn-animate w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-2xl font-semibold text-center flex items-center justify-center space-x-2 hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </button>
          <Link
            to={`/products/${product.id}`}
            className="btn-animate w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-2xl font-semibold text-center flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Eye className="w-5 h-5" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

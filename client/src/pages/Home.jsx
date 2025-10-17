import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import VegetableCarousel from '../components/VegetableCarousel';
import { productAPI } from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 12,
  });

  const sentinelRef = useRef(null);

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Herbs', 'Other'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts(filters);
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (loadingMore) return;
    if (!pagination?.hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextFilters = { ...filters, page: (pagination.currentPage || 1) + 1 };
      const response = await productAPI.getProducts(nextFilters);
      const newProducts = response.data.data.products || [];
      setProducts(prev => [...prev, ...newProducts]);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        fetchMore();
      }
    }, { root: null, rootMargin: '0px', threshold: 1.0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef.current, pagination, loadingMore]);

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };

  const handleCategoryChange = (e) => {
    setFilters(prev => ({
      ...prev,
      category: e.target.value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-4xl opacity-20 float">🌾</div>
        <div className="absolute top-32 right-20 text-3xl opacity-20 float" style={{animationDelay: '2s'}}>🥕</div>
        <div className="absolute bottom-20 left-20 text-3xl opacity-20 float" style={{animationDelay: '4s'}}>🍅</div>
        <div className="absolute bottom-32 right-10 text-4xl opacity-20 float" style={{animationDelay: '1s'}}>🌽</div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text-enhanced drop-shadow-2xl animate-glow">
                Fresh from the Farm
              </h1>
              <p className="text-xl md:text-3xl mb-10 text-white/90 max-w-4xl mx-auto leading-relaxed font-light animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                🌱 Connect directly with local farmers and get the freshest produce delivered to your table
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <a
                href="#products"
                className="btn-primary-enhanced px-12 py-5 text-lg font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl animate-bounce"
                style={{animationDelay: '1s'}}
              >
                🛒 Browse Products
              </a>
              <a
                href="/register"
                className="btn-animate border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-green-600 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl backdrop-blur-sm"
              >
                👨‍🌾 Join as Farmer
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
              <span className="gradient-text">Why Choose Us?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers and farmers in our growing community 🌟
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-enhanced text-center hover-lift group animate-fade-in-left">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                <Package className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2 gradient-text-enhanced">500+</h3>
              <p className="text-gray-600 font-semibold text-lg">Fresh Products</p>
              <p className="text-sm text-gray-500 mt-2">Updated daily from local farms</p>
            </div>
            <div className="card-enhanced text-center hover-lift group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-bounce" style={{animationDelay: '0.7s'}}>
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2 gradient-text-enhanced">100+</h3>
              <p className="text-gray-600 font-semibold text-lg">Local Farmers</p>
              <p className="text-sm text-gray-500 mt-2">Verified and trusted partners</p>
            </div>
            <div className="card-enhanced text-center hover-lift group animate-fade-in-right" style={{animationDelay: '0.4s'}}>
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-bounce" style={{animationDelay: '0.9s'}}>
                <ShoppingCart className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2 gradient-text-enhanced">1000+</h3>
              <p className="text-gray-600 font-semibold text-lg">Happy Customers</p>
              <p className="text-sm text-gray-500 mt-2">Satisfied with our service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
              <span className="gradient-text">Fresh Products Available</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              🥬 Discover a wide variety of fresh, locally-grown produce from trusted farmers in your area
            </p>
          </div>

          {/* Vegetables horizontal carousel */}
          <VegetableCarousel />

          {/* Filters */}
          <div className="glass rounded-3xl p-8 mb-12 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="🔍 Search products..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="form-input w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <select
                    value={filters.category}
                    onChange={handleCategoryChange}
                    className="form-input w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                  >
                    <option value="">🌿 All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.search || filters.category) && (
                <button
                  onClick={clearFilters}
                  className="btn-animate bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  🗑️ Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="glass p-6 rounded-3xl animate-pulse">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-4 shimmer"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-3 shimmer"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4 shimmer"></div>
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shimmer"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="glass p-12 rounded-3xl max-w-md mx-auto">
                <Package className="w-20 h-20 text-gray-400 mx-auto mb-6 float" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No products found</h3>
                <p className="text-gray-600 text-lg mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="btn-animate bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  🔄 Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Infinite scroll sentinel and loader */}
              <div ref={sentinelRef} className="h-12 mt-10 flex items-center justify-center">
                {loadingMore && (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary-500" />
                )}
                {!loadingMore && pagination?.hasNextPage && (
                  <button onClick={fetchMore} className="text-sm text-gray-500 hover:text-gray-700 underline">Load more</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

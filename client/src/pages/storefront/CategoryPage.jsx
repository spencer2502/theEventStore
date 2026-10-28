import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import ProductCard from '../../components/storefront/ProductCard';
import api from '../../api/client';

const CATEGORIES_LIST = [
  { slug: 'all', name: 'All Props' },
  { slug: 'lighting', name: 'Lighting' },
  { slug: 'backdrops', name: 'Backdrops' },
  { slug: 'balloons', name: 'Balloons' },
  { slug: 'tableware', name: 'Tableware' },
  { slug: 'furniture', name: 'Furniture' },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const currentCategorySlug = slug || 'all';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [currentCategorySlug, sortOption]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/public/products?limit=100';
      if (currentCategorySlug !== 'all') {
        url += `&category=${currentCategorySlug}`;
      }
      if (sortOption === 'price_asc') url += '&sort=price_asc';
      if (sortOption === 'price_desc') url += '&sort=price_desc';

      const res = await api.get(url);
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load category products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySwitch = (categorySlug) => {
    if (categorySlug === 'all') {
      navigate('/categories');
    } else {
      navigate(`/category/${categorySlug}`);
    }
  };

  // Local search filter
  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page Header */}
        <div className="border-b border-[#EAE6DF] pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#B21818] uppercase tracking-wider block mb-1">
                Event Props & Rentals Catalog
              </span>
              <h1 className="font-heading font-bold text-2xl sm:text-4xl text-[#1A181E] tracking-tight capitalize">
                {currentCategorySlug === 'all' ? 'All Event Props' : `${currentCategorySlug} Collection`}
              </h1>
            </div>

            {/* Search and Sort controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search props by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#B21818] w-full sm:w-64 transition-colors"
                />
              </div>

              {/* Sort selector */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-xs sm:text-sm py-2 px-3.5 rounded-lg border border-gray-300 bg-white appearance-none pr-8 cursor-pointer font-medium text-gray-700 focus:outline-none focus:border-[#B21818] w-full sm:w-auto transition-colors"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <SlidersHorizontal size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-6 flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = currentCategorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySwitch(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 select-none ${
                    isSelected
                      ? 'bg-[#B21818] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B21818] hover:text-[#B21818]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Count Indicator */}
        <div className="flex items-center justify-between text-xs font-normal text-gray-500 mb-6">
          <span>Showing {filteredProducts.length} items</span>
          <span className="text-gray-400">Click any card to view details</span>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-[#B21818] animate-spin" />
            <span className="font-medium text-sm text-gray-600">Loading props catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <AlertCircle size={36} className="mx-auto text-gray-400 mb-3" />
            <h3 className="font-heading font-bold text-xl text-[#1A181E]">No props found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No props matched "${searchTerm}". Try a different keyword or category.`
                : 'No items currently in this category. Check back soon!'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-[#FAF8F5] border border-gray-300 text-gray-700 hover:text-black"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

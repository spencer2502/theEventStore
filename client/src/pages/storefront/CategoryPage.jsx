import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ProductCard from '../../components/storefront/ProductCard';
import api from '../../api/client';

const CATEGORIES_LIST = [
  { slug: 'all', name: 'All Props', colorKey: 'yellow' },
  { slug: 'lighting', name: 'Lighting', colorKey: 'yellow' },
  { slug: 'backdrops', name: 'Backdrops', colorKey: 'pink' },
  { slug: 'balloons', name: 'Balloons', colorKey: 'blue' },
  { slug: 'tableware', name: 'Tableware', colorKey: 'lime' },
  { slug: 'furniture', name: 'Furniture', colorKey: 'purple' },
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
        <div className="border-b-3 border-ink pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-pink uppercase tracking-wider block mb-1">
                Event Props & Rentals Catalog
              </span>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-ink tracking-tight capitalize">
                {currentCategorySlug === 'all' ? 'All Event Props' : `${currentCategorySlug} Collection`}
              </h1>
            </div>

            {/* Search and Sort controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search props by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="funky-input pl-9 pr-4 py-2 text-xs sm:text-sm w-full sm:w-64"
                />
              </div>

              {/* Sort selector */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="funky-input text-xs sm:text-sm py-2 px-3 appearance-none pr-8 cursor-pointer font-bold w-full sm:w-auto"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <SlidersHorizontal size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink" />
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-6 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = currentCategorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySwitch(cat.slug)}
                  className={`px-4 py-2 rounded-full font-heading font-extrabold text-xs sm:text-sm border-2 transition-all shrink-0 select-none ${
                    isSelected
                      ? 'bg-yellow text-ink border-ink shadow-[3px_3px_0px_#161221] scale-105'
                      : 'bg-white text-ink border-ink shadow-[2px_2px_0px_#161221] hover:bg-lime/30'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Count Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-6">
          <span>Showing {filteredProducts.length} items</span>
          <span className="text-pink">● Click card to view details & gallery</span>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="text-pink animate-spin" />
            <span className="font-heading font-bold text-lg text-ink">Loading props catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-3xl border-2 border-dashed border-ink p-8">
            <AlertCircle size={40} className="mx-auto text-pink mb-3" />
            <h3 className="font-heading font-extrabold text-2xl text-ink">No props found</h3>
            <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No props matched "${searchTerm}". Try a different keyword or category.`
                : 'No items currently in this category. Check back soon!'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 btn-funky bg-yellow text-ink px-4 py-2 text-xs"
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

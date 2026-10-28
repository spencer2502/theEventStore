import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, PartyPopper, MessageCircle } from 'lucide-react';
import HeroSection from '../../components/storefront/HeroSection';
import ProductCard from '../../components/storefront/ProductCard';
import FunkyButton from '../../components/common/FunkyButton';
import api from '../../api/client';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await api.get('/public/products?featured=true&limit=8');
      if (res.data?.success) {
        setFeaturedProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load featured products', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Bestsellers Section */}
      <section className="w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#EAE6DF]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B21818] uppercase tracking-wider mb-1">
                <Sparkles size={14} /> Most Requested Items
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#1A181E] tracking-tight">
                Featured & Bestsellers
              </h2>
            </div>

            <Link to="/categories">
              <FunkyButton variant="white" size="md">
                <span>View Full Catalog</span>
                <ArrowRight size={15} />
              </FunkyButton>
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="text-[#B21818] animate-spin" />
              <span className="font-medium text-sm text-gray-600">Loading catalog...</span>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 font-medium">No featured props found right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Custom Package Callout Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#FAF6F2] to-[#FFF5F5] border border-[#EAD5D5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold text-[#B21818] uppercase tracking-widest block mb-1">
                Concierge Assistance
              </span>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#1A181E]">
                Need a custom setup or multi-day rental?
              </h3>
              <p className="text-xs sm:text-sm font-normal text-gray-600 mt-1 max-w-xl">
                Our decor operations team can build tailored packages, arrange safe transport, and assist with on-site setup for your celebration.
              </p>
            </div>
            <a
              href={`https://wa.me/918962690000?text=${encodeURIComponent(
                'Hi! I want to enquire about a custom prop package setup.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <FunkyButton variant="crimson" size="md" className="gap-2">
                <MessageCircle size={16} />
                <span>WhatsApp Operations</span>
              </FunkyButton>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
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
    <div className="space-y-10">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Bestsellers Section */}
      <section className="w-full py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-3 border-ink">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink uppercase tracking-wider mb-1">
                <PartyPopper size={16} /> Most Loved Event Props
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Featured & Bestsellers
              </h2>
            </div>

            <Link to="/categories">
              <FunkyButton variant="yellow" size="md">
                <span>View Full Catalog</span>
                <ArrowRight size={16} strokeWidth={3} />
              </FunkyButton>
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="text-pink animate-spin" />
              <span className="font-heading font-bold text-lg text-ink">Loading awesome props...</span>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 font-semibold">No featured props found right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Banner inside featured section */}
          <div className="mt-12 p-6 rounded-3xl bg-lime/40 border-3 border-ink shadow-funky flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
                Need customized setup or multi-day rental?
              </h3>
              <p className="text-xs sm:text-sm font-medium text-gray-800 mt-1">
                Our operations team can build custom packages, arrange transport, and set up on-site.
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
              <FunkyButton variant="pink" size="md">
                <span>WhatsApp Operations</span>
              </FunkyButton>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

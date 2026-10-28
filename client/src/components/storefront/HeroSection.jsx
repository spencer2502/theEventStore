import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import FunkyButton from '../common/FunkyButton';

const HERO_CATEGORIES = [
  {
    name: 'Lighting',
    icon: '💡',
    desc: 'Fairy light curtains, neon signs & ambient lanterns',
    link: '/category/lighting',
  },
  {
    name: 'Backdrops',
    icon: '✨',
    desc: 'Shimmer sequin walls, mesh frames & wooden arches',
    link: '/category/backdrops',
  },
  {
    name: 'Balloons',
    icon: '🎈',
    desc: 'Organic garlands, round hoop stands & pastel arches',
    link: '/category/balloons',
  },
  {
    name: 'Tableware',
    icon: '🍽️',
    desc: 'Hammered chargers, gold cutlery & crystal flutes',
    link: '/category/tableware',
  },
  {
    name: 'Furniture',
    icon: '🪑',
    desc: 'Peacock chairs, velvet lounges & acrylic plinths',
    link: '/category/furniture',
  },
];

export default function HeroSection() {
  return (
    <section className="relative w-full border-b border-[#EAE6DF] bg-gradient-to-b from-[#FFFDFB] via-[#FAF6F2] to-[#F5EFE9] overflow-hidden py-10 sm:py-16">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-50/50 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Brand Slogan Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8D0D0] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#B21818] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-[#8F1313] uppercase tracking-widest">
              The Event Store • Premium Decor & Props Hire
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1A181E] leading-[1.12] tracking-tight">
            Curated Props & Decor for <span className="text-[#B21818] inline-block">Extraordinary</span> Celebrations.
          </h1>

          {/* Subtext */}
          <p className="mt-5 text-base sm:text-lg font-normal text-gray-600 leading-relaxed max-w-2xl">
            Browse statement backdrops, ambient lighting, organic balloon setups, and luxury furniture. Check real-time prop availability and reserve seamlessly on WhatsApp.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link to="/categories">
              <FunkyButton variant="crimson" size="lg" className="text-sm sm:text-base px-7 py-3">
                <span>Explore Props Catalog</span>
                <ArrowRight size={18} />
              </FunkyButton>
            </Link>
            <a
              href={`https://wa.me/918962690000?text=${encodeURIComponent(
                'Hi! I would like to check prop availability for an upcoming event.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FunkyButton variant="outline" size="lg" className="text-sm sm:text-base px-6 py-3">
                <MessageCircle size={18} className="text-[#B21818]" />
                <span>Chat on WhatsApp</span>
              </FunkyButton>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-6 border-t border-[#E8E2D8] flex flex-wrap gap-5 sm:gap-8 text-xs sm:text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#B21818]" />
              <span>Real-Time Inventory Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#B21818]" />
              <span>Quick WhatsApp Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#B21818]" />
              <span>Complete Event Customization</span>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="mt-14 pt-8 border-t border-[#E8E2D8]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#1A181E] tracking-tight flex items-center gap-2">
                <span>Featured Collections</span>
                <Sparkles size={18} className="text-[#B21818]" />
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Explore by decor theme & prop style</p>
            </div>
            <Link
              to="/categories"
              className="text-xs sm:text-sm font-semibold text-[#B21818] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {HERO_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={cat.link}
                className="group p-4 sm:p-5 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#B21818] hover:shadow-md transition-all duration-200 block text-left"
              >
                <div className="text-2xl sm:text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A181E] group-hover:text-[#B21818] transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-snug line-clamp-2">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

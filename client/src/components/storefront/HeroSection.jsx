import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import FunkyButton from '../common/FunkyButton';

const HERO_TILES = [
  {
    name: 'Lighting',
    color: 'bg-yellow',
    rotate: 'rotate-[-1.5deg]',
    icon: '💡',
    desc: 'Neon signs, warm fairy curtains & lanterns',
    link: '/category/lighting',
  },
  {
    name: 'Backdrops',
    color: 'bg-pink text-white',
    rotate: 'rotate-[2deg]',
    icon: '✨',
    desc: 'Shimmer sequin walls & wooden arches',
    link: '/category/backdrops',
  },
  {
    name: 'Balloons',
    color: 'bg-blue text-white',
    rotate: 'rotate-[-2deg]',
    icon: '🎈',
    desc: 'Organic garlands & round hoop stands',
    link: '/category/balloons',
  },
  {
    name: 'Tableware',
    color: 'bg-lime',
    rotate: 'rotate-[1.5deg]',
    icon: '🍽️',
    desc: 'Hammered chargers & crystal flutes',
    link: '/category/tableware',
  },
  {
    name: 'Furniture',
    color: 'bg-purple text-white',
    rotate: 'rotate-[-1.8deg]',
    icon: '🪑',
    desc: 'Rattan peacock chairs & plinths',
    link: '/category/furniture',
  },
];

export default function HeroSection() {
  return (
    <section className="relative w-full border-b-3 border-ink bg-panel-bg overflow-hidden py-8 sm:py-14">
      {/* Subtle decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow/30 border-3 border-ink pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-pink/20 border-3 border-ink pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Slogan Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime border-2 border-ink shadow-[2px_2px_0px_#161221] mb-5">
            <Flame size={16} className="text-ink animate-bounce" />
            <span className="font-heading font-extrabold text-xs sm:text-sm text-ink uppercase tracking-wider">
              Event Props & Decor Hire — Stock Backed & Live
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-ink leading-[1.05] tracking-tight">
            PROPS THAT MAKE YOUR PARTY <span className="underline decoration-pink decoration-wavy decoration-4">POP!</span>
          </h1>

          {/* Subtext */}
          <p className="mt-5 text-base sm:text-xl font-medium text-gray-800 leading-relaxed max-w-2xl">
            Browse statement backdrops, vibrant neon lights, organic balloon installations, luxury tableware, and lounge furniture. Check live stock, build your wishlist, and submit your enquiry via WhatsApp in seconds!
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/categories">
              <FunkyButton variant="yellow" size="lg" className="text-base sm:text-lg">
                <span>Explore All Props</span>
                <ArrowRight size={20} strokeWidth={3} />
              </FunkyButton>
            </Link>
            <a
              href={`https://wa.me/918962690000?text=${encodeURIComponent(
                'Hi! I want to check prop availability for an upcoming event.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FunkyButton variant="lime" size="lg" className="text-base sm:text-lg">
                <span>Chat on WhatsApp</span>
              </FunkyButton>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-6 border-t-2 border-ink flex flex-wrap gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-gray-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-pink" strokeWidth={3} />
              <span>Real-Time Stock Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue" strokeWidth={3} />
              <span>Instant WhatsApp Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-purple" strokeWidth={3} />
              <span>Zero Online Signup Needed</span>
            </div>
          </div>
        </div>

        {/* Hero Category Cards (Energy-filled rotated tiles) */}
        <div className="mt-12 pt-8 border-t-3 border-ink">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight flex items-center gap-2">
              <span>Popular Categories</span>
              <Sparkles size={22} className="text-yellow fill-yellow" />
            </h2>
            <Link
              to="/categories"
              className="text-xs sm:text-sm font-bold text-pink hover:underline uppercase tracking-wider"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {HERO_TILES.map((tile) => (
              <Link
                key={tile.name}
                to={tile.link}
                className={`p-4 sm:p-5 rounded-sticker border-3 border-ink shadow-[4px_4px_0px_#161221] hover:shadow-[7px_7px_0px_#161221] hover:-translate-y-1 transition-all ${tile.color} ${tile.rotate} block`}
              >
                <div className="text-3xl sm:text-4xl mb-2">{tile.icon}</div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl leading-tight">
                  {tile.name}
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold mt-1 opacity-90 leading-snug">
                  {tile.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

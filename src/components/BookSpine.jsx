import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Star } from 'lucide-react';

// Warm, premium book spine HSL palettes
const SPINE_PALETTES = [
  { bg: 'from-[#6b1e1e] to-[#471010]', text: 'text-amber-200/90', border: 'border-amber-500/20' }, // Burgundy
  { bg: 'from-[#1c355e] to-[#11213b]', text: 'text-amber-100/90', border: 'border-amber-400/20' }, // Indigo
  { bg: 'from-[#2a4d38] to-[#1a2f22]', text: 'text-[#fbf6ee]/90', border: 'border-[#d4af37]/20' }, // Sage Forest
  { bg: 'from-[#a36820] to-[#6e4310]', text: 'text-amber-100/95', border: 'border-[#fbf6ee]/10' }, // Warm Oak / Ochre
  { bg: 'from-[#3a1a5c] to-[#25103d]', text: 'text-amber-200/90', border: 'border-amber-400/20' }, // Plum / Violet
  { bg: 'from-[#1b4d4b] to-[#0f2e2d]', text: 'text-[#fbf6ee]/90', border: 'border-amber-400/15' }, // Teal
  { bg: 'from-[#302b28] to-[#1f1a18]', text: 'text-amber-300/80', border: 'border-amber-500/20' }, // Charcoal Leather
];

export default function BookSpine({ book }) {
  const { openDrawer } = useAuth();
  
  // Calculate stable properties based on title hash so they remain consistent for each book
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hash = getHash(book.title + book.author);
  const palette = SPINE_PALETTES[hash % SPINE_PALETTES.length];
  
  // Dynamic heights (between 180px and 225px) to simulate realistic visual variety
  const heightClass = [190, 200, 210, 220][hash % 4];
  
  // Dynamic spine thickness (widths) based on book pages count
  const pages = book.pages || 200;
  let widthClass = 'w-10'; // < 150 pages
  if (pages >= 150 && pages < 300) widthClass = 'w-12';
  if (pages >= 300 && pages < 500) widthClass = 'w-14';
  if (pages >= 500) widthClass = 'w-16';

  return (
    <motion.div
      onClick={() => openDrawer(book)}
      className="cursor-pointer select-none relative group"
      whileHover={{ 
        y: -14, 
        z: 30,
        transition: { type: 'spring', stiffness: 220, damping: 14 }
      }}
    >
      {/* 3D Spine Cylinder */}
      <div 
        style={{ height: `${heightClass}px` }}
        className={`book-spine-3d book-shadow-ambient group-hover:book-shadow-lifted bg-gradient-to-b ${palette.bg} ${widthClass} rounded-sm flex flex-col justify-between items-center py-4 border-l border-t ${palette.border} transition-all duration-300`}
      >
        {/* Top Spine Stripe Accent */}
        <div className="w-full flex flex-col items-center gap-0.5 opacity-80">
          <div className="w-[85%] h-[2px] bg-amber-500/40"></div>
          <div className="w-[85%] h-[1px] bg-amber-500/20"></div>
        </div>

        {/* Book Title & Author Text rotated vertically */}
        <div 
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          className={`flex-1 flex items-center justify-center ${palette.text} transform rotate-180 font-serif-book font-semibold tracking-wider text-[11px] leading-none px-1 overflow-hidden select-none max-h-[70%]`}
        >
          <span className="truncate max-h-[120px]" title={book.title}>
            {book.title}
          </span>
          <span className="opacity-45 text-[8px] font-sans font-medium tracking-normal mt-2 transform -rotate-180">
            {book.author}
          </span>
        </div>

        {/* Bottom Spine Accent & Rating Star */}
        <div className="w-full flex flex-col items-center gap-1.5">
          {book.rating > 0 && (
            <div className="flex flex-col items-center gap-0.5 text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <span className="text-[8px] font-sans font-semibold leading-none">{book.rating}</span>
            </div>
          )}
          {book.status === 'Reading' && (
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Reading Now" />
          )}
          <div className="w-full flex flex-col items-center gap-0.5 opacity-80">
            <div className="w-[85%] h-[1px] bg-amber-500/20"></div>
            <div className="w-[85%] h-[2px] bg-amber-500/40"></div>
          </div>
        </div>

        {/* Book ribbon bookmarks bookmarking read state */}
        {book.status === 'Completed' && (
          <div className="absolute top-0 right-1.5 transform -translate-y-[4px] z-10 text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-md">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
          </div>
        )}
      </div>

      {/* Book title tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-[#1c1512] text-[#fbf6ee] text-xs font-medium px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-amber-800/20 z-50">
        {book.title} <span className="text-[#a6948b]">by {book.author}</span>
      </div>
    </motion.div>
  );
}

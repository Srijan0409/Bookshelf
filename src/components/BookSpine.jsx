import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Star } from 'lucide-react';

// Premium library leather and linen color schemes
const LUXURY_PALETTES = [
  { 
    bg: 'from-[#4a1c1c] to-[#250d0d]', // Crimson Leather
    text: 'text-[#f4e8d0]', 
    accent: 'border-[#c9a66b]/30', 
    ribs: 'border-[#c9a66b]/20',
    type: 'leather'
  },
  { 
    bg: 'from-[#1b2b42] to-[#0d1622]', // Navy Moroccan Leather
    text: 'text-[#f4e8d0]', 
    accent: 'border-[#c9a66b]/30',
    ribs: 'border-[#c9a66b]/20',
    type: 'leather'
  },
  { 
    bg: 'from-[#1e3b2b] to-[#0f1d15]', // Emerald Linen
    text: 'text-[#e8dcc6]', 
    accent: 'border-[#b08d57]/30',
    ribs: 'border-[#b08d57]/15',
    type: 'cloth'
  },
  { 
    bg: 'from-[#784e1b] to-[#3f270d]', // Antique Oak Leather
    text: 'text-[#f4e8d0]', 
    accent: 'border-[#c9a66b]/40',
    ribs: 'border-[#c9a66b]/35',
    type: 'leather'
  },
  { 
    bg: 'from-[#421d3b] to-[#220d1e]', // Plum Suede
    text: 'text-[#e8dcc6]', 
    accent: 'border-[#c9a66b]/20',
    ribs: 'border-[#c9a66b]/15',
    type: 'cloth'
  },
  { 
    bg: 'from-[#2d3238] to-[#171a1d]', // Obsidian Velvet
    text: 'text-[#f4e8d0]', 
    accent: 'border-[#c9a66b]/35',
    ribs: 'border-[#c9a66b]/25',
    type: 'leather'
  },
];

function BookSpine({ book }) {
  const { openDrawer } = useAuth();
  
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hash = getHash(book.title + book.author);
  const palette = LUXURY_PALETTES[hash % LUXURY_PALETTES.length];
  
  // Height variations (between 180px and 220px) to simulate realistic visual variety
  const heights = [180, 192, 205, 215];
  const heightVal = heights[hash % 4];
  
  // Thickness based on page counts
  const pages = book.pages || 200;
  let widthClass = 'w-10'; // < 150 pages
  if (pages >= 150 && pages < 300) widthClass = 'w-11';
  if (pages >= 300 && pages < 500) widthClass = 'w-13';
  if (pages >= 500) widthClass = 'w-15';

  return (
    <motion.div
      onClick={() => openDrawer(book)}
      className="cursor-pointer select-none relative group/spine pb-2 book-draggable"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', book._id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      whileHover={{ 
        y: -16, 
        rotateZ: [0, -2.5, -2],
        scale: 1.02,
        transition: { type: 'spring', stiffness: 220, damping: 15 }
      }}
    >
      {/* Spine Outer */}
      <div 
        style={{ height: `${heightVal}px` }}
        className={`book-spine-3d gold-shimmer-trigger book-shadow-ambient group-hover/spine:book-shadow-lifted bg-gradient-to-b ${palette.bg} ${widthClass} rounded-sm flex flex-col justify-between items-center py-5 border-l border-t ${palette.accent} overflow-hidden`}
      >
        {/* Leather/Cloth Grain Texture Overlay */}
        <div className={`absolute inset-0 opacity-15 pointer-events-none ${
          palette.type === 'leather' ? 'spine-grain-leather' : 'spine-grain-cloth'
        }`} />

        {/* Top Spine Ribs & Gold Trim */}
        <div className="w-full flex flex-col items-center gap-1 relative z-10">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a66b]/40 to-transparent"></div>
          <div className="spine-rib"></div>
          <div className="w-[80%] h-[1.5px] bg-[#c9a66b]/20"></div>
        </div>

        {/* Title & Author running vertically */}
        <div 
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          className={`flex-1 flex items-center justify-center ${palette.text} transform rotate-180 font-serif-book font-medium tracking-widest text-[10px] uppercase px-1 overflow-hidden select-none max-h-[65%] relative z-10`}
        >
          <span className="truncate max-h-[110px]" title={book.title}>
            {book.title}
          </span>
          <span className="opacity-45 text-[7px] font-sans font-semibold tracking-wider mt-3 transform -rotate-180 text-amber-100">
            {book.author}
          </span>
        </div>

        {/* Bottom Spine Ribs, Star, and bookmark Ribbon */}
        <div className="w-full flex flex-col items-center gap-2 relative z-10">
          {book.rating > 0 && (
            <div className="flex flex-col items-center gap-0.5 text-[#c9a66b] opacity-80 group-hover/spine:opacity-100 transition-opacity">
              <Star className="w-2.5 h-2.5 fill-[#c9a66b]/40 text-[#c9a66b]" />
              <span className="text-[7.5px] font-sans font-bold leading-none">{book.rating}</span>
            </div>
          )}
          {book.status === 'Reading' && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(214,163,77,0.8)]" title="Reading Now" />
          )}

          <div className="w-full flex flex-col items-center gap-1">
            <div className="w-[80%] h-[1.5px] bg-[#c9a66b]/20"></div>
            <div className="spine-rib"></div>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a66b]/40 to-transparent"></div>
          </div>
        </div>

        {/* Gold leaf bookmark ribbon hanging at top */}
        {book.status === 'Completed' && (
          <div className="absolute top-0 right-1 transform -translate-y-[3px] z-20 text-[#c9a66b] group-hover/spine:text-amber-300 transition-colors drop-shadow-md">
            <Bookmark className="w-3 h-3 fill-[#c9a66b]" />
          </div>
        )}
      </div>

      {/* Collector style visual tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 bg-[#141110] text-[#f4e8d0] text-[10px] font-sans font-semibold tracking-wider uppercase px-2.5 py-1.5 rounded border border-[#c9a66b]/25 shadow-2xl opacity-0 group-hover/spine:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
        <span className="font-serif-book font-normal text-amber-200 capitalize text-xs tracking-normal block text-center mb-0.5">{book.title}</span>
        <span className="text-[#a48e82] text-[8px]">by {book.author}</span>
      </div>
    </motion.div>
  );
}

const MemoizedBookSpine = memo(BookSpine, (prevProps, nextProps) => {
  return prevProps.book._id === nextProps.book._id &&
         prevProps.book.updatedAt === nextProps.book.updatedAt &&
         prevProps.book.status === nextProps.book.status &&
         prevProps.book.rating === nextProps.book.rating &&
         prevProps.book.currentPage === nextProps.book.currentPage;
});
export default MemoizedBookSpine;

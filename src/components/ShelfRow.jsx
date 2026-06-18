import React, { useState } from 'react';
import BookSpine from './BookSpine';
import { PackageOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Hourglass Ornament Vector
const HourglassOrnament = () => (
  <svg 
    className="w-7 h-7 text-[#c9a66b]/20 dark:text-[#c9a66b]/15 hover:text-[#c9a66b]/65 transition-all duration-500 transform hover:rotate-180" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1"
    title="Time flies, pages turn"
  >
    <path d="M5 2h14M5 22h14" strokeLinecap="round" />
    <path d="M19 2l-7 10 7 10" strokeLinejoin="round" />
    <path d="M5 2l7 10-7 10" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" className="opacity-40" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" className="opacity-40" />
  </svg>
);

// Globe Ornament Vector
const GlobeOrnament = () => (
  <svg 
    className="w-8 h-8 text-[#c9a66b]/20 dark:text-[#c9a66b]/15 hover:text-[#c9a66b]/65 transition-all duration-500 transform hover:scale-110" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1"
    title="Explore the intellectual world"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a13.8 13.8 0 0 1 3.5 9 13.8 13.8 0 0 1-3.5 9 13.8 13.8 0 0 1-3.5-9 13.8 13.8 0 0 1 3.5-9z" />
    <path d="M3 12h18" />
  </svg>
);

export default function ShelfRow({ title, books = [], subtitle }) {
  const { updateBook } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);

  const getStatusFromTitle = (t) => {
    if (t === 'Volumes Reading Now') return 'Reading';
    if (t === 'Completed Sanctuary') return 'Completed';
    if (t === 'Reading Wishlist') return 'Wishlist';
    if (t === 'Paused / Dropped Archives') return 'Paused';
    return null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const bookId = e.dataTransfer.getData('text/plain');
      if (!bookId) return;

      if (subtitle === 'Subject Category') {
        // Drop on Genre shelf
        await updateBook(bookId, { genre: title });
      } else {
        // Drop on Status shelf
        const targetStatus = getStatusFromTitle(title);
        if (targetStatus) {
          await updateBook(bookId, { status: targetStatus });
        }
      }
    } catch (err) {
      console.error('Error on drop:', err);
    }
  };

  return (
    <div className="mb-16 relative select-none">
      {/* 3D Wood Shelf Case Container */}
      <div 
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl overflow-hidden bg-black/35 p-6 pb-0 min-h-[230px] border border-[#c9a66b]/8 transition-all duration-300 ${
          isDragOver ? 'shelf-dropzone-active scale-[1.01]' : ''
        }`}
      >
        
        {/* Horizontal Books list with Ornaments standing on edges */}
        <div className="flex items-end justify-between min-h-[220px] pt-4 pb-1 relative z-10">
          
          {/* Left Shelf Ornament (Vintage Hourglass) */}
          <div className="mb-2.5 hidden sm:block flex-shrink-0 select-none">
            <HourglassOrnament />
          </div>

          {/* Books Row */}
          <div className="flex-1 flex items-end gap-4 px-6 overflow-x-auto overflow-y-hidden min-h-[220px] scrollbar-none justify-start sm:justify-center">
            {books.length > 0 ? (
              books.map((book) => (
                <BookSpine key={book._id} book={book} />
              ))
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a48e82]/35 gap-1.5 font-serif italic text-xs">
                <PackageOpen className="w-5 h-5 stroke-1 opacity-55 text-[#c9a66b]/40" />
                <span>This wooden tier awaits a dropped volume entry...</span>
              </div>
            )}
          </div>

          {/* Right Shelf Ornament (Brass Globe) */}
          <div className="mb-2 hidden sm:block flex-shrink-0 select-none">
            <GlobeOrnament />
          </div>
        </div>

        {/* 3D Walnut Shelf Board */}
        <div className="walnut-shelf-board w-full mt-0 relative z-20 flex justify-center items-center">
          
          {/* Brass Plate Label positioned centered on the shelf face */}
          <div className="absolute -top-[10px] z-30 flex items-center gap-1.5 px-5 py-0.5 rounded-sm brass-label-plate text-[9px] font-serif-book font-bold tracking-widest text-[#2d1e17] uppercase select-none border border-[#e8dcc6]/40">
            {/* Left Rivet Screw */}
            <span className="w-1 h-1 rounded-full bg-black/60 shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.4)]"></span>
            
            <span>{title}</span>
            
            {/* Right Rivet Screw */}
            <span className="w-1 h-1 rounded-full bg-black/60 shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.4)]"></span>
          </div>
        </div>

        {/* LED warm shelf lighting glow */}
        <div className="walnut-shelf-lighting w-full absolute left-0 bottom-0 z-0"></div>
      </div>
    </div>
  );
}

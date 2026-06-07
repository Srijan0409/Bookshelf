import React from 'react';
import BookSpine from './BookSpine';
import { PackageOpen } from 'lucide-react';

export default function ShelfRow({ title, books = [], subtitle }) {
  return (
    <div className="mb-14 relative select-none">
      {/* Shelf Header */}
      <div className="flex justify-between items-baseline px-4 mb-2">
        <h2 className="text-lg font-heading-library font-semibold tracking-wide text-amber-900/90 dark:text-amber-400/90 flex items-center gap-2">
          {title}
          <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-amber-900/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </h2>
        {subtitle && (
          <span className="text-xs font-serif italic text-amber-800/60 dark:text-amber-500/60">
            {subtitle}
          </span>
        )}
      </div>

      {/* Shelf Body Container */}
      <div className="relative rounded-lg overflow-hidden bg-black/5 dark:bg-black/20 p-4 pb-0 min-h-[220px]">
        {/* Horizontal Books Row */}
        <div className="flex items-end gap-3.5 px-4 overflow-x-auto overflow-y-hidden min-h-[230px] pt-4 pb-1 relative z-10 scrollbar-thin">
          {books.length > 0 ? (
            books.map((book) => (
              <BookSpine key={book._id} book={book} />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-850/40 dark:text-amber-100/20 gap-2 font-serif italic text-sm">
              <PackageOpen className="w-6 h-6 stroke-1.5 opacity-60" />
              <span>This shelf sits empty, waiting for its next story...</span>
            </div>
          )}
        </div>

        {/* 3D Wood Shelf Board */}
        <div className="wood-shelf-board w-full mt-0 relative z-20"></div>

        {/* Shelf Drop Shadow */}
        <div className="wood-shelf-shadow w-full absolute left-0 bottom-0 z-0"></div>
      </div>
    </div>
  );
}

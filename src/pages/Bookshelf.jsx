import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ShelfRow from '../components/ShelfRow';
import AddBookModal from '../components/AddBookModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Columns, 
  FolderHeart, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function Bookshelf() {
  const { books, fetchBooks } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('status'); // 'status' or 'genre'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Trigger search/filters fetch
  useEffect(() => {
    fetchBooks({
      status: activeFilter === 'All' ? undefined : activeFilter,
      search: searchQuery
    });
  }, [activeFilter, searchQuery]);

  // Group books helper
  const getGroupedShelves = () => {
    if (groupBy === 'status') {
      const groups = {
        'Reading Now': books.filter(b => b.status === 'Reading'),
        'Completed Sanctuary': books.filter(b => b.status === 'Completed'),
        'Reading Wishlist': books.filter(b => b.status === 'Wishlist'),
        'Paused / Dropped Archives': books.filter(b => b.status === 'Paused' || b.status === 'Dropped')
      };
      return Object.entries(groups);
    } else {
      // Group by Genre
      const genreGroups = {};
      books.forEach(book => {
        const genre = book.genre || 'General';
        if (!genreGroups[genre]) {
          genreGroups[genre] = [];
        }
        genreGroups[genre].push(book);
      });
      return Object.entries(genreGroups).sort((a, b) => b[1].length - a[1].length);
    }
  };

  const groupedShelves = getGroupedShelves();
  const uniqueGenres = ['All', ...new Set(books.map(b => b.genre || 'General'))];

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-[#1c1512] dark:text-[#f3eae3] select-none">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/10 dark:border-amber-900/20 pb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading-library font-bold text-amber-950 dark:text-amber-300">
            My Virtual Sanctuary
          </h1>
          <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] font-serif italic mt-0.5">
            "A room without books is like a body without a soul." — Marcus Tullius Cicero
          </p>
        </div>
        
        {/* Shelf Arrangement & Add triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGroupBy(groupBy === 'status' ? 'genre' : 'status')}
            className="px-3 py-2 border-2 border-amber-900/10 hover:border-amber-500 rounded-xl bg-amber-900/5 dark:bg-amber-400/5 transition-all text-xs font-semibold flex items-center gap-2"
          >
            <Columns className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            <span>Shelve by: {groupBy === 'status' ? 'Status' : 'Genre'}</span>
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-2 shadow-md shadow-amber-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catalog Book</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-[#f3eadf] dark:bg-[#1f1613] p-4 rounded-2xl border border-amber-900/10 dark:border-amber-900/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog by title, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fbf6ee] dark:bg-[#1a120f] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
          />
          <Search className="w-4 h-4 text-[#a6948b] absolute left-3.5 top-3" />
        </div>

        {/* Shelf status categories */}
        <div className="flex overflow-x-auto w-full md:w-auto gap-1.5 py-1 scrollbar-none">
          {['All', 'Reading', 'Completed', 'Wishlist'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-amber-800 border-amber-800 text-white shadow'
                  : 'border-[#e7dfd3] dark:border-[#3d2211] hover:border-amber-500'
              }`}
            >
              {filter === 'All' ? 'All Books' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Virtual Bookcase bookshelves grid */}
      <div className="space-y-4 pt-4">
        {groupedShelves.map(([shelfTitle, shelfBooks]) => (
          <ShelfRow 
            key={shelfTitle}
            title={shelfTitle}
            books={shelfBooks}
            subtitle={groupBy === 'status' ? '' : 'Category Group'}
          />
        ))}
        {books.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-black/5 dark:bg-black/20 rounded-2xl border-2 border-dashed border-amber-900/10 dark:border-amber-900/30">
            <BookOpen className="w-12 h-12 text-[#a6948b] stroke-1" />
            <div>
              <p className="font-serif italic text-lg text-amber-900/80 dark:text-amber-400/80">No books cataloged in this section.</p>
              <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] mt-1">Begin logging your literary cataloging journey today.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl transition-all text-xs font-semibold shadow-md cursor-pointer"
            >
              Add Your First Book
            </button>
          </div>
        )}
      </div>

      {/* Catalog modal */}
      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

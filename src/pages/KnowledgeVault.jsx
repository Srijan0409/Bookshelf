import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Brain, Quote, CheckSquare, Sparkles, BookOpen } from 'lucide-react';

export default function KnowledgeVault() {
  const { books, openDrawer } = useAuth();
  const [filterType, setFilterType] = useState('All'); // 'All', 'Insights', 'Quotes'
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all notes and quotes with book contexts
  const getVaultItems = () => {
    let items = [];

    books.forEach(book => {
      // Add Notes/Insights
      if (book.notes && (filterType === 'All' || filterType === 'Insights')) {
        book.notes.forEach(note => {
          items.push({
            id: `note-${note.id}`,
            type: 'insight',
            content: note.content,
            date: note.createdAt,
            book: book,
            title: book.title,
            author: book.author
          });
        });
      }

      // Add Quotes
      if (book.favoriteQuotes && (filterType === 'All' || filterType === 'Quotes')) {
        book.favoriteQuotes.forEach(quote => {
          items.push({
            id: `quote-${quote.id}`,
            type: 'quote',
            content: quote.text,
            page: quote.page,
            date: quote.createdAt,
            book: book,
            title: book.title,
            author: book.author
          });
        });
      }
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.content.toLowerCase().includes(q) || 
        item.title.toLowerCase().includes(q) || 
        item.author.toLowerCase().includes(q)
      );
    }

    // Sort chronologically (newest first)
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const vaultItems = getVaultItems();

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-[#1c1512] dark:text-[#f3eae3] select-none">
      {/* Page Header */}
      <div className="border-b border-amber-900/10 dark:border-amber-900/20 pb-4">
        <h1 className="text-2xl lg:text-3xl font-heading-library font-bold text-amber-950 dark:text-amber-300 flex items-center gap-3">
          <Brain className="w-8 h-8 text-amber-800 dark:text-amber-400" />
          My Knowledge Vault
        </h1>
        <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] font-serif italic mt-0.5">
          "Reading without reflecting is like eating without digesting." — Edmund Burke
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-[#f3eadf] dark:bg-[#1f1613] p-4 rounded-2xl border border-amber-900/10 dark:border-amber-900/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search insights, quotes, concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fbf6ee] dark:bg-[#1a120f] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
          />
          <Search className="w-4 h-4 text-[#a6948b] absolute left-3.5 top-3" />
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none">
          {['All', 'Insights', 'Quotes'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                filterType === type
                  ? 'bg-amber-800 border-amber-800 text-white shadow'
                  : 'border-[#e7dfd3] dark:border-[#3d2211] hover:border-amber-500'
              }`}
            >
              {type === 'All' ? 'Everything' : type === 'Insights' ? 'Lessons & Insights' : 'Quotes'}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vaultItems.map((item) => (
          <div
            key={item.id}
            onClick={() => openDrawer(item.book)}
            className="group cursor-pointer bg-[#fdfaf6] dark:bg-[#201713] rounded-2xl border-2 border-amber-900/5 hover:border-amber-700/30 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px] relative overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute right-2 bottom-2 opacity-5 dark:opacity-[0.02] group-hover:opacity-10 dark:group-hover:opacity-[0.05] transition-opacity">
              {item.type === 'insight' ? (
                <CheckSquare className="w-24 h-24 text-amber-900" />
              ) : (
                <Quote className="w-24 h-24 text-amber-900" />
              )}
            </div>

            <div>
              {/* Type Badge & Header Icon */}
              <div className="flex items-center gap-2 mb-3.5">
                {item.type === 'insight' ? (
                  <div className="p-1 rounded bg-amber-800/10 text-amber-800 dark:text-amber-400">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="p-1 rounded bg-[#d4af37]/20 text-amber-700 dark:text-amber-400">
                    <Quote className="w-3.5 h-3.5 fill-amber-500/10" />
                  </div>
                )}
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#8c7667] dark:text-[#8e7a70]">
                  {item.type === 'insight' ? 'Insight' : 'Quote'}
                </span>
              </div>

              {/* Core Content */}
              {item.type === 'insight' ? (
                <p className="text-xs font-semibold leading-relaxed text-[#1c1512] dark:text-[#f3eae3] line-clamp-4">
                  {item.content}
                </p>
              ) : (
                <p className="text-xs font-serif italic leading-relaxed text-amber-950 dark:text-amber-200 line-clamp-4">
                  "{item.content}"
                </p>
              )}
            </div>

            {/* Footer referencing the Book */}
            <div className="mt-5 pt-3 border-t border-amber-900/5 dark:border-amber-900/15 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden max-w-[80%]">
                <BookOpen className="w-3.5 h-3.5 text-amber-800/60 dark:text-amber-400/60 flex-shrink-0" />
                <div className="text-[10px] leading-tight overflow-hidden">
                  <p className="font-serif-book font-bold truncate text-amber-900 dark:text-amber-400">{item.title}</p>
                  <p className="text-[#a6948b] truncate">{item.author}</p>
                </div>
              </div>
              
              {item.page && (
                <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-900/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-400 flex-shrink-0">
                  p. {item.page}
                </span>
              )}
            </div>
          </div>
        ))}

        {vaultItems.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-4 bg-black/5 dark:bg-black/20 rounded-2xl border-2 border-dashed border-amber-900/10 dark:border-amber-900/30">
            <Brain className="w-12 h-12 text-[#a6948b] stroke-1 mx-auto" />
            <div>
              <p className="font-serif italic text-lg text-amber-900/80 dark:text-amber-400/80">No insights match your query.</p>
              <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] mt-1">Select a book from your library to add notes, takeaways, and quote excerpts.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

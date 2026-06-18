import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Brain, Quote, CheckSquare, BookOpen, Tag } from 'lucide-react';

export default function KnowledgeVault() {
  const { books, openDrawer } = useAuth();
  const [filterType, setFilterType] = useState('All'); // 'All', 'Insights', 'Quotes'
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState('All'); // 'All', 'Thought', 'Lesson', 'Summary'
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique tags
  const getUniqueTags = () => {
    const tagsSet = new Set();
    books.forEach(book => {
      if (book.notes) {
        book.notes.forEach(note => {
          if (note.tags) {
            note.tags.forEach(t => tagsSet.add(t.toLowerCase()));
          }
        });
      }
    });
    return Array.from(tagsSet);
  };

  const uniqueTags = getUniqueTags();

  const getVaultItems = () => {
    let items = [];

    books.forEach(book => {
      // 1. Process Notes
      if (book.notes && (filterType === 'All' || filterType === 'Insights')) {
        book.notes.forEach(note => {
          // Filter by tag if selected
          if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
            return;
          }
          // Filter by note type if selected
          if (selectedNoteType !== 'All' && note.type !== selectedNoteType) {
            return;
          }

          items.push({
            id: `note-${note.id}`,
            type: 'insight',
            noteType: note.type || 'Lesson',
            tags: note.tags || [],
            content: note.content,
            date: note.createdAt,
            book: book,
            title: book.title,
            author: book.author
          });
        });
      }

      // 2. Process Excerpt Quotes (only if not filtering by tags/noteTypes other than standard)
      if (book.favoriteQuotes && (filterType === 'All' || filterType === 'Quotes')) {
        // Excerpts don't have tags or custom note types, so only include them if no tag/type filter is active
        if (!selectedTag && selectedNoteType === 'All') {
          book.favoriteQuotes.forEach(quote => {
            items.push({
              id: `quote-${quote.id}`,
              type: 'quote',
              noteType: 'Excerpt',
              tags: [],
              content: quote.text,
              page: quote.page,
              date: quote.createdAt,
              book: book,
              title: book.title,
              author: book.author
            });
          });
        }
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.content.toLowerCase().includes(q) || 
        item.title.toLowerCase().includes(q) || 
        item.author.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const vaultItems = getVaultItems();

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-[#f4e8d0] select-none relative z-10">
      {/* Page Header */}
      <div className="border-b border-[#c9a66b]/10 pb-4">
        <h1 className="text-2xl lg:text-3xl font-serif-book font-bold text-[#c9a66b] flex items-center gap-3">
          <Brain className="w-7 h-7 text-[#c9a66b]" />
          My Knowledge Vault
        </h1>
        <p className="text-[11px] text-[#a48e82] font-serif italic mt-0.5">
          "Reading without reflecting is like eating without digesting." — Edmund Burke
        </p>
      </div>

      {/* Tag Cloud & Category Filters Container */}
      <div className="space-y-4">
        {/* Dynamic Tag Filter Cloud */}
        {uniqueTags.length > 0 && (
          <div className="bg-[#1f1612]/30 dark:bg-black/20 p-3 rounded-xl border border-[#c9a66b]/10 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="font-bold text-[#a48e82] uppercase tracking-wider mr-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#c9a66b]" /> Tag Index:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-2 py-0.5 rounded border ${
                !selectedTag
                  ? 'bg-[#c9a66b] border-[#c9a66b] text-black font-extrabold'
                  : 'border-[#c9a66b]/15 hover:border-[#c9a66b]/40 text-[#e8dcc6]/80'
              } transition-all cursor-pointer`}
            >
              All Tags
            </button>
            {uniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-2 py-0.5 rounded border flex items-center gap-0.5 transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#c9a66b] border-[#c9a66b] text-black font-extrabold'
                    : 'border-[#c9a66b]/15 hover:border-[#c9a66b]/40 text-[#e8dcc6]/80'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Filter and Search Panel */}
        <div className="bg-[#1f1612]/30 dark:bg-black/20 p-4 rounded-2xl border border-[#c9a66b]/10 flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              placeholder="Search insights, quotes, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
            />
            <Search className="w-4 h-4 text-[#a48e82] absolute left-3.5 top-3" />
          </div>

          {/* Sub-Filters / Tab Selector */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center justify-start lg:justify-end">
            {/* Note/Quote Mode */}
            <div className="flex gap-1.5 border-r border-[#c9a66b]/20 pr-4 mr-2">
              {['All', 'Insights', 'Quotes'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setSelectedNoteType('All');
                  }}
                  className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-[#c9a66b] border-[#c9a66b] text-black'
                      : 'border-[#c9a66b]/15 text-[#e8dcc6]/70 hover:bg-[#c9a66b]/5'
                  }`}
                >
                  {type === 'All' ? 'Everything' : type === 'Insights' ? 'Scholarly Insights' : 'Favorite Quotes'}
                </button>
              ))}
            </div>

            {/* Note Category filter (only visible if Insights or All mode) */}
            {filterType !== 'Quotes' && (
              <div className="flex gap-1">
                {['All', 'Thought', 'Lesson', 'Summary'].map((nType) => (
                  <button
                    key={nType}
                    onClick={() => setSelectedNoteType(nType)}
                    className={`px-2.5 py-1 rounded-md text-[8.5px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedNoteType === nType
                        ? 'bg-[#b08d57] border-[#b08d57] text-black'
                        : 'border-[#c9a66b]/10 text-[#e8dcc6]/60 hover:text-white'
                    }`}
                  >
                    {nType}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vaultItems.map((item) => (
          <div
            key={item.id}
            onClick={() => openDrawer(item.book)}
            className="group cursor-pointer bg-black/20 rounded-2xl border border-[#c9a66b]/12 hover:border-[#c9a66b]/35 p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:translate-y-[-3px] relative overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute right-2 bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              {item.type === 'insight' ? (
                <CheckSquare className="w-20 h-20 text-[#c9a66b]" />
              ) : (
                <Quote className="w-20 h-20 text-[#c9a66b]" />
              )}
            </div>

            <div>
              {/* Header tags and labels */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#b08d57]/15 text-[#b08d57]">
                    {item.noteType}
                  </span>
                </div>
                
                {/* Note creation date */}
                {item.date && (
                  <span className="text-[7.5px] text-[#a48e82] font-semibold">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Core Content */}
              {item.type === 'insight' ? (
                <p className="text-xs font-serif-book leading-relaxed text-[#f4e8d0] line-clamp-5">
                  {item.content}
                </p>
              ) : (
                <p className="font-handwritten-journal text-lg leading-tight text-amber-100/90 line-clamp-4">
                  "{item.content}"
                </p>
              )}

              {/* Render Tag badges inside vault card */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map(t => (
                    <span key={t} className="text-[8px] px-1 bg-black/30 text-[#a48e82] rounded flex items-center gap-0.5 border border-[#c9a66b]/5">
                      <Tag className="w-2 h-2 opacity-60" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Book details */}
            <div className="mt-5 pt-3.5 border-t border-[#c9a66b]/10 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden max-w-[80%]">
                <BookOpen className="w-3.5 h-3.5 text-[#c9a66b]/50 flex-shrink-0" />
                <div className="text-[10px] leading-tight overflow-hidden">
                  <p className="font-serif-book font-bold truncate text-[#c9a66b]">{item.title}</p>
                  <p className="text-[#a48e82] text-[8.5px] truncate">{item.author}</p>
                </div>
              </div>
              
              {item.page && (
                <span className="text-[8px] font-sans font-bold px-1.5 py-0.5 rounded bg-[#c9a66b]/10 text-[#c9a66b] flex-shrink-0">
                  p. {item.page}
                </span>
              )}
            </div>
          </div>
        ))}

        {vaultItems.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-black/10 rounded-2xl border-2 border-dashed border-[#c9a66b]/12">
            <Brain className="w-12 h-12 text-[#a48e82] stroke-1 mx-auto" />
            <div>
              <p className="font-serif-book italic text-lg text-[#c9a66b]">No insights match your search query.</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#a48e82] mt-1">Select a shelf book to add reflections, notes, and quotes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

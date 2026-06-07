import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Search, BookOpen, Loader2, Sparkles } from 'lucide-react';

export default function AddBookModal({ isOpen, onClose }) {
  const { addBook } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [genre, setGenre] = useState('');
  const [pages, setPages] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [status, setStatus] = useState('Reading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(searchQuery)}&limit=5`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        
        const books = data.docs.map(doc => ({
          title: doc.title,
          subtitle: doc.subtitle || '',
          author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
          coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
          genre: doc.subject ? doc.subject[0] : 'General',
          pages: doc.number_of_pages_median || 200,
          publicationYear: doc.first_publish_year || new Date().getFullYear()
        }));

        setSearchResults(books);
      } catch (err) {
        console.error('OpenLibrary API search error:', err);
        setSearchError('Could not fetch book details. Try filling manually.');
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectBook = (selected) => {
    setTitle(selected.title);
    setSubtitle(selected.subtitle);
    setAuthor(selected.author);
    setCoverImage(selected.coverImage);
    setGenre(selected.genre);
    setPages(selected.pages);
    setPublicationYear(selected.publicationYear);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim() || !pages) {
      setFormError('Please fill in all required fields (Title, Author, Genre, Pages).');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const res = await addBook({
      title,
      subtitle,
      author,
      coverImage,
      genre,
      pages: Number(pages),
      publicationYear: Number(publicationYear) || undefined,
      status
    });

    setIsSubmitting(false);

    if (res.success) {
      // Clear forms
      setTitle('');
      setSubtitle('');
      setAuthor('');
      setCoverImage('');
      setGenre('');
      setPages('');
      setPublicationYear('');
      setStatus('Reading');
      onClose();
    } else {
      setFormError(res.error || 'Failed to add book. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-[#1c1512] dark:text-[#f3eae3] select-none">
      <div className="bg-[#fbf6ee] dark:bg-[#1a120f] max-w-lg w-full rounded-2xl border-2 border-amber-900/10 dark:border-amber-900/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="bg-[#f7efe3] dark:bg-[#201713] px-6 py-4 border-b border-amber-900/10 dark:border-amber-900/20 flex items-center justify-between">
          <h3 className="text-lg font-heading-library font-semibold text-amber-900 dark:text-amber-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Catalog a New Book
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[#5c4e47] dark:text-[#a6948b]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Smart Autocomplete Search */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" /> Autofill Book via Search (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type title (e.g. 'Atomic Habits' or 'Sapiens')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-sm"
              />
              <div className="absolute left-3.5 top-3 text-[#a6948b]">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> : <Search className="w-4 h-4" />}
              </div>
            </div>

            {/* Live suggestions dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[#fdfaf6] dark:bg-[#201713] border-2 border-amber-800/20 rounded-xl shadow-xl z-20 divide-y divide-[#e7dfd3] dark:divide-[#3d2211] max-h-60 overflow-y-auto">
                {searchResults.map((bookResult, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectBook(bookResult)}
                    className="w-full px-4 py-2.5 hover:bg-amber-900/5 text-left text-xs flex gap-3 items-center transition-colors"
                  >
                    {bookResult.coverImage ? (
                      <img src={bookResult.coverImage} className="w-8 h-11 object-cover rounded shadow" alt="Cover" />
                    ) : (
                      <div className="w-8 h-11 bg-amber-900/10 dark:bg-amber-400/10 rounded flex items-center justify-center text-[8px]">No Cover</div>
                    )}
                    <div>
                      <p className="font-bold text-amber-950 dark:text-amber-300 line-clamp-1">{bookResult.title}</p>
                      <p className="text-[#5c4e47] dark:text-[#a6948b]">{bookResult.author} ({bookResult.publicationYear})</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchError && <p className="text-[10px] text-amber-600/80 font-medium mt-1">{searchError}</p>}
          </div>

          <div className="h-[1px] bg-amber-900/10 dark:bg-amber-900/20 my-2"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-lg">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                  required
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Genre */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Genre *
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Self-Improvement"
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                  required
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Pages */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Pages *
                </label>
                <input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                  required
                />
              </div>

              {/* Pub Year */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-medium"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#5c4e47] dark:text-[#a6948b] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#e7dfd3] dark:border-[#3d2211] bg-[#fdfaf6] dark:bg-[#1f1613] rounded-xl outline-none focus:border-amber-500 text-xs font-semibold cursor-pointer"
                >
                  <option value="Reading">Reading</option>
                  <option value="Completed">Completed</option>
                  <option value="Wishlist">Wishlist</option>
                  <option value="Paused">Paused</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-amber-900/10 dark:border-amber-900/20">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border-2 border-[#e7dfd3] dark:border-[#3d2211] text-[#5c4e47] dark:text-[#a6948b] font-semibold text-xs rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/55 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-900/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cataloging...</span>
                  </>
                ) : (
                  <span>Catalog Book</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

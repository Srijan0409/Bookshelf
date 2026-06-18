import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Search, BookOpen, Loader2, Sparkles } from 'lucide-react';

export default function AddBookModal({ isOpen, onClose }) {
  const { addBook, token } = useAuth();
  
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
  const [currentPage, setCurrentPage] = useState('0');
  const [publicationYear, setPublicationYear] = useState('');
  const [status, setStatus] = useState('Reading');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Debounced search via Google Books API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const API_BASE = 'http://localhost:5000/api/v1';
        const res = await fetch(`${API_BASE}/books/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        
        const books = (data.items || []).map(item => {
          const info = item.volumeInfo || {};
          let cover = '';
          if (info.imageLinks) {
            cover = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
            if (cover.startsWith('http://')) {
              cover = cover.replace('http://', 'https://');
            }
          }
          
          let parsedIsbn = '';
          if (info.industryIdentifiers) {
            const isbn13 = info.industryIdentifiers.find(id => id.type === 'ISBN_13');
            const isbn10 = info.industryIdentifiers.find(id => id.type === 'ISBN_10');
            parsedIsbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : '');
          }

          const publishYear = info.publishedDate 
            ? new Date(info.publishedDate).getFullYear() || parseInt(info.publishedDate.substring(0, 4))
            : new Date().getFullYear();

          return {
            title: info.title || '',
            subtitle: info.subtitle || (info.description ? (info.description.substring(0, 120) + (info.description.length > 120 ? '...' : '')) : ''),
            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
            coverImage: cover,
            genre: info.categories ? info.categories[0] : 'General',
            pages: info.pageCount || 200,
            publicationYear: isNaN(publishYear) ? new Date().getFullYear() : publishYear,
            isbn: parsedIsbn,
            description: info.description || '',
            categories: info.categories || []
          };
        });

        setSearchResults(books);
      } catch (err) {
        console.error('Google Books API search error:', err);
        setSearchError('Could not fetch book details. Try filling manually.');
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Synchronize status and page counts
  useEffect(() => {
    if (status === 'Completed' && pages) {
      setCurrentPage(pages.toString());
    } else if (status === 'Wishlist') {
      setCurrentPage('0');
    }
  }, [status, pages]);

  if (!isOpen) return null;

  const handleSelectBook = (selected) => {
    setTitle(selected.title);
    setSubtitle(selected.subtitle);
    setAuthor(selected.author);
    setCoverImage(selected.coverImage);
    setGenre(selected.genre);
    setPages(selected.pages);
    setPublicationYear(selected.publicationYear);
    setIsbn(selected.isbn);
    setDescription(selected.description);
    setCategories(selected.categories);
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
      currentPage: Number(currentPage) || 0,
      publicationYear: Number(publicationYear) || undefined,
      status,
      isbn,
      description,
      categories
    });

    setIsSubmitting(false);

    if (res.success) {
      setTitle('');
      setSubtitle('');
      setAuthor('');
      setCoverImage('');
      setGenre('');
      setPages('');
      setCurrentPage('0');
      setPublicationYear('');
      setIsbn('');
      setDescription('');
      setCategories([]);
      setStatus('Reading');
      onClose();
    } else {
      setFormError(res.error || 'Failed to add book. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-[#f4e8d0] select-none">
      {/* Modal Box */}
      <div className="bg-[#1c1411] max-w-lg w-full rounded-2xl border-2 border-[#c9a66b]/20 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="bg-black/20 px-6 py-4 border-b border-[#c9a66b]/10 flex items-center justify-between">
          <h3 className="text-base font-serif-book font-bold text-[#c9a66b] flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Catalog a New Volume
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-[#a48e82] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Google Books Autocomplete Search */}
          <div className="relative">
            <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a66b] fill-[#c9a66b]/10" /> Query Google Books API (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type title, author, or ISBN (e.g. 'Deep Work')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
              />
              <div className="absolute left-3 top-3 text-[#a48e82]">
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c9a66b]" /> : <Search className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Suggestions list */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[#241a16] border border-[#c9a66b]/20 rounded-xl shadow-2xl z-20 divide-y divide-[#c9a66b]/10 max-h-60 overflow-y-auto">
                {searchResults.map((bookResult, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectBook(bookResult)}
                    className="w-full px-4 py-2.5 hover:bg-[#c9a66b]/5 text-left text-xs flex gap-3 items-center transition-colors"
                  >
                    {bookResult.coverImage ? (
                      <img src={bookResult.coverImage} className="w-8 h-11 object-cover rounded shadow" alt="Cover" />
                    ) : (
                      <div className="w-8 h-11 bg-black/40 rounded flex items-center justify-center text-[7px] text-[#a48e82]">No Cover</div>
                    )}
                    <div>
                      <p className="font-bold text-[#c9a66b] line-clamp-1">{bookResult.title}</p>
                      <p className="text-[10px] text-[#a48e82] font-semibold">{bookResult.author} ({bookResult.publicationYear})</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchError && <p className="text-[9px] text-[#c9a66b] mt-1 font-semibold">{searchError}</p>}
          </div>

          <div className="h-[1px] bg-[#c9a66b]/10 my-1"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-semibold rounded-lg text-center">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Volume Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                  required
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Genre */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Genre *
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Philosophy"
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                  required
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Pages */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Pages *
                </label>
                <input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                  required
                />
              </div>

              {/* Start Page (progress) */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Current Page
                </label>
                <input
                  type="number"
                  min="0"
                  max={pages || 9999}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                  disabled={status === 'Completed' || status === 'Wishlist'}
                />
              </div>

              {/* Pub Year */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold cursor-pointer text-[#e8dcc6]"
                >
                  <option value="Reading">Reading</option>
                  <option value="Completed">Completed</option>
                  <option value="Wishlist">Wishlist</option>
                  <option value="Paused">Paused</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>

            {/* ISBN field */}
            <div>
              <label className="block text-[8px] uppercase font-bold tracking-widest text-[#a48e82] mb-1">
                ISBN Code
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 9781473637467"
                className="w-full px-3 py-2 border border-[#c9a66b]/15 bg-black/20 rounded-xl outline-none focus:border-[#c9a66b] text-xs font-semibold"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#c9a66b]/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-[#c9a66b]/15 text-[#a48e82] hover:bg-white/5 font-semibold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#b08d57] hover:bg-[#c9a66b] disabled:bg-[#b08d57]/50 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Catalog Volume</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

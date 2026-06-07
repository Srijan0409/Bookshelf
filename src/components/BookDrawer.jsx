import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Calendar, 
  BookOpen, 
  BookMarked,
  Trash2, 
  Plus, 
  Check, 
  Edit3, 
  Quote, 
  CheckSquare, 
  Star,
  FileText
} from 'lucide-react';

// Star Rating with Half-Star support
const StarRating = ({ rating, onChange }) => {
  const [hoverRating, setHoverRating] = useState(null);
  const stars = [1, 2, 3, 4, 5];

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div className="flex gap-1 items-center">
      {stars.map((star, i) => {
        const starValue = i + 1;
        const currentRating = hoverRating !== null ? hoverRating : rating;
        
        let fillType = 'empty';
        if (currentRating >= starValue) {
          fillType = 'full';
        } else if (currentRating === starValue - 0.5) {
          fillType = 'half';
        }

        return (
          <div
            key={star}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isHalf = x < rect.width / 2;
              onChange(index + (isHalf ? 0.5 : 1));
            }}
            className="cursor-pointer relative text-amber-500 w-6 h-6 hover:scale-110 transition-all duration-150"
          >
            <Star className="w-6 h-6 absolute top-0 left-0 text-amber-500/20" />
            {fillType === 'full' && (
              <Star className="w-6 h-6 absolute top-0 left-0 fill-amber-400 text-amber-500" />
            )}
            {fillType === 'half' && (
              <div className="w-[50%] overflow-hidden absolute top-0 left-0 h-6">
                <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              </div>
            )}
          </div>
        );
      })}
      {rating > 0 && (
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-2">
          {rating} / 5
        </span>
      )}
    </div>
  );
};

export default function BookDrawer() {
  const { 
    activeBook, 
    isDrawerOpen, 
    closeDrawer, 
    updateBook, 
    deleteBook,
    addNote,
    updateNote,
    deleteNote,
    addQuote,
    deleteQuote
  } = useAuth();

  const [status, setStatus] = useState('Reading');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Notes and Quotes temporary state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuotePage, setNewQuotePage] = useState('');

  // Sync state with activeBook
  useEffect(() => {
    if (activeBook) {
      setStatus(activeBook.status || 'Reading');
      setRating(activeBook.rating || 0);
      setReview(activeBook.review?.content || '');
      setIsSaved(false);
    }
  }, [activeBook]);

  if (!activeBook) return null;

  // Reading Duration Calculator
  const getReadingDuration = () => {
    if (!activeBook.startDate) return null;
    const start = new Date(activeBook.startDate);
    const end = activeBook.finishDate ? new Date(activeBook.finishDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  const handleFieldChange = async (fields) => {
    setIsSaving(true);
    await updateBook(activeBook._id, fields);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReviewSave = async () => {
    await handleFieldChange({ review });
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    await addNote(activeBook._id, newNoteContent);
    setNewNoteContent('');
  };

  const handleStartEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleSaveEditNote = async (noteId) => {
    if (!editingNoteContent.trim()) return;
    await updateNote(activeBook._id, noteId, editingNoteContent);
    setEditingNoteId(null);
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    await addQuote(activeBook._id, newQuoteText, newQuotePage);
    setNewQuoteText('');
    setNewQuotePage('');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40"
          />

          {/* Sliding Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] lg:w-[580px] bg-[#fbf6ee] dark:bg-[#1a120f] border-l border-amber-900/15 dark:border-amber-900/30 z-50 overflow-y-auto shadow-2xl flex flex-col font-sans select-none text-[#1c1512] dark:text-[#f3eae3]"
          >
            {/* Header Toolbar */}
            <div className="sticky top-0 bg-[#f7efe3] dark:bg-[#201713] border-b border-amber-900/10 dark:border-amber-900/20 px-6 py-4 flex items-center justify-between z-10">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-800 dark:text-amber-400">
                Book Details
              </span>
              <div className="flex items-center gap-3">
                {isSaving && <span className="text-xs text-amber-700/60 dark:text-amber-400/60 animate-pulse">Saving...</span>}
                {isSaved && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Changes Saved!</span>}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this book from your library? This cannot be undone.')) {
                      deleteBook(activeBook._id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors"
                  title="Remove book from library"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-amber-900 dark:text-amber-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-8 flex-1">
              {/* Book Metadata Section */}
              <div className="flex gap-5 flex-col sm:flex-row pb-6 border-b border-amber-900/10 dark:border-amber-900/20">
                {/* Book Cover image or Mock Cover */}
                <div className="w-32 h-44 flex-shrink-0 mx-auto sm:mx-0 book-shadow-ambient rounded-lg overflow-hidden bg-[#e8dfd2] dark:bg-[#2c201a] border border-[#d8c8bf] dark:border-[#3a2012]">
                  {activeBook.coverImage ? (
                    <img 
                      src={activeBook.coverImage} 
                      alt={activeBook.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=150';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-b from-[#6b1e1e] to-[#471010] text-amber-200">
                      <span className="text-[10px] uppercase font-semibold font-sans tracking-wide">Reader's</span>
                      <span className="font-serif-book font-semibold text-xs leading-tight line-clamp-3">{activeBook.title}</span>
                      <span className="text-[8px] font-sans opacity-70 truncate">{activeBook.author}</span>
                    </div>
                  )}
                </div>

                {/* Meta details */}
                <div className="flex-1 flex flex-col justify-between text-center sm:text-left mt-2 sm:mt-0">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-serif-book font-bold text-amber-950 dark:text-amber-300 leading-tight">
                      {activeBook.title}
                    </h2>
                    {activeBook.subtitle && (
                      <p className="text-xs text-amber-800/70 dark:text-amber-400/70 italic mt-0.5 leading-snug">
                        {activeBook.subtitle}
                      </p>
                    )}
                    <p className="text-sm font-semibold mt-2 text-[#5c4e47] dark:text-[#a6948b]">
                      by {activeBook.author}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-[#f0e6d9] dark:bg-[#241a16] p-2 rounded-lg border border-[#e2d4c3] dark:border-[#38261e]">
                      <span className="block text-[#8c7667] dark:text-[#8e7a70] uppercase font-bold tracking-wider text-[9px] mb-0.5">Genre</span>
                      <span className="font-semibold">{activeBook.genre}</span>
                    </div>
                    <div className="bg-[#f0e6d9] dark:bg-[#241a16] p-2 rounded-lg border border-[#e2d4c3] dark:border-[#38261e]">
                      <span className="block text-[#8c7667] dark:text-[#8e7a70] uppercase font-bold tracking-wider text-[9px] mb-0.5">Length</span>
                      <span className="font-semibold">{activeBook.pages} pages</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reading Stats & Settings Section */}
              <div className="bg-[#f3eadf] dark:bg-[#201713] p-5 rounded-2xl border border-amber-900/10 dark:border-amber-900/20 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Status Dropdown */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#8e7a70] mb-1">
                      Reading Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => {
                          setStatus(e.target.value);
                          handleFieldChange({ status: e.target.value });
                        }}
                        className="w-full sm:w-44 px-3 py-1.5 bg-[#fbf6ee] dark:bg-[#1a120f] border-2 border-[#e7dfd3] dark:border-[#3d2211] rounded-lg outline-none font-semibold text-sm cursor-pointer"
                      >
                        <option value="Reading">Reading</option>
                        <option value="Completed">Completed</option>
                        <option value="Wishlist">Wishlist</option>
                        <option value="Paused">Paused</option>
                        <option value="Dropped">Dropped</option>
                      </select>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#8e7a70] mb-1">
                      Personal Rating
                    </label>
                    <StarRating
                      rating={rating}
                      onChange={(newVal) => {
                        setRating(newVal);
                        handleFieldChange({ rating: newVal });
                      }}
                    />
                  </div>
                </div>

                {/* Start & End Dates details */}
                <div className="pt-2 grid grid-cols-2 gap-4 border-t border-amber-900/5 dark:border-amber-900/10">
                  <div className="flex items-center gap-2.5 text-xs">
                    <Calendar className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#8e7a70]">Started</span>
                      <input 
                        type="date"
                        value={activeBook.startDate ? new Date(activeBook.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFieldChange({ startDate: e.target.value })}
                        className="font-medium bg-transparent focus:underline outline-none text-[#1c1512] dark:text-[#f3eae3] cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <BookMarked className="w-4 h-4 text-amber-850 dark:text-amber-400" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold tracking-wider text-[#8c7667] dark:text-[#8e7a70]">Finished</span>
                      <input 
                        type="date"
                        value={activeBook.finishDate ? new Date(activeBook.finishDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFieldChange({ finishDate: e.target.value })}
                        className="font-medium bg-transparent focus:underline outline-none text-[#1c1512] dark:text-[#f3eae3] cursor-pointer"
                        disabled={status !== 'Completed'}
                      />
                    </div>
                  </div>
                </div>

                {/* Elapsed reading duration */}
                {activeBook.startDate && (
                  <div className="text-[11px] text-[#5c4e47] dark:text-[#a6948b] pt-1 text-center font-serif italic">
                    Reading Journey: {getReadingDuration()}
                  </div>
                )}
              </div>

              {/* Journal / Review Entry */}
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Personal Reflection
                </h3>
                <div className="relative rounded-2xl overflow-hidden border border-amber-900/10 dark:border-amber-900/20 shadow-inner">
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    onBlur={handleReviewSave}
                    placeholder="Reflect on this book. What major lessons did it teach you? Write your review..."
                    className="w-full h-32 p-4 bg-[#faf2e6] dark:bg-[#1a120f] outline-none font-serif text-sm leading-relaxed resize-none"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button
                      onClick={handleReviewSave}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-800 hover:bg-amber-900 text-white rounded shadow-md transition-colors"
                    >
                      Save Journal
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes Manager */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Lessons & Key Insights
                </h3>
                
                {/* Notes list */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeBook.notes && activeBook.notes.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-3 bg-[#f7efe3] dark:bg-[#201713] rounded-xl border border-amber-900/5 dark:border-amber-900/15 flex items-start gap-2 group/note justify-between"
                    >
                      {editingNoteId === note.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-amber-500 rounded bg-[#fbf6ee] dark:bg-[#1a120f]"
                          />
                          <button 
                            onClick={() => handleSaveEditNote(note.id)}
                            className="p-1.5 bg-emerald-600 text-[#fbf6ee] rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></span>
                            <p className="text-xs font-medium leading-relaxed">{note.content}</p>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover/note:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEditNote(note)}
                              className="p-1 hover:bg-amber-900/5 text-[#8c7667] dark:text-[#a6948b] hover:text-amber-900 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteNote(activeBook._id, note.id)}
                              className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {(!activeBook.notes || activeBook.notes.length === 0) && (
                    <p className="text-xs text-[#5c4e47]/60 dark:text-[#a6948b]/40 italic">
                      No key insights added yet. Add lessons to build your second brain.
                    </p>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a lesson learned..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#faf2e6] dark:bg-[#1f1613] border border-[#e7dfd3] dark:border-[#38261e] rounded-lg outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Quotes Vault Section */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm uppercase tracking-wider font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                  <Quote className="w-4 h-4" /> Favorite Quotes Vault
                </h3>

                {/* Quotes List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {activeBook.favoriteQuotes && activeBook.favoriteQuotes.map((quote) => (
                    <div 
                      key={quote.id} 
                      className="p-4 bg-amber-900/5 dark:bg-amber-400/5 border-l-4 border-amber-600 rounded-r-xl relative group/quote"
                    >
                      <button
                        onClick={() => deleteQuote(activeBook._id, quote.id)}
                        className="absolute right-2 top-2 p-1 text-red-400 opacity-0 group-hover/quote:opacity-100 hover:text-red-500 transition-all rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-xs font-serif italic text-amber-950 dark:text-amber-200 leading-relaxed pr-6">
                        "{quote.text}"
                      </p>
                      {quote.page && (
                        <span className="block text-[10px] font-sans font-bold text-amber-800 dark:text-amber-500 mt-2 text-right">
                          — Page {quote.page}
                        </span>
                      )}
                    </div>
                  ))}
                  {(!activeBook.favoriteQuotes || activeBook.favoriteQuotes.length === 0) && (
                    <p className="text-xs text-[#5c4e47]/60 dark:text-[#a6948b]/40 italic">
                      No quotes gathered from this book yet.
                    </p>
                  )}
                </div>

                {/* Add Quote Form */}
                <form onSubmit={handleAddQuote} className="space-y-2 p-3 bg-[#faf2e6] dark:bg-[#1f1613] border border-[#e7dfd3] dark:border-[#38261e] rounded-xl">
                  <textarea
                    placeholder="Enter quote..."
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    className="w-full h-14 p-2 text-xs bg-transparent border-0 outline-none resize-none font-serif italic"
                    required
                  />
                  <div className="flex gap-2 justify-end">
                    <input
                      type="number"
                      placeholder="Page (opt)"
                      value={newQuotePage}
                      onChange={(e) => setNewQuotePage(e.target.value)}
                      className="w-20 px-2 py-1 text-xs bg-[#fbf6ee] dark:bg-[#1a120f] border border-[#e7dfd3] dark:border-[#38261e] rounded"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Save Quote
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

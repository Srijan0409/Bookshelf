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
  FileText,
  Tag,
  Activity,
  Clock,
  PlusCircle
} from 'lucide-react';

// Star Rating with candlelight gold color
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
              onChange(i + (isHalf ? 0.5 : 1));
            }}
            className="cursor-pointer relative text-[#e2b96a] w-5 h-5 hover:scale-120 transition-all duration-150"
          >
            <Star className="w-5 h-5 absolute top-0 left-0 text-[#e2b96a]/15" />
            {fillType === 'full' && (
              <Star className="w-5 h-5 absolute top-0 left-0 fill-[#e2b96a] text-[#b08d57]" />
            )}
            {fillType === 'half' && (
              <div className="w-[50%] overflow-hidden absolute top-0 left-0 h-5">
                <Star className="w-5 h-5 fill-[#e2b96a] text-[#b08d57]" />
              </div>
            )}
          </div>
        );
      })}
      {rating > 0 && (
        <span className="text-[10px] font-sans font-bold text-[#b08d57] ml-2">
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
    deleteQuote,
    addReadingSession,
    deleteReadingSession
  } = useAuth();

  const [status, setStatus] = useState('Reading');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Notes and Quotes state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState('Lesson');
  const [newNoteTags, setNewNoteTags] = useState('');
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [editingNoteType, setEditingNoteType] = useState('Lesson');
  const [editingNoteTags, setEditingNoteTags] = useState('');

  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuotePage, setNewQuotePage] = useState('');

  // Reading session logging state
  const [sessionPages, setSessionPages] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeBook) {
      setStatus(activeBook.status || 'Reading');
      setRating(activeBook.rating || 0);
      setReview(activeBook.review?.content || '');
      setCurrentPage(activeBook.currentPage || 0);
      setIsSaved(false);
      // Reset inputs
      setSessionPages('');
      setSessionDuration('');
    }
  }, [activeBook]);

  if (!activeBook) return null;

  const progressPercentage = activeBook.pages > 0 
    ? Math.min(Math.round((currentPage / activeBook.pages) * 100), 100) 
    : 0;

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

  const handlePageSliderChange = (e) => {
    const value = Number(e.target.value);
    setCurrentPage(value);
  };

  const handlePageSliderRelease = async () => {
    await handleFieldChange({ currentPage: Number(currentPage) });
  };

  const handleReviewSave = async () => {
    await handleFieldChange({ review });
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    
    // Parse comma-separated tags
    const tagsArray = newNoteTags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    await addNote(activeBook._id, newNoteContent, newNoteType, tagsArray);
    setNewNoteContent('');
    setNewNoteTags('');
    setNewNoteType('Lesson');
  };

  const handleStartEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
    setEditingNoteType(note.type || 'Lesson');
    setEditingNoteTags(note.tags ? note.tags.join(', ') : '');
  };

  const handleSaveEditNote = async (noteId) => {
    if (!editingNoteContent.trim()) return;
    const tagsArray = editingNoteTags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    await updateNote(activeBook._id, noteId, editingNoteContent, editingNoteType, tagsArray);
    setEditingNoteId(null);
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    await addQuote(activeBook._id, newQuoteText, newQuotePage);
    setNewQuoteText('');
    setNewQuotePage('');
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!sessionPages) return;
    
    const res = await addReadingSession(
      activeBook._id, 
      Number(sessionPages), 
      sessionDuration ? Number(sessionDuration) : undefined,
      sessionDate
    );
    
    // Adjust visual progress locally immediately
    const nextPages = Math.min(currentPage + Number(sessionPages), activeBook.pages);
    setCurrentPage(nextPages);
    
    setSessionPages('');
    setSessionDuration('');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Ambient Room Shadow Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-[#0c0a09]/80 backdrop-blur-sm z-40"
          />

          {/* Leather-bound Journal Slide-out Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 23 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[760px] lg:w-[1000px] bg-[#221611] border-l-8 border-[#3b2116] z-50 overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col font-sans select-none text-[#1a1411]"
          >
            {/* Lined Cream Paper Container wrapping all contents */}
            <div className="flex-1 bg-[#f4e8d0] border-l-2 border-r-2 border-dashed border-[#b08d57]/30 m-4 p-6 space-y-6 flex flex-col rounded shadow-2xl relative">
              
              {/* Paper Lines subtle design overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(176,141,87,0.06)_1px,transparent_1px)] bg-[size:100%_24px] pointer-events-none rounded"></div>

              {/* Header Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#b08d57]/20 relative z-10">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#b08d57] font-sans">
                  Private Reading Log
                </span>
                <div className="flex items-center gap-3">
                  {isSaving && <span className="text-[10px] uppercase font-bold text-[#b08d57]/60 animate-pulse">Recording...</span>}
                  {isSaved && <span className="text-[10px] uppercase font-bold text-emerald-700">Logged!</span>}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this treasured volume from your collection?')) {
                        deleteBook(activeBook._id);
                      }
                    }}
                    className="p-1 rounded hover:bg-black/5 text-red-700/80 hover:text-red-700 transition-all cursor-pointer"
                    title="De-catalog book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="p-1 rounded hover:bg-black/5 text-[#b08d57] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Two-Column Open Book/Journal Grid on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-1 overflow-y-auto">
                
                {/* LEFT PAGE: Metadata, Status, Slider Progress, and Reading Session Logging */}
                <div className="lg:col-span-5 space-y-6 lg:border-r lg:border-dashed lg:border-[#b08d57]/30 lg:pr-6">
                  
                  {/* Book Metadata Cover & Title Header */}
                  <div className="flex gap-4 flex-col sm:flex-row pb-4 border-b border-[#b08d57]/15">
                    <div className="w-24 h-36 flex-shrink-0 mx-auto sm:mx-0 shadow-[8px_8px_16px_rgba(0,0,0,0.4)] rounded overflow-hidden border border-[#b08d57]/30">
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
                        <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-b from-[#4a1c1c] to-[#250d0d] text-[#f4e8d0]">
                          <span className="text-[9px] uppercase tracking-wide">Reader's</span>
                          <span className="font-serif-book font-bold text-[10px] leading-tight line-clamp-3">{activeBook.title}</span>
                          <span className="text-[7px] opacity-75 truncate">{activeBook.author}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-serif-book font-bold text-[#2d1e17] leading-tight line-clamp-2">
                          {activeBook.title}
                        </h2>
                        <p className="text-[10px] font-bold text-[#b08d57] uppercase tracking-wider mt-1">
                          by {activeBook.author}
                        </p>
                      </div>
                      
                      {activeBook.isbn && (
                        <p className="text-[9px] text-[#2d1e17]/50 font-mono mt-1">
                          ISBN: {activeBook.isbn}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 text-[9px] uppercase font-bold tracking-wider">
                        <div className="bg-[#ebdcb9]/40 p-1.5 rounded border border-[#b08d57]/15">
                          <span className="block text-[#b08d57] text-[7px] mb-0.5">Subject</span>
                          <span className="text-[#2d1e17] truncate block">{activeBook.genre}</span>
                        </div>
                        <div className="bg-[#ebdcb9]/40 p-1.5 rounded border border-[#b08d57]/15">
                          <span className="block text-[#b08d57] text-[7px] mb-0.5">Pages</span>
                          <span className="text-[#2d1e17]">{activeBook.pages}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Rating Selector */}
                  <div className="bg-[#ebdcb9]/20 p-4 rounded-xl border border-[#b08d57]/15 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <label className="block text-[8px] uppercase font-bold tracking-widest text-[#b08d57] mb-0.5">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => {
                            setStatus(e.target.value);
                            handleFieldChange({ status: e.target.value });
                          }}
                          className="px-2 py-1 bg-[#fbf6ee] border border-[#b08d57]/20 rounded-md outline-none font-bold text-[11px] cursor-pointer text-[#2d1e17]"
                        >
                          <option value="Reading">Reading</option>
                          <option value="Completed">Completed</option>
                          <option value="Wishlist">Wishlist</option>
                          <option value="Paused">Paused</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] uppercase font-bold tracking-widest text-[#b08d57] mb-0.5">
                          Sanctuary Rating
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

                    {/* Progress Slider Bar */}
                    <div className="pt-2 border-t border-[#b08d57]/10 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#b08d57] uppercase tracking-wider">
                        <span>Reading Progress</span>
                        <span>{currentPage} / {activeBook.pages} pgs ({progressPercentage}%)</span>
                      </div>
                      
                      <input 
                        type="range"
                        min="0"
                        max={activeBook.pages || 100}
                        value={currentPage}
                        onChange={handlePageSliderChange}
                        onMouseUp={handlePageSliderRelease}
                        onTouchEnd={handlePageSliderRelease}
                        className="w-full accent-[#b08d57] h-1 bg-[#ebdcb9] rounded-lg cursor-pointer"
                        disabled={status === 'Wishlist'}
                      />

                      <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden border border-[#b08d57]/10 mt-1">
                        <div 
                          className="h-full bg-gradient-to-r from-[#b08d57] to-[#c9a66b]" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Timeline dates */}
                    <div className="pt-2 border-t border-[#b08d57]/10 grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider">
                      <div>
                        <span className="block text-[#b08d57] text-[7.5px]">Started</span>
                        <input 
                          type="date"
                          value={activeBook.startDate ? new Date(activeBook.startDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleFieldChange({ startDate: e.target.value })}
                          className="font-bold bg-transparent outline-none text-[#2d1e17] cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="block text-[#b08d57] text-[7.5px]">Finished</span>
                        <input 
                          type="date"
                          value={activeBook.finishDate ? new Date(activeBook.finishDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleFieldChange({ finishDate: e.target.value })}
                          className="font-bold bg-transparent outline-none text-[#2d1e17] cursor-pointer"
                          disabled={status !== 'Completed'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Log Reading Session form */}
                  {status === 'Reading' && (
                    <div className="bg-[#ebdcb9]/30 p-4 rounded-xl border border-[#b08d57]/15 space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#b08d57] flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Log Reading Session
                      </h4>
                      
                      <form onSubmit={handleAddSession} className="grid grid-cols-3 gap-2.5 items-end">
                        <div>
                          <label className="block text-[7.5px] uppercase font-bold tracking-wider text-[#a48e82] mb-0.5">Pages Read</label>
                          <input 
                            type="number"
                            placeholder="e.g. 20"
                            min="1"
                            max={(activeBook.pages - currentPage) || 100}
                            value={sessionPages}
                            onChange={(e) => setSessionPages(e.target.value)}
                            className="w-full px-2 py-1 bg-[#fbf6ee] border border-[#b08d57]/20 rounded text-[11px] font-semibold text-[#2d1e17]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[7.5px] uppercase font-bold tracking-wider text-[#a48e82] mb-0.5">Duration (min)</label>
                          <input 
                            type="number"
                            placeholder="mins"
                            min="1"
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(e.target.value)}
                            className="w-full px-2 py-1 bg-[#fbf6ee] border border-[#b08d57]/20 rounded text-[11px] font-semibold text-[#2d1e17]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="py-1 px-2.5 bg-[#2d1e17] hover:bg-[#1a1411] text-[#f4e8d0] border border-[#c9a66b]/35 rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all hover:shadow"
                        >
                          <PlusCircle className="w-3 h-3" /> Log
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Reading Sessions Timeline logs */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#b08d57] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Reading Session History
                    </h4>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-serif-book italic text-[11px] text-[#2d1e17]/80">
                      {activeBook.readingSessions && activeBook.readingSessions.length > 0 ? (
                        activeBook.readingSessions.map((s, idx) => (
                          <div key={s.id || idx} className="flex justify-between items-center py-1 border-b border-[#b08d57]/10 group/session">
                            <span>
                              {new Date(s.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}: Read <span className="font-bold text-[#2d1e17]">{s.pagesRead} pages</span> {s.duration && `in ${s.duration} mins`}
                            </span>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this session? Visual page counts will be adjusted.')) {
                                  deleteReadingSession(activeBook._id, s.id);
                                }
                              }}
                              className="text-red-700/60 opacity-0 group-hover/session:opacity-100 transition-opacity hover:text-red-700 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[9px] uppercase font-bold tracking-wider text-[#a48e82]/50">No reading sessions recorded yet.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT PAGE: Review journal, key takeaways note logs with tags, and favorite quotes */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Scholar's Journal Review */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#b08d57] flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Scholar's Journal Review
                    </h3>
                    <div className="relative rounded-xl overflow-hidden border border-[#b08d57]/20 shadow-sm">
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        onBlur={handleReviewSave}
                        placeholder="Record your reflections, thoughts, and intellectual takeaways in this diary..."
                        className="w-full h-28 p-3 bg-[#faf2e6] outline-none font-handwritten-journal text-lg text-amber-950/90 leading-relaxed resize-none border-b border-[#b08d57]/10"
                      />
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={handleReviewSave}
                          className="px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-[#2d1e17] hover:bg-[#1a1411] text-[#f4e8d0] rounded border border-[#c9a66b]/30 shadow-md transition-all cursor-pointer"
                        >
                          Save Journal
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Key Takeaways & Lessons Note logs with Type and Tags */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#b08d57] flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> Key Insights & Notebook Takeaways
                    </h3>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeBook.notes && activeBook.notes.map((note) => (
                        <div 
                          key={note.id} 
                          className="p-3 bg-[#ebdcb9]/20 rounded-xl border border-[#b08d57]/15 flex items-start gap-2 group/note justify-between hover:bg-[#ebdcb9]/35 transition-colors relative"
                        >
                          {editingNoteId === note.id ? (
                            <div className="flex-1 flex flex-col gap-2">
                              <input
                                type="text"
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-[#b08d57]/40 rounded bg-[#fdfaf6] outline-none"
                              />
                              <div className="flex gap-2 items-center">
                                <select
                                  value={editingNoteType}
                                  onChange={(e) => setEditingNoteType(e.target.value)}
                                  className="px-2 py-0.5 bg-[#fbf6ee] border border-[#b08d57]/30 rounded text-[10px]"
                                >
                                  <option value="Thought">Thought</option>
                                  <option value="Lesson">Lesson</option>
                                  <option value="Quote">Quote</option>
                                  <option value="Summary">Summary</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="tags (comma separated)"
                                  value={editingNoteTags}
                                  onChange={(e) => setEditingNoteTags(e.target.value)}
                                  className="flex-1 px-2 py-0.5 text-[10px] border border-[#b08d57]/30 rounded bg-[#fdfaf6] outline-none"
                                />
                                <button 
                                  onClick={() => handleSaveEditNote(note.id)}
                                  className="px-2 py-0.5 bg-emerald-700 text-[#fbf6ee] rounded text-[10px]"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#b08d57]/15 text-[#b08d57]">
                                    {note.type || 'Lesson'}
                                  </span>
                                  
                                  {/* Render Tags */}
                                  {note.tags && note.tags.map((t, tid) => (
                                    <span key={tid} className="text-[8px] font-sans font-semibold text-[#a48e82] flex items-center gap-0.5">
                                      <Tag className="w-2.5 h-2.5 opacity-60" /> {t}
                                    </span>
                                  ))}
                                </div>
                                <p className="font-handwritten-journal text-base text-amber-950/90 leading-tight">{note.content}</p>
                              </div>
                              <div className="flex gap-1.5 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleStartEditNote(note)}
                                  className="p-1 text-[#b08d57] hover:text-[#2d1e17] rounded cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteNote(activeBook._id, note.id)}
                                  className="p-1 text-red-700/60 hover:text-red-700 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {(!activeBook.notes || activeBook.notes.length === 0) && (
                        <p className="text-[10px] text-[#b08d57]/60 italic font-medium uppercase tracking-wider">
                          No philosophical lessons cataloged.
                        </p>
                      )}
                    </div>

                    {/* New Note Form with Category/Tags */}
                    <form onSubmit={handleAddNote} className="space-y-2 p-3 bg-[#faf2e6] border border-[#b08d57]/20 rounded-xl shadow-sm">
                      <input
                        type="text"
                        placeholder="Log insight taking..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#fdfaf6] border border-[#b08d57]/30 rounded-lg outline-none focus:border-[#b08d57] text-[#2d1e17] font-semibold"
                        required
                      />
                      <div className="flex gap-2 items-center flex-wrap">
                        <select
                          value={newNoteType}
                          onChange={(e) => setNewNoteType(e.target.value)}
                          className="px-2 py-1 bg-[#fdfaf6] border border-[#b08d57]/30 rounded-lg text-xs font-semibold text-[#2d1e17] outline-none cursor-pointer"
                        >
                          <option value="Thought">Thought</option>
                          <option value="Lesson">Lesson</option>
                          <option value="Quote">Quote</option>
                          <option value="Summary">Summary</option>
                        </select>
                        <input
                          type="text"
                          placeholder="comma, separated, tags"
                          value={newNoteTags}
                          onChange={(e) => setNewNoteTags(e.target.value)}
                          className="flex-1 min-w-[120px] px-2.5 py-1 text-xs bg-[#fdfaf6] border border-[#b08d57]/30 rounded-lg outline-none text-[#2d1e17] font-semibold"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-[#2d1e17] hover:bg-[#1a1411] text-[#f4e8d0] border border-[#c9a66b]/35 rounded-lg flex items-center justify-center transition-all cursor-pointer text-xs uppercase font-bold tracking-wider"
                        >
                          Record Note
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Favorite Excerpts Quotes Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#b08d57] flex items-center gap-2">
                      <Quote className="w-4 h-4" /> Favorite Excerpts
                    </h3>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {activeBook.favoriteQuotes && activeBook.favoriteQuotes.map((quote) => (
                        <div 
                          key={quote.id} 
                          className="p-3 bg-[#ebdcb9]/35 border-l-4 border-[#b08d57] rounded-r-xl relative group/quote"
                        >
                          <button
                            onClick={() => deleteQuote(activeBook._id, quote.id)}
                            className="absolute right-2 top-2 p-1 text-red-700/60 opacity-0 group-hover/quote:opacity-100 hover:text-red-700 transition-all rounded hover:bg-red-700/5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <p className="text-xs font-serif-book italic text-amber-950/90 leading-relaxed pr-6">
                            "{quote.text}"
                          </p>
                          {quote.page && (
                            <span className="block text-[8.5px] font-sans font-bold text-[#b08d57] mt-1.5 text-right tracking-widest uppercase">
                              — Volume Page {quote.page}
                            </span>
                          )}
                        </div>
                      ))}
                      {(!activeBook.favoriteQuotes || activeBook.favoriteQuotes.length === 0) && (
                        <p className="text-[10px] text-[#b08d57]/60 italic font-medium uppercase tracking-wider">
                          No quotes captured yet.
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleAddQuote} className="space-y-2 p-3 bg-[#faf2e6] border border-[#b08d57]/20 rounded-xl">
                      <textarea
                        placeholder="Capture quote text..."
                        value={newQuoteText}
                        onChange={(e) => setNewQuoteText(e.target.value)}
                        className="w-full h-12 p-2 text-xs bg-transparent border-0 outline-none resize-none font-serif italic text-amber-950"
                        required
                      />
                      <div className="flex gap-2 justify-end">
                        <input
                          type="number"
                          placeholder="Page #"
                          value={newQuotePage}
                          onChange={(e) => setNewQuotePage(e.target.value)}
                          className="w-16 px-2 py-0.5 text-xs bg-[#ebdcb9]/40 border border-[#b08d57]/30 rounded text-[#2d1e17] font-semibold"
                        />
                        <button
                          type="submit"
                          className="px-3 py-0.5 bg-[#2d1e17] hover:bg-[#1a1411] text-[#f4e8d0] border border-[#c9a66b]/35 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Record
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

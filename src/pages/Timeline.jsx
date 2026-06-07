import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, BookOpen, ChevronRight, History } from 'lucide-react';

export default function Timeline() {
  const { books, openDrawer } = useAuth();

  // Group books by finish/start year
  const getTimelineData = () => {
    const yearsMap = {};

    // Only include books that have start/finish dates
    const datedBooks = books.filter(b => b.startDate || b.finishDate);

    datedBooks.forEach(book => {
      // Determine year: prefer finishDate, fallback to startDate, fallback to createdAt
      const date = book.finishDate || book.startDate || book.createdAt;
      const year = new Date(date).getFullYear();

      if (!yearsMap[year]) {
        yearsMap[year] = [];
      }
      yearsMap[year].push({
        book,
        sortDate: new Date(date)
      });
    });

    // Sort books inside each year (newest finish date first)
    Object.keys(yearsMap).forEach(year => {
      yearsMap[year].sort((a, b) => b.sortDate - a.sortDate);
    });

    // Return years sorted descending
    return Object.entries(yearsMap)
      .map(([year, items]) => [Number(year), items.map(i => i.book)])
      .sort((a, b) => b[0] - a[0]);
  };

  const timelineData = getTimelineData();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('default', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-[#1c1512] dark:text-[#f3eae3] select-none">
      {/* Page Header */}
      <div className="border-b border-amber-900/10 dark:border-amber-900/20 pb-4">
        <h1 className="text-2xl lg:text-3xl font-heading-library font-bold text-amber-950 dark:text-amber-300 flex items-center gap-3">
          <History className="w-8 h-8 text-amber-800 dark:text-amber-400" />
          My Reading Timeline
        </h1>
        <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] font-serif italic mt-0.5">
          "A chronological catalog of my intellectual migrations."
        </p>
      </div>

      {/* Timeline Tree */}
      {timelineData.length > 0 ? (
        <div className="relative border-l-2 border-amber-900/15 dark:border-amber-900/35 ml-6 md:ml-24 space-y-12 pt-4">
          {timelineData.map(([year, yearBooks]) => (
            <div key={year} className="relative">
              {/* Year Flag Bubble */}
              <div className="absolute -left-[54px] md:-left-[118px] top-0 w-24 text-right hidden md:block">
                <span className="font-heading-library font-bold text-2xl text-amber-900 dark:text-amber-400">
                  {year}
                </span>
              </div>
              
              {/* Mobile Year Badge (displayed on top of timeline dot) */}
              <div className="absolute -left-[18px] -top-8 md:hidden bg-amber-800 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                {year}
              </div>

              {/* Spine Node list for the year */}
              <div className="space-y-8 pl-6">
                {yearBooks.map((book) => {
                  const durationDays = book.startDate && book.finishDate
                    ? Math.ceil(Math.abs(new Date(book.finishDate) - new Date(book.startDate)) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div 
                      key={book._id} 
                      onClick={() => openDrawer(book)}
                      className="group relative bg-[#fdfaf6] dark:bg-[#201713] border border-amber-900/5 hover:border-amber-700/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start cursor-pointer hover:translate-x-[4px]"
                    >
                      {/* Timeline dot */}
                      <span className="absolute -left-[32px] top-7 w-3.5 h-3.5 rounded-full border-2 border-amber-800 bg-[#fbf6ee] dark:bg-[#1a120f] group-hover:bg-amber-500 z-10 transition-colors"></span>
                      
                      {/* Book Cover / Visual Spine Thumbnail */}
                      <div className="w-20 h-28 flex-shrink-0 bg-[#e8dfd2] dark:bg-[#2c201a] border border-[#d8c8bf] dark:border-[#3a2012] rounded-md overflow-hidden shadow-sm self-center sm:self-start">
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={book.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=100';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col justify-between p-2 bg-[#6b1e1e] text-amber-200">
                            <span className="text-[7px] uppercase font-bold">Spine</span>
                            <span className="font-serif-book font-bold text-[9px] leading-tight line-clamp-3">{book.title}</span>
                            <span></span>
                          </div>
                        )}
                      </div>

                      {/* Timeline Entry Body */}
                      <div className="flex-1 space-y-2 select-none">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3 className="font-serif-book font-bold text-lg text-amber-950 dark:text-amber-300 leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                            {book.title}
                          </h3>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-900/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-400 self-start sm:self-center">
                            {book.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#5c4e47] dark:text-[#a6948b]">by {book.author}</p>
                        
                        {/* Dates info */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#8c7667] dark:text-[#a6948b] font-medium pt-1">
                          {book.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                              Started: {formatDate(book.startDate)}
                            </span>
                          )}
                          {book.finishDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-850 dark:text-amber-400" />
                              Finished: {formatDate(book.finishDate)}
                            </span>
                          )}
                          {durationDays && (
                            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                              <Clock className="w-3.5 h-3.5" />
                              Completed in {durationDays} {durationDays === 1 ? 'day' : 'days'}
                            </span>
                          )}
                        </div>

                        {/* Review Reflection Snippet */}
                        {book.review?.content && (
                          <div className="mt-3 bg-amber-900/5 dark:bg-amber-400/5 p-3 rounded-lg border-l-2 border-amber-800 text-xs font-serif italic text-amber-950 dark:text-amber-200 line-clamp-2 leading-relaxed">
                            "{book.review.content}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-black/5 dark:bg-black/20 rounded-2xl border-2 border-dashed border-amber-900/10 dark:border-amber-900/30">
          <History className="w-12 h-12 text-[#a6948b] stroke-1 mx-auto" />
          <div>
            <p className="font-serif italic text-lg text-amber-900/80 dark:text-amber-400/80">No historical logs found.</p>
            <p className="text-xs text-[#5c4e47] dark:text-[#a6948b] mt-1">Timeline builds automatically as you configure Reading or Completed start and finish dates.</p>
          </div>
        </div>
      )}
    </div>
  );
}

import express from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import { protect } from '../middleware/auth.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

// Simple in-memory cache for search queries to reduce external API hits
const searchCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache duration

router.use(protect);

// @desc    Get all user books
router.get('/', async (req, res) => {
  try {
    const { status, genre, rating, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = { userId: req.user._id };
      if (status) query.status = status;
      if (genre) query.genre = genre;
      if (rating) query.rating = Number(rating);
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } }
        ];
      }
      const books = await Book.find(query).sort({ updatedAt: -1 });
      return res.json(books);
    } else {
      // JSON DB Fallback
      const books = await localDb.getBooks(req.user._id, { status, genre, search });
      return res.json(books);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search books via Google Books API (with OpenLibrary fallback & caching)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Search query is required' });

  const queryKey = q.trim().toLowerCase();
  
  // Check memory cache first
  if (searchCache.has(queryKey)) {
    const cached = searchCache.get(queryKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    } else {
      searchCache.delete(queryKey);
    }
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5${apiKey ? `&key=${apiKey}` : ''}`;
    
    const response = await fetch(url);
    
    // Handle Google rate-limit (429) by falling back to OpenLibrary
    if (response.status === 429) {
      console.warn('Google Books API rate limited (429). Falling back to OpenLibrary API.');
      
      const olRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=5`);
      if (!olRes.ok) {
        throw new Error('Both Google Books and OpenLibrary API failed due to limit restrictions');
      }
      
      const olData = await olRes.json();
      
      // Remap OpenLibrary docs layout to match Google Books schema structure
      const items = (olData.docs || []).map(doc => ({
        volumeInfo: {
          title: doc.title,
          subtitle: doc.subtitle || '',
          authors: doc.author_name || ['Unknown Author'],
          imageLinks: doc.cover_i ? {
            thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          } : undefined,
          categories: doc.subject || ['General'],
          pageCount: doc.number_of_pages_median || 200,
          publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          industryIdentifiers: doc.isbn ? [{ type: 'ISBN_13', identifier: doc.isbn[0] }] : undefined
        }
      }));
      
      const mappedData = { items };
      searchCache.set(queryKey, { data: mappedData, timestamp: Date.now() });
      return res.json(mappedData);
    }

    if (!response.ok) {
      throw new Error(`Google Books API responded with status ${response.status}`);
    }

    const data = await response.json();
    searchCache.set(queryKey, { data, timestamp: Date.now() });
    return res.json(data);
  } catch (error) {
    console.error('Error querying book database APIs:', error.message);
    return res.status(500).json({ message: 'Failed to search catalog databases' });
  }
});

// @desc    Get book by ID
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json(book);
    } else {
      // JSON DB Fallback
      const book = await localDb.getBookById(req.user._id, req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json(book);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new book
router.post('/', async (req, res) => {
  const { title, subtitle, author, coverImage, genre, publicationYear, pages, currentPage, status, rating, isbn, description, categories } = req.body;

  try {
    const bookData = {
      title,
      subtitle,
      author,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=250',
      genre: genre || 'General',
      publicationYear: Number(publicationYear) || undefined,
      pages: Number(pages) || 200,
      currentPage: Number(currentPage) || 0,
      status: status || 'Reading',
      rating: Number(rating) || 0,
      isbn: isbn || undefined,
      description: description || undefined,
      categories: Array.isArray(categories) ? categories : (categories ? [categories] : []),
      startDate: status === 'Reading' || status === 'Completed' ? new Date() : null,
      finishDate: status === 'Completed' ? new Date() : null
    };

    if (mongoose.connection.readyState === 1) {
      const book = await Book.create({ ...bookData, userId: req.user._id });
      return res.status(201).json(book);
    } else {
      // JSON DB Fallback
      const book = await localDb.createBook({ ...bookData, userId: req.user._id });
      return res.status(201).json(book);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a book
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, author, coverImage, genre, publicationYear, pages, currentPage, status, rating, review, startDate, finishDate, isbn, description, categories } = req.body;

    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      book.title = title ?? book.title;
      book.subtitle = subtitle ?? book.subtitle;
      book.author = author ?? book.author;
      book.coverImage = coverImage ?? book.coverImage;
      book.genre = genre ?? book.genre;
      book.publicationYear = publicationYear ?? book.publicationYear;
      book.pages = pages ? Number(pages) : book.pages;
      
      if (currentPage !== undefined) {
        book.currentPage = Number(currentPage);
        if (book.currentPage >= book.pages && book.status !== 'Completed') {
          book.status = 'Completed';
          book.finishDate = new Date();
        }
      }

      if (status && status !== book.status) {
        book.status = status;
        if (status === 'Completed' && !book.finishDate) book.finishDate = new Date();
        if (status === 'Reading' && !book.startDate) book.startDate = new Date();
      } else {
        book.status = status ?? book.status;
      }

      book.rating = rating !== undefined ? Number(rating) : book.rating;
      if (review !== undefined) book.review = { content: review, ratedAt: new Date() };

      if (startDate !== undefined) book.startDate = startDate ? new Date(startDate) : null;
      if (finishDate !== undefined) book.finishDate = finishDate ? new Date(finishDate) : null;
      
      book.isbn = isbn ?? book.isbn;
      book.description = description ?? book.description;
      if (categories !== undefined) {
        book.categories = Array.isArray(categories) ? categories : [categories];
      }

      const updatedBook = await book.save();
      return res.json(updatedBook);
    } else {
      // JSON DB Fallback
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (subtitle !== undefined) updates.subtitle = subtitle;
      if (author !== undefined) updates.author = author;
      if (coverImage !== undefined) updates.coverImage = coverImage;
      if (genre !== undefined) updates.genre = genre;
      if (publicationYear !== undefined) updates.publicationYear = Number(publicationYear);
      if (pages !== undefined) updates.pages = Number(pages);
      if (currentPage !== undefined) updates.currentPage = Number(currentPage);
      if (rating !== undefined) updates.rating = Number(rating);
      if (review !== undefined) updates.review = review;
      if (isbn !== undefined) updates.isbn = isbn;
      if (description !== undefined) updates.description = description;
      if (categories !== undefined) updates.categories = Array.isArray(categories) ? categories : [categories];
      
      if (status !== undefined) {
        updates.status = status;
        const currentBook = await localDb.getBookById(req.user._id, req.params.id);
        if (currentBook && status !== currentBook.status) {
          if (status === 'Completed' && !currentBook.finishDate) updates.finishDate = new Date();
          if (status === 'Reading' && !currentBook.startDate) updates.startDate = new Date();
        }
      }

      if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
      if (finishDate !== undefined) updates.finishDate = finishDate ? new Date(finishDate) : null;

      const updatedBook = await localDb.updateBook(req.user._id, req.params.id, updates);
      if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
      return res.json(updatedBook);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a book
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const result = await Book.deleteOne({ _id: req.params.id, userId: req.user._id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Book not found' });
      return res.json({ message: 'Book removed successfully' });
    } else {
      // JSON DB Fallback
      const book = await localDb.getBookById(req.user._id, req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      await localDb.deleteBook(req.user._id, req.params.id);
      return res.json({ message: 'Book removed successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// NOTES CRUD
// ==========================================

router.post('/:id/notes', async (req, res) => {
  const { content, type, tags } = req.body;
  if (!content) return res.status(400).json({ message: 'Note content is required' });

  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const newNote = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        type: type || 'Lesson',
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date()
      };
      book.notes.push(newNote);
      await book.save();
      return res.status(201).json(newNote);
    } else {
      // JSON DB Fallback
      const newNote = await localDb.addNote(req.user._id, req.params.id, content, type, tags);
      return res.status(201).json(newNote);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/notes/:noteId', async (req, res) => {
  const { content, type, tags } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const note = book.notes.find(n => n.id === req.params.noteId);
      if (!note) return res.status(404).json({ message: 'Note not found' });

      if (content !== undefined) note.content = content;
      if (type !== undefined) note.type = type;
      if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : [];
      await book.save();
      return res.json(note);
    } else {
      // JSON DB Fallback
      const note = await localDb.updateNote(req.user._id, req.params.id, req.params.noteId, content, type, tags);
      return res.json(note);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      book.notes = book.notes.filter(n => n.id !== req.params.noteId);
      await book.save();
      return res.json({ message: 'Note deleted successfully' });
    } else {
      // JSON DB Fallback
      await localDb.deleteNote(req.user._id, req.params.id, req.params.noteId);
      return res.json({ message: 'Note deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// QUOTES CRUD
// ==========================================

router.post('/:id/quotes', async (req, res) => {
  const { text, page } = req.body;
  if (!text) return res.status(400).json({ message: 'Quote text is required' });

  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const newQuote = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        page: page ? Number(page) : null,
        createdAt: new Date()
      };
      book.favoriteQuotes.push(newQuote);
      await book.save();
      return res.status(201).json(newQuote);
    } else {
      // JSON DB Fallback
      const newQuote = await localDb.addQuote(req.user._id, req.params.id, text, page);
      return res.status(201).json(newQuote);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/quotes/:quoteId', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      book.favoriteQuotes = book.favoriteQuotes.filter(q => q.id !== req.params.quoteId);
      await book.save();
      return res.json({ message: 'Quote deleted successfully' });
    } else {
      // JSON DB Fallback
      await localDb.deleteQuote(req.user._id, req.params.id, req.params.quoteId);
      return res.json({ message: 'Quote deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// READING SESSIONS CRUD
// ==========================================

// @desc    Add a reading session
router.post('/:id/sessions', async (req, res) => {
  const { pagesRead, duration, date } = req.body;
  if (pagesRead === undefined) return res.status(400).json({ message: 'Pages read is required' });

  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const newSession = {
        id: Math.random().toString(36).substr(2, 9),
        date: date ? new Date(date) : new Date(),
        pagesRead: Number(pagesRead),
        duration: duration ? Number(duration) : undefined
      };
      book.readingSessions.push(newSession);
      book.currentPage = Math.min(book.currentPage + Number(pagesRead), book.pages);
      if (book.currentPage >= book.pages && book.status !== 'Completed') {
        book.status = 'Completed';
        book.finishDate = new Date();
      }
      await book.save();
      return res.status(201).json(newSession);
    } else {
      // JSON DB Fallback
      const newSession = await localDb.addReadingSession(req.user._id, req.params.id, pagesRead, duration, date);
      return res.status(201).json(newSession);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a reading session
router.delete('/:id/sessions/:sessionId', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const session = book.readingSessions.find(s => s.id === req.params.sessionId);
      if (session) {
        book.currentPage = Math.max(0, book.currentPage - session.pagesRead);
        book.readingSessions = book.readingSessions.filter(s => s.id !== req.params.sessionId);
        await book.save();
      }
      return res.json({ message: 'Session deleted successfully' });
    } else {
      // JSON DB Fallback
      await localDb.deleteReadingSession(req.user._id, req.params.id, req.params.sessionId);
      return res.json({ message: 'Session deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

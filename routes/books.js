import express from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import { protect } from '../middleware/auth.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

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
  const { title, subtitle, author, coverImage, genre, publicationYear, pages, status, rating } = req.body;

  try {
    const bookData = {
      title,
      subtitle,
      author,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=250',
      genre: genre || 'General',
      publicationYear: Number(publicationYear) || undefined,
      pages: Number(pages) || 200,
      status: status || 'Reading',
      rating: Number(rating) || 0,
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
    const { title, subtitle, author, coverImage, genre, publicationYear, pages, status, rating, review, startDate, finishDate } = req.body;

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
      if (rating !== undefined) updates.rating = Number(rating);
      if (review !== undefined) updates.review = review;
      
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
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Note content is required' });

  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const newNote = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        createdAt: new Date()
      };
      book.notes.push(newNote);
      await book.save();
      return res.status(201).json(newNote);
    } else {
      // JSON DB Fallback
      const newNote = await localDb.addNote(req.user._id, req.params.id, content);
      return res.status(201).json(newNote);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/notes/:noteId', async (req, res) => {
  const { content } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const note = book.notes.find(n => n.id === req.params.noteId);
      if (!note) return res.status(404).json({ message: 'Note not found' });

      note.content = content;
      await book.save();
      return res.json(note);
    } else {
      // JSON DB Fallback
      const note = await localDb.updateNote(req.user._id, req.params.id, req.params.noteId, content);
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

export default router;

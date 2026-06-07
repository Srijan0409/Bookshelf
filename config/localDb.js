import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('data/db.json');

// Ensure data directory and file exist
const initDb = () => {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], books: [] }, null, 2));
  }
};

const readDb = () => {
  try {
    initDb();
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], books: [] };
  }
};

const writeDb = (data) => {
  try {
    initDb();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to local JSON DB:', error);
  }
};

export const localDb = {
  // Users operations
  createUser: async (userData) => {
    const db = readDb();
    const newUser = {
      _id: Math.random().toString(36).substr(2, 9),
      ...userData,
      joinedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  },
  
  findUserByEmail: async (email) => {
    const db = readDb();
    return db.users.find(u => u.email === email);
  },
  
  findUserById: async (id) => {
    const db = readDb();
    return db.users.find(u => u._id === id);
  },
  
  updateUserGoals: async (id, annual, monthly) => {
    const db = readDb();
    const user = db.users.find(u => u._id === id);
    if (user) {
      user.readingGoal = { annual, monthly };
      user.updatedAt = new Date();
      writeDb(db);
    }
    return user;
  },

  // Books operations
  getBooks: async (userId, filters = {}) => {
    const db = readDb();
    let userBooks = db.books.filter(b => b.userId === userId);
    
    if (filters.status) {
      userBooks = userBooks.filter(b => b.status === filters.status);
    }
    if (filters.genre) {
      userBooks = userBooks.filter(b => b.genre === filters.genre);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      userBooks = userBooks.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q)
      );
    }
    return userBooks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },
  
  getBookById: async (userId, id) => {
    const db = readDb();
    return db.books.find(b => b._id === id && b.userId === userId);
  },
  
  createBook: async (bookData) => {
    const db = readDb();
    const newBook = {
      _id: Math.random().toString(36).substr(2, 9),
      notes: [],
      favoriteQuotes: [],
      rating: 0,
      review: { content: '' },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...bookData
    };
    db.books.push(newBook);
    writeDb(db);
    return newBook;
  },
  
  createManyBooks: async (booksArray) => {
    const db = readDb();
    const newBooks = booksArray.map(book => ({
      _id: Math.random().toString(36).substr(2, 9),
      notes: book.notes || [],
      favoriteQuotes: book.favoriteQuotes || [],
      rating: book.rating || 0,
      review: book.review || { content: '' },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...book
    }));
    db.books.push(...newBooks);
    writeDb(db);
    return newBooks;
  },
  
  updateBook: async (userId, id, updates) => {
    const db = readDb();
    const book = db.books.find(b => b._id === id && b.userId === userId);
    if (book) {
      Object.keys(updates).forEach(key => {
        if (key === 'review') {
          book.review = { content: updates.review, ratedAt: new Date() };
        } else {
          book[key] = updates[key];
        }
      });
      book.updatedAt = new Date();
      writeDb(db);
    }
    return book;
  },
  
  deleteBook: async (userId, id) => {
    const db = readDb();
    db.books = db.books.filter(b => !(b._id === id && b.userId === userId));
    writeDb(db);
    return true;
  },

  // Notes operations
  addNote: async (userId, bookId, content) => {
    const db = readDb();
    const book = db.books.find(b => b._id === bookId && b.userId === userId);
    if (book) {
      if (!book.notes) book.notes = [];
      const newNote = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        createdAt: new Date()
      };
      book.notes.push(newNote);
      book.updatedAt = new Date();
      writeDb(db);
      return newNote;
    }
    throw new Error('Book not found');
  },
  
  updateNote: async (userId, bookId, noteId, content) => {
    const db = readDb();
    const book = db.books.find(b => b._id === bookId && b.userId === userId);
    if (book && book.notes) {
      const note = book.notes.find(n => n.id === noteId);
      if (note) {
        note.content = content;
        book.updatedAt = new Date();
        writeDb(db);
        return note;
      }
    }
    throw new Error('Note not found');
  },
  
  deleteNote: async (userId, bookId, noteId) => {
    const db = readDb();
    const book = db.books.find(b => b._id === bookId && b.userId === userId);
    if (book && book.notes) {
      book.notes = book.notes.filter(n => n.id !== noteId);
      book.updatedAt = new Date();
      writeDb(db);
      return true;
    }
    throw new Error('Book or Note not found');
  },

  // Quotes operations
  addQuote: async (userId, bookId, text, page) => {
    const db = readDb();
    const book = db.books.find(b => b._id === bookId && b.userId === userId);
    if (book) {
      if (!book.favoriteQuotes) book.favoriteQuotes = [];
      const newQuote = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        page: page ? Number(page) : null,
        createdAt: new Date()
      };
      book.favoriteQuotes.push(newQuote);
      book.updatedAt = new Date();
      writeDb(db);
      return newQuote;
    }
    throw new Error('Book not found');
  },
  
  deleteQuote: async (userId, bookId, quoteId) => {
    const db = readDb();
    const book = db.books.find(b => b._id === bookId && b.userId === userId);
    if (book && book.favoriteQuotes) {
      book.favoriteQuotes = book.favoriteQuotes.filter(q => q.id !== quoteId);
      book.updatedAt = new Date();
      writeDb(db);
      return true;
    }
    throw new Error('Book or Quote not found');
  }
};

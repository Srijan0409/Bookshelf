import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { protect } from '../middleware/auth.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'readers_library_secret_key_2026_cozy', {
    expiresIn: '30d',
  });
};

const sampleBooks = [
  {
    title: 'Atomic Habits',
    subtitle: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    author: 'James Clear',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/81wgcld4bfL.jpg',
    genre: 'Self-Improvement',
    publicationYear: 2018,
    pages: 320,
    currentPage: 320,
    status: 'Completed',
    rating: 5,
    startDate: new Date('2026-01-05'),
    finishDate: new Date('2026-01-18'),
    review: {
      content: 'An absolute masterpiece on habits. The 4 laws of behavior change are practical and life-altering. Redesigning my environment has been the most effective strategy.',
      ratedAt: new Date('2026-01-18')
    },
    notes: [
      { id: 'n1', content: 'You do not rise to the level of your goals. You fall to the level of your systems.', type: 'Lesson', tags: ['habits', 'systems'] },
      { id: 'n2', content: 'Every action you take is a vote for the type of person you wish to become.', type: 'Thought', tags: ['identity'] },
      { id: 'n3', content: 'Make good habits obvious, attractive, easy, and satisfying.', type: 'Lesson', tags: ['habits'] }
    ],
    favoriteQuotes: [
      { id: 'q1', text: 'Small habits create remarkable results.', page: 12 }
    ]
  },
  {
    title: 'Deep Work',
    subtitle: 'Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/41p986h2BvL._SX329_BO1,204,203,200_.jpg',
    genre: 'Productivity',
    publicationYear: 2016,
    pages: 304,
    currentPage: 120,
    status: 'Reading',
    rating: 4.5,
    startDate: new Date('2026-05-10'),
    review: {
      content: 'Very insightful. Newport categorizes focus as a modern superpower. The idea of scheduling blocks of deep work and eliminating shallow tasks is key.',
      ratedAt: new Date('2026-05-25')
    },
    notes: [
      { id: 'n4', content: 'Deep work is the ability to focus without distraction on a cognitively demanding task.', type: 'Thought', tags: ['productivity'] },
      { id: 'n5', content: 'High-Quality Work Produced = (Time Spent) x (Intensity of Focus)', type: 'Lesson', tags: ['productivity', 'focus'] }
    ],
    favoriteQuotes: [
      { id: 'q2', text: 'To produce at your peak level you need to work for extended periods with full concentration on a single task.', page: 44 }
    ],
    readingSessions: [
      { id: 's1', date: new Date('2026-05-11'), pagesRead: 50, duration: 45 },
      { id: 's2', date: new Date('2026-05-12'), pagesRead: 70, duration: 60 }
    ]
  },
  {
    title: 'The Psychology of Money',
    subtitle: 'Timeless lessons on wealth, greed, and happiness',
    author: 'Morgan Housel',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg',
    genre: 'Finance',
    publicationYear: 2020,
    pages: 250,
    currentPage: 250,
    status: 'Completed',
    rating: 5,
    startDate: new Date('2026-02-12'),
    finishDate: new Date('2026-02-28'),
    review: {
      content: 'The best book on personal finance I have ever read. It focuses on the behavioral aspect of money rather than mathematical models.',
      ratedAt: new Date('2026-02-28')
    },
    notes: [
      { id: 'n6', content: 'Doing well with money has a little to do with how smart you are and a lot to do with how you behave.', type: 'Lesson', tags: ['finance', 'behavior'] },
      { id: 'n7', content: 'Wealth is the nice cars not purchased, the diamonds not bought. Wealth is assets not yet converted into the stuff you see.', type: 'Thought', tags: ['finance'] }
    ],
    favoriteQuotes: [
      { id: 'q3', text: 'Using your money to buy control over your time is the highest dividend money pays.', page: 82 }
    ]
  },
  {
    title: 'The Almanack of Naval Ravikant',
    subtitle: 'A Guide to Wealth and Happiness',
    author: 'Eric Jorgenson',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/61k99c6A7BL.jpg',
    genre: 'Philosophy',
    publicationYear: 2020,
    pages: 244,
    currentPage: 0,
    status: 'Wishlist',
    notes: [],
    favoriteQuotes: []
  }
];

// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({ name, email, password });
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        readingGoal: user.readingGoal,
        token: generateToken(user._id),
      });
    } else {
      // JSON DB Fallback
      const userExists = await localDb.findUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await localDb.createUser({
        name,
        email,
        password: hashedPassword,
        readingGoal: { annual: 12, monthly: 1 }
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        readingGoal: user.readingGoal,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          readingGoal: user.readingGoal,
          token: generateToken(user._id),
        });
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    } else {
      // JSON DB Fallback
      const user = await localDb.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          readingGoal: user.readingGoal,
          token: generateToken(user._id),
        });
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Log in with demo credentials (creates demo account and seeds books if not exists)
router.post('/demo', async (req, res) => {
  const demoEmail = 'demo@readerslibrary.com';
  const demoPassword = 'demoreader123';

  try {
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: demoEmail });

      if (!user) {
        user = await User.create({
          name: 'Demo Reader',
          email: demoEmail,
          password: demoPassword,
          readingGoal: { annual: 12, monthly: 1 }
        });
        await Book.create(sampleBooks.map(book => ({ ...book, userId: user._id })));
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        readingGoal: user.readingGoal,
        token: generateToken(user._id),
      });
    } else {
      // JSON DB Fallback
      let user = await localDb.findUserByEmail(demoEmail);

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(demoPassword, salt);
        user = await localDb.createUser({
          name: 'Demo Reader',
          email: demoEmail,
          password: hashedPassword,
          readingGoal: { annual: 12, monthly: 1 }
        });
        await localDb.createManyBooks(sampleBooks.map(book => ({ ...book, userId: user._id })));
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        readingGoal: user.readingGoal,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    readingGoal: req.user.readingGoal,
  });
});

// @desc    Update user reading goals
router.put('/goals', protect, async (req, res) => {
  const { annual, monthly } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.readingGoal.annual = annual ?? user.readingGoal.annual;
        user.readingGoal.monthly = monthly ?? user.readingGoal.monthly;
        const updatedUser = await user.save();
        return res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          readingGoal: updatedUser.readingGoal,
        });
      }
      return res.status(404).json({ message: 'User not found' });
    } else {
      // JSON DB Fallback
      const user = await localDb.updateUserGoals(req.user._id, annual, monthly);
      if (user) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          readingGoal: user.readingGoal,
        });
      }
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

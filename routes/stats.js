import express from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

router.use(protect);

// @desc    Get reading statistics overview
router.get('/', async (req, res) => {
  try {
    let books = [];
    let user = null;

    if (mongoose.connection.readyState === 1) {
      books = await Book.find({ userId: req.user._id });
      user = await User.findById(req.user._id);
    } else {
      // JSON DB Fallback
      books = await localDb.getBooks(req.user._id);
      user = await localDb.findUserById(req.user._id);
    }

    const totalBooks = books.length;
    const completedBooks = books.filter(b => b.status === 'Completed');
    const readingBooks = books.filter(b => b.status === 'Reading');
    const wishlistBooks = books.filter(b => b.status === 'Wishlist');

    const totalBooksCompleted = completedBooks.length;
    const totalPagesRead = completedBooks.reduce((sum, b) => sum + (b.pages || 0), 0);

    const ratedBooks = books.filter(b => b.rating > 0);
    const averageRating = ratedBooks.length > 0 
      ? Number((ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)) 
      : 0;

    // Genres calculation
    const genreCounts = {};
    books.forEach(b => {
      if (b.genre) {
        genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
      }
    });
    
    let favoriteGenre = 'None';
    let maxGenreCount = 0;
    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxGenreCount) {
        maxGenreCount = count;
        favoriteGenre = genre;
      }
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const completedThisYear = completedBooks.filter(b => {
      if (!b.finishDate) return false;
      return new Date(b.finishDate).getFullYear() === currentYear;
    }).length;

    const completedThisMonth = completedBooks.filter(b => {
      if (!b.finishDate) return false;
      const fDate = new Date(b.finishDate);
      return fDate.getFullYear() === currentYear && fDate.getMonth() === currentMonth;
    }).length;

    // Reading streak calculation
    const activityDates = new Set();
    books.forEach(b => {
      if (b.startDate) activityDates.add(new Date(b.startDate).toDateString());
      if (b.finishDate) activityDates.add(new Date(b.finishDate).toDateString());
      if (b.updatedAt) activityDates.add(new Date(b.updatedAt).toDateString());
      if (b.notes) {
        b.notes.forEach(n => {
          if (n.createdAt) activityDates.add(new Date(n.createdAt).toDateString());
        });
      }
    });

    let currentStreak = 0;
    let checkDate = new Date();
    while (true) {
      if (activityDates.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Grace period for today
        if (checkDate.toDateString() === new Date().toDateString()) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (activityDates.has(checkDate.toDateString())) {
            continue;
          }
        }
        break;
      }
    }

    // Reading velocity (pages/day over last 30 days)
    let pagesReadLast30Days = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    books.forEach(b => {
      if (b.readingSessions && b.readingSessions.length > 0) {
        b.readingSessions.forEach(s => {
          if (new Date(s.date) >= thirtyDaysAgo) {
            pagesReadLast30Days += (s.pagesRead || 0);
          }
        });
      } else if (b.status === 'Completed' && b.finishDate && new Date(b.finishDate) >= thirtyDaysAgo) {
        pagesReadLast30Days += (b.pages || 0);
      }
    });
    const readingVelocity = Number((pagesReadLast30Days / 30).toFixed(1));

    // Goal progress
    const annualGoal = user?.readingGoal?.annual || 12;
    const monthlyGoal = user?.readingGoal?.monthly || 1;

    // Monthly completed stats for the past 6 months (aggregating count AND pages)
    const monthlyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const year = d.getFullYear();
      const monthNum = d.getMonth();
      const monthName = d.toLocaleString('default', { month: 'short' });

      const count = completedBooks.filter(b => {
        if (!b.finishDate) return false;
        const fDate = new Date(b.finishDate);
        return fDate.getFullYear() === year && fDate.getMonth() === monthNum;
      }).length;

      let pagesCount = 0;
      books.forEach(b => {
        if (b.readingSessions && b.readingSessions.length > 0) {
          b.readingSessions.forEach(s => {
            const sDate = new Date(s.date);
            if (sDate.getFullYear() === year && sDate.getMonth() === monthNum) {
              pagesCount += (s.pagesRead || 0);
            }
          });
        } else if (b.status === 'Completed' && b.finishDate) {
          const fDate = new Date(b.finishDate);
          if (fDate.getFullYear() === year && fDate.getMonth() === monthNum) {
            pagesCount += (b.pages || 0);
          }
        }
      });

      monthlyHistory.push({ name: monthName, count, pages: pagesCount });
    }

    // Genre Distribution list for charts
    const genreDistribution = Object.entries(genreCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Heatmap reading data
    const dateCounts = {};
    books.forEach(b => {
      const dates = [];
      if (b.startDate) dates.push(new Date(b.startDate).toISOString().split('T')[0]);
      if (b.finishDate) dates.push(new Date(b.finishDate).toISOString().split('T')[0]);
      if (b.notes) {
        b.notes.forEach(n => {
          if (n.createdAt) dates.push(new Date(n.createdAt).toISOString().split('T')[0]);
        });
      }
      if (b.readingSessions) {
        b.readingSessions.forEach(s => {
          if (s.date) dates.push(new Date(s.date).toISOString().split('T')[0]);
        });
      }
      dates.forEach(dStr => {
        dateCounts[dStr] = (dateCounts[dStr] || 0) + 1;
      });
    });

    res.json({
      summary: {
        totalBooks,
        totalBooksCompleted,
        totalPagesRead,
        averageRating,
        readingStreak: currentStreak,
        favoriteGenre,
        completedThisYear,
        completedThisMonth,
        readingBooksCount: readingBooks.length,
        wishlistBooksCount: wishlistBooks.length,
        readingVelocity
      },
      goals: {
        annual: annualGoal,
        monthly: monthlyGoal,
        annualProgress: Math.min(Math.round((completedThisYear / annualGoal) * 100), 100),
        monthlyProgress: Math.min(Math.round((completedThisMonth / monthlyGoal) * 100), 100)
      },
      monthlyHistory,
      genreDistribution,
      activityCounts: dateCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

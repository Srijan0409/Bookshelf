import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const QuoteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  page: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const BookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  author: { type: String, required: true },
  coverImage: { type: String },
  genre: { type: String, required: true },
  publicationYear: { type: Number },
  pages: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Reading', 'Completed', 'Wishlist', 'Paused', 'Dropped'], 
    default: 'Reading' 
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  review: {
    content: { type: String, default: '' },
    ratedAt: { type: Date }
  },
  notes: [NoteSchema],
  favoriteQuotes: [QuoteSchema],
  startDate: { type: Date },
  finishDate: { type: Date }
}, { timestamps: true });

const Book = mongoose.model('Book', BookSchema);
export default Book;

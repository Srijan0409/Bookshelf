import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('library_token'));
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBook, setActiveBook] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('library_dark') === 'true');

  // Sync luxury theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('theme-charcoal');
      root.classList.remove('theme-walnut');
      localStorage.setItem('library_dark', 'true');
    } else {
      root.classList.add('theme-walnut');
      root.classList.remove('theme-charcoal');
      localStorage.setItem('library_dark', 'false');
    }
  }, [darkMode]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // Load default books & statistics
          await Promise.all([fetchBooks(), fetchStats()]);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const fetchBooks = async (filters = {}) => {
    if (!token) return;
    try {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
      if (filters.genre && filters.genre !== 'All') queryParams.append('genre', filters.genre);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await fetch(`${API_BASE}/books?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        // Sync activeBook details if it is currently open
        if (activeBook) {
          const updatedActive = data.find(b => b._id === activeBook._id);
          if (updatedActive) setActiveBook(updatedActive);
        }
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('library_token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, readingGoal: data.readingGoal });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('library_token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, readingGoal: data.readingGoal });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Demo login failed');
      
      localStorage.setItem('library_token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email, readingGoal: data.readingGoal });
      return { success: true };
    } catch (error) {
      console.error('Demo login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('library_token');
    setToken(null);
    setUser(null);
    setBooks([]);
    setStats(null);
    setActiveBook(null);
    setIsDrawerOpen(false);
  };

  const updateGoals = async (annual, monthly) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ annual: Number(annual), monthly: Number(monthly) })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(prev => ({ ...prev, readingGoal: updatedUser.readingGoal }));
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  const addBook = async (bookData) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
        return { success: true };
      }
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to add book');
    } catch (error) {
      console.error('Add book error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateBook = async (bookId, bookData) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      if (res.ok) {
        const updated = await res.json();
        if (activeBook && activeBook._id === bookId) {
          setActiveBook(updated);
        }
        await Promise.all([fetchBooks(), fetchStats()]);
        return { success: true };
      }
    } catch (error) {
      console.error('Update book error:', error);
    }
  };

  const deleteBook = async (bookId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        if (activeBook && activeBook._id === bookId) {
          setIsDrawerOpen(false);
          setActiveBook(null);
        }
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Delete book error:', error);
    }
  };

  const addNote = async (bookId, content, type = 'Lesson', tags = []) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, type, tags })
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Add note error:', error);
    }
  };

  const updateNote = async (bookId, noteId, content, type, tags) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, type, tags })
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Update note error:', error);
    }
  };

  const deleteNote = async (bookId, noteId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Delete note error:', error);
    }
  };

  const addReadingSession = async (bookId, pagesRead, duration, date) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pagesRead, duration, date })
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
        return { success: true };
      }
    } catch (error) {
      console.error('Add reading session error:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteReadingSession = async (bookId, sessionId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Delete reading session error:', error);
    }
  };

  const addQuote = async (bookId, text, page) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, page })
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Add quote error:', error);
    }
  };

  const deleteQuote = async (bookId, quoteId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await Promise.all([fetchBooks(), fetchStats()]);
      }
    } catch (error) {
      console.error('Delete quote error:', error);
    }
  };

  const openDrawer = (book) => {
    setActiveBook(book);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setActiveBook(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      books,
      stats,
      loading,
      activeBook,
      isDrawerOpen,
      darkMode,
      setDarkMode,
      login,
      register,
      loginDemo,
      logout,
      updateGoals,
      fetchBooks,
      fetchStats,
      addBook,
      updateBook,
      deleteBook,
      addNote,
      updateNote,
      deleteNote,
      addQuote,
      deleteQuote,
      addReadingSession,
      deleteReadingSession,
      openDrawer,
      closeDrawer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

# The Reader's Library 📚

A visually stunning, highly immersive, modern web application designed as a personal virtual bookshelf. Users can store, organize, review, and capture key takeaways, quotes, and reading timeline chronologies.

---

## 🎨 Key Features
* **Wood-Shelved Bookshelf**: Books are rendered vertically with 3D shadows and hover elevation animations. Group shelves by status or genre.
* **Knowledge Vault**: A searchable "second brain" consolidating all logged quotes, notes, and lessons.
* **Timeline View**: Chronological vertical axis showing reading logs by year.
* **Reading Analytics**: SVG goal tracking rings, a 365-day Contribution Heatmap, and custom monthly completions charts.
* **Smart Lookup Autocomplete**: Search book titles via OpenLibrary lookup to auto-catalog pages, author name, and cover art.
* **Smart Offline Database Fallback**: Automatically falls back to a local JSON file database (`backend/data/db.json`) if MongoDB is not running, ensuring immediate out-of-the-box operation.

---

## 📂 Project Structure
```
├── backend/
│   ├── config/          # DB connections and filesystem fallback
│   ├── middleware/      # JWT auth guard
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Express application entry
│   └── .gitignore       # Git ignores (excludes node_modules, .env, data/)
│
└── frontend/
    ├── src/
    │   ├── components/  # Drawer, Spines, Shelves, Modals
    │   ├── context/     # State management AuthContext
    │   ├── pages/       # Bookshelf, Vault, Timeline, Stats, Login
    │   ├── App.jsx      # Navigation routing shell
    │   ├── index.css    # Custom wood grains and design styles
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Optional. If not running, the application will automatically fall back to the built-in local JSON file database).

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd readers-library
   ```

2. **Backend Configuration**
   * Go to the `backend` folder:
     ```bash
     cd backend
     ```
   * Create a `.env` file (copying from standard settings):
     ```env
     PORT=5000
     MONGODB_URI=mongodb://127.0.0.1:27017/readers_library
     JWT_SECRET=readers_library_secret_key_2026_cozy
     ```
   * Install backend packages:
     ```bash
     npm install
     ```

3. **Frontend Configuration**
   * Go to the `frontend` folder:
     ```bash
     cd ../frontend
     ```
   * Install frontend packages:
     ```bash
     npm install
     ```

---

## 💻 Running the Application

To run the application, launch the backend server and frontend dev server in separate terminal windows.

### Start the Backend Server
```bash
cd backend
npm run dev
```
*The API will run at `http://localhost:5000`.*

### Start the Frontend Client
```bash
cd frontend
npm run dev
```
*The client will compile and host at `http://localhost:5173`.*

---

## 🔒 Reviewer Quick Entry
To bypass the login page and test with preloaded mock data:
1. Open `http://localhost:5173`.
2. Click **Explore Demo Library (One Click)**.
3. This seeds your database with default books, ratings, quotes, and note collections immediately.

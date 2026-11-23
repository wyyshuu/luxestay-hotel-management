# LuxeStay | Hotel Management CRUD SPA

A production-grade, bug-free, full-stack Hotel Management Single Page Application (SPA) built with a responsive luxury e-commerce UI.

---

## 🏛 Architecture & Tech Stack

### Monorepo Structure
```
hotel-management-app/
├── backend/
│   ├── config/
│   │   └── db.js            # Native pg Pool with parameterized queries + schema auto-init
│   ├── middleware/
│   │   └── upload.js        # Multer disk storage for /uploads with validation
│   ├── routes/
│   │   └── hotelRoutes.js   # Parameterized CRUD API endpoints ($1, $2, ...)
│   ├── uploads/             # Local file storage for uploaded hotel photography
│   ├── schema.sql           # Native PostgreSQL table schema
│   ├── server.js            # Express server with CORS & static /uploads
│   ├── test-runner.js       # Complete automated CRUD test suite
│   ├── .env                 # Database and server configuration
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # UI components (Navbar, Hero, FilterBar, HotelCard, HotelGrid, Modals)
│   │   ├── pages/           # HotelListingPage, HotelDetailPage
│   │   ├── store/           # Redux Toolkit (hotelSlice, uiSlice, store)
│   │   ├── styles/          # Modular CSS design system (variables, index, components)
│   │   ├── utils/           # Formatters (currency, coordinates, maps URLs, image URLs)
│   │   ├── App.jsx          # React Router layout & global modal mount
│   │   └── main.jsx         # Entry point with Provider & BrowserRouter
│   ├── index.html           # HTML5 template with Google typography
│   ├── vite.config.js       # Vite bundler with reverse proxy
│   └── package.json
├── package.json             # Root workspace script runner
└── README.md
```

---

## 🔒 Architectural Constraints Adherence

1. **Strictly NO ORMs:**
   - Every single database operation in `/backend/routes/hotelRoutes.js` and `/backend/config/db.js` uses **native parameterized SQL queries** (`$1, $2, ...`) via the `pg` Pool driver to completely prevent SQL injection.
   - Zero Sequelize, Prisma, TypeORM, or Knex dependencies.

2. **Local File Storage:**
   - Hotel images are uploaded via `multer` directly to `/backend/uploads` with sanitized unique filenames (`hotel-${Date.now()}-${random}.ext`).
   - Only the relative file path (e.g. `uploads/hotel-1795346678716-41749410.svg`) is stored in PostgreSQL.
   - The `/uploads` path is exposed statically via `express.static(path.join(__dirname, 'uploads'))`.
   - On hotel record update (with new image) or deletion, old files are cleanly unlinked from the filesystem.

3. **Responsive Card Layout (NO HTML Tables):**
   - The hotel inventory list is rendered exclusively using an e-commerce-grade responsive CSS Grid (`repeat(auto-fill, minmax(330px, 1fr))`).
   - HTML `<table>` elements are strictly not used for hotel listing.

4. **Automatic Schema Initialization:**
   - `/backend/schema.sql` contains `CREATE TABLE IF NOT EXISTS hotels`.
   - Backend automatically reads and executes `schema.sql` on startup, seeding sample luxury properties if the database is initially empty.

---

## 🗄 Database Schema (`backend/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **PostgreSQL** (optional; an intelligent in-memory PostgreSQL emulator `pg-mem` activates automatically if an external PostgreSQL daemon is not detected, enabling instant zero-configuration testing!)

### 2. Configure Backend Database (Optional)
In `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hotel_db
# Or individual PG variables:
# PGHOST=localhost
# PGPORT=5432
# PGUSER=postgres
# PGPASSWORD=postgres
# PGDATABASE=hotel_db
```

### 3. Start Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` with API at `http://localhost:5000/api/hotels`.*

### 4. Start Frontend SPA
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📡 REST API Reference

All database queries strictly execute native parameterized SQL (`$1, $2, ...` via `pg.Pool`) without any ORM.

| Method | Endpoint | Description | Payload / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & database engine status | None |
| `GET` | `/api/hotels` | List hotels with filtering & sorting | Query: `search`, `minPrice`, `maxPrice`, `sort` (`newest`, `price_asc`, `price_desc`, `title_asc`, `oldest`) |
| `GET` | `/api/hotels/:id` | Fetch single hotel by ID | Param: `id` (integer) |
| `POST` | `/api/hotels` | Create new hotel + local file upload | Multipart FormData: `title`, `description`, `latitude`, `longitude`, `price`, `image` (file) |
| `PUT` | `/api/hotels/:id` | Update hotel (+ optional photo replace) | Multipart FormData: `title`, `description`, `latitude`, `longitude`, `price`, `image` (optional) |
| `DELETE` | `/api/hotels/:id` | Delete hotel & purge photo from disk | Param: `id` (integer) |

---

## 🧪 Testing Backend CRUD Endpoints

An automated end-to-end integration test is included:
```bash
cd backend
npm test
```
Tests:
- `GET /api/health`
- `GET /api/hotels` (with search and price filters)
- `POST /api/hotels` (multipart/form-data image upload)
- `GET /api/hotels/:id`
- `PUT /api/hotels/:id` (updating fields and image)
- `DELETE /api/hotels/:id` (verifying database deletion and filesystem cleanup)
- `GET /api/hotels/:id` (confirming 404 post-deletion)

---

## 🎨 UI & UX Features
- **Responsive Hotel Cards:** Aspect-ratio imagery, price pill badge, compass-formatted coordinates with direct Google Maps link, quick actions (Details, Edit, Delete).
- **Redux Toolkit Integration:** Fully reactive centralized state with `hotelSlice` and `uiSlice` async thunks and loading/error states.
- **Client-Side Validation:** Real-time feedback for coordinates (-90 to 90 lat, -180 to 180 lng), positive price, image format, and required text.
- **Drag & Drop Image Upload:** Live image preview before submitting to server.
- **Search & Dynamic Filters:** Debounced keyword search, min/max price range, sort by newest, price, or title, and one-click reset.
- **Toast Notifications:** Auto-dismissing feedback alerts for create, update, delete, and error events.

# 🎪 THE EVENT STORE

> An inventory-backed e-commerce site for event props and decor hire (lighting, backdrops, balloons, furniture, tableware), featuring a signature funky neo-brutalist aesthetic, guest storefront with WhatsApp & Telegram order dispatch, and a full-access admin operations dashboard with POS billing and real-time inventory tracking.

---

## 🌟 Key Features

### 🛍️ Client Storefront (Mobile-First)

- **Funky Neo-Brutalist Theme**: Bold diagonal gradient background (`blue` → `purple` → `pink` → `yellow`), white "sticker" panels with 3px solid ink borders, 24px rounded corners, hard offset drop shadows (`8px 8px 0 #161221`), and Google Fonts (_Baloo 2_ for headings & _Space Grotesk_ for UI).
- **In-Card Image Carousel**: Browse multiple angles of props with dot and arrow navigation directly on cards without navigating away.
- **Product Detail Pages**: Full image gallery slider, live stock badges (_"In Stock"_, _"Only 3 left!"_, _"Out of stock"_), description, and stock-capped quantity selector.
- **Dynamic Category Navigation**: Lighting (yellow), Backdrops (pink), Balloons (blue), Tableware (lime), Furniture (purple).
- **Live Stock Cart Drawer**: Validates quantities against live stock; prevents exceeding available inventory.
- **Friction-Free Guest Checkout**: No login or signup required. Customers provide only their name and phone number.
- **Dual Notification Dispatch**:
  - **WhatsApp Deep Link**: Generates a pre-filled `wa.me` link with full order details addressed to the store's number with an interactive "Send on WhatsApp" button.
  - **Telegram Bot API**: Automatically logs the order enquiry to the store's Telegram channel from the backend as the reliable system of record.
- **Strict Order vs. Sale Distinction**: Online storefront checkout creates an `Order` (status: `pending`) and **NEVER decrements stock**. Only a finalized POS sale modifies inventory.

### 🏢 Admin Dashboard

- **Single Admin Role**: Every administrator has full system control, including catalog management, inventory reports, CSV exports, POS billing, orders, audit logs, and user account management.
- **POS / Billing Tool (Counter Sales)**:
  - Real-time product search and line item builder.
  - Custom sold price per line item (independent from listed catalog price).
  - **Atomic Stock Decrement**: Uses `{ _id: id, stock: { $gte: qty } }` ensuring race-condition-proof inventory decrement with automatic rollback if stock is insufficient.
  - One-click "Bill from Order" action directly pre-populates online enquiries into POS bills.
  - Printable and viewable receipt summary upon finalization.
- **Inventory & CSV Export**:
  - Highlights products where stock ≤ 5 with warning badges and color-coded rows.
  - "Low Stock Only" filter toggle.
  - One-click CSV export with explicit `Stock Status` (`LOW STOCK (<= 5)` vs `IN STOCK`) column.
- **Category Management**: Create, edit, and delete categories with brand colorKey assignments. Safe deletion prompts for reassignment so no product is ever orphaned.
- **Backend-Proxied Cloudinary Uploads**: Multi-photo uploads streamed via Multer memory storage and Cloudinary Node SDK. Zero API secrets are exposed to the browser.
- **Audit Logging**: Logs key operations (product changes, bill finalization, user modifications) with timestamp and staff reference.

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas URI or local MongoDB instance (If no URI is provided, an embedded in-memory MongoDB automatically starts in development mode).

### 1. Clone & Install Dependencies

```bash
git clone <repository_url> theeventstore
cd theeventstore

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Environment Configuration

Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

Edit `server/.env` with your credentials:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas (or leave empty for embedded in-memory database)
MONGODB_URI=mongodb://localhost:27017/theeventstore

# JWT Secrets
JWT_SECRET=supersecret_theeventstore_jwt_access_token_key_2026
JWT_REFRESH_SECRET=supersecret_theeventstore_jwt_refresh_token_key_2026

# Store WhatsApp Number (for customer wa.me deep links)
STORE_WHATSAPP_NUMBER=919876543210
STORE_NAME=THE EVENT STORE

# Telegram Bot Notifications (Free Telegram Bot API)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Cloudinary Image Storage (Free Tier)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Seed Demo Data

Populate categories, demo products with multi-angle photos, and pre-configured user accounts:

```bash
npm run seed
```

#### Demo Login Credentials:

| Role      | Email                     | Password    | Permissions         |
| --------- | ------------------------- | ----------- | ------------------- |
| **Admin** | `admin@theeventstore.com` | `Admin123!` | Full system control |

_(The login screen also features a one-click quick-fill button for the admin account.)_

### 4. Run Locally

Run both backend and frontend concurrently with a single command:

```bash
npm run dev
```

- **Storefront Client**: [http://localhost:5173](http://localhost:5173)
- **Admin Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📁 Repository Monorepo Structure

```
theeventstore/
├── package.json              # Monorepo scripts (dev, build, seed, install:all)
├── .env.example              # Central environment variable template
├── README.md                 # Complete documentation & setup instructions
├── server/                   # Backend Express & Mongoose API
│   ├── package.json
│   ├── .env                  # Backend environment secrets
│   ├── scripts/
│   │   ├── seed.js           # Database seeder (users, categories, products)
│   │   └── test-workflow.js  # Automated verification suite
│   └── src/
│       ├── config/           # Database, Cloudinary, Telegram configs
│       ├── controllers/      # Auth, Products, Categories, Orders, Sales, Inventory, Users
│       ├── middleware/       # Auth (JWT httpOnly), RBAC guards, rate limiter, error handler
│       ├── models/           # User, Category, Product, Order, Sale, AuditLog
│       ├── routes/           # Auth, Public storefront, Admin endpoints
│       ├── utils/            # Audit logger, CSV generator
│       └── index.js          # Express app entry point
└── client/                   # Frontend React (Vite) Single Page App
    ├── package.json
    ├── vite.config.js        # Vite dev server with /api proxy
    ├── tailwind.config.js    # Custom funky design system tokens
    ├── index.html            # Google Fonts (Baloo 2 & Space Grotesk)
    └── src/
        ├── index.css         # Funky gradient, sticker panels, hard offset shadows
        ├── api/              # Axios client with withCredentials
        ├── context/          # AuthContext (RBAC) & CartContext (live stock limits)
        ├── components/
        │   ├── common/       # FunkyButton, Badge, Modal, ImageSlider, ProtectedRoute
        │   ├── layout/       # Navbar, Footer, AdminLayout
        │   └── storefront/   # HeroSection, ProductCard, CartDrawer, CheckoutModal
        ├── pages/
        │   ├── storefront/   # HomePage, CategoryPage, ProductDetailPage
        │   └── admin/        # Login, Dashboard, Billing (POS), Orders, Products, Categories, Inventory, Users, AuditLogs
        ├── App.jsx           # React Router route definitions
        └── main.jsx          # React bootstrap
```

---

## 🔒 Security & Performance Features

- **httpOnly Cookies**: JWT access and refresh tokens stored strictly in httpOnly, sameSite cookies to protect against XSS.
- **Brute Force Protection**: Rate limiting on `/api/auth/login` (express-rate-limit).
- **Spam Order Prevention**: Rate limiting on guest storefront checkout (`/api/public/orders`).
- **HTTP Hardening**: Helmet security headers configured on all endpoints.
- **Zero Exposed Cloudinary Secrets**: Image uploads are signed and proxied through backend Multer memory storage.
- **Atomic Stock Deductions**: Uses `{ _id, stock: { $gte: quantity } }` to guarantee inventory integrity and prevent overselling even under concurrent requests.

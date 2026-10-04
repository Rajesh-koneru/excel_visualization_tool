# Excel Visual Analyzer — Production MERN Data Intelligence Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19-cyan.svg)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-emerald.svg)](https://www.mongodb.com)
[![Express.js](https://img.shields.io/badge/Express-v5-black.svg)](https://expressjs.com)
[![Recharts](https://img.shields.io/badge/Recharts-v3-purple.svg)](https://recharts.org)

> A modern, full-stack MERN spreadsheet analytics and visualization platform that extracts Excel/CSV data, performs automated statistical profiling, generates actionable dynamic insights, audits data health, and renders interactive customizable visualizations.

---

## 🚀 Overview

**Excel Visual Analyzer** transforms complex spreadsheets into immediate business intelligence. Users can drag and drop `.xlsx`, `.xls`, or `.csv` files to get automated statistical profiling, health scores, dynamic insights, chart recommendations, and interactive data filtering without writing a single formula or script.

---

## ✨ Key Features

- 📤 **Smart Spreadsheet Ingestion**: Drag-and-drop file upload with format validation (`.xlsx`, `.xls`, `.csv`), file size limits (10MB), and multi-stage progress indicators.
- 📊 **Automated Statistical Data Profiling**: Calculates min, max, mean, median, standard deviation, sum for numeric columns, and unique frequencies/top modes for categorical columns.
- 🩺 **Data Quality & Health Audit**: Evaluates dataset health (0–100%), detects null cells, missing values, duplicate rows, and empty columns.
- 🧹 **One-Click Auto-Data Cleaning**: Safely imputes missing numerical/string values and deduplicates rows without overwriting original files.
- 💡 **Dynamic Insight Engine**: Automatically discovers trends, category dominance, high variance alerts, and statistical range summaries.
- 🎯 **Intelligent Chart Recommendations**: Recommends visual representations (Bar, Line, Area, Pie, Doughnut) tailored to column data types.
- 🎨 **Interactive Chart Configuration & Export**: Select X/Y axes, custom titles, aggregation modes (Sum, Average, Count), and export charts as **PNG**, **SVG**, or **JPEG**.
- 🔍 **Interactive Data Table**: Global search across all columns, instant sorting, pagination, and one-click **CSV export**.
- 🗂️ **Analysis History Drawer**: Persistent history drawer powered by MongoDB with dataset metadata, active selection, and file management.
- 🤖 **AI Data Assistant**: Interactive natural-language assistant to query dataset metrics, rankings, averages, executive reports, and trends directly.
- 🔐 **JWT Authentication & Security**: Secure password hashing with `bcrypt`, JWT tokens, environment configuration, and centralized error handling.

---

## 🔄 Core Workflow

```text
User Selects / Drops Spreadsheet (.xlsx, .xls, .csv)
                       │
                       ▼
          Client Validation (Type & Size)
                       │
                       ▼
       Server Memory Buffer Parsing (XLSX Engine)
                       │
                       ▼
      Automated Profiling & Data Quality Audit
                       │
                       ▼
    Dynamic Insight & Chart Recommendation Engine
                       │
                       ▼
     Persistence to MongoDB (Dataset Metadata & Rows)
                       │
                       ▼
 Interactive Dashboard (Overview, Quality, Insights, Charts, Explorer)
```

---

## 🛠️ Technology Stack

### Backend
- **Node.js**: Asynchronous event-driven runtime environment.
- **Express.js (v5)**: RESTful API routing, file upload handling, and error middleware.
- **MongoDB & Mongoose**: NoSQL database for metadata, statistics, profiling summaries, and dataset rows.
- **XLSX**: Spreadsheet parsing engine supporting cell types, dates, and multiple sheets.
- **Bcrypt & JsonWebToken**: Password hashing and stateless authentication.
- **Multer**: Memory storage file stream processing.

### Frontend
- **React (v19)**: Component-driven user interface architecture.
- **Recharts**: Responsive SVG/Canvas charting library for Bar, Line, Area, Pie, and Doughnut charts.
- **Lucide React**: Clean modern icon kit.
- **Axios**: Promised-based HTTP client with request/response interceptors for JWT injection.
- **HTML-to-Image & DownloadJS**: High-resolution chart image exporter.
- **Vanilla CSS (Custom System)**: CSS variables, glassmorphic themes, responsive layouts, and dark mode palette.

---

## 🏗️ Project Architecture

```text
excel-visual-analyzer/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User Auth (Register, Login, Me)
│   │   └── datasetController.js  # Spreadsheet upload, profile, clean, preview, demo
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   ├── fileUpload.js         # Multer buffer & extension filter
│   │   └── errorHandler.js       # Centralized API error response
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Dataset.js            # Dataset schema (metadata, profiling, insights)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/v1/auth
│   │   ├── datasetRoutes.js      # /api/v1/datasets
│   │   └── UserRoutes.js         # Legacy backward compatibility routes
│   ├── services/
│   │   ├── excelParser.js        # Spreadsheet buffer parser
│   │   ├── dataProfiler.js       # Statistical engine & quality auditor
│   │   └── insightEngine.js      # Dynamic insight & chart recommender
│   ├── .env.example
│   ├── server.js                 # Application entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Glassmorphic header & status badges
│   │   │   ├── FileUpload.jsx    # Dropzone & progress indicator
│   │   │   ├── DatasetOverview.jsx # Metric cards & column schema breakdown
│   │   │   ├── DataQualityCard.jsx# Health audit report & auto-clean button
│   │   │   ├── InsightsSection.jsx# Dynamic insight cards
│   │   │   ├── ChartConfig.jsx   # Recommendations & chart builder controls
│   │   │   ├── ChartDisplay.jsx  # Recharts canvas renderer
│   │   │   ├── Download.jsx      # Export dropdown (PNG, SVG, JPEG)
│   │   │   ├── DataPreview.jsx   # Data table with search & pagination
│   │   │   ├── SideBar.jsx       # History drawer & dataset selection
│   │   │   └── Footer.jsx        # Page footer
│   │   ├── pages/
│   │   │   ├── home.jsx          # Hero landing page & instant analyzer
│   │   │   ├── Dashboard.jsx     # Workspace dashboard
│   │   │   ├── loginPage.jsx     # Login page
│   │   │   └── Registration.jsx  # Registration page
│   │   ├── services/
│   │   │   └── api.js            # Axios client & endpoints wrapper
│   │   ├── App.js                # React Router setup
│   │   ├── index.css             # Global CSS variables & glassmorphism utilities
│   │   └── index.js
│   └── package.json
│
├── .env.example
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment configuration
cp .env.example .env

# Start development server
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```
*Frontend runs on `http://localhost:3000`*

---

## 🔑 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/Excel_analysis
JWT_SECRET=excel_visual_analyzer_secret_key_2026_prod
MAX_FILE_SIZE_MB=10
```

### Frontend `.env` (Optional)
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📡 API Reference

### Auth Endpoints (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account |
| `POST` | `/api/v1/auth/login` | Login and receive JWT access token |
| `GET` | `/api/v1/auth/me` | Fetch active user profile |

### Dataset Endpoints (`/api/v1/datasets`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/datasets/upload` | Upload spreadsheet file, parse, profile & analyze |
| `GET` | `/api/v1/datasets` | List all processed datasets for user/session |
| `POST` | `/api/v1/datasets/preview` | Fetch dataset rows and profiling preview |
| `GET` | `/api/v1/datasets/demo` | Fetch pre-loaded demo sales dataset for quick testing |
| `POST` | `/api/v1/datasets/:filename/clean` | Auto-clean missing values & deduplicate rows |
| `DELETE` | `/api/v1/datasets/:filename` | Delete dataset record from history |

### AI Assistant Endpoints (`/api/v1/ai`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ai/query` | Natural-language query with deterministic dataset calculation and AI response |

---

## 🤖 AI Data Assistant

The Excel Visual Analyzer includes an AI-powered assistant that allows users to ask natural-language questions about uploaded Excel datasets.

Examples:

- Highest/lowest values
- Averages and totals
- Category comparisons
- Trends
- Data summaries
- Overall reports
- Data insights

AI configuration is handled through environment variables:
```env
AI_API_KEY=your_free_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/)). If no key is set, the assistant automatically uses the built-in deterministic query engine for exact computations.*

---

## 🛡️ Security & Performance Practices

1. **In-Memory File Processing**: Spreadsheets are parsed in memory using Multer buffers, preventing file system clutter or uncleaned temporary files.
2. **Input & Extension Filtering**: Strict MIME type and extension validation (`.xlsx`, `.xls`, `.csv`) and 10MB payload size limits.
3. **Password Hashing**: Passwords are standardly hashed with `bcrypt` (10 salt rounds).
4. **CORS & Centralized Error Handling**: Configured origins, headers, and sanitized error responses that never leak raw stack traces to end users in production.

---

## 📜 License

This project is open-source under the ISC License.

---
*Developed with focus on full-stack architecture, clean code quality, and production data visualization.*

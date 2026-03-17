# School Web App

A React school website with **About Us**, **Reports** (documents), **Donations**, **Teachers**, and an **Admin** panel to manage all content.

## Features

- **Public site**: Home, About Us, Reports (document list + full document view), Donations, Teachers
- **Admin panel**: Log in to edit About page, add/edit/delete Reports, add/edit/delete Teachers, edit Donations page
- **Backend**: Express API with JSON file storage (no database required)

## Quick start

### 1. Install dependencies

From the project root:

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Run dev (frontend + backend)

From the project root:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173  
- **API**: http://localhost:3001  

### 3. Admin access

- Go to **Admin** in the nav (or http://localhost:5173/admin)
- Password: **admin123** (change in `server/index.js` for production)

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Run client + server in dev     |
| `npm run build`| Build React app for production |
| `npm run start`| Run server only (after build)  |

## Tech stack

- **Client**: React 18, React Router, Vite, CSS Modules
- **Server**: Node.js, Express
- **Data**: `server/data/db.json` (edit or replace with a real DB later)

## Project structure

```
school/
├── client/           # React app
│   ├── src/
│   │   ├── pages/    # Home, About, Reports, Donations, Teachers, Admin
│   │   ├── api.ts    # API client
│   │   ├── App.tsx
│   │   └── Layout
│   └── ...
├── server/
│   ├── data/
│   │   └── db.json   # Content storage
│   └── index.js      # Express API
└── package.json
```

Change the admin password and consider adding proper auth (e.g. JWT or sessions) before deploying.

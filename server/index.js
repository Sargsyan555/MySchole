import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Dev admin password (change in production)
const ADMIN_PASSWORD = 'admin';

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const name = `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB
const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

app.use(express.json());

// Admin: upload PDF file (must be before static so POST is handled)
app.post('/api/admin/upload-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/admin/upload-image', uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

// Serve uploaded files (so /api/uploads/filename.pdf works)
app.use('/api/uploads', express.static(UPLOADS_DIR));

// In-memory store for dev
let about = { title: 'School', subtitle: 'Welcome', body: 'Content here.' };
let reports = [];
let teachers = [];
let events = [];

// Public routes
app.get('/api/about', (req, res) => res.json(about));
app.get('/api/reports', (req, res) => res.json(reports));
app.get('/api/reports/:id', (req, res) => {
  const r = reports.find((x) => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Report not found' });
  res.json(r);
});
app.get('/api/teachers', (req, res) => res.json(teachers));
app.get('/api/events', (req, res) => res.json(events));

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  res.json({ ok: true });
});

// Admin events CRUD (must be before generic 404)
app.post('/api/admin/events', (req, res) => {
  const id = String(Date.now());
  const event = {
    id,
    title: req.body.title || '',
    description: req.body.description || '',
    date: req.body.date || new Date().toISOString().slice(0, 16),
    status: req.body.status === 'past' ? 'past' : 'upcoming',
    imageUrl: req.body.imageUrl || '',
    galleryImages: Array.isArray(req.body.galleryImages) ? req.body.galleryImages : [],
  };
  events.push(event);
  res.status(201).json(event);
});

app.put('/api/admin/events/:id', (req, res) => {
  const i = events.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Event not found' });
  events[i] = {
    ...events[i],
    ...req.body,
    id: events[i].id,
    galleryImages: Array.isArray(req.body.galleryImages) ? req.body.galleryImages : (events[i].galleryImages || []),
  };
  res.json(events[i]);
});

app.delete('/api/admin/events/:id', (req, res) => {
  events = events.filter((x) => x.id !== req.params.id);
  res.status(204).end();
});

// Admin routes (no auth check for dev)
app.put('/api/admin/about', (req, res) => {
  about = { ...about, ...req.body };
  res.json(about);
});

app.post('/api/admin/reports', (req, res) => {
  const id = String(Date.now());
  const report = { id, ...req.body, publishedAt: req.body.publishedAt || new Date().toISOString().slice(0, 10) };
  reports.push(report);
  res.status(201).json(report);
});

app.put('/api/admin/reports/:id', (req, res) => {
  const i = reports.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Report not found' });
  reports[i] = { ...reports[i], ...req.body };
  res.json(reports[i]);
});

app.delete('/api/admin/reports/:id', (req, res) => {
  reports = reports.filter((x) => x.id !== req.params.id);
  res.status(204).end();
});

app.post('/api/admin/teachers', (req, res) => {
  const id = String(Date.now());
  const teacher = { id, ...req.body };
  teachers.push(teacher);
  res.status(201).json(teacher);
});

app.put('/api/admin/teachers/:id', (req, res) => {
  const i = teachers.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Teacher not found' });
  teachers[i] = { ...teachers[i], ...req.body };
  res.json(teachers[i]);
});

app.delete('/api/admin/teachers/:id', (req, res) => {
  teachers = teachers.filter((x) => x.id !== req.params.id);
  res.status(204).end();
});

// 404 for any other /api request (helps debug missing routes)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

const server = app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Free it with:\n  lsof -ti:${PORT} | xargs kill\n`);
    process.exit(1);
  }
  throw err;
});

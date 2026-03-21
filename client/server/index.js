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

// About content per language (en, hy, ru) — persisted so all three survive restarts
const emptyAboutBlock = () => ({ title: '', subtitle: '', body: '' });
const ABOUT_LANGS = ['en', 'hy', 'ru'];
const ABOUT_DATA_FILE = path.join(__dirname, 'data', 'about.json');

function normalizeAboutFromFile(parsed) {
  const base = {
    en: emptyAboutBlock(),
    hy: emptyAboutBlock(),
    ru: emptyAboutBlock(),
  };
  if (!parsed || typeof parsed !== 'object') return base;
  for (const lang of ABOUT_LANGS) {
    const b = parsed[lang];
    if (b && typeof b === 'object') {
      base[lang] = {
        title: String(b.title ?? ''),
        subtitle: String(b.subtitle ?? ''),
        body: String(b.body ?? ''),
      };
    }
  }
  return base;
}

function loadAboutFromDisk() {
  try {
    if (fs.existsSync(ABOUT_DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ABOUT_DATA_FILE, 'utf8'));
      return normalizeAboutFromFile(parsed);
    }
  } catch (e) {
    console.warn('about.json load failed:', e.message);
  }
  return { en: emptyAboutBlock(), hy: emptyAboutBlock(), ru: emptyAboutBlock() };
}

function saveAboutToDisk() {
  try {
    const dir = path.dirname(ABOUT_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ABOUT_DATA_FILE, JSON.stringify(aboutByLang, null, 2), 'utf8');
  } catch (e) {
    console.warn('about.json save failed:', e.message);
  }
}

let aboutByLang = loadAboutFromDisk();
let studentsPage = { title: '', subtitle: '', body: '' };
let reports = [];
let announcements = [];
let teachers = [];
let events = [];

// Public routes
app.get('/api/about', (req, res) => res.json(aboutByLang));
app.get('/api/students-page', (req, res) => res.json(studentsPage));
app.get('/api/reports', (req, res) => res.json(reports));
app.get('/api/announcements', (req, res) => res.json(announcements));
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
  const lang = req.body?.lang;
  if (!ABOUT_LANGS.includes(lang)) {
    return res.status(400).json({ error: 'Invalid or missing lang (en, hy, ru)' });
  }
  const title = req.body.title != null ? String(req.body.title) : '';
  const subtitle = req.body.subtitle != null ? String(req.body.subtitle) : '';
  const body = req.body.body != null ? String(req.body.body) : '';
  // Only replace this language; en / hy / ru stay independent
  aboutByLang[lang] = { title, subtitle, body };
  saveAboutToDisk();
  res.json(aboutByLang);
});

app.put('/api/admin/students-page', (req, res) => {
  studentsPage = { ...studentsPage, ...req.body };
  res.json(studentsPage);
});

const ANNOUNCEMENT_TYPES = ['vacancies', 'admission'];
app.post('/api/admin/announcements', (req, res) => {
  const id = String(Date.now());
  const type = ANNOUNCEMENT_TYPES.includes(req.body?.type) ? req.body.type : 'vacancies';
  const item = {
    id,
    ...req.body,
    type,
    publishedAt: req.body.publishedAt || new Date().toISOString().slice(0, 10),
  };
  announcements.push(item);
  res.status(201).json(item);
});

app.put('/api/admin/announcements/:id', (req, res) => {
  const i = announcements.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Announcement not found' });
  const type =
    req.body?.type && ANNOUNCEMENT_TYPES.includes(req.body.type)
      ? req.body.type
      : announcements[i].type || 'vacancies';
  announcements[i] = { ...announcements[i], ...req.body, type };
  res.json(announcements[i]);
});

app.delete('/api/admin/announcements/:id', (req, res) => {
  announcements = announcements.filter((x) => x.id !== req.params.id);
  res.status(204).end();
});

const DOC_TYPES = ['budgets', 'purchases', 'licenses', 'other'];
app.post('/api/admin/reports', (req, res) => {
  const id = String(Date.now());
  const type = DOC_TYPES.includes(req.body?.type) ? req.body.type : 'other';
  const report = {
    id,
    ...req.body,
    type,
    publishedAt: req.body.publishedAt || new Date().toISOString().slice(0, 10),
  };
  reports.push(report);
  res.status(201).json(report);
});

app.put('/api/admin/reports/:id', (req, res) => {
  const i = reports.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Report not found' });
  const type = req.body?.type && DOC_TYPES.includes(req.body.type) ? req.body.type : reports[i].type || 'other';
  reports[i] = { ...reports[i], ...req.body, type };
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

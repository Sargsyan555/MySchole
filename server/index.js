import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  DATA_FILES,
  UPLOADS_ROOT,
  UPLOADS_PDFS,
  UPLOADS_IMAGES,
  ensureDirs,
  writeJsonAtomic,
  safeUnlinkUploadUrl,
  loadReports,
  loadAnnouncements,
  loadTeachers,
  loadEvents,
  normalizeReport,
  normalizeAnnouncement,
  normalizeTeacher,
  normalizeEvent,
} from './persistence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

const ADMIN_PASSWORD = 'admin';

ensureDirs();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_PDFS),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const name = `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_IMAGES),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());

app.post('/api/admin/upload-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const rel = `pdfs/${req.file.filename}`;
  const url = `/api/uploads/${rel}`;
  const uploadedAt = new Date().toISOString();
  res.json({
    url,
    storedFileName: req.file.filename,
    originalName: req.file.originalname || '',
    subpath: rel,
    uploadedAt,
  });
});

app.post('/api/admin/upload-image', uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const rel = `images/${req.file.filename}`;
  const url = `/api/uploads/${rel}`;
  const uploadedAt = new Date().toISOString();
  res.json({
    url,
    storedFileName: req.file.filename,
    originalName: req.file.originalname || '',
    subpath: rel,
    uploadedAt,
  });
});

app.use('/api/uploads', express.static(UPLOADS_ROOT));

// About — same file as before
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
    writeJsonAtomic(ABOUT_DATA_FILE, aboutByLang);
  } catch (e) {
    console.warn('about.json save failed:', e.message);
  }
}

let aboutByLang = loadAboutFromDisk();
let reports = loadReports();
let announcements = loadAnnouncements();
let teachers = loadTeachers();
let events = loadEvents();

function saveReports() {
  writeJsonAtomic(DATA_FILES.reports, reports);
}
function saveAnnouncements() {
  writeJsonAtomic(DATA_FILES.announcements, announcements);
}
function saveTeachers() {
  writeJsonAtomic(DATA_FILES.teachers, teachers);
}
function saveEvents() {
  writeJsonAtomic(DATA_FILES.events, events);
}

app.get('/api/about', (req, res) => res.json(aboutByLang));
app.get('/api/reports', (req, res) => res.json(reports));
app.get('/api/announcements', (req, res) => res.json(announcements));
app.get('/api/reports/:id', (req, res) => {
  const r = reports.find((x) => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Report not found' });
  res.json(r);
});
app.get('/api/teachers', (req, res) => res.json(teachers));
app.get('/api/events', (req, res) => res.json(events));

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  res.json({ ok: true });
});

app.post('/api/admin/events', (req, res) => {
  const id = String(Date.now());
  const event = normalizeEvent({
    id,
    title: req.body.title || '',
    description: req.body.description || '',
    date: req.body.date || new Date().toISOString().slice(0, 16),
    status: req.body.status === 'past' ? 'past' : 'upcoming',
    imageUrl: req.body.imageUrl || '',
    galleryImages: Array.isArray(req.body.galleryImages) ? req.body.galleryImages : [],
  });
  events.push(event);
  saveEvents();
  res.status(201).json(event);
});

app.put('/api/admin/events/:id', (req, res) => {
  const i = events.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Event not found' });
  const prev = events[i];
  const nextImage = req.body.imageUrl !== undefined ? req.body.imageUrl : prev.imageUrl;
  const nextGallery =
    req.body.galleryImages !== undefined
      ? req.body.galleryImages
      : prev.galleryImages || [];
  if (nextImage !== prev.imageUrl) safeUnlinkUploadUrl(prev.imageUrl);
  if (Array.isArray(prev.galleryImages)) {
    const removed = prev.galleryImages.filter((u) => !nextGallery.includes(u));
    removed.forEach(safeUnlinkUploadUrl);
  }
  events[i] = normalizeEvent({
    ...prev,
    ...req.body,
    id: prev.id,
    galleryImages: Array.isArray(req.body.galleryImages) ? req.body.galleryImages : prev.galleryImages || [],
  });
  saveEvents();
  res.json(events[i]);
});

app.delete('/api/admin/events/:id', (req, res) => {
  const ev = events.find((x) => x.id === req.params.id);
  if (ev) {
    safeUnlinkUploadUrl(ev.imageUrl);
    (ev.galleryImages || []).forEach(safeUnlinkUploadUrl);
  }
  events = events.filter((x) => x.id !== req.params.id);
  saveEvents();
  res.status(204).end();
});

app.put('/api/admin/about', (req, res) => {
  const lang = req.body?.lang;
  if (!ABOUT_LANGS.includes(lang)) {
    return res.status(400).json({ error: 'Invalid or missing lang (en, hy, ru)' });
  }
  const title = req.body.title != null ? String(req.body.title) : '';
  const subtitle = req.body.subtitle != null ? String(req.body.subtitle) : '';
  const body = req.body.body != null ? String(req.body.body) : '';
  aboutByLang[lang] = { title, subtitle, body };
  saveAboutToDisk();
  res.json(aboutByLang);
});

const ANNOUNCEMENT_TYPES = ['vacancies', 'admission'];
app.post('/api/admin/announcements', (req, res) => {
  const id = String(Date.now());
  const type = ANNOUNCEMENT_TYPES.includes(req.body?.type) ? req.body.type : 'vacancies';
  const item = normalizeAnnouncement({
    id,
    title: req.body?.title ?? '',
    summary: req.body?.summary ?? '',
    content: req.body?.content ?? '',
    publishedAt: req.body?.publishedAt || new Date().toISOString().slice(0, 10),
    type,
    pdfUrl: req.body?.pdfUrl ?? '',
    pdfMeta: req.body?.pdfMeta,
  });
  announcements.push(item);
  saveAnnouncements();
  res.status(201).json(item);
});

app.put('/api/admin/announcements/:id', (req, res) => {
  const i = announcements.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Announcement not found' });
  const prev = announcements[i];
  const type =
    req.body?.type && ANNOUNCEMENT_TYPES.includes(req.body.type)
      ? req.body.type
      : announcements[i].type || 'vacancies';
  const nextPdf = req.body.pdfUrl !== undefined ? req.body.pdfUrl : prev.pdfUrl;
  if (nextPdf !== prev.pdfUrl) safeUnlinkUploadUrl(prev.pdfUrl);
  announcements[i] = normalizeAnnouncement({
    ...prev,
    ...req.body,
    type,
    id: prev.id,
  });
  saveAnnouncements();
  res.json(announcements[i]);
});

app.delete('/api/admin/announcements/:id', (req, res) => {
  const item = announcements.find((x) => x.id === req.params.id);
  if (item) safeUnlinkUploadUrl(item.pdfUrl);
  announcements = announcements.filter((x) => x.id !== req.params.id);
  saveAnnouncements();
  res.status(204).end();
});

const DOC_TYPES = ['budgets', 'purchases', 'licenses', 'other'];
app.post('/api/admin/reports', (req, res) => {
  const id = String(Date.now());
  const type = DOC_TYPES.includes(req.body?.type) ? req.body.type : 'other';
  const report = normalizeReport({
    id,
    title: req.body?.title ?? '',
    summary: req.body?.summary ?? '',
    content: req.body?.content ?? '',
    publishedAt: req.body?.publishedAt || new Date().toISOString().slice(0, 10),
    type,
    pdfUrl: req.body?.pdfUrl ?? '',
    pdfMeta: req.body?.pdfMeta,
  });
  reports.push(report);
  saveReports();
  res.status(201).json(report);
});

app.put('/api/admin/reports/:id', (req, res) => {
  const i = reports.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Report not found' });
  const prev = reports[i];
  const type = req.body?.type && DOC_TYPES.includes(req.body.type) ? req.body.type : reports[i].type || 'other';
  const nextPdf = req.body.pdfUrl !== undefined ? req.body.pdfUrl : prev.pdfUrl;
  if (nextPdf !== prev.pdfUrl) safeUnlinkUploadUrl(prev.pdfUrl);
  reports[i] = normalizeReport({
    ...prev,
    ...req.body,
    type,
    id: prev.id,
  });
  saveReports();
  res.json(reports[i]);
});

app.delete('/api/admin/reports/:id', (req, res) => {
  const r = reports.find((x) => x.id === req.params.id);
  if (r) safeUnlinkUploadUrl(r.pdfUrl);
  reports = reports.filter((x) => x.id !== req.params.id);
  saveReports();
  res.status(204).end();
});

app.post('/api/admin/teachers', (req, res) => {
  const id = String(Date.now());
  const teacher = normalizeTeacher({
    id,
    name: req.body?.name ?? '',
    subject: req.body?.subject ?? '',
    bio: req.body?.bio ?? '',
    email: req.body?.email ?? '',
    photoUrl: req.body?.photoUrl ?? '',
  });
  teachers.push(teacher);
  saveTeachers();
  res.status(201).json(teacher);
});

app.put('/api/admin/teachers/:id', (req, res) => {
  const i = teachers.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Teacher not found' });
  const prev = teachers[i];
  const nextPhoto = req.body.photoUrl !== undefined ? req.body.photoUrl : prev.photoUrl;
  if (nextPhoto !== prev.photoUrl) safeUnlinkUploadUrl(prev.photoUrl);
  teachers[i] = normalizeTeacher({ ...prev, ...req.body, id: prev.id });
  saveTeachers();
  res.json(teachers[i]);
});

app.delete('/api/admin/teachers/:id', (req, res) => {
  const te = teachers.find((x) => x.id === req.params.id);
  if (te) safeUnlinkUploadUrl(te.photoUrl);
  teachers = teachers.filter((x) => x.id !== req.params.id);
  saveTeachers();
  res.status(204).end();
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

const server = app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Data JSON: ${path.join(__dirname, 'data')}`);
  console.log(`Uploads:   ${UPLOADS_ROOT} (pdfs/, images/)`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Free it with:\n  lsof -ti:${PORT} | xargs kill\n`);
    process.exit(1);
  }
  throw err;
});

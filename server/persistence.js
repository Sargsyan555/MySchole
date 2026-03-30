import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.join(__dirname, 'data');
export const UPLOADS_ROOT = path.join(__dirname, 'uploads');
export const UPLOADS_PDFS = path.join(UPLOADS_ROOT, 'pdfs');
export const UPLOADS_IMAGES = path.join(UPLOADS_ROOT, 'images');

/** JSON store files (metadata + paths to files under uploads/) */
export const DATA_FILES = {
  reports: path.join(DATA_DIR, 'reports.json'),
  announcements: path.join(DATA_DIR, 'announcements.json'),
  teachers: path.join(DATA_DIR, 'teachers.json'),
  events: path.join(DATA_DIR, 'events.json'),
};

export function ensureDirs() {
  for (const d of [DATA_DIR, UPLOADS_ROOT, UPLOADS_PDFS, UPLOADS_IMAGES]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

export function readJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.warn(`readJson failed ${filePath}:`, e.message);
  }
  return fallback;
}

export function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

const UPLOADS_PREFIX = '/api/uploads/';

/**
 * Resolve a public upload URL to absolute path under UPLOADS_ROOT, or null if unsafe / external.
 */
export function uploadUrlToAbsolutePath(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith(UPLOADS_PREFIX)) return null;
  const rel = url.slice(UPLOADS_PREFIX.length).replace(/\\/g, '/');
  if (!rel || rel.includes('..')) return null;
  const resolved = path.resolve(UPLOADS_ROOT, rel);
  const rootResolved = path.resolve(UPLOADS_ROOT);
  if (!resolved.startsWith(rootResolved + path.sep) && resolved !== rootResolved) return null;
  return resolved;
}

export function safeUnlinkUploadUrl(url) {
  const abs = uploadUrlToAbsolutePath(url);
  if (!abs) return;
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (e) {
    console.warn('safeUnlinkUploadUrl:', e.message);
  }
}

const DOC_TYPES = ['budgets', 'purchases', 'licenses', 'other'];
const ANN_TYPES = ['vacancies', 'admission'];

export function normalizeReport(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const pdfMeta = raw.pdfMeta && typeof raw.pdfMeta === 'object' ? raw.pdfMeta : undefined;
  const type = DOC_TYPES.includes(raw.type) ? raw.type : 'other';
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    content: String(raw.content ?? ''),
    publishedAt: String(raw.publishedAt ?? ''),
    type,
    pdfUrl: raw.pdfUrl != null ? String(raw.pdfUrl) : '',
    pdfMeta: pdfMeta
      ? {
          storedFileName: String(pdfMeta.storedFileName ?? ''),
          originalName: String(pdfMeta.originalName ?? ''),
          uploadedAt: String(pdfMeta.uploadedAt ?? ''),
        }
      : undefined,
  };
}

export function normalizeAnnouncement(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const pdfMeta = raw.pdfMeta && typeof raw.pdfMeta === 'object' ? raw.pdfMeta : undefined;
  const type = ANN_TYPES.includes(raw.type) ? raw.type : 'vacancies';
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    content: String(raw.content ?? ''),
    publishedAt: String(raw.publishedAt ?? ''),
    type,
    pdfUrl: raw.pdfUrl != null ? String(raw.pdfUrl) : '',
    pdfMeta: pdfMeta
      ? {
          storedFileName: String(pdfMeta.storedFileName ?? ''),
          originalName: String(pdfMeta.originalName ?? ''),
          uploadedAt: String(pdfMeta.uploadedAt ?? ''),
        }
      : undefined,
  };
}

export function normalizeTeacher(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    subject: String(raw.subject ?? ''),
    bio: String(raw.bio ?? ''),
    email: String(raw.email ?? ''),
    photoUrl: raw.photoUrl != null ? String(raw.photoUrl) : '',
  };
}

export function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const galleryImages = Array.isArray(raw.galleryImages)
    ? raw.galleryImages.map((u) => String(u)).filter(Boolean)
    : [];
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    date: String(raw.date ?? ''),
    status: raw.status === 'past' ? 'past' : 'upcoming',
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : '',
    galleryImages,
  };
}

export function loadReports() {
  const arr = readJson(DATA_FILES.reports, []);
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeReport).filter(Boolean);
}

export function loadAnnouncements() {
  const arr = readJson(DATA_FILES.announcements, []);
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeAnnouncement).filter(Boolean);
}

export function loadTeachers() {
  const arr = readJson(DATA_FILES.teachers, []);
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeTeacher).filter(Boolean);
}

export function loadEvents() {
  const arr = readJson(DATA_FILES.events, []);
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeEvent).filter(Boolean);
}

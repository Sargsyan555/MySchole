const API = '/api';

/** Same-origin API calls; sends httpOnly session cookie for admin routes. */
function fetchApi(path: string, init: RequestInit = {}) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${API}${p}`, { credentials: 'include', ...init });
}

export type AboutLang = 'en' | 'hy' | 'ru';
export type AboutBlock = { title: string; subtitle: string; body: string };
export type AboutByLang = Record<AboutLang, AboutBlock>;

export const ABOUT_LANGS: AboutLang[] = ['en', 'hy', 'ru'];

/** Normalize API response (supports legacy flat `{ title, subtitle, body }`). */
export function normalizeAboutResponse(raw: unknown): AboutByLang {
  const empty = (): AboutBlock => ({ title: '', subtitle: '', body: '' });
  const base: AboutByLang = { en: empty(), hy: empty(), ru: empty() };
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  if (o.en && o.hy && o.ru && typeof o.en === 'object' && typeof o.hy === 'object' && typeof o.ru === 'object') {
    for (const lang of ABOUT_LANGS) {
      const b = o[lang] as Partial<AboutBlock>;
      base[lang] = {
        title: String(b?.title ?? ''),
        subtitle: String(b?.subtitle ?? ''),
        body: String(b?.body ?? ''),
      };
    }
    return base;
  }
  if ('title' in o || 'subtitle' in o || 'body' in o) {
    base.en = {
      title: String(o.title ?? ''),
      subtitle: String(o.subtitle ?? ''),
      body: String(o.body ?? ''),
    };
  }
  return base;
}

export async function getAbout(): Promise<AboutByLang> {
  const r = await fetchApi('/about');
  if (!r.ok) throw new Error('Failed to load about');
  return r.json();
}

export async function updateAbout(lang: AboutLang, data: AboutBlock): Promise<AboutByLang> {
  const r = await fetchApi('/admin/about', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang, title: data.title, subtitle: data.subtitle, body: data.body }),
  });
  if (!r.ok) throw new Error('Failed to update');
  return r.json();
}

export async function getReports() {
  const r = await fetchApi('/reports');
  if (!r.ok) throw new Error('Failed to load reports');
  return r.json();
}

export async function getReport(id: string) {
  const r = await fetchApi(`/reports/${id}`);
  if (!r.ok) throw new Error('Report not found');
  return r.json();
}

export async function getTeachers() {
  const r = await fetchApi('/teachers');
  if (!r.ok) throw new Error('Failed to load teachers');
  return r.json();
}

export async function getEvents() {
  const r = await fetchApi('/events');
  if (!r.ok) throw new Error('Failed to load events');
  return r.json();
}

export async function getAnnouncements() {
  const r = await fetchApi('/announcements');
  if (!r.ok) throw new Error('Failed to load announcements');
  return r.json();
}

export async function adminLogin(email: string, password: string) {
  const r = await fetchApi('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error || 'Login failed');
  }
  return r.json();
}

export async function getAdminSession() {
  const r = await fetchApi('/admin/session');
  if (!r.ok) throw new Error('Unauthorized');
  return r.json() as Promise<{ ok: boolean }>;
}

export async function adminLogout() {
  const r = await fetchApi('/admin/logout', { method: 'POST' });
  if (!r.ok) throw new Error('Logout failed');
  return r.json();
}

export async function uploadPdf(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('pdf', file);
  const r = await fetchApi('/admin/upload-pdf', { method: 'POST', body: formData });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error || 'Upload failed');
  }
  return r.json();
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const r = await fetchApi('/admin/upload-image', { method: 'POST', body: formData });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error || 'Upload failed');
  }
  return r.json();
}

export type EventPayload = {
  title: string;
  description?: string;
  date: string;
  status: 'upcoming' | 'past';
  imageUrl?: string;
  galleryImages?: string[];
};

export async function createEvent(data: EventPayload) {
  const r = await fetchApi('/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create event');
  return r.json();
}

export async function updateEvent(id: string, data: Partial<EventPayload>) {
  const r = await fetchApi(`/admin/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update event');
  return r.json();
}

export async function deleteEvent(id: string) {
  const r = await fetchApi(`/admin/events/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete event');
}

export type AnnouncementType = 'vacancies' | 'admission';

export async function createAnnouncement(data: {
  title: string;
  summary: string;
  content?: string;
  publishedAt?: string;
  pdfUrl?: string;
  type?: AnnouncementType;
}) {
  const r = await fetchApi('/admin/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create announcement');
  return r.json();
}

export async function updateAnnouncement(
  id: string,
  data: Partial<{
    title: string;
    summary: string;
    content: string;
    publishedAt: string;
    pdfUrl: string;
    type: AnnouncementType;
  }>
) {
  const r = await fetchApi(`/admin/announcements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update announcement');
  return r.json();
}

export async function deleteAnnouncement(id: string) {
  const r = await fetchApi(`/admin/announcements/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete announcement');
}

export type DocumentType = 'budgets' | 'purchases' | 'licenses' | 'other';
export async function createReport(data: {
  title: string;
  summary: string;
  content?: string;
  publishedAt?: string;
  pdfUrl?: string;
  type?: DocumentType;
}) {
  const r = await fetchApi('/admin/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create report');
  return r.json();
}

export async function updateReport(
  id: string,
  data: Partial<{ title: string; summary: string; content: string; publishedAt: string; pdfUrl: string; type: DocumentType }>
) {
  const r = await fetchApi(`/admin/reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update report');
  return r.json();
}

export async function deleteReport(id: string) {
  const r = await fetchApi(`/admin/reports/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete report');
}

export async function createTeacher(data: { name: string; subject: string; bio: string; email: string }) {
  const r = await fetchApi('/admin/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create teacher');
  return r.json();
}

export async function updateTeacher(id: string, data: Partial<{ name: string; subject: string; bio: string; email: string }>) {
  const r = await fetchApi(`/admin/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update teacher');
  return r.json();
}

export async function deleteTeacher(id: string) {
  const r = await fetchApi(`/admin/teachers/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete teacher');
}

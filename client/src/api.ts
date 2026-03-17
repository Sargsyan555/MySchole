const API = '/api';

export async function getAbout() {
  const r = await fetch(`${API}/about`);
  if (!r.ok) throw new Error('Failed to load about');
  return r.json();
}

export async function getReports() {
  const r = await fetch(`${API}/reports`);
  if (!r.ok) throw new Error('Failed to load reports');
  return r.json();
}

export async function getReport(id: string) {
  const r = await fetch(`${API}/reports/${id}`);
  if (!r.ok) throw new Error('Report not found');
  return r.json();
}

export async function getTeachers() {
  const r = await fetch(`${API}/teachers`);
  if (!r.ok) throw new Error('Failed to load teachers');
  return r.json();
}

export async function getEvents() {
  const r = await fetch(`${API}/events`);
  if (!r.ok) throw new Error('Failed to load events');
  return r.json();
}

export async function adminLogin(password: string) {
  const r = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error || 'Login failed');
  }
  return r.json();
}

export async function uploadPdf(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('pdf', file);
  const r = await fetch(`${API}/admin/upload-pdf`, { method: 'POST', body: formData });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error || 'Upload failed');
  }
  return r.json();
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const r = await fetch(`${API}/admin/upload-image`, { method: 'POST', body: formData });
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
  const r = await fetch(`${API}/admin/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create event');
  return r.json();
}

export async function updateEvent(id: string, data: Partial<EventPayload>) {
  const r = await fetch(`${API}/admin/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update event');
  return r.json();
}

export async function deleteEvent(id: string) {
  const r = await fetch(`${API}/admin/events/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete event');
}

export async function updateAbout(data: Record<string, unknown>) {
  const r = await fetch(`${API}/admin/about`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update');
  return r.json();
}

export async function createReport(data: { title: string; summary: string; content: string; publishedAt?: string; pdfUrl?: string }) {
  const r = await fetch(`${API}/admin/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create report');
  return r.json();
}

export async function updateReport(id: string, data: Partial<{ title: string; summary: string; content: string; publishedAt: string; pdfUrl: string }>) {
  const r = await fetch(`${API}/admin/reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update report');
  return r.json();
}

export async function deleteReport(id: string) {
  const r = await fetch(`${API}/admin/reports/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete report');
}

export async function createTeacher(data: { name: string; subject: string; bio: string; email: string }) {
  const r = await fetch(`${API}/admin/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to create teacher');
  return r.json();
}

export async function updateTeacher(id: string, data: Partial<{ name: string; subject: string; bio: string; email: string }>) {
  const r = await fetch(`${API}/admin/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to update teacher');
  return r.json();
}

export async function deleteTeacher(id: string) {
  const r = await fetch(`${API}/admin/teachers/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete teacher');
}

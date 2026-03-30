export type DocType = 'budgets' | 'purchases' | 'licenses' | 'other';

export type Report = {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  pdfUrl?: string;
  type?: DocType;
};

export type Teacher = { id: string; name: string; subject: string; bio: string; email: string };

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'past';
  imageUrl?: string;
  galleryImages?: string[];
};

export type AnnType = 'vacancies' | 'admission';

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  pdfUrl?: string;
  type?: AnnType;
};

export type Tab = 'about' | 'documents' | 'announcements' | 'teachers' | 'events';

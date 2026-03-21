import { useEffect, useState } from 'react';
import { getAnnouncements } from '../api';

export type AnnouncementType = 'vacancies' | 'admission';

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  publishedAt: string;
  pdfUrl?: string;
  type?: AnnouncementType;
};

export function useAnnouncements(type: AnnouncementType) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnnouncements()
      .then((all: Announcement[]) => {
        const filtered = all
          .filter((a) => (a.type || 'vacancies') === type)
          .slice()
          .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
        setItems(filtered);
      })
      .catch(() => {
        setError(null);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  return { items, loading, error };
}

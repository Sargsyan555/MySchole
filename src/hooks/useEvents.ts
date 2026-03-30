import { useEffect, useState } from 'react';
import { getEvents } from '../api';

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'past';
  imageUrl?: string;
  galleryImages?: string[];
};

export const PLACEHOLDER_PAST: Event[] = [
  { id: '1', title: 'Միջոցառում 1', description: 'Վերջին ավարտված միջոցառումը։', date: '2024-01-15', status: 'past' },
  { id: '2', title: 'Միջոցառում 2', description: 'Դպրոցական միջոցառում նկարներով։', date: '2024-02-20', status: 'past' },
  { id: '3', title: 'Միջոցառում 3', description: 'Հանդիպում և ակտիվություններ։', date: '2024-03-10', status: 'past' },
];

export const PLACEHOLDER_UPCOMING: Event[] = [
  { id: 'u1', title: 'Առաջիկա միջոցառում 1', description: '..........', date: '2025-04-15', status: 'upcoming' },
  { id: 'u2', title: 'Առաջիկա միջոցառում 2', description: '..........', date: '2025-05-01', status: 'upcoming' },
  { id: 'u3', title: 'Առաջիկա միջոցառում 3', description: '..........։', date: '2025-06-10', status: 'upcoming' },
];

/**
 * Fetches events from API; splits by status (past / upcoming). Falls back to placeholders on error.
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then((all: Event[]) => setEvents(Array.isArray(all) ? all : []))
      .catch(() => {
        setError(null);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const pastEvents = events
    .filter((e) => e.status === 'past')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const upcomingEvents = events
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return {
    pastEvents: pastEvents.length > 0 ? pastEvents : PLACEHOLDER_PAST,
    upcomingEvents: upcomingEvents.length > 0 ? upcomingEvents : PLACEHOLDER_UPCOMING,
    loading,
    error,
  };
}

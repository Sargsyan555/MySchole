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

/**
 * Loads events from the API only (admin dashboard → persisted store).
 * No placeholder or seed data.
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    getEvents()
      .then((all: Event[]) => {
        if (!cancelled) setEvents(Array.isArray(all) ? all : []);
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([]);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pastEvents = events
    .filter((e) => e.status === 'past')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const upcomingEvents = events
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return {
    pastEvents,
    upcomingEvents,
    loading,
    error: loadFailed,
  };
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../hooks/useEvents';
import styles from './EventDetail.module.css';

const PAST_FALLBACK =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGl6-SPekrXZhYF6_5457Qy-NySsLPHR-JcA&s';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { t } = useTranslation();
  const { events, loading, error } = useEvents();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const event = useMemo(
    () => (eventId ? events.find((e) => e.id === eventId) : undefined),
    [events, eventId]
  );

  const heroSrc = useMemo(() => {
    if (!event) return '';
    const fromUrl = event.imageUrl?.trim();
    const fromGallery = event.galleryImages?.[0];
    if (event.status === 'upcoming') {
      return fromUrl || '';
    }
    return fromUrl || fromGallery || PAST_FALLBACK;
  }, [event]);

  const upcomingHeroPlaceholder =
    event?.status === 'upcoming' && !(event.imageUrl?.trim());

  const galleryList = useMemo(() => {
    if (!event) return [];
    return (event.galleryImages || []).filter(Boolean);
  }, [event]);

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxUrl]);

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }
  if (error) {
    return <div className={styles.error}>{t('eventsPage.loadError')}</div>;
  }
  if (!event) {
    return (
      <div className={styles.page}>
        <Link to="/my-school/events" className={styles.back}>
          {t('eventsPage.detailBack')}
        </Link>
        <p className={styles.notFound}>{t('eventsPage.detailNotFound')}</p>
      </div>
    );
  }

  return (
    <article className={styles.page}>
      <Link to="/my-school/events" className={styles.back}>
        {t('eventsPage.detailBack')}
      </Link>

      {upcomingHeroPlaceholder ? (
        <header className={styles.heroUpcoming}>
          <h1 className={styles.heroUpcomingTitle}>
            {event.title?.trim() || t('home.eventUntitled')}
          </h1>
          <time className={styles.heroUpcomingTime} dateTime={event.date}>
            {event.date}
          </time>
        </header>
      ) : (
        <>
          <div className={styles.hero}>
            <img src={heroSrc} alt="" />
          </div>
          <h1 className={styles.title}>{event.title}</h1>
          <time className={styles.time} dateTime={event.date}>
            {event.date}
          </time>
        </>
      )}

      {event.description?.trim() ? (
        <p className={styles.description}>{event.description}</p>
      ) : null}

      {galleryList.length > 0 ? (
        <>
          <h2 className={styles.galleryTitle}>{t('eventsPage.detailGalleryTitle')}</h2>
          <ul className={styles.galleryGrid}>
            {galleryList.map((url, idx) => (
              <li key={`${url}-${idx}`}>
                <button type="button" onClick={() => setLightboxUrl(url)} aria-label={t('eventsPage.openImage')}>
                  <img src={url} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {lightboxUrl ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={t('eventsPage.lightboxLabel')}>
          <button
            type="button"
            className={styles.lightboxBackdrop}
            aria-label={t('eventsPage.closeLightbox')}
            onClick={() => setLightboxUrl(null)}
          />
          <img src={lightboxUrl} alt="" />
          <button type="button" className={styles.lightboxClose} onClick={() => setLightboxUrl(null)} aria-label={t('eventsPage.closeLightbox')}>
            ×
          </button>
        </div>
      ) : null}
    </article>
  );
}

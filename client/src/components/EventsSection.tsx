import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Event } from '../hooks/useEvents';
import styles from '../pages/Home.module.css';

const EVENT_IMAGE_FALLBACK = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGl6-SPekrXZhYF6_5457Qy-NySsLPHR-JcA&s';

type EventsSectionProps = {
  pastEvents: Event[];
  upcomingEvents: Event[];
  limitPast?: number;
  limitUpcoming?: number;
  showViewAllLink?: boolean;
};

export function EventsSection({
  pastEvents,
  upcomingEvents,
  limitPast,
  limitUpcoming,
  showViewAllLink = false,
}: EventsSectionProps) {
  const { t } = useTranslation();
  const lastEvents = limitPast != null ? pastEvents.slice(0, limitPast) : pastEvents;
  const upEvents = limitUpcoming != null ? upcomingEvents.slice(0, limitUpcoming) : upcomingEvents;

  return (
    <section className={styles.section}>
      <div className={styles.eventsSectionHeader}>
        <div className={styles.eventsSectionHeaderRow}>
          <div>
            <h2 className={styles.eventsSectionTitle}>{t('home.latestEventsTitle')}</h2>
            <p className={styles.eventsSectionSubtitle}>{t('home.latestEventsSubtitle')}</p>
          </div>
          {showViewAllLink && (
            <Link to="/events" className={styles.btnGhost}>
              {t('home.viewAllEvents')}
            </Link>
          )}
        </div>
      </div>
      <div className={styles.eventsSubsection}>
        <h3 className={styles.eventsSubsectionTitle}>{t('home.lastEventsTitle')}</h3>
        <p className={styles.eventsSubsectionSubtitle}>{t('home.lastEventsSubtitle')}</p>
        <ul className={styles.eventsPreview}>
          {lastEvents.map((e) => (
            <li key={e.id}>
              <div className={styles.eventCardWithImage}>
                <div className={styles.eventImageWrap}>
                  <img
                    src={e.imageUrl || e.galleryImages?.[0] || EVENT_IMAGE_FALLBACK}
                    alt={e.title}
                    className={styles.eventImage}
                    loading="lazy"
                  />
                  <div className={styles.eventImageOverlay} />
                </div>
                <div className={styles.eventCardContent}>
                  <h4 className={styles.eventCardTitle}>{e.title}</h4>
                  <time className={styles.eventCardDate}>{e.date}</time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.eventsSubsection}>
        <h3 className={styles.eventsSubsectionTitle}>{t('home.upcomingEventsTitle')}</h3>
        <p className={styles.eventsSubsectionSubtitle}>{t('home.upcomingEventsSubtitle')}</p>
        <ul className={styles.eventsPreview}>
          {upEvents.map((e) => (
            <li key={e.id}>
              <div className={e.imageUrl ? styles.eventCardWithImage : styles.eventCardNoImage}>
                {e.imageUrl && (
                  <div className={styles.eventImageWrap}>
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      className={styles.eventImage}
                      loading="lazy"
                    />
                    <div className={styles.eventImageOverlay} />
                  </div>
                )}
                <div className={styles.eventCardContent}>
                  <h4 className={styles.eventCardTitle}>{e.title}</h4>
                  <time className={styles.eventCardDate}>{e.date}</time>
                  {e.description && (
                    <p className={styles.eventCardDescription}>{e.description}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { useTranslation } from 'react-i18next';
import { useEvents } from '../hooks/useEvents';
import { EventsSection } from '../components/EventsSection';
import styles from './Events.module.css';

export default function Events() {
  const { t } = useTranslation();
  const { pastEvents, upcomingEvents, loading, error } = useEvents();

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (error) return <div className={styles.error}>{t('eventsPage.loadError')}</div>;

  const isEmpty = pastEvents.length === 0 && upcomingEvents.length === 0;

  return (
    <div className={styles.page}>
      {isEmpty ? (
        <p className={styles.empty}>{t('eventsPage.empty')}</p>
      ) : (
        <EventsSection pastEvents={pastEvents} upcomingEvents={upcomingEvents} />
      )}
    </div>
  );
}

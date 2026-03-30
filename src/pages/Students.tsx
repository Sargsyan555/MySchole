import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudentsPage } from '../api';
import styles from './About.module.css';


type StudentsData = { title?: string; subtitle?: string; body?: string };

export default function Students() {
  const { t } = useTranslation();
  const [data, setData] = useState<StudentsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentsPage()
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.subtitle}>{t('common.loading')}</p>
      </div>
    );
  }

  const title = data?.title?.trim() || t('students.fallbackTitle');
  const subtitle = data?.subtitle?.trim() || t('students.fallbackSubtitle');
  // const body = (data?.body?.trim() || t('students.fallbackBody')).split('\n\n');

  return (
    <article className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
          <div className={styles.body}>
            In Processing...
          </div>
        </div>
        <aside className={styles.aside}>
          <div className={styles.imageFrame}>
            
            <div className={styles.imageOverlay} />
          </div>
        </aside>
      </div>
    </article>
  );
}

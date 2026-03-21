import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudentsPage } from '../api';
import styles from './About.module.css';

const SCHOOL_IMAGE = 'https://haykadzor.schoolsite.am/wp-content/uploads/sites/872/2016/12/cropped-20170119_111008-e1484810760105-5.jpg';

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
  const body = (data?.body?.trim() || t('students.fallbackBody')).split('\n\n');

  return (
    <article className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
          <div className={styles.body}>
            {body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
        <aside className={styles.aside}>
          <div className={styles.imageFrame}>
            <img
              src={SCHOOL_IMAGE}
              alt={t('students.imageAlt')}
              className={styles.image}
              loading="eager"
            />
            <div className={styles.imageOverlay} />
          </div>
        </aside>
      </div>
    </article>
  );
}

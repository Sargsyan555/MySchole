import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTeachers } from '../api';
import styles from './Teachers.module.css';

type Teacher = { id: string; name: string; subject: string; bio: string; email: string };

export default function Teachers() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .catch(() => setError('Failed to load teachers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const intro = t('teachers.intro').trim();

  return (
    <div className={styles.page}>
      <h1>{t('teachers.title')}</h1>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      {teachers.length === 0 ? (
        <p className={styles.empty}>{t('teachers.empty')}</p>
      ) : (
        <div className={styles.grid}>
          {teachers.map((t) => (
            <article key={t.id} className={styles.card}>
              <div className={styles.avatar}>
                {t.name.charAt(0)}
              </div>
              <h3>{t.name}</h3>
              <p className={styles.subject}>{t.subject}</p>
              {t.bio && <p className={styles.bio}>{t.bio}</p>}
              {t.email && (
                <a href={`mailto:${t.email}`} className={styles.email}>{t.email}</a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

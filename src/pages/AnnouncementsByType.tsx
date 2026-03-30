import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAnnouncements } from '../hooks/useAnnouncements';
import styles from './AnnouncementsByType.module.css';

const TYPES = ['vacancies', 'admission'] as const;
type AnnType = (typeof TYPES)[number];

const titleKeys: Record<AnnType, string> = {
  vacancies: 'announcements.vacancies',
  admission: 'announcements.admission',
};

const introKeys: Record<AnnType, string> = {
  vacancies: 'announcements.vacanciesIntro',
  admission: 'announcements.admissionIntro',
};

function isValid(s: string | undefined): s is AnnType {
  return TYPES.includes(s as AnnType);
}

export default function AnnouncementsByType() {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation();
  const annType = isValid(type) ? type : 'vacancies';
  const { items, loading, error } = useAnnouncements(annType);

  if (!isValid(type)) {
    return (
      <div className={styles.page}>
        <Link to="/announcements">{t('announcements.backToList')}</Link>
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/announcements">{t('announcements.title')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{t(titleKeys[annType])}</span>
      </div>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t(titleKeys[annType])}</h1>
        <p className={styles.sectionSubtitle}>{t(introKeys[annType])}</p>
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>{t('announcements.empty')}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{item.title || t('adminDashboard.untitledEvent')}</h2>
              {item.publishedAt && (
                <time className={styles.date} dateTime={item.publishedAt}>
                  {item.publishedAt}
                </time>
              )}
              {item.summary && <p className={styles.summary}>{item.summary}</p>}
              {item.content && (
                <div className={styles.content}>
                  {item.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
              {item.pdfUrl && (
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfLink}
                >
                  {t('documents.openPdf')}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

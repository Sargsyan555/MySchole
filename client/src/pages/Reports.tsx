import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReports, PDF_FALLBACK_URL_EXPORT } from '../hooks/useReports';
import { mediaUrl } from '../api';
import { IconFileText } from '../components/SiteIcons';
import styles from './Reports.module.css';

export default function Reports() {
  const { t } = useTranslation();
  const { reports, loading, error } = useReports();

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t('reports.title')}</h1>
        <p className={styles.sectionSubtitle}>{t('reports.intro')}</p>
      </div>
      <ul className={styles.reportsPreview}>
        {reports.map((r) => {
          const href = r.pdfUrl ? (mediaUrl(r.pdfUrl) ?? r.pdfUrl) : PDF_FALLBACK_URL_EXPORT;
          const cardContent = (
            <>
              <span className={styles.pdfIcon}>
                <IconFileText />
              </span>
              <span className={styles.pdfTitle}>{r.title}</span>
              {r.summary && <span className={styles.pdfSummary}>{r.summary}</span>}
              <span className={styles.pdfLabel}>
                {r.pdfUrl ? t('home.openPdf') : t('home.viewDetails')}
              </span>
            </>
          );
          return (
            <li key={r.id}>
              {r.pdfUrl ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfCard}
                >
                  {cardContent}
                </a>
              ) : (
                <Link to={`/reports/${r.id}`} className={styles.pdfCard}>
                  {cardContent}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

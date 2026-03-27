import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReport, mediaUrl } from '../api';
import styles from './ReportView.module.css';

type Report = {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  pdfUrl?: string;
};

function renderMarkdown(text: string) {
  return text
    .split(/\n/)
    .map((line, i) => {
      if (/^#\s/.test(line)) return <h2 key={i}>{line.replace(/^#\s+/, '')}</h2>;
      if (/^##\s/.test(line)) return <h3 key={i}>{line.replace(/^##\s+/, '')}</h3>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
}

export default function ReportView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getReport(id)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!report) return null;

  return (
    <article className={styles.page}>
      <Link to="/reports" className={styles.back}>
        {t('common.backToReports')}
      </Link>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <time className={styles.date}>{report.publishedAt}</time>
        {report.summary && <p className={styles.summary}>{report.summary}</p>}
      </header>
      {report.pdfUrl ? (
        <div className={styles.pdfWrapper}>
          <iframe
            src={mediaUrl(report.pdfUrl) ?? report.pdfUrl}
            className={styles.pdfFrame}
            title={report.title}
          />
          <a
            href={mediaUrl(report.pdfUrl) ?? report.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.pdfLink}
          >
            {t('reports.openPdfExternal')}
          </a>
        </div>
      ) : (
        <div className={styles.content}>{renderMarkdown(report.content)}</div>
      )}
    </article>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocuments } from '../hooks/useDocuments';
import { mediaUrl } from '../api';
import { IconFileText } from '../components/SiteIcons';
import styles from './DocumentsByType.module.css';

const DOCUMENT_TYPES = ['budgets', 'purchases', 'licenses', 'other'] as const;
type DocType = (typeof DOCUMENT_TYPES)[number];

const titleKeys: Record<DocType, string> = {
  budgets: 'documents.budgets',
  purchases: 'documents.purchases',
  licenses: 'documents.licenses',
  other: 'documents.other',
};

const introKeys: Record<DocType, string> = {
  budgets: 'documents.budgetsIntro',
  purchases: 'documents.purchasesIntro',
  licenses: 'documents.licensesIntro',
  other: 'documents.otherIntro',
};

function isValidDocType(s: string | undefined): s is DocType {
  return DOCUMENT_TYPES.includes(s as DocType);
}

export default function DocumentsByType() {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation();
  const { documents, loading, error } = useDocuments(isValidDocType(type) ? type : 'other');

  if (!isValidDocType(type)) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{t('documents.empty')}</p>
        <Link to="/documents">{t('documents.backToDocuments')}</Link>
      </div>
    );
  }

  const docType = type as DocType;

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/documents">{t('nav.documents')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{t(titleKeys[docType])}</span>
      </div>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t(titleKeys[docType])}</h1>
        <p className={styles.sectionSubtitle}>{t(introKeys[docType])}</p>
      </div>
      {documents.length === 0 ? (
        <p className={styles.empty}>{t('documents.empty')}</p>
      ) : (
        <ul className={styles.docList}>
          {documents
            .filter((doc) => doc.pdfUrl)
            .map((doc) => (
              <li key={doc.id}>
                <a
                  href={mediaUrl(doc.pdfUrl) ?? doc.pdfUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfCard}
                >
                  <span className={styles.pdfIcon}>
                    <IconFileText />
                  </span>
                  <span className={styles.pdfTitle}>{doc.title}</span>
                  {doc.summary && (
                    <span className={styles.pdfSummary}>{doc.summary}</span>
                  )}
                  <span className={styles.pdfLabel}>{t('documents.openPdf')}</span>
                </a>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

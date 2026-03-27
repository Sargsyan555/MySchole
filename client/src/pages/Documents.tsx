import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconFileText } from '../components/SiteIcons';
import styles from './Documents.module.css';

const DOCUMENT_TYPES = ['budgets', 'purchases', 'licenses', 'other'] as const;

const introKeys: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  budgets: 'documents.budgetsIntro',
  purchases: 'documents.purchasesIntro',
  licenses: 'documents.licensesIntro',
  other: 'documents.otherIntro',
};

const titleKeys: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  budgets: 'documents.budgets',
  purchases: 'documents.purchases',
  licenses: 'documents.licenses',
  other: 'documents.other',
};

export default function Documents() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t('documents.title')}</h1>
        <p className={styles.sectionSubtitle}>{t('documents.intro')}</p>
      </div>
      <ul className={styles.categoryGrid}>
        {DOCUMENT_TYPES.map((type) => (
          <li key={type}>
            <Link to={`/documents/${type}`} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>
                <IconFileText />
              </span>
              <span className={styles.categoryTitle}>{t(titleKeys[type])}</span>
              <span className={styles.categoryIntro}>{t(introKeys[type])}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

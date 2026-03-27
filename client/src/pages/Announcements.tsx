import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconMegaphone } from '../components/SiteIcons';
import styles from './Documents.module.css';

const TYPES = ['vacancies', 'admission'] as const;

const titleKeys: Record<(typeof TYPES)[number], string> = {
  vacancies: 'announcements.vacancies',
  admission: 'announcements.admission',
};

const introKeys: Record<(typeof TYPES)[number], string> = {
  vacancies: 'announcements.vacanciesIntro',
  admission: 'announcements.admissionIntro',
};

export default function Announcements() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t('announcements.title')}</h1>
        <p className={styles.sectionSubtitle}>{t('announcements.intro')}</p>
      </div>
      <ul className={styles.categoryGrid}>
        {TYPES.map((type) => (
          <li key={type}>
            <Link to={`/announcements/${type}`} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>
                <IconMegaphone />
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

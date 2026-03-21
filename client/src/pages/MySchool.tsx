import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Documents.module.css';

const LINKS = [
  { to: '/my-school/staff', titleKey: 'mySchool.staff', introKey: 'mySchool.staffIntro' },
  { to: '/my-school/students', titleKey: 'mySchool.students', introKey: 'mySchool.studentsIntro' },
  { to: '/my-school/about', titleKey: 'mySchool.aboutUs', introKey: 'mySchool.aboutUsIntro' },
  { to: '/my-school/events', titleKey: 'mySchool.events', introKey: 'mySchool.eventsIntro' },
] as const;

export default function MySchool() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t('mySchool.title')}</h1>
        <p className={styles.sectionSubtitle}>{t('mySchool.intro')}</p>
      </div>
      <ul className={styles.categoryGrid}>
        {LINKS.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>🏫</span>
              <span className={styles.categoryTitle}>{t(item.titleKey)}</span>
              <span className={styles.categoryIntro}>{t(item.introKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconCalendar, IconGraduationCap, IconSchool, type SiteIconComponent } from '../components/SiteIcons';
import styles from './Documents.module.css';

const LINKS: readonly {
  to: string;
  titleKey: 'mySchool.staff' | 'mySchool.aboutUs' | 'mySchool.events';
  introKey: 'mySchool.staffIntro' | 'mySchool.aboutUsIntro' | 'mySchool.eventsIntro';
  Icon: SiteIconComponent;
}[] = [
  { to: '/my-school/staff', titleKey: 'mySchool.staff', introKey: 'mySchool.staffIntro', Icon: IconGraduationCap },
  { to: '/my-school/about', titleKey: 'mySchool.aboutUs', introKey: 'mySchool.aboutUsIntro', Icon: IconSchool },
  { to: '/my-school/events', titleKey: 'mySchool.events', introKey: 'mySchool.eventsIntro', Icon: IconCalendar },
];

export default function MySchool() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>{t('mySchool.title')}</h1>
        <p className={styles.sectionSubtitle}>{t('mySchool.intro')}</p>
      </div>
      <ul className={styles.categoryGrid}>
        {LINKS.map(({ to, titleKey, introKey, Icon }) => (
          <li key={to}>
            <Link to={to} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>
                <Icon />
              </span>
              <span className={styles.categoryTitle}>{t(titleKey)}</span>
              <span className={styles.categoryIntro}>{t(introKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

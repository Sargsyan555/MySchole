import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Layout.module.css';

export default function Layout() {
  const { t, i18n } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoLine1}>Հայկաձորի</span>
            <span className={styles.logoLine2}>միջնակարգ դպրոց</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/reports">{t('nav.reports')}</Link>
            <Link to="/events">{t('nav.events')}</Link>
            <Link to="/teachers">{t('nav.teachers')}</Link>
            {/* <Link to="/admin" className={styles.adminLink}>
              {t('nav.admin')}
            </Link> */}
            <select
              className={styles.langSelect}
              value={i18n.resolvedLanguage || i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label={t('language.label')}
            >
              <option value="en">{t('language.en')}</option>
              <option value="hy">{t('language.hy')}</option>
              <option value="ru">{t('language.ru')}</option>
            </select>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
}

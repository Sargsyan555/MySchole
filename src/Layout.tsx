import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Layout.module.css';

const DOCUMENT_TYPES = ['budgets', 'purchases', 'licenses', 'other'] as const;
type DocType = (typeof DOCUMENT_TYPES)[number];

const MY_SCHOOL_LINKS = [
  { to: '/my-school/staff', labelKey: 'nav.mySchoolStaff' as const },
  { to: '/my-school/about', labelKey: 'nav.mySchoolAbout' as const },
  { to: '/my-school/events', labelKey: 'nav.mySchoolEvents' as const },
];

const ANNOUNCEMENT_TYPES = ['vacancies', 'admission'] as const;
type AnnType = (typeof ANNOUNCEMENT_TYPES)[number];

type MobileSection = 'mySchool' | 'documents' | 'announcements' | null;

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mySchoolOpen, setMySchoolOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<MobileSection>(null);

  const navDocKey = (type: DocType) =>
    type === 'budgets'
      ? 'documentsBudgets'
      : type === 'purchases'
        ? 'documentsPurchases'
        : type === 'licenses'
          ? 'documentsLicenses'
          : 'documentsOther';

  const navAnnKey = (type: AnnType) =>
    type === 'vacancies' ? 'announcementsVacancies' : 'announcementsAdmission';

  const isDocumentsActive =
    location.pathname === '/documents' ||
    DOCUMENT_TYPES.some((x) => location.pathname === `/documents/${x}`);

  const isMySchoolActive =
    location.pathname === '/my-school' ||
    location.pathname.startsWith('/my-school/');

  const isAnnouncementsActive =
    location.pathname === '/announcements' ||
    ANNOUNCEMENT_TYPES.some((x) => location.pathname === `/announcements/${x}`);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  };

  const toggleMobileSection = (section: MobileSection) => {
    setMobileExpanded((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
            <span className={styles.logoMark} aria-hidden>
              <svg
                className={styles.logoSvg}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 3.5 4 11v17h8v-9h8v9h8V11L16 3.5Z"
                  fill="currentColor"
                  fillOpacity="0.92"
                />
                <path
                  d="M12 22v6h-5v-6h5Zm13 0v6h-5v-6h5Z"
                  fill="currentColor"
                  fillOpacity="0.35"
                />
                <path d="M16 6.2 7.5 12v2.5L16 9.8l8.5 4.7V12L16 6.2Z" fill="currentColor" fillOpacity="0.25" />
              </svg>
            </span>
            <span className={styles.logoText}>
              <span className={styles.logoLine1}>Հայկաձորի</span>
              <span className={styles.logoLine2}>միջնակարգ դպրոց</span>
            </span>
          </Link>

          <button
            type="button"
            className={`${styles.menuToggle} ${mobileMenuOpen ? styles.menuToggleOpen : ''}`}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.menu')}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <span className={styles.menuToggleBox} aria-hidden>
              <span className={styles.menuToggleBar} />
              <span className={styles.menuToggleBar} />
              <span className={styles.menuToggleBar} />
            </span>
          </button>

          <nav className={styles.navDesktop} aria-label={t('nav.menu')}>
            <div
              className={styles.navDropdown}
              onMouseEnter={() => setMySchoolOpen(true)}
              onMouseLeave={() => setMySchoolOpen(false)}
            >
              <Link
                to="/my-school"
                className={isMySchoolActive ? styles.navActive : undefined}
              >
                {t('nav.mySchool')}
              </Link>
              {mySchoolOpen && (
                <ul className={styles.dropdownMenu}>
                  {MY_SCHOOL_LINKS.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} onClick={() => setMySchoolOpen(false)}>
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              className={styles.navDropdown}
              onMouseEnter={() => setDocumentsOpen(true)}
              onMouseLeave={() => setDocumentsOpen(false)}
            >
              <Link
                to="/documents"
                className={isDocumentsActive ? styles.navActive : undefined}
              >
                {t('nav.documents')}
              </Link>
              {documentsOpen && (
                <ul className={styles.dropdownMenu}>
                  {DOCUMENT_TYPES.map((type) => (
                    <li key={type}>
                      <Link to={`/documents/${type}`} onClick={() => setDocumentsOpen(false)}>
                        {t(`nav.${navDocKey(type)}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              className={styles.navDropdown}
              onMouseEnter={() => setAnnouncementsOpen(true)}
              onMouseLeave={() => setAnnouncementsOpen(false)}
            >
              <Link
                to="/announcements"
                className={isAnnouncementsActive ? styles.navActive : undefined}
              >
                {t('nav.announcements')}
              </Link>
              {announcementsOpen && (
                <ul className={styles.dropdownMenu}>
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <li key={type}>
                      <Link
                        to={`/announcements/${type}`}
                        onClick={() => setAnnouncementsOpen(false)}
                      >
                        {t(`nav.${navAnnKey(type)}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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

        {mobileMenuOpen && (
          <button
            type="button"
            className={styles.mobileBackdrop}
            aria-label={t('nav.closeMenu')}
            onClick={closeMobileMenu}
          />
        )}

        <nav
          id="mobile-navigation"
          className={`${styles.navMobile} ${mobileMenuOpen ? styles.navMobileOpen : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className={styles.navMobileInner}>
            <div className={styles.mobileGroup}>
              <button
                type="button"
                className={styles.mobileGroupToggle}
                aria-expanded={mobileExpanded === 'mySchool'}
                onClick={() => toggleMobileSection('mySchool')}
              >
                <span>{t('nav.mySchool')}</span>
                <span className={styles.mobileChevron} data-open={mobileExpanded === 'mySchool'} />
              </button>
              {mobileExpanded === 'mySchool' && (
                <ul className={styles.mobileSubList}>
                  <li>
                    <Link to="/my-school" onClick={closeMobileMenu}>
                      {t('nav.sectionOverview')}
                    </Link>
                  </li>
                  {MY_SCHOOL_LINKS.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} onClick={closeMobileMenu}>
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.mobileGroup}>
              <button
                type="button"
                className={styles.mobileGroupToggle}
                aria-expanded={mobileExpanded === 'documents'}
                onClick={() => toggleMobileSection('documents')}
              >
                <span>{t('nav.documents')}</span>
                <span className={styles.mobileChevron} data-open={mobileExpanded === 'documents'} />
              </button>
              {mobileExpanded === 'documents' && (
                <ul className={styles.mobileSubList}>
                  <li>
                    <Link to="/documents" onClick={closeMobileMenu}>
                      {t('nav.sectionOverview')}
                    </Link>
                  </li>
                  {DOCUMENT_TYPES.map((type) => (
                    <li key={type}>
                      <Link to={`/documents/${type}`} onClick={closeMobileMenu}>
                        {t(`nav.${navDocKey(type)}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.mobileGroup}>
              <button
                type="button"
                className={styles.mobileGroupToggle}
                aria-expanded={mobileExpanded === 'announcements'}
                onClick={() => toggleMobileSection('announcements')}
              >
                <span>{t('nav.announcements')}</span>
                <span className={styles.mobileChevron} data-open={mobileExpanded === 'announcements'} />
              </button>
              {mobileExpanded === 'announcements' && (
                <ul className={styles.mobileSubList}>
                  <li>
                    <Link to="/announcements" onClick={closeMobileMenu}>
                      {t('nav.sectionOverview')}
                    </Link>
                  </li>
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <li key={type}>
                      <Link to={`/announcements/${type}`} onClick={closeMobileMenu}>
                        {t(`nav.${navAnnKey(type)}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.mobileLangRow}>
              <label htmlFor="mobile-lang" className={styles.mobileLangLabel}>
                {t('language.label')}
              </label>
              <select
                id="mobile-lang"
                className={styles.langSelectMobile}
                value={i18n.resolvedLanguage || i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">{t('language.en')}</option>
                <option value="hy">{t('language.hy')}</option>
                <option value="ru">{t('language.ru')}</option>
              </select>
            </div>
          </div>
        </nav>
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

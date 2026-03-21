import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReports } from '../hooks/useReports';
import { useEvents } from '../hooks/useEvents';
import { EventsSection } from '../components/EventsSection';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useTranslation();
  const { reports } = useReports();
  const latestReports = reports.filter((r) => r.pdfUrl).slice(0, 3);
  const { pastEvents, upcomingEvents } = useEvents();

  return (
    <div className={styles.page}>
      <section className={styles.heroWrap}>
        <div className={styles.hero}>
          <img
            className={styles.heroMedia}
            src="https://haykadzor.schoolsite.am/wp-content/uploads/sites/872/2016/12/cropped-20170119_111008-e1484810760105-5.jpg"
            alt="School"
            loading="eager"
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Հայկաձորի միջնակարգ դպրոց</h1>
            <div className={styles.heroActions}>
              <Link to="/my-school/about" className={styles.btnPrimary}>
                {t('home.aboutCta')}
              </Link>
              <Link to="/documents" className={styles.btnSecondary}>
                {t('home.documentsCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.cards}>
        <Link to="/my-school/about" className={styles.card}>
          <span className={styles.cardIcon}>🏫</span>
          <h3>{t('home.cardAboutTitle')}</h3>
          <p>{t('home.cardAboutBody')}</p>
        </Link>
        <Link to="/documents" className={styles.card}>
          <span className={styles.cardIcon}>📄</span>
          <h3>{t('home.cardDocumentsTitle')}</h3>
          <p>{t('home.cardDocumentsBody')}</p>
        </Link>
        <Link to="/my-school/staff" className={styles.card}>
          <span className={styles.cardIcon}>👩‍🏫</span>
          <h3>{t('home.cardTeachersTitle')}</h3>
          <p>{t('home.cardTeachersBody')}</p>
        </Link>
        <Link to="/my-school/events" className={styles.card}>
          <span className={styles.cardIcon}>📅</span>
          <h3>{t('home.cardEventsTitle')}</h3>
          <p>{t('home.cardEventsBody')}</p>
        </Link>
      </section>
      {/* <section className={`${styles.section} ${styles.galleryWrap}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.galleryTitle')}</h2>
          <p className={styles.sectionSubtitle}>{t('home.gallerySubtitle')}</p>
        </div>
        <div className={styles.galleryRows}>
          <div className={`${styles.galleryRow} ${styles.galleryRowLeft}`}>
            <div className={styles.galleryFrame}>
              <img
                src="https://scontent.fevn13-1.fna.fbcdn.net/v/t39.30808-6/499286860_1534105188034535_7763413236250627786_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=gD1EJAv6fM4Q7kNvwHPhZhD&_nc_oc=Adlp7sz1keWNvt_qifEz2Ul3XmDflV_FBCS5N2fGAZzq-raLoUrMws146UT9ktBe-zU&_nc_zt=23&_nc_ht=scontent.fevn13-1.fna&_nc_gid=s0eId8CesCmrXTKs7H6AOw&_nc_ss=8&oh=00_Afy8BCedy0zq3yQ6NjaUiPfiRsyja5Sun9l3S3Ofeh7nUQ&oe=69B8E39F"

                alt="School building and students"
                className={styles.galleryImageLarge}
                loading="lazy"
              />
            </div>
          </div>
          <div className={`${styles.galleryRow} ${styles.galleryRowRight}`}>
            <div className={styles.galleryFrame}>
              <img
                // src="https://lib.armedu.am/files/resource/gallery/2025-05-27/17a1a14728c3bd54f6451e38ce3cad8f.jpg"
                src="https://scontent.fevn13-1.fna.fbcdn.net/v/t39.30808-6/499286860_1534105188034535_7763413236250627786_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=gD1EJAv6fM4Q7kNvwHPhZhD&_nc_oc=Adlp7sz1keWNvt_qifEz2Ul3XmDflV_FBCS5N2fGAZzq-raLoUrMws146UT9ktBe-zU&_nc_zt=23&_nc_ht=scontent.fevn13-1.fna&_nc_gid=s0eId8CesCmrXTKs7H6AOw&_nc_ss=8&oh=00_Afy8BCedy0zq3yQ6NjaUiPfiRsyja5Sun9l3S3Ofeh7nUQ&oe=69B8E39F"
                alt="Students participation"
                className={styles.galleryImageLarge}
                loading="lazy"
              />
            </div>
          </div>
          <div className={`${styles.galleryRow} ${styles.galleryRowLeft}`}>
            <div className={styles.galleryFrame}>
              <img
                src="https://scontent.fevn13-1.fna.fbcdn.net/v/t39.30808-6/499788008_1534104681367919_1401829668122153673_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=yV92WApbANUQ7kNvwGDMl9F&_nc_oc=AdmVpfwdJx3ZSrQAwKJVP6lax5Js9cUSBF1iEegPHV7wQl_CsjuPf1oM0ZB_IWM5ags&_nc_zt=23&_nc_ht=scontent.fevn13-1.fna&_nc_gid=m7rCQVtradn5xR793Zki9g&_nc_ss=8&oh=00_AfxXVZJcBxNsRuKxaIzNftyEYvArobUvlBiHhK62FG9_Sw&oe=69B8BA8D"
                alt="School community"
                className={styles.galleryImageLarge}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section> */}
      <section className={styles.section}>
        <div className={styles.reportsSectionHeader}>
          <h2 className={styles.reportsSectionTitle}>{t('home.latestReportsTitle')}</h2>
          <p className={styles.reportsSectionSubtitle}>{t('home.latestReportsSubtitle')}</p>
        </div>
        <ul className={styles.reportsPreview}>
            {latestReports.length === 0 ? (
              <li className={styles.noReports}>
                <Link to="/documents">{t('home.noDocuments')}</Link>
              </li>
            ) : latestReports.map((r) => (
              <li key={r.id}>
                <a
                  href={r.pdfUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfCard}
                >
                  <span className={styles.pdfIcon}>📄</span>
                  <span className={styles.pdfTitle}>{r.title}</span>
                  <span className={styles.pdfLabel}>{t('home.openPdf')}</span>
                </a>
              </li>
            ))}
          </ul>

      </section>
      <EventsSection
        pastEvents={pastEvents}
        upcomingEvents={upcomingEvents}
        limitPast={3}
        limitUpcoming={3}
        showViewAllLink
      />
      <section className={styles.section}>
        <div className={styles.reportsSectionHeader}>
          <h2 className={styles.reportsSectionTitle}>{t('home.contactTitle')}</h2>
          <p className={styles.reportsSectionSubtitle}>{t('home.contactSubtitle')}</p>
        </div>
        <div className={styles.contactLayout}>
          <div className={styles.contactDetails}>
            <p className={styles.contactName}>{t('home.contactName')}</p>
            <p className={styles.contactRow}>
              <span className={styles.contactLabel}>{t('home.contactPhoneLabel')}</span>
              <span className={styles.contactValue}>+374 93030772</span>
            </p>
            <p className={styles.contactRow}>
              <span className={styles.contactLabel}>{t('home.contactAddressLabel')}</span>
              <span className={styles.contactValue}>
                {t('home.contactAddressValue')}
              </span>
            </p>
            <p className={styles.contactRow}>
              <span className={styles.contactLabel}>{t('home.contactEmailLabel')}</span>
              <span className={styles.contactValue}>
                aikadzor@mail.ru / haykadzor@schools.am
              </span>
            </p>
          </div>
          <div className={styles.mapWrapper}>
            <img
              src="https://haykadzor.schoolsite.am/wp-content/uploads/sites/872/2017/01/Untitled-2-1200x675.png"
              alt={t('home.contactMapAlt')}
              className={styles.mapImage}
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

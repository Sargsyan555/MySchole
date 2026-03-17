import { useTranslation } from 'react-i18next';
import styles from './About.module.css';

const SCHOOL_IMAGE = 'https://haykadzor.schoolsite.am/wp-content/uploads/sites/872/2016/12/cropped-20170119_111008-e1484810760105-5.jpg';

export default function About() {
  const { t } = useTranslation();

  const title = t('about.title');
  const subtitle = t('about.subtitle');
  const body = t('about.body');

  return (
    <article className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
          <div className={styles.body}>
            {body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
        <aside className={styles.aside}>
          <div className={styles.imageFrame}>
            <img
              src={SCHOOL_IMAGE}
              alt={t('about.imageAlt')}
              className={styles.image}
              loading="eager"
            />
            <div className={styles.imageOverlay} />
          </div>
        </aside>
      </div>
    </article>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAbout,
  normalizeAboutResponse,
  type AboutByLang,
  type AboutLang,
} from '../api';
import { SCHOOL_IMAGE_URL } from '../constants/schoolAssets';
import styles from './About.module.css';

function splitBody(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const byDoubleNl = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (byDoubleNl.length > 0) return byDoubleNl;
  return [trimmed];
}

function resolveLang(code: string | undefined): AboutLang {
  const base = (code || 'hy').split('-')[0].toLowerCase();
  if (base === 'en' || base === 'hy' || base === 'ru') return base;
  return 'hy';
}

/** Use only CMS text for the active UI language — never show another language's saved copy. */
function blockForLang(data: AboutByLang | null, lang: AboutLang) {
  if (!data) return null;
  return data[lang];
}

export default function About() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<AboutByLang | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const activeLang = resolveLang(i18n.resolvedLanguage || i18n.language);

  useEffect(() => {
    let cancelled = false;
    getAbout()
      .then((d) => {
        if (!cancelled) {
          setData(normalizeAboutResponse(d));
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const block = useMemo(() => blockForLang(data, activeLang), [data, activeLang]);

  const title = useMemo(() => {
    if (loading) return '';
    if (block?.title?.trim()) return block.title.trim();
    return t('about.title');
  }, [loading, block, t]);

  const subtitle = useMemo(() => {
    if (loading) return '';
    if (block?.subtitle?.trim()) return block.subtitle.trim();
    return t('about.subtitle');
  }, [loading, block, t]);

  const bodyParagraphs = useMemo(() => {
    if (loading) return [];
    const fallbackBody = t('about.body');
    const raw =
      block?.body?.trim() ? String(block.body) : fallbackBody;
    let paras = splitBody(raw);
    if (paras.length === 0) paras = splitBody(fallbackBody);
    return paras;
  }, [loading, block, t]);

  if (loading) {
    return (
      <article className={styles.page}>
        <p className={styles.loading}>{t('common.loading')}</p>
      </article>
    );
  }

  return (
    <article className={styles.page}>
      {loadFailed && (
        <p className={styles.offlineNote} role="status">
          {t('about.offlineNote')}
        </p>
      )}
      <div className={styles.layout}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </header>
          <div className={styles.body}>
            {bodyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
        <aside className={styles.aside}>
          <div className={styles.imageFrame}>
            <img
              src={SCHOOL_IMAGE_URL}
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

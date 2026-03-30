import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { ABOUT_LANGS, type AboutByLang, type AboutLang } from '../../../api';
import { aboutBlockHasText } from '../aboutUtils';
import styles from '../Admin.module.css';

type ClientPreview = { title: string; subtitle: string; bodyParagraphs: string[] };

type Props = {
  aboutByLang: AboutByLang;
  aboutEditLang: AboutLang;
  onEditLang: (lang: AboutLang) => void;
  aboutClientPreview: ClientPreview | null;
  onFieldChange: (field: 'title' | 'subtitle' | 'body', value: string) => void;
  onSave: () => void;
  saving: boolean;
};

export function AdminAboutSection({
  aboutByLang,
  aboutEditLang,
  onEditLang,
  aboutClientPreview,
  onFieldChange,
  onSave,
  saving,
}: Props) {
  const { t } = useTranslation();
  const block = aboutByLang[aboutEditLang];

  return (
    <section className={`${styles.section} ${styles.sectionCard}`}>
      <div className={styles.sectionHeaderBar}>
        <h2>{t('adminDashboard.aboutPage')}</h2>
        <p className={styles.sectionLead}>{t('adminDashboard.aboutContentLanguageHint')}</p>
      </div>
      <div className={styles.aboutVersionsRow} role="status">
        <p className={styles.aboutVersionsCaption}>{t('adminDashboard.aboutStoredVersionsCaption')}</p>
        <ul className={styles.aboutVersionsList}>
          {ABOUT_LANGS.map((l) => {
            const filled = aboutBlockHasText(aboutByLang[l]);
            const label =
              l === 'hy' ? t('adminDashboard.langHy') : l === 'en' ? t('adminDashboard.langEn') : t('adminDashboard.langRu');
            return (
              <li key={l} className={filled ? styles.aboutVersionOk : styles.aboutVersionEmpty}>
                <span className={styles.aboutVersionName}>{label}</span>
                <span className={styles.aboutVersionState}>
                  {filled ? t('adminDashboard.aboutVersionFilled') : t('adminDashboard.aboutVersionEmpty')}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{t('adminDashboard.aboutContentLanguage')}</label>
        <select
          className={styles.selectInput}
          value={aboutEditLang}
          onChange={(e) => onEditLang(e.target.value as AboutLang)}
        >
          <option value="hy">{t('adminDashboard.langHy')}</option>
          <option value="en">{t('adminDashboard.langEn')}</option>
          <option value="ru">{t('adminDashboard.langRu')}</option>
        </select>
      </div>
      {aboutClientPreview && (
        <div className={styles.aboutClientPreview}>
          <p className={styles.aboutClientPreviewTitle}>{t('adminDashboard.aboutClientPreviewTitle')}</p>
          <p className={styles.aboutClientPreviewNote}>{t('adminDashboard.aboutClientPreviewNote')}</p>
          <div className={styles.aboutClientPreviewBox}>
            <h3 className={styles.aboutClientPreviewH}>{aboutClientPreview.title}</h3>
            {aboutClientPreview.subtitle ? (
              <p className={styles.aboutClientPreviewSub}>{aboutClientPreview.subtitle}</p>
            ) : null}
            <div className={styles.aboutClientPreviewBody}>
              {aboutClientPreview.bodyParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className={styles.aboutSavedFieldsLead}>{t('adminDashboard.aboutSavedFieldsLead')}</p>
      <label>{t('adminDashboard.titleLabel')}</label>
      <input
        className={styles.textInput}
        value={block.title}
        placeholder={i18n.t('about.title', { lng: aboutEditLang })}
        onChange={(e) => onFieldChange('title', e.target.value)}
      />
      <label>{t('adminDashboard.subtitleLabel')}</label>
      <input
        className={styles.textInput}
        value={block.subtitle}
        placeholder={i18n.t('about.subtitle', { lng: aboutEditLang })}
        onChange={(e) => onFieldChange('subtitle', e.target.value)}
      />
      <label>{t('adminDashboard.bodyLabel')}</label>
      <textarea
        className={styles.textareaInput}
        value={block.body}
        placeholder={i18n.t('about.body', { lng: aboutEditLang })}
        onChange={(e) => onFieldChange('body', e.target.value)}
        rows={8}
      />
      <button type="button" onClick={onSave} disabled={saving} className={styles.primaryBtn}>
        {saving ? t('adminDashboard.saving') : t('adminDashboard.saveAbout')}
      </button>
    </section>
  );
}

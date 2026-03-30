import { useTranslation } from 'react-i18next';
import { IconPaperclip } from '../../../components/SiteIcons';
import type { AnnType, Announcement } from '../types';
import styles from '../Admin.module.css';

type Props = {
  announcements: Announcement[];
  editing: Announcement | null;
  onSelect: (a: Announcement) => void;
  onChange: (updater: (a: Announcement) => Announcement) => void;
  onCreate: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  uploadingPdf: boolean;
};

export function AdminAnnouncementsSection({
  announcements,
  editing,
  onSelect,
  onChange,
  onCreate,
  onSave,
  onDelete,
  onPdfUpload,
  saving,
  uploadingPdf,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className={`${styles.section} ${styles.sectionCard}`}>
      <div className={styles.sectionHeaderBar}>
        <h2>{t('adminDashboard.announcementsTitle')}</h2>
        <p className={styles.sectionLead}>{t('adminDashboard.announcementsSectionLead')}</p>
      </div>
      <button type="button" onClick={onCreate} disabled={saving} className={styles.addBtn}>
        {t('adminDashboard.addAnnouncement')}
      </button>
      <div className={styles.listAndEditor}>
        <ul className={styles.reportList}>
          {announcements.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={editing?.id === a.id ? styles.selected : undefined}
                onClick={() => onSelect(a)}
              >
                {a.title || t('adminDashboard.untitledEvent')} —{' '}
                {t(
                  a.type === 'admission'
                    ? 'adminDashboard.announcementTypeAdmission'
                    : 'adminDashboard.announcementTypeVacancies'
                )}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete(a.id)}
                title={t('adminDashboard.delete')}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {editing && (
          <div className={`${styles.editor} ${styles.editorPanel}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.announcementTypeLabel')}</label>
              <select
                className={styles.selectInput}
                value={editing.type || 'vacancies'}
                onChange={(e) => onChange((x) => ({ ...x, type: e.target.value as AnnType }))}
              >
                <option value="vacancies">{t('adminDashboard.announcementTypeVacancies')}</option>
                <option value="admission">{t('adminDashboard.announcementTypeAdmission')}</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderTitle')}</label>
              <input
                className={styles.textInput}
                value={editing.title}
                onChange={(e) => onChange((x) => ({ ...x, title: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderSummary')}</label>
              <input
                className={styles.textInput}
                value={editing.summary}
                onChange={(e) => onChange((x) => ({ ...x, summary: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderDate')}</label>
              <input
                className={styles.textInput}
                value={editing.publishedAt}
                onChange={(e) => onChange((x) => ({ ...x, publishedAt: e.target.value }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderContent')}</label>
              <textarea
                className={styles.textareaInput}
                value={editing.content}
                onChange={(e) => onChange((x) => ({ ...x, content: e.target.value }))}
                rows={6}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.uploadPdfLabel')}</label>
              <p className={styles.fieldHint}>{t('adminDashboard.uploadPdfOptional')}</p>
              <label htmlFor="admin-ann-pdf" className={styles.uploadZone}>
                <input
                  id="admin-ann-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={onPdfUpload}
                  disabled={uploadingPdf}
                  className={styles.uploadInputHidden}
                />
                <span className={styles.uploadZoneIcon}>
                  <IconPaperclip />
                </span>
                <span className={styles.uploadZoneText}>{t('adminDashboard.choosePdf')}</span>
              </label>
              {uploadingPdf && <span className={styles.uploading}>{t('adminDashboard.uploading')}</span>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.orFileLink')}</label>
              <input
                className={styles.textInput}
                type="url"
                value={editing.pdfUrl ?? ''}
                onChange={(e) => onChange((x) => ({ ...x, pdfUrl: e.target.value }))}
              />
            </div>
            <button type="button" onClick={onSave} disabled={saving} className={styles.primaryBtn}>
              {t('adminDashboard.saveAnnouncement')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

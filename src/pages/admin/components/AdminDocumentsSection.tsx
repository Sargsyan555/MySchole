import { useTranslation } from 'react-i18next';
import { IconFileText } from '../../../components/SiteIcons';
import type { DocType, Report } from '../types';
import styles from '../Admin.module.css';

type Props = {
  reports: Report[];
  editingReport: Report | null;
  onSelectReport: (r: Report) => void;
  onChangeReport: (updater: (r: Report) => Report) => void;
  onCreate: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  uploadingPdf: boolean;
};

export function AdminDocumentsSection({
  reports,
  editingReport,
  onSelectReport,
  onChangeReport,
  onCreate,
  onSave,
  onDelete,
  onPdfUpload,
  saving,
  uploadingPdf,
}: Props) {
  const { t } = useTranslation();

  const docTypeLabel = (type: DocType | undefined) =>
    t(
      type === 'budgets'
        ? 'adminDashboard.documentTypeBudgets'
        : type === 'purchases'
          ? 'adminDashboard.documentTypePurchases'
          : type === 'licenses'
            ? 'adminDashboard.documentTypeLicenses'
            : 'adminDashboard.documentTypeOther'
    );

  return (
    <section className={`${styles.section} ${styles.sectionCard}`}>
      <div className={styles.sectionHeaderBar}>
        <h2>{t('adminDashboard.documentsTitle')}</h2>
        <p className={styles.sectionLead}>{t('adminDashboard.documentsSectionLead')}</p>
      </div>
      <button type="button" onClick={onCreate} disabled={saving} className={styles.addBtn}>
        {t('adminDashboard.addDocument')}
      </button>
      <div className={styles.listAndEditor}>
        <ul className={styles.reportList}>
          {reports.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={editingReport?.id === r.id ? styles.selected : undefined}
                onClick={() => onSelectReport(r)}
              >
                {r.title || t('adminDashboard.untitledEvent')} — {docTypeLabel(r.type)}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete(r.id)}
                title={t('adminDashboard.delete')}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {editingReport && (
          <div className={`${styles.editor} ${styles.editorPanel}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.documentTypeLabel')}</label>
              <select
                className={styles.selectInput}
                value={editingReport.type || 'other'}
                onChange={(e) => onChangeReport((r) => ({ ...r, type: e.target.value as DocType }))}
              >
                <option value="budgets">{t('adminDashboard.documentTypeBudgets')}</option>
                <option value="purchases">{t('adminDashboard.documentTypePurchases')}</option>
                <option value="licenses">{t('adminDashboard.documentTypeLicenses')}</option>
                <option value="other">{t('adminDashboard.documentTypeOther')}</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderTitle')}</label>
              <input
                className={styles.textInput}
                value={editingReport.title}
                onChange={(e) => onChangeReport((r) => ({ ...r, title: e.target.value }))}
                placeholder={t('adminDashboard.placeholderTitle')}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderSummary')}</label>
              <input
                className={styles.textInput}
                value={editingReport.summary}
                onChange={(e) => onChangeReport((r) => ({ ...r, summary: e.target.value }))}
                placeholder={t('adminDashboard.placeholderSummary')}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderDate')}</label>
              <input
                className={styles.textInput}
                value={editingReport.publishedAt}
                onChange={(e) => onChangeReport((r) => ({ ...r, publishedAt: e.target.value }))}
                placeholder={t('adminDashboard.placeholderDate')}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {t('adminDashboard.uploadPdfLabel')} <span className={styles.requiredMark}>*</span>
              </label>
              <p className={styles.fieldHint}>{t('adminDashboard.uploadPdfHint')}</p>
              <label htmlFor="admin-doc-pdf" className={styles.uploadZone}>
                <input
                  id="admin-doc-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={onPdfUpload}
                  disabled={uploadingPdf}
                  className={styles.uploadInputHidden}
                />
                <span className={styles.uploadZoneIcon}>
                  <IconFileText />
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
                value={editingReport.pdfUrl ?? ''}
                onChange={(e) => onChangeReport((r) => ({ ...r, pdfUrl: e.target.value }))}
                placeholder={t('adminDashboard.placeholderFileLink')}
              />
            </div>
            <button type="button" onClick={onSave} disabled={saving} className={styles.primaryBtn}>
              {t('adminDashboard.saveReport')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

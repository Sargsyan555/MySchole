import { useTranslation } from 'react-i18next';
import { UPCOMING_EVENT_PLACEHOLDER_IMAGE } from '../../../constants/eventImages';
import type { Event } from '../types';
import styles from '../Admin.module.css';

type Props = {
  events: Event[];
  editing: Event | null;
  onSelect: (ev: Event) => void;
  onChange: (updater: (ev: Event) => Event) => void;
  onCreate: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  uploadingImage: boolean;
};

export function AdminEventsSection({
  events,
  editing,
  onSelect,
  onChange,
  onCreate,
  onSave,
  onDelete,
  onCoverImageUpload,
  onGalleryImageUpload,
  saving,
  uploadingImage,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className={`${styles.section} ${styles.sectionCard}`}>
      <div className={styles.sectionHeaderBar}>
        <h2>{t('adminDashboard.eventsTitle')}</h2>
      </div>
      <button type="button" onClick={onCreate} disabled={saving} className={styles.addBtn}>
        {t('adminDashboard.addEvent')}
      </button>
      <div className={styles.listAndEditor}>
        <ul className={styles.reportList}>
          {events.map((ev) => (
            <li key={ev.id}>
              <button
                type="button"
                className={editing?.id === ev.id ? styles.selected : undefined}
                onClick={() => onSelect(ev)}
              >
                {ev.title || t('adminDashboard.untitledEvent')} —{' '}
                {ev.status === 'past' ? t('adminDashboard.statusPast') : t('adminDashboard.statusUpcoming')}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete(ev.id)}
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
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderTitle')}</label>
              <input
                className={styles.textInput}
                value={editing.title}
                onChange={(e) => onChange((ev) => ({ ...ev, title: e.target.value }))}
                placeholder={t('adminDashboard.eventNamePlaceholder')}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.placeholderContent')}</label>
              <textarea
                className={styles.textareaInput}
                value={editing.description}
                onChange={(e) => onChange((ev) => ({ ...ev, description: e.target.value }))}
                placeholder={t('adminDashboard.eventDescriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.eventTimeLabel')}</label>
              <input
                className={styles.textInput}
                type="datetime-local"
                value={editing.date.slice(0, 16)}
                onChange={(e) => onChange((ev) => ({ ...ev, date: e.target.value || ev.date }))}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('adminDashboard.eventStatusLabel')}</label>
              <select
                className={styles.selectInput}
                value={editing.status}
                onChange={(e) => {
                  const status = e.target.value as 'upcoming' | 'past';
                  onChange((ev) =>
                    status === 'upcoming'
                      ? { ...ev, status, imageUrl: '', galleryImages: [] }
                      : { ...ev, status }
                  );
                }}
              >
                <option value="upcoming">{t('adminDashboard.statusUpcoming')}</option>
                <option value="past">{t('adminDashboard.statusPast')}</option>
              </select>
            </div>

            {editing.status === 'upcoming' && (
              <div className={styles.fieldGroup}>
                <p className={styles.fieldHint}>{t('adminDashboard.eventUpcomingImageHint')}</p>
                <div className={styles.eventPlaceholderPreview}>
                  <img src={UPCOMING_EVENT_PLACEHOLDER_IMAGE} alt="" />
                </div>
              </div>
            )}

            {editing.status === 'past' && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.eventImageLabel')}</label>
                  <p className={styles.fieldHint}>{t('adminDashboard.eventPastImageHint')}</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onCoverImageUpload}
                    disabled={uploadingImage}
                    className={styles.fileInput}
                  />
                  {uploadingImage && <span className={styles.uploading}>{t('adminDashboard.uploading')}</span>}
                  {editing.imageUrl && (
                    <p className={styles.imagePreview}>
                      <img
                        src={editing.imageUrl}
                        alt=""
                        style={{ maxWidth: 160, maxHeight: 100, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </p>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.galleryImagesLabel')}</label>
                  <p className={styles.fieldHint}>{t('adminDashboard.galleryImagesHint')}</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onGalleryImageUpload}
                    disabled={uploadingImage}
                    className={styles.fileInput}
                  />
                  <ul className={styles.galleryPreview}>
                    {(editing.galleryImages || []).map((url, idx) => (
                      <li key={url}>
                        <img src={url} alt="" style={{ maxWidth: 80, maxHeight: 60, objectFit: 'cover' }} />
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() =>
                            onChange((ev) => ({
                              ...ev,
                              galleryImages: (ev.galleryImages || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <button type="button" onClick={onSave} disabled={saving} className={styles.primaryBtn}>
              {t('adminDashboard.saveEvent')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

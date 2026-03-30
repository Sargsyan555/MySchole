import { useTranslation } from 'react-i18next';
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
          <div className={styles.editor}>
            <input
              value={editing.title}
              onChange={(e) => onChange((ev) => ({ ...ev, title: e.target.value }))}
              placeholder={t('adminDashboard.eventNamePlaceholder')}
            />
            <textarea
              value={editing.description}
              onChange={(e) => onChange((ev) => ({ ...ev, description: e.target.value }))}
              placeholder={t('adminDashboard.eventDescriptionPlaceholder')}
              rows={2}
            />
            <label>{t('adminDashboard.eventTimeLabel')}</label>
            <input
              type="datetime-local"
              value={editing.date.slice(0, 16)}
              onChange={(e) => onChange((ev) => ({ ...ev, date: e.target.value || ev.date }))}
            />
            <label>{t('adminDashboard.eventStatusLabel')}</label>
            <select
              value={editing.status}
              onChange={(e) => onChange((ev) => ({ ...ev, status: e.target.value as 'upcoming' | 'past' }))}
            >
              <option value="upcoming">{t('adminDashboard.statusUpcoming')}</option>
              <option value="past">{t('adminDashboard.statusPast')}</option>
            </select>
            <label>{t('adminDashboard.eventImageLabel')}</label>
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
                <img src={editing.imageUrl} alt="" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover' }} />
              </p>
            )}
            {editing.status === 'past' && (
              <>
                <label>{t('adminDashboard.galleryImagesLabel')}</label>
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

import { useTranslation } from 'react-i18next';
import type { Teacher } from '../types';
import styles from '../Admin.module.css';

type Props = {
  teachers: Teacher[];
  editing: Teacher | null;
  onSelect: (teacher: Teacher) => void;
  onChange: (updater: (teacher: Teacher) => Teacher) => void;
  onCreate: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
};

export function AdminTeachersSection({
  teachers,
  editing,
  onSelect,
  onChange,
  onCreate,
  onSave,
  onDelete,
  saving,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className={`${styles.section} ${styles.sectionCard}`}>
      <div className={styles.sectionHeaderBar}>
        <h2>{t('adminDashboard.teachersTitle')}</h2>
      </div>
      <button type="button" onClick={onCreate} disabled={saving} className={styles.addBtn}>
        {t('adminDashboard.addTeacher')}
      </button>
      <div className={styles.listAndEditor}>
        <ul className={styles.reportList}>
          {teachers.map((teacher) => (
            <li key={teacher.id}>
              <button
                type="button"
                className={editing?.id === teacher.id ? styles.selected : undefined}
                onClick={() => onSelect(teacher)}
              >
                {teacher.name} — {teacher.subject}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete(teacher.id)}
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
              value={editing.name}
              onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('adminDashboard.placeholderName')}
            />
            <input
              value={editing.subject}
              onChange={(e) => onChange((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder={t('adminDashboard.placeholderSubject')}
            />
            <input
              value={editing.email}
              onChange={(e) => onChange((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t('adminDashboard.placeholderEmail')}
            />
            <textarea
              value={editing.bio}
              onChange={(e) => onChange((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder={t('adminDashboard.placeholderBio')}
              rows={4}
            />
            <button type="button" onClick={onSave} disabled={saving} className={styles.primaryBtn}>
              {t('adminDashboard.saveTeacher')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

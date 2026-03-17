import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '../../api';
import styles from './Admin.module.css';

type About = { title: string; subtitle: string; body: string };
type Report = { id: string; title: string; summary: string; content: string; publishedAt: string; pdfUrl?: string };
type Teacher = { id: string; name: string; subject: string; bio: string; email: string };
type Event = { id: string; title: string; description: string; date: string; status: 'upcoming' | 'past'; imageUrl?: string; galleryImages?: string[] };
type Tab = 'about' | 'reports' | 'teachers' | 'events';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('about');
  const [about, setAbout] = useState<About | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingReport) return;
    if (file.type !== 'application/pdf') {
      setMessage(t('adminDashboard.pdfOnly'));
      return;
    }
    setUploadingPdf(true);
    setMessage('');
    try {
      const { url } = await api.uploadPdf(file);
      setEditingReport((r) => (r ? { ...r, pdfUrl: url } : r));
      setMessage(t('adminDashboard.pdfUploaded'));
    } catch {
      setMessage(t('adminDashboard.pdfUploadFailed'));
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;
    if (!file.type.startsWith('image/')) {
      setMessage(t('adminDashboard.imageOnly'));
      return;
    }
    setUploadingImage(true);
    setMessage('');
    try {
      const { url } = await api.uploadImage(file);
      setEditingEvent((ev) => (ev ? { ...ev, imageUrl: url } : ev));
      setMessage(t('adminDashboard.imageUploaded'));
    } catch {
      setMessage(t('adminDashboard.imageUploadFailed'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;
    if (!file.type.startsWith('image/')) {
      setMessage(t('adminDashboard.imageOnly'));
      return;
    }
    setUploadingImage(true);
    setMessage('');
    try {
      const { url } = await api.uploadImage(file);
      const gallery = [...(editingEvent.galleryImages || []), url];
      setEditingEvent((ev) => (ev ? { ...ev, galleryImages: gallery } : ev));
      setMessage(t('adminDashboard.imageUploaded'));
    } catch {
      setMessage(t('adminDashboard.imageUploadFailed'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const ok = sessionStorage.getItem('admin');
    if (!ok) {
      navigate('/admin');
      return;
    }
    Promise.all([
      api.getAbout().then(setAbout),
      fetch('/api/reports').then((r) => r.json()).then(setReports),
      api.getTeachers().then(setTeachers),
      api.getEvents().then((data: Event[]) => setEvents(Array.isArray(data) ? data : [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const saveAbout = async () => {
    if (!about) return;
    setSaving(true);
    setMessage('');
    try {
      await api.updateAbout(about);
      setMessage(t('adminDashboard.aboutSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const createReport = async () => {
    setSaving(true);
    setMessage('');
    try {
      const r = await api.createReport({
        title: 'New Report',
        summary: '',
        content: '',
        publishedAt: new Date().toISOString().slice(0, 10),
        pdfUrl: '',
      });
      setReports((prev) => [...prev, r]);
      setEditingReport(r);
      setMessage(t('adminDashboard.reportCreated'));
    } catch {
      setMessage(t('adminDashboard.failedToCreateReport'));
    } finally {
      setSaving(false);
    }
  };

  const updateReport = async () => {
    if (!editingReport) return;
    setSaving(true);
    setMessage('');
    try {
      await api.updateReport(editingReport.id, {
        title: editingReport.title,
        summary: editingReport.summary,
        content: editingReport.content,
        publishedAt: editingReport.publishedAt,
        pdfUrl: editingReport.pdfUrl,
      });
      setReports((prev) => prev.map((r) => (r.id === editingReport.id ? editingReport : r)));
      setMessage(t('adminDashboard.reportSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSaveReport'));
    } finally {
      setSaving(false);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm(t('adminDashboard.confirmDeleteReport'))) return;
    setSaving(true);
    try {
      await api.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (editingReport?.id === id) setEditingReport(null);
      setMessage(t('adminDashboard.reportDeleted'));
    } catch {
      setMessage(t('adminDashboard.failedToDelete'));
    } finally {
      setSaving(false);
    }
  };

  const createTeacher = async () => {
    setSaving(true);
    setMessage('');
    try {
      const newTeacher = await api.createTeacher({
        name: 'New Teacher',
        subject: 'Subject',
        bio: '',
        email: '',
      });
      setTeachers((prev) => [...prev, newTeacher]);
      setEditingTeacher(newTeacher);
      setMessage(t('adminDashboard.teacherAdded'));
    } catch {
      setMessage(t('adminDashboard.failedToAddTeacher'));
    } finally {
      setSaving(false);
    }
  };

  const updateTeacher = async () => {
    if (!editingTeacher) return;
    setSaving(true);
    setMessage('');
    try {
      await api.updateTeacher(editingTeacher.id, {
        name: editingTeacher.name,
        subject: editingTeacher.subject,
        bio: editingTeacher.bio,
        email: editingTeacher.email,
      });
      setTeachers((prev) => prev.map((teacher) => (teacher.id === editingTeacher.id ? editingTeacher : teacher)));
      setMessage(t('adminDashboard.teacherSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSaveTeacher'));
    } finally {
      setSaving(false);
    }
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm(t('adminDashboard.confirmRemoveTeacher'))) return;
    setSaving(true);
    try {
      await api.deleteTeacher(id);
      setTeachers((prev) => prev.filter((te) => te.id !== id));
      if (editingTeacher?.id === id) setEditingTeacher(null);
      setMessage(t('adminDashboard.teacherRemoved'));
    } catch {
      setMessage(t('adminDashboard.failedToRemove'));
    } finally {
      setSaving(false);
    }
  };

  const createEvent = async () => {
    setSaving(true);
    setMessage('');
    try {
      const ev = await api.createEvent({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 16),
        status: 'upcoming',
      });
      setEvents((prev) => [...prev, ev]);
      setEditingEvent(ev);
      setMessage(t('adminDashboard.eventCreated'));
    } catch {
      setMessage(t('adminDashboard.failedToCreateEvent'));
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = async () => {
    if (!editingEvent) return;
    setSaving(true);
    setMessage('');
    try {
      await api.updateEvent(editingEvent.id, {
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date,
        status: editingEvent.status,
        imageUrl: editingEvent.imageUrl,
        galleryImages: editingEvent.galleryImages,
      });
      setEvents((prev) => prev.map((ev) => (ev.id === editingEvent.id ? editingEvent : ev)));
      setMessage(t('adminDashboard.eventSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSaveEvent'));
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm(t('adminDashboard.confirmDeleteEvent'))) return;
    setSaving(true);
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      if (editingEvent?.id === id) setEditingEvent(null);
      setMessage(t('adminDashboard.eventDeleted'));
    } catch {
      setMessage(t('adminDashboard.failedToDeleteEvent'));
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin');
    navigate('/admin');
  };

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.topBar}>
        <h1>{t('adminDashboard.title')}</h1>
        <div className={styles.actions}>
          <Link to="/">{t('adminDashboard.viewSite')}</Link>
          <button type="button" onClick={logout} className={styles.logout}>
            {t('adminDashboard.logOut')}
          </button>
        </div>
      </div>
      <nav className={styles.tabs}>
        {(['about', 'reports', 'teachers', 'events'] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            className={tab === tabKey ? styles.tabActive : styles.tab}
            onClick={() => setTab(tabKey)}
          >
            {tabKey === 'about' && t('adminDashboard.tabAbout')}
            {tabKey === 'reports' && t('adminDashboard.tabReports')}
            {tabKey === 'teachers' && t('adminDashboard.tabTeachers')}
            {tabKey === 'events' && t('adminDashboard.tabEvents')}
          </button>
        ))}
      </nav>
      {message && <p className={styles.message}>{message}</p>}

      {tab === 'about' && about && (
        <section className={styles.section}>
          <h2>{t('adminDashboard.aboutPage')}</h2>
          <label>{t('adminDashboard.titleLabel')}</label>
          <input
            value={about.title}
            onChange={(e) => setAbout((a) => (a ? { ...a, title: e.target.value } : a))}
          />
          <label>{t('adminDashboard.subtitleLabel')}</label>
          <input
            value={about.subtitle}
            onChange={(e) => setAbout((a) => (a ? { ...a, subtitle: e.target.value } : a))}
          />
          <label>{t('adminDashboard.bodyLabel')}</label>
          <textarea
            value={about.body}
            onChange={(e) => setAbout((a) => (a ? { ...a, body: e.target.value } : a))}
            rows={8}
          />
          <button type="button" onClick={saveAbout} disabled={saving}>
            {saving ? t('adminDashboard.saving') : t('adminDashboard.saveAbout')}
          </button>
        </section>
      )}

      {tab === 'reports' && (
        <section className={styles.section}>
          <h2>{t('adminDashboard.reportsTitle')}</h2>
          <button type="button" onClick={createReport} disabled={saving} className={styles.addBtn}>
            {t('adminDashboard.addReport')}
          </button>
          <div className={styles.listAndEditor}>
            <ul className={styles.reportList}>
              {reports.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={editingReport?.id === r.id ? styles.selected : undefined}
                    onClick={() => setEditingReport(r)}
                  >
                    {r.title}
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteReport(r.id)}
                    title={t('adminDashboard.delete')}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {editingReport && (
              <div className={styles.editor}>
                <input
                  value={editingReport.title}
                  onChange={(e) => setEditingReport((r) => (r ? { ...r, title: e.target.value } : r))}
                  placeholder={t('adminDashboard.placeholderTitle')}
                />
                <input
                  value={editingReport.summary}
                  onChange={(e) => setEditingReport((r) => (r ? { ...r, summary: e.target.value } : r))}
                  placeholder={t('adminDashboard.placeholderSummary')}
                />
                <input
                  value={editingReport.publishedAt}
                  onChange={(e) => setEditingReport((r) => (r ? { ...r, publishedAt: e.target.value } : r))}
                  placeholder={t('adminDashboard.placeholderDate')}
                />
                <label>{t('adminDashboard.uploadPdfLabel')}</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                  className={styles.fileInput}
                />
                {uploadingPdf && <span className={styles.uploading}>{t('adminDashboard.uploading')}</span>}
                <label className={styles.orLabel}>{t('adminDashboard.orFileLink')}</label>
                <input
                  type="url"
                  value={editingReport.pdfUrl ?? ''}
                  onChange={(e) => setEditingReport((r) => (r ? { ...r, pdfUrl: e.target.value } : r))}
                  placeholder={t('adminDashboard.placeholderFileLink')}
                />
                <button type="button" onClick={updateReport} disabled={saving}>
                  {t('adminDashboard.saveReport')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'events' && (
        <section className={styles.section}>
          <h2>{t('adminDashboard.eventsTitle')}</h2>
          <button type="button" onClick={createEvent} disabled={saving} className={styles.addBtn}>
            {t('adminDashboard.addEvent')}
          </button>
          <div className={styles.listAndEditor}>
            <ul className={styles.reportList}>
              {events.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    className={editingEvent?.id === ev.id ? styles.selected : undefined}
                    onClick={() => setEditingEvent(ev)}
                  >
                    {ev.title || t('adminDashboard.untitledEvent')} — {ev.status === 'past' ? t('adminDashboard.statusPast') : t('adminDashboard.statusUpcoming')}
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteEvent(ev.id)}
                    title={t('adminDashboard.delete')}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {editingEvent && (
              <div className={styles.editor}>
                <input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent((ev) => (ev ? { ...ev, title: e.target.value } : ev))}
                  placeholder={t('adminDashboard.eventNamePlaceholder')}
                />
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent((ev) => (ev ? { ...ev, description: e.target.value } : ev))}
                  placeholder={t('adminDashboard.eventDescriptionPlaceholder')}
                  rows={2}
                />
                <label>{t('adminDashboard.eventTimeLabel')}</label>
                <input
                  type="datetime-local"
                  value={editingEvent.date.slice(0, 16)}
                  onChange={(e) => setEditingEvent((ev) => (ev ? { ...ev, date: e.target.value || ev.date } : ev))}
                />
                <label>{t('adminDashboard.eventStatusLabel')}</label>
                <select
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent((ev) => (ev ? { ...ev, status: e.target.value as 'upcoming' | 'past' } : ev))}
                >
                  <option value="upcoming">{t('adminDashboard.statusUpcoming')}</option>
                  <option value="past">{t('adminDashboard.statusPast')}</option>
                </select>
                <label>{t('adminDashboard.eventImageLabel')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEventImageUpload}
                  disabled={uploadingImage}
                  className={styles.fileInput}
                />
                {uploadingImage && <span className={styles.uploading}>{t('adminDashboard.uploading')}</span>}
                {editingEvent.imageUrl && (
                  <p className={styles.imagePreview}>
                    <img src={editingEvent.imageUrl} alt="" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover' }} />
                  </p>
                )}
                {editingEvent.status === 'past' && (
                  <>
                    <label>{t('adminDashboard.galleryImagesLabel')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      disabled={uploadingImage}
                      className={styles.fileInput}
                    />
                    <ul className={styles.galleryPreview}>
                      {(editingEvent.galleryImages || []).map((url, idx) => (
                        <li key={url}>
                          <img src={url} alt="" style={{ maxWidth: 80, maxHeight: 60, objectFit: 'cover' }} />
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => setEditingEvent((ev) => ev ? { ...ev, galleryImages: (ev.galleryImages || []).filter((_, i) => i !== idx) } : ev)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button type="button" onClick={updateEvent} disabled={saving}>
                  {t('adminDashboard.saveEvent')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'teachers' && (
        <section className={styles.section}>
          <h2>{t('adminDashboard.teachersTitle')}</h2>
          <button type="button" onClick={createTeacher} disabled={saving} className={styles.addBtn}>
            {t('adminDashboard.addTeacher')}
          </button>
          <div className={styles.listAndEditor}>
            <ul className={styles.reportList}>
              {teachers.map((teacher) => (
                <li key={teacher.id}>
                  <button
                    type="button"
                    className={editingTeacher?.id === teacher.id ? styles.selected : undefined}
                    onClick={() => setEditingTeacher(teacher)}
                  >
                    {teacher.name} — {teacher.subject}
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteTeacher(teacher.id)}
                    title={t('adminDashboard.delete')}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {editingTeacher && (
              <div className={styles.editor}>
                <input
                  value={editingTeacher.name}
onChange={(e) => setEditingTeacher((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                    placeholder={t('adminDashboard.placeholderName')}
                />
                <input
                  value={editingTeacher.subject}
onChange={(e) => setEditingTeacher((prev) => (prev ? { ...prev, subject: e.target.value } : prev))}
                    placeholder={t('adminDashboard.placeholderSubject')}
                />
                <input
                  value={editingTeacher.email}
onChange={(e) => setEditingTeacher((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                    placeholder={t('adminDashboard.placeholderEmail')}
                />
                <textarea
                  value={editingTeacher.bio}
onChange={(e) => setEditingTeacher((prev) => (prev ? { ...prev, bio: e.target.value } : prev))}
                    placeholder={t('adminDashboard.placeholderBio')}
                  rows={4}
                />
                <button type="button" onClick={updateTeacher} disabled={saving}>
                  {t('adminDashboard.saveTeacher')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}

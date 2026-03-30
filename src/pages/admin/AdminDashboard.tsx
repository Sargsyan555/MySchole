import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import * as api from '../../api';
import type { AboutByLang, AboutLang } from '../../api';
import { splitBodyPreview } from './aboutUtils';
import type { Announcement, Event, Report, Tab, Teacher } from './types';
import styles from './Admin.module.css';
import { AdminTabsNav } from './components/AdminTabsNav';
import { AdminAboutSection } from './components/AdminAboutSection';
import { AdminDocumentsSection } from './components/AdminDocumentsSection';
import { AdminAnnouncementsSection } from './components/AdminAnnouncementsSection';
import { AdminTeachersSection } from './components/AdminTeachersSection';
import { AdminEventsSection } from './components/AdminEventsSection';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('documents');
  const [aboutByLang, setAboutByLang] = useState<AboutByLang | null>(null);
  const [aboutEditLang, setAboutEditLang] = useState<AboutLang>('hy');
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
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
  const [aboutFormDirty, setAboutFormDirty] = useState(false);
  const navigate = useNavigate();

  const aboutClientPreview = useMemo(() => {
    if (!aboutByLang) return null;
    const b = aboutByLang[aboutEditLang];
    const lng = aboutEditLang;
    const title = b.title.trim() || i18n.t('about.title', { lng });
    const subtitle = b.subtitle.trim() || i18n.t('about.subtitle', { lng });
    const bodyRaw = b.body.trim() || i18n.t('about.body', { lng });
    return { title, subtitle, bodyParagraphs: splitBodyPreview(bodyRaw) };
  }, [aboutByLang, aboutEditLang]);

  const handleAnnouncementPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAnnouncement) return;
    if (file.type !== 'application/pdf') {
      setMessage(t('adminDashboard.pdfOnly'));
      return;
    }
    setUploadingPdf(true);
    setMessage('');
    try {
      const { url } = await api.uploadPdf(file);
      setEditingAnnouncement((a) => (a ? { ...a, pdfUrl: url } : a));
      setMessage(t('adminDashboard.pdfUploaded'));
    } catch {
      setMessage(t('adminDashboard.pdfUploadFailed'));
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  };

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
      api.getAbout().then((d) => setAboutByLang(api.normalizeAboutResponse(d))),
      fetch('/api/reports').then((r) => r.json()).then(setReports),
      api
        .getAnnouncements()
        .then((data: Announcement[]) => setAnnouncements(Array.isArray(data) ? data : []))
        .catch(() => setAnnouncements([])),
      api.getTeachers().then(setTeachers),
      api.getEvents().then((data: Event[]) => setEvents(Array.isArray(data) ? data : [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (tab !== 'about' || aboutFormDirty || loading) return;
    let cancelled = false;
    api
      .getAbout()
      .then((d) => {
        if (!cancelled) setAboutByLang(api.normalizeAboutResponse(d));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tab, aboutFormDirty, loading]);

  const saveAbout = async () => {
    if (!aboutByLang) return;
    const block = aboutByLang[aboutEditLang];
    setSaving(true);
    setMessage('');
    try {
      const next = await api.updateAbout(aboutEditLang, block);
      setAboutByLang(api.normalizeAboutResponse(next));
      setAboutFormDirty(false);
      setMessage(t('adminDashboard.aboutSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const patchAboutField = (field: 'title' | 'subtitle' | 'body', value: string) => {
    setAboutFormDirty(true);
    setAboutByLang((prev) =>
      prev
        ? {
            ...prev,
            [aboutEditLang]: { ...prev[aboutEditLang], [field]: value },
          }
        : prev
    );
  };

  const createAnnouncement = async () => {
    setSaving(true);
    setMessage('');
    try {
      const a = await api.createAnnouncement({
        title: '',
        summary: '',
        content: '',
        publishedAt: new Date().toISOString().slice(0, 10),
        type: 'vacancies',
      });
      setAnnouncements((prev) => [...prev, a]);
      setEditingAnnouncement(a);
      setMessage(t('adminDashboard.announcementCreated'));
    } catch {
      setMessage(t('adminDashboard.failedToCreateAnnouncement'));
    } finally {
      setSaving(false);
    }
  };

  const updateAnnouncement = async () => {
    if (!editingAnnouncement) return;
    setSaving(true);
    setMessage('');
    try {
      await api.updateAnnouncement(editingAnnouncement.id, {
        title: editingAnnouncement.title,
        summary: editingAnnouncement.summary,
        content: editingAnnouncement.content,
        publishedAt: editingAnnouncement.publishedAt,
        pdfUrl: editingAnnouncement.pdfUrl,
        type: editingAnnouncement.type,
      });
      setAnnouncements((prev) =>
        prev.map((x) => (x.id === editingAnnouncement.id ? editingAnnouncement : x))
      );
      setMessage(t('adminDashboard.announcementSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSaveAnnouncement'));
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm(t('adminDashboard.confirmDeleteAnnouncement'))) return;
    setSaving(true);
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((x) => x.id !== id));
      if (editingAnnouncement?.id === id) setEditingAnnouncement(null);
      setMessage(t('adminDashboard.announcementDeleted'));
    } catch {
      setMessage(t('adminDashboard.failedToDeleteAnnouncement'));
    } finally {
      setSaving(false);
    }
  };

  const createReport = async () => {
    setSaving(true);
    setMessage('');
    try {
      const r = await api.createReport({
        title: '',
        summary: '',
        content: '',
        publishedAt: new Date().toISOString().slice(0, 10),
        pdfUrl: '',
        type: 'other',
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
    if (!editingReport.pdfUrl?.trim()) {
      setMessage(t('adminDashboard.pdfRequired'));
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await api.updateReport(editingReport.id, {
        title: editingReport.title,
        summary: editingReport.summary,
        content: editingReport.content,
        publishedAt: editingReport.publishedAt,
        pdfUrl: editingReport.pdfUrl,
        type: editingReport.type,
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
        <div className={styles.topBarText}>
          <h1>{t('adminDashboard.title')}</h1>
        </div>
        <div className={styles.actions}>
          <Link to="/" className={styles.viewSiteBtn}>
            {t('adminDashboard.viewSite')}
          </Link>
          <button type="button" onClick={logout} className={styles.logout}>
            {t('adminDashboard.logOut')}
          </button>
        </div>
      </div>
      <AdminTabsNav tab={tab} onTab={setTab} />
      {message && <p className={styles.message}>{message}</p>}

      {tab === 'about' && aboutByLang && (
        <AdminAboutSection
          aboutByLang={aboutByLang}
          aboutEditLang={aboutEditLang}
          onEditLang={setAboutEditLang}
          aboutClientPreview={aboutClientPreview}
          onFieldChange={patchAboutField}
          onSave={saveAbout}
          saving={saving}
        />
      )}

      {tab === 'documents' && (
        <AdminDocumentsSection
          reports={reports}
          editingReport={editingReport}
          onSelectReport={setEditingReport}
          onChangeReport={(fn) => setEditingReport((prev) => (prev ? fn(prev) : prev))}
          onCreate={createReport}
          onSave={updateReport}
          onDelete={deleteReport}
          onPdfUpload={handlePdfUpload}
          saving={saving}
          uploadingPdf={uploadingPdf}
        />
      )}

      {tab === 'announcements' && (
        <AdminAnnouncementsSection
          announcements={announcements}
          editing={editingAnnouncement}
          onSelect={setEditingAnnouncement}
          onChange={(fn) => setEditingAnnouncement((prev) => (prev ? fn(prev) : prev))}
          onCreate={createAnnouncement}
          onSave={updateAnnouncement}
          onDelete={deleteAnnouncement}
          onPdfUpload={handleAnnouncementPdfUpload}
          saving={saving}
          uploadingPdf={uploadingPdf}
        />
      )}

      {tab === 'teachers' && (
        <AdminTeachersSection
          teachers={teachers}
          editing={editingTeacher}
          onSelect={setEditingTeacher}
          onChange={(fn) => setEditingTeacher((prev) => (prev ? fn(prev) : prev))}
          onCreate={createTeacher}
          onSave={updateTeacher}
          onDelete={deleteTeacher}
          saving={saving}
        />
      )}

      {tab === 'events' && (
        <AdminEventsSection
          events={events}
          editing={editingEvent}
          onSelect={setEditingEvent}
          onChange={(fn) => setEditingEvent((prev) => (prev ? fn(prev) : prev))}
          onCreate={createEvent}
          onSave={updateEvent}
          onDelete={deleteEvent}
          onCoverImageUpload={handleEventImageUpload}
          onGalleryImageUpload={handleGalleryImageUpload}
          saving={saving}
          uploadingImage={uploadingImage}
        />
      )}
    </div>
  );
}

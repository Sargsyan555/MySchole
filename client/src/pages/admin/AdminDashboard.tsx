import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import * as api from '../../api';
import { ABOUT_LANGS, type AboutByLang, type AboutLang } from '../../api';
import styles from './Admin.module.css';

type DocType = 'budgets' | 'purchases' | 'licenses' | 'other';
type Report = {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  pdfUrl?: string;
  type?: DocType;
};
type Teacher = { id: string; name: string; subject: string; bio: string; email: string };
type Event = { id: string; title: string; description: string; date: string; status: 'upcoming' | 'past'; imageUrl?: string; galleryImages?: string[] };
type AnnType = 'vacancies' | 'admission';
type Announcement = {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  pdfUrl?: string;
  type?: AnnType;
};
type StudentsPage = { title: string; subtitle: string; body: string };
type Tab = 'about' | 'students' | 'documents' | 'announcements' | 'teachers' | 'events';

function aboutBlockHasText(b: { title: string; subtitle: string; body: string }) {
  return !!(b.title?.trim() || b.subtitle?.trim() || b.body?.trim());
}

function splitBodyPreview(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const byDoubleNl = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return byDoubleNl.length > 0 ? byDoubleNl : [trimmed];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('documents');
  const [aboutByLang, setAboutByLang] = useState<AboutByLang | null>(null);
  const [aboutEditLang, setAboutEditLang] = useState<AboutLang>('hy');
  const [studentsPage, setStudentsPage] = useState<StudentsPage | null>(null);
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

  /** Same text visitors see on the public About page for the selected language (CMS or translation fallback). */
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
      api
        .getStudentsPage()
        .then(setStudentsPage)
        .catch(() => setStudentsPage({ title: '', subtitle: '', body: '' })),
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

  // When opening About, reload from server so inputs match what the API serves (unless you have unsaved edits).
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

  const saveStudentsPageData = async () => {
    if (!studentsPage) return;
    setSaving(true);
    setMessage('');
    try {
      await api.updateStudentsPage(studentsPage);
      setMessage(t('adminDashboard.studentsPageSaved'));
    } catch {
      setMessage(t('adminDashboard.failedToSave'));
    } finally {
      setSaving(false);
    }
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
          <p className={styles.topBarLead}>{t('adminDashboard.dashboardLead')}</p>
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
      <nav className={styles.tabs}>
        {(['about', 'students', 'documents', 'announcements', 'teachers', 'events'] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            className={tab === tabKey ? styles.tabActive : styles.tab}
            onClick={() => setTab(tabKey)}
          >
            {tabKey === 'about' && t('adminDashboard.tabAbout')}
            {tabKey === 'students' && t('adminDashboard.tabStudents')}
            {tabKey === 'documents' && t('adminDashboard.tabDocuments')}
            {tabKey === 'announcements' && t('adminDashboard.tabAnnouncements')}
            {tabKey === 'teachers' && t('adminDashboard.tabTeachers')}
            {tabKey === 'events' && t('adminDashboard.tabEvents')}
          </button>
        ))}
      </nav>
      {message && <p className={styles.message}>{message}</p>}

      {tab === 'about' && aboutByLang && (
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
              onChange={(e) => setAboutEditLang(e.target.value as AboutLang)}
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
            value={aboutByLang[aboutEditLang].title}
            placeholder={i18n.t('about.title', { lng: aboutEditLang })}
            onChange={(e) => {
              setAboutFormDirty(true);
              setAboutByLang((prev) =>
                prev
                  ? {
                      ...prev,
                      [aboutEditLang]: { ...prev[aboutEditLang], title: e.target.value },
                    }
                  : prev
              );
            }}
          />
          <label>{t('adminDashboard.subtitleLabel')}</label>
          <input
            className={styles.textInput}
            value={aboutByLang[aboutEditLang].subtitle}
            placeholder={i18n.t('about.subtitle', { lng: aboutEditLang })}
            onChange={(e) => {
              setAboutFormDirty(true);
              setAboutByLang((prev) =>
                prev
                  ? {
                      ...prev,
                      [aboutEditLang]: { ...prev[aboutEditLang], subtitle: e.target.value },
                    }
                  : prev
              );
            }}
          />
          <label>{t('adminDashboard.bodyLabel')}</label>
          <textarea
            className={styles.textareaInput}
            value={aboutByLang[aboutEditLang].body}
            placeholder={i18n.t('about.body', { lng: aboutEditLang })}
            onChange={(e) => {
              setAboutFormDirty(true);
              setAboutByLang((prev) =>
                prev
                  ? {
                      ...prev,
                      [aboutEditLang]: { ...prev[aboutEditLang], body: e.target.value },
                    }
                  : prev
              );
            }}
            rows={8}
          />
          <button type="button" onClick={saveAbout} disabled={saving} className={styles.primaryBtn}>
            {saving ? t('adminDashboard.saving') : t('adminDashboard.saveAbout')}
          </button>
        </section>
      )}

      {tab === 'students' && studentsPage && (
        <section className={`${styles.section} ${styles.sectionCard}`}>
          <div className={styles.sectionHeaderBar}>
            <h2>{t('adminDashboard.studentsPageTitle')}</h2>
          </div>
          <label>{t('adminDashboard.titleLabel')}</label>
          <input
            value={studentsPage.title}
            onChange={(e) => setStudentsPage((s) => (s ? { ...s, title: e.target.value } : s))}
          />
          <label>{t('adminDashboard.subtitleLabel')}</label>
          <input
            value={studentsPage.subtitle}
            onChange={(e) => setStudentsPage((s) => (s ? { ...s, subtitle: e.target.value } : s))}
          />
          <label>{t('adminDashboard.bodyLabel')}</label>
          <textarea
            value={studentsPage.body}
            onChange={(e) => setStudentsPage((s) => (s ? { ...s, body: e.target.value } : s))}
            rows={8}
          />
          <button type="button" onClick={saveStudentsPageData} disabled={saving} className={styles.primaryBtn}>
            {saving ? t('adminDashboard.saving') : t('adminDashboard.saveStudentsPage')}
          </button>
        </section>
      )}

      {tab === 'documents' && (
        <section className={`${styles.section} ${styles.sectionCard}`}>
          <div className={styles.sectionHeaderBar}>
            <h2>{t('adminDashboard.documentsTitle')}</h2>
            <p className={styles.sectionLead}>{t('adminDashboard.documentsSectionLead')}</p>
          </div>
          <button type="button" onClick={createReport} disabled={saving} className={styles.addBtn}>
            {t('adminDashboard.addDocument')}
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
                    {r.title || t('adminDashboard.untitledEvent')} — {t(r.type === 'budgets' ? 'adminDashboard.documentTypeBudgets' : r.type === 'purchases' ? 'adminDashboard.documentTypePurchases' : r.type === 'licenses' ? 'adminDashboard.documentTypeLicenses' : 'adminDashboard.documentTypeOther')}
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
              <div className={`${styles.editor} ${styles.editorPanel}`}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.documentTypeLabel')}</label>
                  <select
                    className={styles.selectInput}
                    value={editingReport.type || 'other'}
                    onChange={(e) =>
                      setEditingReport((r) =>
                        r ? { ...r, type: e.target.value as DocType } : r
                      )
                    }
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
                    onChange={(e) => setEditingReport((r) => (r ? { ...r, title: e.target.value } : r))}
                    placeholder={t('adminDashboard.placeholderTitle')}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.placeholderSummary')}</label>
                  <input
                    className={styles.textInput}
                    value={editingReport.summary}
                    onChange={(e) => setEditingReport((r) => (r ? { ...r, summary: e.target.value } : r))}
                    placeholder={t('adminDashboard.placeholderSummary')}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.placeholderDate')}</label>
                  <input
                    className={styles.textInput}
                    value={editingReport.publishedAt}
                    onChange={(e) => setEditingReport((r) => (r ? { ...r, publishedAt: e.target.value } : r))}
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
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className={styles.uploadInputHidden}
                    />
                    <span className={styles.uploadZoneIcon}>📄</span>
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
                    onChange={(e) => setEditingReport((r) => (r ? { ...r, pdfUrl: e.target.value } : r))}
                    placeholder={t('adminDashboard.placeholderFileLink')}
                  />
                </div>
                <button type="button" onClick={updateReport} disabled={saving} className={styles.primaryBtn}>
                  {t('adminDashboard.saveReport')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'announcements' && (
        <section className={`${styles.section} ${styles.sectionCard}`}>
          <div className={styles.sectionHeaderBar}>
            <h2>{t('adminDashboard.announcementsTitle')}</h2>
            <p className={styles.sectionLead}>{t('adminDashboard.announcementsSectionLead')}</p>
          </div>
          <button type="button" onClick={createAnnouncement} disabled={saving} className={styles.addBtn}>
            {t('adminDashboard.addAnnouncement')}
          </button>
          <div className={styles.listAndEditor}>
            <ul className={styles.reportList}>
              {announcements.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className={editingAnnouncement?.id === a.id ? styles.selected : undefined}
                    onClick={() => setEditingAnnouncement(a)}
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
                    onClick={() => deleteAnnouncement(a.id)}
                    title={t('adminDashboard.delete')}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {editingAnnouncement && (
              <div className={`${styles.editor} ${styles.editorPanel}`}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.announcementTypeLabel')}</label>
                  <select
                    className={styles.selectInput}
                    value={editingAnnouncement.type || 'vacancies'}
                    onChange={(e) =>
                      setEditingAnnouncement((x) =>
                        x ? { ...x, type: e.target.value as AnnType } : x
                      )
                    }
                  >
                    <option value="vacancies">{t('adminDashboard.announcementTypeVacancies')}</option>
                    <option value="admission">{t('adminDashboard.announcementTypeAdmission')}</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.placeholderTitle')}</label>
                  <input
                    className={styles.textInput}
                    value={editingAnnouncement.title}
                    onChange={(e) =>
                      setEditingAnnouncement((x) => (x ? { ...x, title: e.target.value } : x))
                    }
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.placeholderSummary')}</label>
                  <input
                    className={styles.textInput}
                    value={editingAnnouncement.summary}
                    onChange={(e) =>
                      setEditingAnnouncement((x) => (x ? { ...x, summary: e.target.value } : x))
                    }
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.placeholderDate')}</label>
                  <input
                    className={styles.textInput}
                    value={editingAnnouncement.publishedAt}
                    onChange={(e) =>
                      setEditingAnnouncement((x) => (x ? { ...x, publishedAt: e.target.value } : x))
                    }
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.placeholderContent')}</label>
                  <textarea
                    className={styles.textareaInput}
                    value={editingAnnouncement.content}
                    onChange={(e) =>
                      setEditingAnnouncement((x) => (x ? { ...x, content: e.target.value } : x))
                    }
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
                      onChange={handleAnnouncementPdfUpload}
                      disabled={uploadingPdf}
                      className={styles.uploadInputHidden}
                    />
                    <span className={styles.uploadZoneIcon}>📎</span>
                    <span className={styles.uploadZoneText}>{t('adminDashboard.choosePdf')}</span>
                  </label>
                  {uploadingPdf && <span className={styles.uploading}>{t('adminDashboard.uploading')}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>{t('adminDashboard.orFileLink')}</label>
                  <input
                    className={styles.textInput}
                    type="url"
                    value={editingAnnouncement.pdfUrl ?? ''}
                    onChange={(e) =>
                      setEditingAnnouncement((x) => (x ? { ...x, pdfUrl: e.target.value } : x))
                    }
                  />
                </div>
                <button type="button" onClick={updateAnnouncement} disabled={saving} className={styles.primaryBtn}>
                  {t('adminDashboard.saveAnnouncement')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'events' && (
        <section className={`${styles.section} ${styles.sectionCard}`}>
          <div className={styles.sectionHeaderBar}>
            <h2>{t('adminDashboard.eventsTitle')}</h2>
          </div>
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
                <button type="button" onClick={updateEvent} disabled={saving} className={styles.primaryBtn}>
                  {t('adminDashboard.saveEvent')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'teachers' && (
        <section className={`${styles.section} ${styles.sectionCard}`}>
          <div className={styles.sectionHeaderBar}>
            <h2>{t('adminDashboard.teachersTitle')}</h2>
          </div>
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
                <button type="button" onClick={updateTeacher} disabled={saving} className={styles.primaryBtn}>
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

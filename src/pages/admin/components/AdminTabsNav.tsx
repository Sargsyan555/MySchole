import { useTranslation } from 'react-i18next';
import type { Tab } from '../types';
import styles from '../Admin.module.css';

const TAB_KEYS: Tab[] = ['about', 'documents', 'announcements', 'teachers', 'events'];

type Props = {
  tab: Tab;
  onTab: (t: Tab) => void;
};

export function AdminTabsNav({ tab, onTab }: Props) {
  const { t } = useTranslation();

  return (
    <nav className={styles.tabs}>
      {TAB_KEYS.map((tabKey) => (
        <button
          key={tabKey}
          type="button"
          className={tab === tabKey ? styles.tabActive : styles.tab}
          onClick={() => onTab(tabKey)}
        >
          {tabKey === 'about' && t('adminDashboard.tabAbout')}
          {tabKey === 'documents' && t('adminDashboard.tabDocuments')}
          {tabKey === 'announcements' && t('adminDashboard.tabAnnouncements')}
          {tabKey === 'teachers' && t('adminDashboard.tabTeachers')}
          {tabKey === 'events' && t('adminDashboard.tabEvents')}
        </button>
      ))}
    </nav>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminLogin } from '../../api';
import styles from './Admin.module.css';

export default function AdminLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminLogin.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>{t('adminLogin.title')}</h1>
        <p className={styles.hint}>{t('adminLogin.hint')}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('adminLogin.emailPlaceholder')}
            autoFocus
            disabled={loading}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('adminLogin.passwordPlaceholder')}
            disabled={loading}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? t('adminLogin.loggingIn') : t('adminLogin.logIn')}
          </button>
        </form>
      </div>
    </div>
  );
}

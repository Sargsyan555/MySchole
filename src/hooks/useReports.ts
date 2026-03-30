import { useEffect, useState } from 'react';
import { getReports } from '../api';

export type Report = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  pdfUrl?: string;
};

const PDF_FALLBACK_URL =
  'https://haykadzor.schoolsite.am/wp-content/uploads/sites/872/2017/02/%D5%A2%D5%B5%D5%B8%D6%82%D5%BB%D5%A5-2018-%D5%B6%D5%A1%D5%AD%D5%B6%D5%A1%D5%AF%D5%A1%D5%B6.pdf';

export const PLACEHOLDER_REPORTS: Report[] = [
  { id: '1', title: 'Հաշվետվություն 1', pdfUrl: PDF_FALLBACK_URL, summary: '', publishedAt: '' },
  { id: '2', title: 'Հաշվետվություն 2', pdfUrl: PDF_FALLBACK_URL, summary: '', publishedAt: '' },
  { id: '3', title: 'Հաշվետվություն 3', pdfUrl: PDF_FALLBACK_URL, summary: '', publishedAt: '' },
];

export { PDF_FALLBACK_URL as PDF_FALLBACK_URL_EXPORT };

/**
 * Fetches reports from the API (same data as admin dashboard).
 * Falls back to placeholder when API fails.
 */
export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReports()
      .then((all: Report[]) =>
        all
          .slice()
          .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
      )
      .then(setReports)
      .catch(() => {
        setError(null);
        setReports(PLACEHOLDER_REPORTS);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    reports,
    loading,
    error,
  };
}

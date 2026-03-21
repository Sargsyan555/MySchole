import { useEffect, useState } from 'react';
import { getReports } from '../api';

export type DocumentType = 'budgets' | 'purchases' | 'licenses' | 'other';

export type Document = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  pdfUrl?: string;
  type?: DocumentType;
};

/**
 * Fetches documents filtered by type (budgets, purchases, licenses, other).
 * Uses the reports API and filters client-side by type.
 */
export function useDocuments(type: DocumentType) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReports()
      .then((all: Document[]) => {
        const filtered = all
          .filter((d) => (d.type || 'other') === type)
          .slice()
          .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
        setDocuments(filtered);
      })
      .catch(() => {
        setError(null);
        setDocuments([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  return {
    documents,
    loading,
    error,
  };
}

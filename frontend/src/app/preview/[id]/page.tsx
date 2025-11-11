'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fileReportService } from '@/services/file-report.service';
import { ArrowLeft, Download } from 'lucide-react';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const id = params.id as string;
        const report = await fileReportService.get(id);

        if (!report) {
          setError('Rapport introuvable');
          return;
        }

        // Get the HTML from localStorage or generate it from template
        const savedContent = localStorage.getItem('crmep-report-data');
        if (savedContent) {
          const data = JSON.parse(savedContent);
          // Load template and populate
          const { templateParser } = await import('@/services/template-parser');
          const templateHTML = await templateParser.loadTemplate();
          const populatedHTML = templateParser.populateTemplate(templateHTML, data);
          setHtmlContent(populatedHTML);
        } else {
          // Fallback: show a message or empty template
          setError('Aucune donnée de rapport disponible');
        }
      } catch (err) {
        setError('Erreur lors du chargement du rapport');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [params.id]);

  const handleDownload = () => {
    if (!htmlContent) return;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CR-MEP-${params.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger HTML</span>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            srcDoc={htmlContent}
            className="w-full"
            style={{ height: 'calc(100vh - 120px)', border: 'none' }}
            title="Aperçu du rapport"
          />
        </div>
      </div>
    </div>
  );
}

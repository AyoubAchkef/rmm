'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Eye } from 'lucide-react';
import { templateParser } from '@/services/template-parser';

export function TemplatePreview() {
  const { theme } = useTheme();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadAndPopulateTemplate = async () => {
      try {
        setIsLoading(true);

        // Load template
        const templateHTML = await templateParser.loadTemplate();

        // Get data from localStorage
        const savedData = localStorage.getItem('crmep-report-data');
        let reportData = templateParser.getDefaultData();

        if (savedData) {
          const parsed = JSON.parse(savedData);
          reportData = { ...reportData, ...parsed };
        }

        // Populate template
        const populated = templateParser.populateTemplate(templateHTML, reportData);
        setHtmlContent(populated);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load template:', error);
        setIsLoading(false);
      }
    };

    loadAndPopulateTemplate();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      loadAndPopulateTemplate();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event from same window
    const handleLocalUpdate = (e: CustomEvent) => {
      loadAndPopulateTemplate();
    };

    window.addEventListener('template-data-updated' as any, handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('template-data-updated' as any, handleLocalUpdate);
    };
  }, []);

  // Adjust iframe height based on content
  useEffect(() => {
    const adjustIframeHeight = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const iframeDoc = iframeRef.current.contentWindow.document;
          const height = iframeDoc.documentElement.scrollHeight;
          iframeRef.current.style.height = `${height}px`;
        } catch (e) {
          // Fallback if we can't access iframe content - silently ignore
        }
      }
    };

    if (!isLoading && htmlContent && iframeRef.current) {
      // Wait for iframe to load content
      const iframe = iframeRef.current;
      iframe.onload = () => {
        adjustIframeHeight();
      };
      // Also adjust immediately in case it's already loaded
      setTimeout(adjustIframeHeight, 100);

      // Listen for window resize to re-adjust height
      const handleResize = () => {
        setTimeout(adjustIframeHeight, 100);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [htmlContent, isLoading]);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)',
        }}
      >
        <Eye className="w-4 h-4" style={{ color: '#CC9F53' }} />
        <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          Prévisualisation
        </h3>
      </div>

      {/* Preview Content */}
      <div
        className="flex-1 overflow-auto elegant-scrollbar"
        style={{ background: 'rgba(0, 0, 0, 0.05)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: '#CC9F53', borderTopColor: 'transparent' }}
              />
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Chargement du template...
              </p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="bg-white w-full"
            style={{
              border: 'none',
              display: 'block',
              minHeight: '500px',
            }}
            title="Template Preview"
            sandbox="allow-same-origin allow-scripts"
            scrolling="no"
          />
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Silk from '@/components/ui/silk';
import GlassSurface from '@/components/ui/glass-surface';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { ReportTopBar } from '@/components/report/report-top-bar';
import { TemplateEditor } from '@/components/report/template-editor';
import { TemplatePreview } from '@/components/report/template-preview';
import { ReportRightSidebar } from '@/components/report/report-right-sidebar';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { templateParser } from '@/services/template-parser';
import { fileReportService } from '@/services/file-report.service';
import type { ReportDTO } from '@/types/api';

export default function CreateCRMEPPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Nettoyer le localStorage quand on arrive sur la page de création
  useEffect(() => {
    // Supprimer les anciennes données
    localStorage.removeItem('crmep-report-data');

    // Forcer le rechargement du TemplateEditor avec des données vides
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('force-reload-template-data'));
    }, 100);
  }, []);

  const handleDataChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const savedContent = localStorage.getItem('crmep-report-data');

      if (!savedContent) {
        toast.error('Aucune donnée à sauvegarder', {
          duration: 3000,
          position: 'bottom-right',
        });
        return;
      }

      const reportData = templateParser.migrateOldDataFormat(JSON.parse(savedContent));

      // Load template and populate it
      const templateHTML = await templateParser.loadTemplate();
      const populatedHTML = templateParser.populateTemplate(templateHTML, reportData);

      // Prepare request payload for file system
      const deploymentDate = reportData.deployment_date || reportData.date_deploiement;
      const requestData: any = {
        package: reportData.package_version || 'Unknown',
        sprint: reportData.sprint || 'Unknown',
        createdBy: 'User',
        tags: [],
        data: reportData,
        templateHtml: populatedHTML,
      };

      // Only add deploymentDate if it has a valid value, and convert to ISO format
      if (deploymentDate && deploymentDate.trim() !== '') {
        try {
          // Try to parse the date and convert to ISO format (YYYY-MM-DD)
          const parsedDate = new Date(deploymentDate);
          if (!isNaN(parsedDate.getTime())) {
            requestData.deploymentDate = parsedDate.toISOString();
          }
        } catch (error) {
          console.warn('Invalid deployment date format:', deploymentDate);
        }
      }

      console.log('Request data being sent:', {
        package: requestData.package,
        sprint: requestData.sprint,
        deploymentDate: requestData.deploymentDate,
        hasDeploymentDate: 'deploymentDate' in requestData,
        dataKeys: Object.keys(requestData.data || {}),
        templateHtmlLength: requestData.templateHtml?.length,
      });

      if (currentReportId) {
        // Update existing report
        const loadingToast = toast.loading('Mise à jour du rapport...', {
          position: 'bottom-right',
        });

        const savedReport = await fileReportService.update(currentReportId, {
          data: reportData,
          templateHtml: populatedHTML,
          updatedBy: 'User',
        });

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        toast.success(`Rapport mis à jour (v${savedReport.version})`, {
          duration: 2000,
          position: 'bottom-right',
          style: {
            background: '#1C355E',
            color: '#FFFFFF',
            border: '1px solid rgba(204, 159, 83, 0.3)',
          },
          iconTheme: {
            primary: '#CC9F53',
            secondary: '#FFFFFF',
          },
        });
      } else {
        // Create new report
        const loadingToast = toast.loading('Sauvegarde du rapport...', {
          position: 'bottom-right',
        });

        const savedReport = await fileReportService.create(requestData);
        setCurrentReportId(savedReport.id);

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success toast
        toast.success(
          `Rapport sauvegardé avec succès!`,
          {
            duration: 2000,
            position: 'bottom-right',
            style: {
              background: '#1C355E',
              color: '#FFFFFF',
              border: '1px solid rgba(204, 159, 83, 0.3)',
            },
            iconTheme: {
              primary: '#CC9F53',
              secondary: '#FFFFFF',
            },
          }
        );

        // Wait a bit before redirect to ensure toast is visible
        setTimeout(() => {
          router.push(`/cr-mep/edit/${savedReport.id}`);
        }, 500);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error(
        `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          duration: 4000,
          position: 'bottom-right',
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'html') => {
    const savedContent = localStorage.getItem('crmep-report-data');

    try {
      // Load the original template
      toast.loading('Chargement du template...', {
        duration: 2000,
        position: 'bottom-right',
      });

      const templateHTML = await templateParser.loadTemplate();

      // Get saved data or use defaults
      let reportData = templateParser.getDefaultData();
      if (savedContent) {
        const parsed = templateParser.migrateOldDataFormat(JSON.parse(savedContent));
        reportData = { ...reportData, ...parsed };
      }

      // Populate template with data
      const populatedHTML = templateParser.populateTemplate(templateHTML, reportData);

      if (format === 'html') {
        // Export as HTML
        const blob = new Blob([populatedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CR-MEP-${reportData.package_version}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Export HTML réussi !', {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: '#1C355E',
            color: '#FFFFFF',
            border: '1px solid rgba(204, 159, 83, 0.3)',
          },
          iconTheme: {
            primary: '#CC9F53',
            secondary: '#FFFFFF',
          },
        });
      } else if (format === 'pdf') {
        // Dynamically import html2pdf for client-side only
        const html2pdf = (await import('html2pdf.js')).default;

        // Export as PDF
        toast.loading('Génération du PDF en cours...', {
          duration: 3000,
          position: 'bottom-right',
        });

        const element = document.createElement('div');
        element.innerHTML = populatedHTML;
        element.style.width = '210mm'; // A4 width
        document.body.appendChild(element);

        const opt = {
          margin: [10, 10, 10, 10],
          filename: `CR-MEP-${reportData.package_version}-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 1200
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf().set(opt).from(element).save().then(() => {
          document.body.removeChild(element);
          toast.success('Export PDF réussi !', {
            duration: 3000,
            position: 'bottom-right',
            style: {
              background: '#1C355E',
              color: '#FFFFFF',
              border: '1px solid rgba(204, 159, 83, 0.3)',
            },
            iconTheme: {
              primary: '#CC9F53',
              secondary: '#FFFFFF',
            },
          });
        }).catch((err: Error) => {
          document.body.removeChild(element);
          console.error('PDF generation error:', err);
          toast.error('Erreur lors de la génération du PDF', {
            duration: 3000,
            position: 'bottom-right',
          });
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Erreur lors de l'export: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 4000,
        position: 'bottom-right',
      });
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handlePreview = async () => {
    try {
      const savedContent = localStorage.getItem('crmep-report-data');

      if (!savedContent) {
        toast.error('Aucune donnée à prévisualiser', {
          duration: 3000,
          position: 'bottom-right',
        });
        return;
      }

      const reportData = templateParser.migrateOldDataFormat(JSON.parse(savedContent));

      // Load template and populate it
      const templateHTML = await templateParser.loadTemplate();
      const populatedHTML = templateParser.populateTemplate(templateHTML, reportData);

      // Open in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(populatedHTML);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(`Erreur lors de l'aperçu: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 4000,
        position: 'bottom-right',
      });
    }
  };

  const handleAIPrompt = (prompt: string) => {
    // TODO: Implement AI prompt functionality
  };

  const handleFileUpload = (files: File[]) => {
    // TODO: Implement file upload functionality
  };

  const handleAddLink = (url: string, title: string) => {
    // TODO: Implement link addition functionality
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Silk Animation */}
      <div className="absolute inset-0 w-full h-full">
        <Silk
          speed={5}
          scale={1}
          color={theme === 'dark' ? '#1C355E' : '#D6D1CA'}
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Glass Surface Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <GlassSurface
          width="calc(100% - 4rem)"
          height="calc(100vh - 4rem)"
          borderRadius={32}
          blur={25}
          opacity={0.12}
          brightness={100}
          backgroundOpacity={0.08}
          displace={2}
          className="glass-dashboard"
          style={{ backdropFilter: 'blur(12px) saturate(1.5)', position: 'relative' }}
        >
          {/* Dashboard Sidebar */}
          <DashboardSidebar onExpandChange={setIsSidebarExpanded} />

          {/* Main Content */}
          <div
            className="w-full h-full flex flex-col transition-all duration-300 ease-out"
            style={{
              paddingLeft: isSidebarExpanded ? '256px' : '80px',
            }}
          >
            {/* Dashboard Header */}
            <DashboardHeader />

            {/* Report Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <ReportTopBar
                title={t('report.title')}
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={handleSave}
                onExport={handleExport}
                onShare={handleShare}
                onPreview={handlePreview}
              />

              {/* 3-Column Layout */}
              <div className="flex-1 flex overflow-hidden gap-4 p-4">
                {/* Left: Template Editor Column */}
                <div
                  className="w-96 h-full overflow-hidden rounded-2xl border elegant-scrollbar"
                  style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    borderColor: theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <TemplateEditor onDataChange={handleDataChange} />
                </div>

                {/* Center: Preview Container */}
                <div
                  className="flex-1 h-full min-w-0 min-h-0 overflow-hidden rounded-2xl border"
                  style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    borderColor: theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <TemplatePreview />
                </div>

                {/* Right: AI + Tools Sidebar */}
                <div
                  className="w-96 h-full overflow-hidden rounded-2xl border"
                  style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    borderColor: theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <ReportRightSidebar
                    onAIPrompt={handleAIPrompt}
                    onFileUpload={handleFileUpload}
                    onAddLink={handleAddLink}
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassSurface>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Silk from '@/components/ui/silk';
import GlassSurface from '@/components/ui/glass-surface';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DocumentsHeader } from '@/components/documents/documents-header';
import { DocumentsTabs, DocumentTab } from '@/components/documents/documents-tabs';
import { DocumentsTableHeader } from '@/components/documents/documents-table-header';
import { DocumentListItem, Document } from '@/components/documents/document-list-item';
import { DocumentsEmpty } from '@/components/documents/documents-empty';
import { Toast, ToastType } from '@/components/ui/toast';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { fileReportService, ReportMetadata } from '@/services/file-report.service';

type SortOption = 'dateDesc' | 'dateAsc' | 'titleAsc' | 'titleDesc';

export default function DocumentsPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dateDesc');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; documentId: string; title: string }>({
    isOpen: false,
    documentId: '',
    title: '',
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents from API
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const reports = await fileReportService.list();

        // Convert ReportMetadata to Document format
        const docs: Document[] = reports.map((report) => ({
          id: report.id,
          title: `CR MEP ${report.package} - ${report.sprint}`,
          type: 'cr-mep' as const,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt),
          createdBy: report.createdBy,
        }));

        setDocuments(docs);
      } catch (error) {
        showToast('Erreur lors du chargement des documents', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (activeTab !== 'all') {
      filtered = filtered.filter((doc) => doc.type === activeTab);
    }

    if (debouncedSearch) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'dateDesc':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'dateAsc':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'titleDesc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [activeTab, debouncedSearch, sortBy, documents]);

  // Count documents per tab
  const tabCounts: Record<DocumentTab, number> = {
    all: documents.length,
    'cr-mep': documents.filter((d) => d.type === 'cr-mep').length,
    'cr-post-mep': documents.filter((d) => d.type === 'cr-post-mep').length,
    'sprint-review': documents.filter((d) => d.type === 'sprint-review').length,
    presentation: documents.filter((d) => d.type === 'presentation').length,
  };

  // Handlers
  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const handleCreateDocument = useCallback((type: string) => {
    // Map document types to their creation routes
    const routeMap: Record<string, string> = {
      'cr-mep': '/cr-mep/create',
      'cr-post-mep': '/cr-post-mep/create',
      'sprint-review': '/sprint-review/create',
      'presentation': '/presentation/create',
    };

    const route = routeMap[type];
    if (route) {
      router.push(route);
    }
  }, [router]);

  const handleViewDocument = useCallback((id: string) => {
    // Open preview in a new tab
    window.open(`/preview/${id}`, '_blank');
  }, []);

  const handleEditDocument = useCallback((id: string) => {
    // Find the document to determine its type
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    // Map document types to their edit routes
    const routeMap: Record<string, string> = {
      'cr-mep': `/cr-mep/edit/${id}`,
      'cr-post-mep': `/cr-post-mep/edit/${id}`,
      'sprint-review': `/sprint-review/edit/${id}`,
      'presentation': `/presentation/edit/${id}`,
    };

    const route = routeMap[doc.type];
    if (route) {
      router.push(route);
    }
  }, [documents, router]);

  const handleDownloadDocument = useCallback((id: string) => {
    // TODO: Implement download document functionality
    showToast(t('documents.notifications.downloaded'), 'success');
  }, [showToast, t]);

  const handleDeleteDocument = useCallback((id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setDeleteModal({
        isOpen: true,
        documentId: id,
        title: doc.title,
      });
    }
  }, [documents]);

  const confirmDelete = useCallback(async () => {
    try {
      await fileReportService.delete(deleteModal.documentId);

      // Remove document from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteModal.documentId));

      showToast(t('documents.notifications.deleted'), 'success');
      setDeleteModal({ isOpen: false, documentId: '', title: '' });
    } catch (error) {
      showToast(
        `Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }, [deleteModal.documentId, showToast, t]);

  const cancelDelete = useCallback(() => {
    setDeleteModal({ isOpen: false, documentId: '', title: '' });
  }, []);

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
          {/* Sidebar */}
          <DashboardSidebar onExpandChange={setIsSidebarExpanded} />

          {/* Main Content */}
          <div
            className="w-full h-full flex flex-col transition-all duration-300 ease-out"
            style={{
              paddingLeft: isSidebarExpanded ? '256px' : '80px',
            }}
          >
            {/* Header */}
            <DashboardHeader />

            {/* Main Content Area */}
            <div className="flex-1 px-8 pb-6 flex flex-col overflow-auto scrollbar-thin">
              {/* Documents Header */}
              <DocumentsHeader
                onSearch={setSearchQuery}
                onCreateDocument={handleCreateDocument}
              />

              {/* Tabs */}
              <DocumentsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={tabCounts}
              />

              {/* Documents List or Empty State */}
              {filteredDocuments.length === 0 ? (
                <DocumentsEmpty
                  onCreateDocument={handleCreateDocument}
                  searchQuery={debouncedSearch}
                />
              ) : (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(28, 53, 94, 0.05)'}`,
                  }}
                >
                  {/* Table Header */}
                  <DocumentsTableHeader
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />

                  {/* Documents List */}
                  {filteredDocuments.map((document) => (
                    <DocumentListItem
                      key={document.id}
                      document={document}
                      onView={handleViewDocument}
                      onEdit={handleEditDocument}
                      onDownload={handleDownloadDocument}
                      onDelete={handleDeleteDocument}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassSurface>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

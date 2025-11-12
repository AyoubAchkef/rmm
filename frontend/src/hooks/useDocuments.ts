/**
 * Documents Hook
 * Optimized hook for managing documents with caching and memoization
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export type DocumentType = 'cr-mep' | 'cr-mep-template' | 'test-plan' | 'test-report' | 'presentation';
export type DocumentTab = 'all' | 'cr-mep' | 'tests' | 'presentations';
export type SortOption = 'dateDesc' | 'dateAsc' | 'nameAsc' | 'nameDesc';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  size: string;
  status: 'draft' | 'published' | 'archived';
  version?: string;
  package?: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dateDesc');

  // Debounce search query for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load documents from API
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reports');
        
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Filter and sort documents (memoized for performance)
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'cr-mep') {
        filtered = filtered.filter(doc => doc.type === 'cr-mep' || doc.type === 'cr-mep-template');
      } else if (activeTab === 'tests') {
        filtered = filtered.filter(doc => doc.type === 'test-plan' || doc.type === 'test-report');
      } else if (activeTab === 'presentations') {
        filtered = filtered.filter(doc => doc.type === 'presentation');
      }
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.package?.toLowerCase().includes(query) ||
        doc.version?.toLowerCase().includes(query)
      );
    }

    // Sort documents
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'dateDesc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'dateAsc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'nameAsc':
          return a.title.localeCompare(b.title);
        case 'nameDesc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [documents, activeTab, debouncedSearch, sortBy]);

  // Delete document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }, []);

  return {
    documents: filteredDocuments,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    deleteDocument,
  };
}

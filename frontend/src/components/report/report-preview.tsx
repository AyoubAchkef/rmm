'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { Eye, Edit3, Code } from 'lucide-react';
import { TiptapEditor } from './tiptap-editor';
import toast from 'react-hot-toast';

interface ReportPreviewProps {
  activeSection: string | null;
  content?: string;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  onContentChange?: (hasChanges: boolean) => void;
}

export function ReportPreview({
  activeSection,
  content,
  isEditing = false,
  onToggleEdit,
  onContentChange
}: ReportPreviewProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const initialContentRef = useRef<Record<string, string> | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Editable content state for each section
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({
    hero: `<h1 style="text-align: center;">${t('report.content.hero.title')}</h1><h2 style="text-align: center; color: #CC9F53;">Package 12.0.7</h2><p style="text-align: center;">CRM Ariane - Rothschild & Co</p>`,
    synthese: `<h2>${t('report.content.synthese.title')}</h2><p>Cette section contient les métriques principales du sprint.</p>`,
    bilan: `<h2>${t('report.content.bilan.title')}</h2><p>${t('report.content.bilan.summary')}</p>`,
    metriques: `<h2>Métriques du Sprint</h2><p>Analyse des indicateurs clés de performance du sprint.</p><ul><li>Vélocité de l'équipe</li><li>Temps de cycle moyen</li><li>Taux de complétion</li></ul>`,
    defauts: `<h2>Défauts et Incidents</h2><p>Liste des anomalies détectées et leur résolution.</p><ul><li>Défauts critiques: 0</li><li>Défauts majeurs: 2</li><li>Défauts mineurs: 5</li></ul>`,
    'user-stories': `<h2>User Stories</h2><p>Récapitulatif des user stories traitées durant le sprint.</p><ul><li>US complétées: 42/45</li><li>US en cours: 3</li><li>US bloquées: 0</li></ul>`,
    'plan-test': `<h2>Plan de Test</h2><p>Stratégie de test et couverture fonctionnelle.</p><ul><li>Tests unitaires: 95%</li><li>Tests d'intégration: 85%</li><li>Tests end-to-end: 70%</li></ul>`,
    'validation-business': `<h2>Validation Business</h2><p>Validation des livrables par les parties prenantes.</p><ul><li>Recette fonctionnelle: ✓</li><li>Validation utilisateurs: ✓</li><li>Approbation métier: En cours</li></ul>`,
    'bilan-recommandations': `<h2>Bilan & Recommandations</h2><p>Synthèse et axes d'amélioration pour les prochains sprints.</p><ul><li>Améliorer la documentation technique</li><li>Renforcer les tests automatisés</li><li>Optimiser le processus de code review</li></ul>`,
    conclusion: `<h2>Conclusion</h2><p>Le sprint s'est déroulé avec succès, avec un taux de complétion de 93%. L'équipe a démontré une excellente capacité d'adaptation face aux défis techniques rencontrés.</p>`,
  });

  const handleContentChange = (section: string, newContent: string) => {
    setSectionContent((prev) => ({
      ...prev,
      [section]: newContent,
    }));
  };

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('crmep-report-content');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setSectionContent(parsed);
        initialContentRef.current = parsed;
      } catch (e) {
        console.error('Failed to parse saved content', e);
      }
    } else {
      initialContentRef.current = sectionContent;
    }
  }, []);

  // Detect content changes and notify parent
  useEffect(() => {
    if (initialContentRef.current) {
      const hasChanges = JSON.stringify(sectionContent) !== JSON.stringify(initialContentRef.current);
      onContentChange?.(hasChanges);
    }
  }, [sectionContent, onContentChange]);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      localStorage.setItem('crmep-report-content', JSON.stringify(sectionContent));
      toast.success('Sauvegarde automatique effectuée', {
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
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [sectionContent]);

  // Mock content for each section
  const getMockContent = (sectionId: string | null) => {
    switch (sectionId) {
      case 'hero':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent.hero || ''}
              onChange={(newContent) => handleContentChange('hero', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="text-center py-16">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
              {t('report.content.hero.title')}
            </h1>
            <h2 className="text-3xl mb-8" style={{ color: '#CC9F53' }}>
              {t('report.content.hero.package')} <span className="font-semibold">12.0.7</span>
            </h2>
            <div className="inline-block px-6 py-2 rounded-full" style={{ background: 'rgba(204, 159, 83, 0.2)' }}>
              <span className="text-sm" style={{ color: '#CC9F53' }}>
                {t('report.content.hero.crm')}
              </span>
            </div>
          </div>
        );

      case 'synthese':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent.synthese || ''}
              onChange={(newContent) => handleContentChange('synthese', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1F6699' }}>
              {t('report.content.synthese.title')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t('report.content.synthese.usCompleted'), value: '42', unit: '/ 45', color: '#10b981' },
                { label: t('report.content.synthese.totalUS'), value: '45', unit: t('report.content.synthese.stories'), color: '#1F6699' },
                { label: t('report.content.synthese.defectsResolved'), value: '18', unit: '/ 20', color: '#6E9966' },
                { label: t('report.content.synthese.testsValidated'), value: '95', unit: '%', color: '#CC9F53' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                    <span className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {stat.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bilan':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent.bilan || ''}
              onChange={(newContent) => handleContentChange('bilan', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1F6699' }}>
              {t('report.content.bilan.title')}
            </h2>
            <div
              className="p-6 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {t('report.content.bilan.summary')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#10b981' }}>
                  {t('report.content.bilan.positives')}
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <li>• {t('report.content.bilan.positivesList.deployment')}</li>
                  <li>• {t('report.content.bilan.positivesList.performance')}</li>
                  <li>• {t('report.content.bilan.positivesList.validation')}</li>
                </ul>
              </div>

              <div
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#eab308' }}>
                  {t('report.content.bilan.concerns')}
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <li>• {t('report.content.bilan.concernsList.monitoring')}</li>
                  <li>• {t('report.content.bilan.concernsList.defects')}</li>
                  <li>• {t('report.content.bilan.concernsList.training')}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'metriques':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent.metriques || ''}
              onChange={(newContent) => handleContentChange('metriques', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent.metriques }} />
        );

      case 'defauts':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent.defauts || ''}
              onChange={(newContent) => handleContentChange('defauts', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent.defauts }} />
        );

      case 'user-stories':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent['user-stories'] || ''}
              onChange={(newContent) => handleContentChange('user-stories', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent['user-stories'] }} />
        );

      case 'plan-test':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent['plan-test'] || ''}
              onChange={(newContent) => handleContentChange('plan-test', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent['plan-test'] }} />
        );

      case 'validation-business':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent['validation-business'] || ''}
              onChange={(newContent) => handleContentChange('validation-business', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent['validation-business'] }} />
        );

      case 'bilan-recommandations':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent['bilan-recommandations'] || ''}
              onChange={(newContent) => handleContentChange('bilan-recommandations', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent['bilan-recommandations'] }} />
        );

      case 'conclusion':
        if (isEditing) {
          return (
            <TiptapEditor
              content={sectionContent.conclusion || ''}
              onChange={(newContent) => handleContentChange('conclusion', newContent)}
              placeholder={t('report.ai.placeholder')}
              editable={true}
            />
          );
        }
        return (
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: sectionContent.conclusion }} />
        );

      default:
        return (
          <div className="text-center py-16">
            <Eye className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {activeSection ? t('report.previewSection.inDevelopment') : t('report.previewSection.selectSection')}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
              {activeSection
                ? t('report.previewSection.inDevelopmentDesc')
                : t('report.previewSection.selectSectionDesc')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4" style={{ color: '#CC9F53' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            {t('report.previewSection.title')}
          </h3>
          {activeSection && (
            <span
              className="px-2 py-1 rounded text-xs"
              style={{
                background: 'rgba(204, 159, 83, 0.15)',
                color: '#CC9F53',
              }}
            >
              {activeSection}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEdit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: isEditing ? '#CC9F53' : 'rgba(255, 255, 255, 0.05)',
              color: isEditing ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
              border: `1px solid ${isEditing ? '#CC9F53' : 'rgba(255, 255, 255, 0.1)'}`,
            }}
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? t('report.editMode') : t('report.edit')}</span>
          </button>

          <button
            className="p-1.5 rounded-lg transition-all duration-150"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="flex-1 overflow-y-auto p-8 scrollbar-thin"
        style={{
          background: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Report Content Container */}
        <div
          className="max-w-4xl mx-auto rounded-xl p-12 shadow-2xl"
          style={{
            background: theme === 'dark' ? 'rgba(28, 53, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(28, 53, 94, 0.1)'}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {getMockContent(activeSection)}
        </div>
      </div>
    </div>
  );
}

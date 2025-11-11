'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { CRMEPData, templateParser } from '@/services/template-parser';
import { TiptapEditor } from './tiptap-editor';
import { MultiSelect } from './multi-select';
import RichTextEditor from '@/components/common/RichTextEditor';
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  MapPin,
  Sparkles,
  Wrench,
  Bug,
  Rocket,
  CheckCircle2,
  Target,
  TestTube,
  RotateCcw,
  Briefcase,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Package
} from 'lucide-react';

interface TemplateEditorProps {
  onDataChange?: (data: Partial<CRMEPData>) => void;
}

export function TemplateEditor({ onDataChange }: TemplateEditorProps) {
  const { theme } = useTheme();
  const [data, setData] = useState<CRMEPData>(templateParser.getDefaultData());
  const [linksExpanded, setLinksExpanded] = useState(false);

  // Keep track of the previous data to prevent unnecessary updates
  const previousDataRef = useRef<string>('');
  // Track if we've loaded data from localStorage to prevent saving empty data on mount
  const hasLoadedRef = useRef<boolean>(false);
  // Track if this is the first render to prevent saving on initial mount
  const isFirstRenderRef = useRef<boolean>(true);

  // Function to load data from localStorage
  const loadDataFromLocalStorage = () => {
    console.log('[TemplateEditor] Loading data from localStorage...');
    const saved = localStorage.getItem('crmep-report-data');
    console.log('[TemplateEditor] Raw localStorage data:', saved ? saved.substring(0, 200) : 'null');
    if (saved) {
      try {
        const parsed = templateParser.migrateOldDataFormat(JSON.parse(saved));
        console.log('[TemplateEditor] Parsed data:', { package_version: parsed.package_version, sprint: parsed.sprint, date_deploiement: parsed.date_deploiement });
        // Merge with defaults to ensure new fields are added
        const defaults = templateParser.getDefaultData();
        const merged = { ...defaults, ...parsed };
        console.log('[TemplateEditor] Merged data:', { package_version: merged.package_version, sprint: merged.sprint, date_deploiement: merged.date_deploiement });
        // IMPORTANT: Set refs BEFORE calling setData to prevent save effect from triggering
        previousDataRef.current = JSON.stringify(merged);
        hasLoadedRef.current = true;
        setData(merged);
        console.log('[TemplateEditor] Data loaded successfully');
      } catch (e) {
        console.error('Failed to load saved data:', e);
        hasLoadedRef.current = true;
      }
    } else {
      console.log('[TemplateEditor] No saved data found, using defaults');
      // Initialize with default data
      const defaults = templateParser.getDefaultData();
      previousDataRef.current = JSON.stringify(defaults);
      hasLoadedRef.current = true;
      setData(defaults);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    console.log('[TemplateEditor] Component mounted, loading data...');
    loadDataFromLocalStorage();
  }, []);

  // Listen for force reload events from edit page
  useEffect(() => {
    const handleForceReload = () => {
      console.log('[TemplateEditor] Force reload event received');
      loadDataFromLocalStorage();
    };

    console.log('[TemplateEditor] Setting up force-reload event listener');
    window.addEventListener('force-reload-template-data', handleForceReload);

    return () => {
      console.log('[TemplateEditor] Removing force-reload event listener');
      window.removeEventListener('force-reload-template-data', handleForceReload);
    };
  }, []);

  // Update preview in real-time AND save to localStorage - ONLY when data actually changes
  useEffect(() => {
    // Skip on first render (component mount)
    if (isFirstRenderRef.current) {
      console.log('[TemplateEditor] Skipping save - first render');
      isFirstRenderRef.current = false;
      return;
    }

    // Don't save on initial mount before we've loaded data
    if (!hasLoadedRef.current) {
      console.log('[TemplateEditor] Skipping save - data not loaded yet');
      return;
    }

    const currentDataString = JSON.stringify(data);

    // Only update if data has actually changed
    if (currentDataString !== previousDataRef.current) {
      console.log('[TemplateEditor] Data changed, saving to localStorage');
      // Save to localStorage for preview
      localStorage.setItem('crmep-report-data', currentDataString);

      // Only notify parent of changes (for unsaved changes indicator)
      onDataChange?.(data);

      // Dispatch custom event to trigger preview update
      window.dispatchEvent(new CustomEvent('template-data-updated', { detail: data }));

      // Update ref with new data
      previousDataRef.current = currentDataString;
    }
  }, [data, onDataChange]);

  const handleFieldChange = (field: keyof CRMEPData, value: string | number | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-calculate percentages when base values change
  useEffect(() => {
    setData(prev => {
      const calculated: Partial<CRMEPData> = {};

      // Calculate % US Complétées (use nb_user_stories as the total)
      if (prev.nb_user_stories > 0) {
        calculated.pct_us_completees = Math.round((prev.nb_us_completees / prev.nb_user_stories) * 100);
      }

      // Calculate % Tests Réussis
      if (prev.nb_tests_total > 0) {
        calculated.pct_tests_reussis = Math.round((prev.nb_tests_valides / prev.nb_tests_total) * 100);
      }

      // Calculate % Tests Non-Régression
      if (prev.nb_tests_non_regression_total > 0) {
        calculated.pct_tests_non_regression = Math.round((prev.nb_tests_non_regression_reussis / prev.nb_tests_non_regression_total) * 100);
      }

      // Calculate Taux Validation UAT
      if (prev.bs_nb_uat_total > 0) {
        calculated.bs_taux_validation_uat = Math.round((prev.bs_nb_uat_validees / prev.bs_nb_uat_total) * 100);
      }

      // Auto-calculate total defects from criticality breakdown (FIRST)
      calculated.nb_defauts_identifies = (prev.nb_defauts_critical || 0) + (prev.nb_defauts_high || 0) +
                                          (prev.nb_defauts_medium || 0) + (prev.nb_defauts_low || 0);

      // Auto-calculate resolved defects (resolved = closed) (SECOND)
      calculated.nb_defauts_resolus = prev.nb_defauts_closed || 0;

      // Calculate DDR (Defect Detection Rate) - AFTER nb_defauts_identifies is calculated
      if (prev.nb_user_stories > 0 && calculated.nb_defauts_identifies !== undefined) {
        calculated.pct_ddr = Math.round((calculated.nb_defauts_identifies / prev.nb_user_stories) * 100);
      }

      // Calculate Taux de Résolution - AFTER both values are calculated
      if (calculated.nb_defauts_identifies && calculated.nb_defauts_identifies > 0) {
        calculated.taux_resolution = Math.round((calculated.nb_defauts_resolus! / calculated.nb_defauts_identifies) * 100);
      } else {
        calculated.taux_resolution = 0;
      }

      // Calculate Défauts Actifs (identifies - resolus)
      calculated.nb_defauts_actifs = (calculated.nb_defauts_identifies || 0) - (calculated.nb_defauts_resolus || 0);

      return { ...prev, ...calculated };
    });
  }, [
    data.nb_user_stories,
    data.nb_us_completees,
    data.nb_tests_total,
    data.nb_tests_valides,
    data.nb_defauts_critical,
    data.nb_defauts_high,
    data.nb_defauts_medium,
    data.nb_defauts_low,
    data.nb_defauts_closed,
    data.nb_tests_non_regression_total,
    data.nb_tests_non_regression_reussis,
    data.bs_nb_uat_total,
    data.bs_nb_uat_validees
  ]);

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser tous les champs ?')) {
      const emptyData = templateParser.getDefaultData();
      setData(emptyData);
      localStorage.setItem('crmep-report-data', JSON.stringify(emptyData));
      window.dispatchEvent(new CustomEvent('template-data-updated', { detail: emptyData }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(28, 53, 94, 0.25)',
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            Édition du rapport
          </h2>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: '#8A1E41',
              border: '1px solid #8A1E41',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#9A2E51';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8A1E41';
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* All Fields - Scrollable */}
      <div className="flex-1 overflow-y-auto elegant-scrollbar p-6 space-y-8">
        {/* Métadonnées */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <FileText className="w-5 h-5" style={{ color: '#CC9F53' }} />
            <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Métadonnées
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                <Building2 className="w-4 h-4" style={{ color: '#CC9F53' }} />
                Package
              </label>
              <input
                type="text"
                value={data.package_version}
                onChange={(e) => handleFieldChange('package_version', e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                }}
                placeholder="Ex: 12.0.8"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                <FileText className="w-4 h-4" style={{ color: '#CC9F53' }} />
                Sprint
              </label>
              <input
                type="text"
                value={data.sprint}
                onChange={(e) => handleFieldChange('sprint', e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                }}
                placeholder="Ex: 156"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                <Calendar className="w-4 h-4" style={{ color: '#CC9F53' }} />
                Date de Déploiement
              </label>
              <input
                type="text"
                value={data.date_deploiement}
                onChange={(e) => handleFieldChange('date_deploiement', e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                }}
                placeholder="Ex: 30/10/2025"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#CC9F53' }} />
                Statut MEP
              </label>
              <select
                value={data.statut_mep}
                onChange={(e) => handleFieldChange('statut_mep', e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                }}
              >
                <option value="" style={{ background: '#1C355E' }}>Sélectionner un statut</option>
                <option value="En cours de développement" style={{ background: '#1C355E' }}>En cours de développement</option>
                <option value="Tests en cours" style={{ background: '#1C355E' }}>Tests en cours</option>
                <option value="Validation en cours" style={{ background: '#1C355E' }}>Validation en cours</option>
                <option value="Prêt pour MEP" style={{ background: '#1C355E' }}>Prêt pour MEP</option>
                <option value="MEP Réalisée" style={{ background: '#1C355E' }}>MEP Réalisée</option>
                <option value="MEP Reportée" style={{ background: '#1C355E' }}>MEP Reportée</option>
                <option value="Annulé" style={{ background: '#1C355E' }}>Annulé</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  <User className="w-4 h-4" style={{ color: '#CC9F53' }} />
                  Prénom Nom
                </label>
                <input
                  type="text"
                  value={data.prenom_nom}
                  onChange={(e) => handleFieldChange('prenom_nom', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  <Briefcase className="w-4 h-4" style={{ color: '#CC9F53' }} />
                  Fonction
                </label>
                <input
                  type="text"
                  value={data.fonction}
                  onChange={(e) => handleFieldChange('fonction', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#CC9F53' }} />
                  Ville
                </label>
                <input
                  type="text"
                  value={data.ville}
                  onChange={(e) => handleFieldChange('ville', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                  <Users className="w-4 h-4" style={{ color: '#CC9F53' }} />
                  Équipe
                </label>
                <input
                  type="text"
                  value={data.equipe}
                  onChange={(e) => handleFieldChange('equipe', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu Riche */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <FileText className="w-5 h-5" style={{ color: '#CC9F53' }} />
            <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Contenu Riche
            </h3>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#fbbf24' }}>
              <FileText className="w-4 h-4" />
              Synthèse de la Livraison
            </h4>
            <TiptapEditor
              content={data.synthese_livraison}
              onChange={(content) => handleFieldChange('synthese_livraison', content)}
              placeholder="Décrivez la synthèse de la livraison..."
              editable={true}
            />
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#10b981' }}>
              <Sparkles className="w-4 h-4" />
              Nouvelles Fonctionnalités
            </h4>
            <TiptapEditor
              content={data.nouvelles_fonctionnalites}
              onChange={(content) => handleFieldChange('nouvelles_fonctionnalites', content)}
              placeholder="Décrivez les nouvelles fonctionnalités..."
              editable={true}
            />
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#3b82f6' }}>
              <Wrench className="w-4 h-4" />
              Améliorations
            </h4>
            <TiptapEditor
              content={data.ameliorations}
              onChange={(content) => handleFieldChange('ameliorations', content)}
              placeholder="Décrivez les améliorations..."
              editable={true}
            />
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>
              <Bug className="w-4 h-4" />
              Corrections
            </h4>
            <TiptapEditor
              content={data.corrections}
              onChange={(content) => handleFieldChange('corrections', content)}
              placeholder="Listez les corrections apportées..."
              editable={true}
            />
          </div>
        </div>

        {/* Déploiement */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <Rocket className="w-5 h-5" style={{ color: '#CC9F53' }} />
            <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Déploiement
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MultiSelect
              label="Environnements"
              options={['DEV', 'SIT', 'UAT', 'PRE PROD', 'PROD']}
              selected={data.selected_environments || []}
              onChange={(selected) => handleFieldChange('selected_environments', selected)}
              placeholder="Sélectionner les environnements..."
            />

            <MultiSelect
              label="Pays"
              options={['France', 'Belgique', 'Luxembourg', 'Monaco', 'Italie']}
              selected={data.selected_countries || []}
              onChange={(selected) => handleFieldChange('selected_countries', selected)}
              placeholder="Sélectionner les pays..."
            />
          </div>
        </div>

        {/* Bilan de la Livraison - Suivant l'ordre du HTML */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <Target className="w-5 h-5" style={{ color: '#CC9F53' }} />
            <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Bilan de la Livraison
            </h3>
          </div>

          {/* 1. User Stories au Scope (Carte Or) */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(204, 159, 83, 0.25)', border: '1px solid rgba(204, 159, 83, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#CC9F53' }}>
              <CheckCircle2 className="w-4 h-4" />
              User Stories au Scope
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>US Total au Scope</label>
                <input
                  type="number"
                  value={data.nb_user_stories}
                  onChange={(e) => handleFieldChange('nb_user_stories', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>US Complétées</label>
                <input
                  type="number"
                  value={data.nb_us_completees}
                  onChange={(e) => handleFieldChange('nb_us_completees', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                <span>% Complétion</span>
                <span style={{ color: '#CC9F53', fontSize: '10px' }}>(Calculé automatiquement)</span>
              </label>
              <input
                type="number"
                value={data.pct_us_completees}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{
                  background: 'rgba(204, 159, 83, 0.8)',
                  border: '1px solid rgba(204, 159, 83, 0.8)',
                  color: '#CC9F53',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Distribution des User Stories */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(204, 159, 83, 0.8)' }}>
              <h5 className="text-xs font-semibold mb-3" style={{ color: '#CC9F53' }}>Distribution</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>QA Complete</label>
                  <input
                    type="number"
                    value={data.nb_us_qa_complete}
                    onChange={(e) => handleFieldChange('nb_us_qa_complete', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>In Progress</label>
                  <input
                    type="number"
                    value={data.nb_us_in_progress}
                    onChange={(e) => handleFieldChange('nb_us_in_progress', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>UAT Delivered</label>
                  <input
                    type="number"
                    value={data.nb_us_uat_delivered}
                    onChange={(e) => handleFieldChange('nb_us_uat_delivered', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>New</label>
                  <input
                    type="number"
                    value={data.nb_us_new}
                    onChange={(e) => handleFieldChange('nb_us_new', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Technical</label>
                  <input
                    type="number"
                    value={data.nb_us_technical}
                    onChange={(e) => handleFieldChange('nb_us_technical', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Closed</label>
                  <input
                    type="number"
                    value={data.nb_us_closed}
                    onChange={(e) => handleFieldChange('nb_us_closed', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tests Réussis (Carte Verte) */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(61, 102, 74, 0.25)', border: '1px solid rgba(110, 153, 102, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#6E9966' }}>
              <TestTube className="w-4 h-4" />
              Tests Réussis
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Tests Total</label>
                <input
                  type="number"
                  value={data.nb_tests_total}
                  onChange={(e) => handleFieldChange('nb_tests_total', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Tests Validés</label>
                <input
                  type="number"
                  value={data.nb_tests_valides}
                  onChange={(e) => handleFieldChange('nb_tests_valides', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                <span>% Tests Réussis</span>
                <span style={{ color: '#6E9966', fontSize: '10px' }}>(Calculé automatiquement)</span>
              </label>
              <input
                type="number"
                value={data.pct_tests_reussis}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{
                  background: 'rgba(110, 153, 102, 0.8)',
                  border: '1px solid rgba(110, 153, 102, 0.8)',
                  color: '#6E9966',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          {/* 3. DDR Maîtrisé (Carte Bleue) */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(28, 53, 94, 0.25)', border: '1px solid rgba(46, 62, 128, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#2E3E80' }}>
              <Target className="w-4 h-4" />
              DDR (Defect Detection Rate)
            </h4>
            <div className="mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Défauts Identifiés</label>
                <input
                  type="number"
                  value={data.nb_defauts_identifies}
                  onChange={(e) => handleFieldChange('nb_defauts_identifies', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                <span>% DDR</span>
                <span style={{ color: '#2E3E80', fontSize: '10px' }}>(Calculé: défauts/US total)</span>
              </label>
              <input
                type="number"
                value={data.pct_ddr}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{
                  background: 'rgba(46, 62, 128, 0.8)',
                  border: '1px solid rgba(46, 62, 128, 0.8)',
                  color: '#2E3E80',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          {/* 4. Défauts Identifiés (Carte Violette) */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(117, 47, 90, 0.25)', border: '1px solid rgba(153, 46, 99, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#992E63' }}>
              <Bug className="w-4 h-4" />
              Défauts Identifiés
            </h4>

            {/* Criticité */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold mb-3" style={{ color: '#992E63' }}>Criticité</h5>
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Critical</label>
                  <input
                    type="number"
                    value={data.nb_defauts_critical}
                    onChange={(e) => handleFieldChange('nb_defauts_critical', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>High</label>
                  <input
                    type="number"
                    value={data.nb_defauts_high}
                    onChange={(e) => handleFieldChange('nb_defauts_high', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Medium</label>
                  <input
                    type="number"
                    value={data.nb_defauts_medium}
                    onChange={(e) => handleFieldChange('nb_defauts_medium', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Low</label>
                  <input
                    type="number"
                    value={data.nb_defauts_low}
                    onChange={(e) => handleFieldChange('nb_defauts_low', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Totaux et Résolution */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  <span>Total Identifiés</span>
                  <span style={{ color: '#992E63', fontSize: '10px' }}>(Auto)</span>
                </label>
                <input
                  type="number"
                  value={data.nb_defauts_identifies}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                  style={{
                    background: 'rgba(153, 46, 99, 0.8)',
                    border: '1px solid rgba(153, 46, 99, 0.8)',
                    color: '#992E63',
                    fontWeight: 600,
                  }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  <span>Résolus</span>
                  <span style={{ color: '#992E63', fontSize: '10px' }}>(Auto)</span>
                </label>
                <input
                  type="number"
                  value={data.nb_defauts_resolus}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                  style={{
                    background: 'rgba(153, 46, 99, 0.8)',
                    border: '1px solid rgba(153, 46, 99, 0.8)',
                    color: '#992E63',
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            {/* Statuts des Défauts */}
            <div className="mb-4">
              <h5 className="text-xs font-semibold mb-3" style={{ color: '#992E63' }}>Statuts</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Closed</label>
                  <input
                    type="number"
                    value={data.nb_defauts_closed}
                    onChange={(e) => handleFieldChange('nb_defauts_closed', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>New</label>
                  <input
                    type="number"
                    value={data.nb_defauts_new}
                    onChange={(e) => handleFieldChange('nb_defauts_new', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>In Progress</label>
                  <input
                    type="number"
                    value={data.nb_defauts_in_progress}
                    onChange={(e) => handleFieldChange('nb_defauts_in_progress', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>UAT Delivered</label>
                  <input
                    type="number"
                    value={data.nb_defauts_uat_delivered}
                    onChange={(e) => handleFieldChange('nb_defauts_uat_delivered', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>SIT Delivered</label>
                  <input
                    type="number"
                    value={data.nb_defauts_sit_delivered}
                    onChange={(e) => handleFieldChange('nb_defauts_sit_delivered', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Cancelled</label>
                  <input
                    type="number"
                    value={data.nb_defauts_cancelled}
                    onChange={(e) => handleFieldChange('nb_defauts_cancelled', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                <span>% Résolution</span>
                <span style={{ color: '#992E63', fontSize: '10px' }}>(Calculé automatiquement)</span>
              </label>
              <input
                type="number"
                value={data.taux_resolution}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{
                  background: 'rgba(153, 46, 99, 0.8)',
                  border: '1px solid rgba(153, 46, 99, 0.8)',
                  color: '#992E63',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          {/* Section: Indicateurs de Performance */}
          <div className="flex items-center gap-2 pb-3 border-b mt-8" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style={{ color: '#CC9F53' }}>
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="7" y="12" width="3" height="9" fill="currentColor" opacity="0.3"/>
              <rect x="11" y="8" width="3" height="13" fill="currentColor" opacity="0.5"/>
              <rect x="15" y="5" width="3" height="16" fill="currentColor" opacity="0.7"/>
            </svg>
            <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
              Indicateurs de Performance
            </h3>
          </div>

          {/* Tests Non-Régression */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(16, 185, 129, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#10b981' }}>
              <RotateCcw className="w-4 h-4" />
              Tests Non-Régression
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Total</label>
                <input
                  type="number"
                  value={data.nb_tests_non_regression_total}
                  onChange={(e) => handleFieldChange('nb_tests_non_regression_total', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Réussis</label>
                <input
                  type="number"
                  value={data.nb_tests_non_regression_reussis}
                  onChange={(e) => handleFieldChange('nb_tests_non_regression_reussis', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                <span>% Réussite</span>
                <span style={{ color: '#10b981', fontSize: '10px' }}>(Calculé automatiquement)</span>
              </label>
              <input
                type="number"
                value={data.pct_tests_non_regression}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{
                  background: 'rgba(16, 185, 129, 0.8)',
                  border: '1px solid rgba(16, 185, 129, 0.8)',
                  color: '#10b981',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Statut Plan de Test */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.8)' }}>
              <h5 className="text-xs font-semibold mb-3" style={{ color: '#10b981' }}>Statut Plan de Test</h5>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Passed</label>
                  <input
                    type="number"
                    value={data.nb_tests_passed}
                    onChange={(e) => handleFieldChange('nb_tests_passed', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Not Run</label>
                  <input
                    type="number"
                    value={data.nb_tests_not_run}
                    onChange={(e) => handleFieldChange('nb_tests_not_run', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Blocked</label>
                  <input
                    type="number"
                    value={data.nb_tests_blocked}
                    onChange={(e) => handleFieldChange('nb_tests_blocked', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Not Applicable</label>
                  <input
                    type="number"
                    value={data.nb_tests_not_applicable}
                    onChange={(e) => handleFieldChange('nb_tests_not_applicable', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(204, 159, 83, 0.25)', border: '1px solid rgba(204, 159, 83, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#CC9F53' }}>
              <Briefcase className="w-4 h-4" />
              Métriques Business
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>UAT Total</label>
                <input
                  type="number"
                  value={data.bs_nb_uat_total}
                  onChange={(e) => handleFieldChange('bs_nb_uat_total', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>UAT Validées</label>
                <input
                  type="number"
                  value={data.bs_nb_uat_validees}
                  onChange={(e) => handleFieldChange('bs_nb_uat_validees', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="flex items-center gap-2 text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                <span>% Validation UAT</span>
                <span style={{ color: '#CC9F53', fontSize: '10px' }}>(Calculé automatiquement)</span>
              </label>
              <input
                type="number"
                value={data.bs_taux_validation_uat}
                readOnly
                className="w-full px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                style={{
                  background: 'rgba(204, 159, 83, 0.8)',
                  border: '1px solid rgba(204, 159, 83, 0.8)',
                  color: '#CC9F53',
                  fontWeight: 600,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Nb Évolutions</label>
                <input
                  type="number"
                  value={data.bs_nb_evolutions}
                  onChange={(e) => handleFieldChange('bs_nb_evolutions', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Anomalies Non-Bloquantes</label>
                <input
                  type="number"
                  value={data.bs_nb_anomalies_non_bloquantes}
                  onChange={(e) => handleFieldChange('bs_nb_anomalies_non_bloquantes', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Blocages</label>
                <input
                  type="number"
                  value={data.bs_nb_blocages}
                  onChange={(e) => handleFieldChange('bs_nb_blocages', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* Validation Business Support - Texte d'introduction */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(204, 159, 83, 0.8)' }}>
              <h5 className="text-xs font-semibold mb-3" style={{ color: '#CC9F53' }}>Texte d'introduction (paragraphe libre)</h5>

              <div className="mb-3">
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Décrivez la validation Business Support (résumé des US validées, anomalies, patch, etc.)
                </label>
                <RichTextEditor
                  value={data.bs_validation_intro_text || ''}
                  onChange={(html) => handleFieldChange('bs_validation_intro_text', html)}
                  placeholder="Exemple: Le Business Support a validé 62 User Stories sur 65 au scope (95%)..."
                  minHeight="120px"
                />
              </div>

              {/* Description Évolutions */}
              <div className="mb-3">
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Description Évolutions (affiché dans la carte)</label>
                <input
                  type="text"
                  value={data.bs_evolutions_description}
                  onChange={(e) => handleFieldChange('bs_evolutions_description', e.target.value)}
                  placeholder="US 144438 pour patch 12.0.7.1"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>

              {/* Description Anomalies */}
              <div className="mb-3">
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Description Anomalies (affiché dans la carte)</label>
                <input
                  type="text"
                  value={data.bs_anomalies_description}
                  onChange={(e) => handleFieldChange('bs_anomalies_description', e.target.value)}
                  placeholder="US 119408, 144534, 144543 à corriger"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>

              {/* Description Blocages */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Description Blocages (optionnel, affiché dans la carte)</label>
                <input
                  type="text"
                  value={data.bs_blocages_description}
                  onChange={(e) => handleFieldChange('bs_blocages_description', e.target.value)}
                  placeholder="Aucun blocage identifié"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bilan & Recommandations */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(204, 159, 83, 0.25)', border: '1px solid rgba(204, 159, 83, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#CC9F53' }}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.59L13.09 23L12 17L10.91 23L9.19 16.59L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Bilan & Recommandations
            </h4>

            <div className="space-y-4">
              {/* Points Forts */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Points Forts de la Livraison
                </label>
                <RichTextEditor
                  value={data.bilan_points_forts || ''}
                  onChange={(html) => handleFieldChange('bilan_points_forts', html)}
                  placeholder="Listez les points forts..."
                  minHeight="150px"
                />
              </div>

              {/* Actions Post-MEP */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Actions Post-MEP
                </label>
                <RichTextEditor
                  value={data.bilan_actions_post_mep || ''}
                  onChange={(html) => handleFieldChange('bilan_actions_post_mep', html)}
                  placeholder="Listez les actions à réaliser post-MEP..."
                  minHeight="150px"
                />
              </div>

              {/* Récapitulatif Défauts Résolus */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Récapitulatif Défauts Résolus
                </label>
                <RichTextEditor
                  value={data.bilan_defauts_resolus || ''}
                  onChange={(html) => handleFieldChange('bilan_defauts_resolus', html)}
                  placeholder="Listez les défauts résolus..."
                  minHeight="150px"
                />
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(204, 159, 83, 0.25)', border: '1px solid rgba(204, 159, 83, 0.7)' }}>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: '#CC9F53' }}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 12L15 17L13 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              </svg>
              Conclusion
            </h4>

            <div className="space-y-4">
              {/* Paragraphe 1 : Mise en production principale */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Paragraphe 1 : Mise en production principale
                </label>
                <RichTextEditor
                  value={data.conclusion_paragraph_1 || ''}
                  onChange={(html) => handleFieldChange('conclusion_paragraph_1', html)}
                  placeholder="Décrivez la mise en production principale..."
                  minHeight="120px"
                />
              </div>

              {/* Paragraphe 2 : Tests de non-régression */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Paragraphe 2 : Tests de non-régression
                </label>
                <RichTextEditor
                  value={data.conclusion_paragraph_2 || ''}
                  onChange={(html) => handleFieldChange('conclusion_paragraph_2', html)}
                  placeholder="Décrivez les résultats des tests de non-régression..."
                  minHeight="120px"
                />
              </div>

              {/* Paragraphe 3 : GO CONFIRMÉ */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                  Paragraphe 3 : GO CONFIRMÉ
                </label>
                <RichTextEditor
                  value={data.conclusion_paragraph_3 || ''}
                  onChange={(html) => handleFieldChange('conclusion_paragraph_3', html)}
                  placeholder="Rédigez la confirmation du GO..."
                  minHeight="120px"
                />
              </div>
            </div>
          </div>

          {/* Hyperlinks Section - Collapsible */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.7)' }}>
            <button
              type="button"
              onClick={() => setLinksExpanded(!linksExpanded)}
              className="w-full flex items-center justify-between text-sm font-semibold mb-3 hover:opacity-80 transition-opacity"
              style={{ color: '#3b82f6' }}
            >
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                Liens Hypertextes (Optionnel)
                <span className="text-xs opacity-60 font-normal">- Rendre les éléments cliquables</span>
              </div>
              {linksExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {linksExpanded && (
              <div className="space-y-4 mt-4">
                {/* Package/Sprint */}
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#60a5fa' }}>
                    <Package size={14} />
                    Package / Sprint
                  </h5>
                  <input
                    type="url"
                    value={data.link_package_dashboard || ''}
                    onChange={(e) => handleFieldChange('link_package_dashboard', e.target.value)}
                    placeholder="https://dev.azure.com/..."
                    className="w-full px-3 py-2 rounded-lg text-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>

                {/* User Stories Links */}
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#60a5fa' }}>
                    <Target size={14} />
                    User Stories (Queries)
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Toutes les US</label>
                      <input
                        type="url"
                        value={data.link_us_scope_total || ''}
                        onChange={(e) => handleFieldChange('link_us_scope_total', e.target.value)}
                        placeholder="Query Azure DevOps"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">QA Complete</label>
                      <input
                        type="url"
                        value={data.link_us_qa_complete || ''}
                        onChange={(e) => handleFieldChange('link_us_qa_complete', e.target.value)}
                        placeholder="Query QA Complete"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">In Progress</label>
                      <input
                        type="url"
                        value={data.link_us_in_progress || ''}
                        onChange={(e) => handleFieldChange('link_us_in_progress', e.target.value)}
                        placeholder="Query In Progress"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">UAT Delivered</label>
                      <input
                        type="url"
                        value={data.link_us_uat_delivered || ''}
                        onChange={(e) => handleFieldChange('link_us_uat_delivered', e.target.value)}
                        placeholder="Query UAT Delivered"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">New</label>
                      <input
                        type="url"
                        value={data.link_us_new || ''}
                        onChange={(e) => handleFieldChange('link_us_new', e.target.value)}
                        placeholder="Query New"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Technical</label>
                      <input
                        type="url"
                        value={data.link_us_technical || ''}
                        onChange={(e) => handleFieldChange('link_us_technical', e.target.value)}
                        placeholder="Query Technical"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Closed</label>
                      <input
                        type="url"
                        value={data.link_us_closed || ''}
                        onChange={(e) => handleFieldChange('link_us_closed', e.target.value)}
                        placeholder="Query Closed"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Test Plan Links */}
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#60a5fa' }}>
                    <TestTube size={14} />
                    Plan de Tests
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Plan complet</label>
                      <input
                        type="url"
                        value={data.link_plan_tests || ''}
                        onChange={(e) => handleFieldChange('link_plan_tests', e.target.value)}
                        placeholder="Lien Test Plan"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Tests NR</label>
                      <input
                        type="url"
                        value={data.link_tests_nr || ''}
                        onChange={(e) => handleFieldChange('link_tests_nr', e.target.value)}
                        placeholder="Tests Non-Régression"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Passed</label>
                      <input
                        type="url"
                        value={data.link_tests_passed || ''}
                        onChange={(e) => handleFieldChange('link_tests_passed', e.target.value)}
                        placeholder="Tests Passed"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Blocked</label>
                      <input
                        type="url"
                        value={data.link_tests_blocked || ''}
                        onChange={(e) => handleFieldChange('link_tests_blocked', e.target.value)}
                        placeholder="Tests Blocked"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Failed / Not Run</label>
                      <input
                        type="url"
                        value={data.link_tests_failed || ''}
                        onChange={(e) => handleFieldChange('link_tests_failed', e.target.value)}
                        placeholder="Tests Failed"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">N/A</label>
                      <input
                        type="url"
                        value={data.link_tests_not_applicable || ''}
                        onChange={(e) => handleFieldChange('link_tests_not_applicable', e.target.value)}
                        placeholder="Tests N/A"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Defects Links */}
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#60a5fa' }}>
                    <Bug size={14} />
                    Défauts (Queries)
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Tous les défauts</label>
                      <input
                        type="url"
                        value={data.link_defauts_all || ''}
                        onChange={(e) => handleFieldChange('link_defauts_all', e.target.value)}
                        placeholder="Query tous défauts"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Défauts actifs</label>
                      <input
                        type="url"
                        value={data.link_defauts_actifs || ''}
                        onChange={(e) => handleFieldChange('link_defauts_actifs', e.target.value)}
                        placeholder="Query actifs"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Résolus</label>
                      <input
                        type="url"
                        value={data.link_defauts_resolus || ''}
                        onChange={(e) => handleFieldChange('link_defauts_resolus', e.target.value)}
                        placeholder="Query résolus"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Closed</label>
                      <input
                        type="url"
                        value={data.link_defauts_closed || ''}
                        onChange={(e) => handleFieldChange('link_defauts_closed', e.target.value)}
                        placeholder="Query Closed"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">New</label>
                      <input
                        type="url"
                        value={data.link_defauts_new || ''}
                        onChange={(e) => handleFieldChange('link_defauts_new', e.target.value)}
                        placeholder="Query New"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">In Progress</label>
                      <input
                        type="url"
                        value={data.link_defauts_in_progress || ''}
                        onChange={(e) => handleFieldChange('link_defauts_in_progress', e.target.value)}
                        placeholder="Query In Progress"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">UAT Delivered</label>
                      <input
                        type="url"
                        value={data.link_defauts_uat_delivered || ''}
                        onChange={(e) => handleFieldChange('link_defauts_uat_delivered', e.target.value)}
                        placeholder="Query UAT Delivered"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">SIT Delivered</label>
                      <input
                        type="url"
                        value={data.link_defauts_sit_delivered || ''}
                        onChange={(e) => handleFieldChange('link_defauts_sit_delivered', e.target.value)}
                        placeholder="Query SIT Delivered"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Defects by Criticality */}
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#60a5fa' }}>
                    <AlertTriangle size={14} />
                    Défauts par Criticité
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Critical</label>
                      <input
                        type="url"
                        value={data.link_defauts_critical || ''}
                        onChange={(e) => handleFieldChange('link_defauts_critical', e.target.value)}
                        placeholder="Query Critical"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">High</label>
                      <input
                        type="url"
                        value={data.link_defauts_high || ''}
                        onChange={(e) => handleFieldChange('link_defauts_high', e.target.value)}
                        placeholder="Query High"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Medium</label>
                      <input
                        type="url"
                        value={data.link_defauts_medium || ''}
                        onChange={(e) => handleFieldChange('link_defauts_medium', e.target.value)}
                        placeholder="Query Medium"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Low</label>
                      <input
                        type="url"
                        value={data.link_defauts_low || ''}
                        onChange={(e) => handleFieldChange('link_defauts_low', e.target.value)}
                        placeholder="Query Low"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Support Links */}
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#60a5fa' }}>
                    <Briefcase size={14} />
                    Business Support
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Validation UAT</label>
                      <input
                        type="url"
                        value={data.link_bs_validation_uat || ''}
                        onChange={(e) => handleFieldChange('link_bs_validation_uat', e.target.value)}
                        placeholder="Board Validation UAT"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Évolutions</label>
                      <input
                        type="url"
                        value={data.link_bs_evolutions || ''}
                        onChange={(e) => handleFieldChange('link_bs_evolutions', e.target.value)}
                        placeholder="Évolutions demandées"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Anomalies</label>
                      <input
                        type="url"
                        value={data.link_bs_anomalies || ''}
                        onChange={(e) => handleFieldChange('link_bs_anomalies', e.target.value)}
                        placeholder="Anomalies non bloquantes"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 opacity-70">Blocages</label>
                      <input
                        type="url"
                        value={data.link_bs_blocages || ''}
                        onChange={(e) => handleFieldChange('link_bs_blocages', e.target.value)}
                        placeholder="Blocages identifiés"
                        className="w-full px-2 py-1.5 rounded text-xs"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

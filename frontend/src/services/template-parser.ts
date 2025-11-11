/**
 * Service for parsing and manipulating the CR MEP HTML template
 */

export interface TemplateField {
  name: string;
  type: 'text' | 'html' | 'number' | 'percent' | 'chart';
  defaultValue?: string;
}

export interface CRMEPData {
  // Metadata
  package_version: string;
  sprint: string;
  date_deploiement: string;
  statut_mep: string;
  prenom_nom: string;
  fonction: string;
  ville: string;
  equipe: string;

  // Multi-select fields
  selected_environments: string[];
  selected_countries: string[];

  // Rich content (HTML)
  nouvelles_fonctionnalites: string;
  ameliorations: string;
  corrections: string;
  synthese_livraison: string;

  // Metrics (numbers)
  nb_us_total: number;
  nb_us_completees: number;
  pct_us_completees: number;
  nb_user_stories: number;

  nb_tests_total: number;
  nb_tests_valides: number;
  pct_tests_reussis: number;
  nb_tests_non_regression_total: number;
  nb_tests_non_regression_reussis: number;
  pct_tests_non_regression: number;

  nb_defauts_identifies: number;
  nb_defauts_resolus: number;
  nb_defauts_actifs: number;      // Auto-calculated: identifies - resolus
  taux_resolution: number;

  // Defects by criticality
  nb_defauts_critical: number;
  nb_defauts_high: number;
  nb_defauts_medium: number;
  nb_defauts_low: number;

  // Defects by status
  nb_defauts_closed: number;
  nb_defauts_new: number;
  nb_defauts_in_progress: number;
  nb_defauts_uat_delivered: number;
  nb_defauts_sit_delivered: number;
  nb_defauts_cancelled: number;

  // User Stories distribution
  nb_us_qa_complete: number;
  nb_us_in_progress: number;
  nb_us_uat_delivered: number;
  nb_us_new: number;
  nb_us_technical: number;
  nb_us_closed: number;

  // Test Plan status
  nb_tests_passed: number;
  nb_tests_not_run: number;
  nb_tests_blocked: number;
  nb_tests_not_applicable: number;

  // Business metrics
  bs_nb_uat_total: number;
  bs_nb_uat_validees: number;
  bs_taux_validation_uat: number;
  bs_nb_evolutions: number;
  bs_nb_anomalies_non_bloquantes: number;
  bs_nb_blocages: number;
  pct_ddr: number;

  // Business Support - Validation details (text fields)
  bs_validation_intro_text: string;    // Texte libre du paragraphe d'introduction (textarea)
  bs_evolutions_description: string;   // Description des évolutions (affiché dans la carte)
  bs_anomalies_description: string;    // Description des anomalies (affiché dans la carte)
  bs_blocages_description: string;     // Description des blocages (affiché dans la carte)

  // Bilan & Recommandations (listes libres - un item par ligne)
  bilan_points_forts: string;          // Liste des points forts (colonne verte)
  bilan_actions_post_mep: string;      // Liste des actions post-MEP (colonne jaune)
  bilan_defauts_resolus: string;       // Liste récapitulative des défauts (colonne bleue)

  // Conclusion (paragraphes libres)
  conclusion_paragraph_1: string;      // Premier paragraphe (mise en production principale)
  conclusion_paragraph_2: string;      // Deuxième paragraphe (tests de non-régression)
  conclusion_paragraph_3: string;      // Troisième paragraphe (GO CONFIRMÉ)

  // Charts data (JSON strings)
  chart_us?: string;
  chart_tests?: string;
  chart_defauts?: string;

  // ==========================================
  // HYPERLINKS - Make elements clickable
  // ==========================================

  // Package/Version links
  link_package_dashboard?: string;     // Dashboard global du package

  // User Stories - Links by status (for charts and badges)
  link_us_scope_total?: string;        // Toutes les US au scope
  link_us_qa_complete?: string;        // US QA Complete
  link_us_in_progress?: string;        // US In Progress
  link_us_uat_delivered?: string;      // US UAT Delivered
  link_us_new?: string;                // US New
  link_us_technical?: string;          // US Technical
  link_us_closed?: string;             // US Closed

  // Test Plan - Links by status
  link_plan_tests?: string;            // Plan de Tests global
  link_tests_passed?: string;          // Tests Passed
  link_tests_blocked?: string;         // Tests Blocked
  link_tests_failed?: string;          // Tests Failed (Not Run)
  link_tests_not_applicable?: string;  // Tests N/A

  // Defects - Links by status
  link_defauts_all?: string;           // Tous les défauts
  link_defauts_actifs?: string;        // Défauts actifs
  link_defauts_resolus?: string;       // Défauts résolus
  link_defauts_closed?: string;        // Défauts Closed
  link_defauts_new?: string;           // Défauts New
  link_defauts_in_progress?: string;   // Défauts In Progress
  link_defauts_uat_delivered?: string; // Défauts UAT Delivered
  link_defauts_sit_delivered?: string; // Défauts SIT Delivered

  // Defects by criticality
  link_defauts_critical?: string;      // Défauts Critical
  link_defauts_high?: string;          // Défauts High
  link_defauts_medium?: string;        // Défauts Medium
  link_defauts_low?: string;           // Défauts Low

  // Business Support metrics
  link_bs_validation_uat?: string;     // Validation UAT Board
  link_bs_evolutions?: string;         // Évolutions demandées
  link_bs_anomalies?: string;          // Anomalies non bloquantes
  link_bs_blocages?: string;           // Blocages identifiés

  // Test Non-Régression
  link_tests_nr?: string;              // Tests de Non-Régression
}

export class TemplateParser {
  private templateHTML: string | null = null;

  /**
   * Load the HTML template from /public
   */
  async loadTemplate(): Promise<string> {
    // Always reload in development to pick up changes
    const shouldCache = process.env.NODE_ENV === 'production';

    if (this.templateHTML && shouldCache) {
      return this.templateHTML;
    }

    try {
      // Add cache busting in development
      const cacheBuster = shouldCache ? '' : `?t=${Date.now()}`;
      const response = await fetch(`/rapport_mep_template.html${cacheBuster}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      this.templateHTML = await response.text();
      return this.templateHTML;
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  /**
   * Extract all data-field attributes from the template
   */
  extractFields(html: string): TemplateField[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('[data-field]');

    const fields: TemplateField[] = [];
    const seen = new Set<string>();

    elements.forEach((element) => {
      const fieldName = element.getAttribute('data-field');
      if (fieldName && !seen.has(fieldName)) {
        seen.add(fieldName);

        // Determine field type based on name patterns
        let type: TemplateField['type'] = 'text';
        if (fieldName.startsWith('chart_')) {
          type = 'chart';
        } else if (fieldName.startsWith('pct_') || fieldName.includes('taux_')) {
          type = 'percent';
        } else if (fieldName.startsWith('nb_') || fieldName.startsWith('bs_')) {
          type = 'number';
        } else if (['nouvelles_fonctionnalites', 'ameliorations', 'corrections', 'environnements_deployes'].includes(fieldName)) {
          type = 'html';
        }

        fields.push({
          name: fieldName,
          type,
          defaultValue: element.textContent || undefined,
        });
      }
    });

    return fields;
  }

  /**
   * Escape HTML special characters for safe injection in attributes
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '\n': '&#10;' // Preserve newlines
    };
    return text.replace(/[&<>"'\n]/g, char => map[char]);
  }

  /**
   * Generate HTML for environment badges
   */
  private generateEnvironmentBadges(environments: string[]): string {
    const envConfig: Record<string, { color: string; gradient: string }> = {
      'DEV': {
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
      },
      'SIT': {
        color: '#eab308',
        gradient: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)'
      },
      'UAT': {
        color: '#1C355E',
        gradient: 'linear-gradient(135deg, #1C355E 0%, #2d4a7c 100%)'
      },
      'PRE PROD': {
        color: '#1C355E',
        gradient: 'linear-gradient(135deg, #1C355E 0%, #2d4a7c 100%)'
      },
      'PROD': {
        color: '#CC9F53',
        gradient: 'linear-gradient(135deg, #CC9F53 0%, #D7B275 100%)'
      },
    };

    // Sort environments in the specified order
    const order = ['DEV', 'SIT', 'UAT', 'PRE PROD', 'PROD'];
    const sortedEnvs = environments.sort((a, b) => order.indexOf(a) - order.indexOf(b));

    return sortedEnvs.map(env => {
      const config = envConfig[env] || envConfig['UAT'];
      return `<span style="background: ${config.gradient}; color: white; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">${env}</span>`;
    }).join('\n                                ');
  }

  /**
   * Generate HTML for country list
   */
  private generateCountryList(countries: string[]): string {
    // Sort countries in the specified order
    const order = ['France', 'Belgique', 'Luxembourg', 'Monaco', 'Italie'];
    const sortedCountries = countries.sort((a, b) => order.indexOf(a) - order.indexOf(b));

    return sortedCountries.map((country, index) =>
      `${index > 0 ? '<span style="color: var(--text-light); margin: 0 6px;">•</span> ' : ''}<span style="color: var(--primary); font-weight: 700;">${country}</span>`
    ).join('');
  }

  /**
   * Generate chart configuration JSON for User Stories distribution
   */
  private generateUSChartConfig(data: Partial<CRMEPData>): string {
    const config = {
      labels: ['QA Complete', 'In Progress', 'UAT Delivered', 'New', 'Technical', 'Closed'],
      values: [
        data.nb_us_qa_complete || 0,
        data.nb_us_in_progress || 0,
        data.nb_us_uat_delivered || 0,
        data.nb_us_new || 0,
        data.nb_us_technical || 0,
        data.nb_us_closed || 0
      ]
    };
    return JSON.stringify(config);
  }

  /**
   * Generate chart configuration JSON for Test Plan status
   */
  private generateTestsChartConfig(data: Partial<CRMEPData>): string {
    const config = {
      labels: ['Passed', 'Not run', 'Blocked', 'Not applicable'],
      values: [
        data.nb_tests_passed || 0,
        data.nb_tests_not_run || 0,
        data.nb_tests_blocked || 0,
        data.nb_tests_not_applicable || 0
      ]
    };
    return JSON.stringify(config);
  }

  /**
   * Generate chart configuration JSON for Defects by status
   */
  private generateDefautsChartConfig(data: Partial<CRMEPData>): string {
    const config = {
      labels: ['Closed', 'New', 'In Progress', 'UAT Delivered', 'SIT Delivered', 'Cancelled'],
      values: [
        data.nb_defauts_closed || 0,
        data.nb_defauts_new || 0,
        data.nb_defauts_in_progress || 0,
        data.nb_defauts_uat_delivered || 0,
        data.nb_defauts_sit_delivered || 0,
        data.nb_defauts_cancelled || 0
      ]
    };
    return JSON.stringify(config);
  }

  /**
   * Replace all data-field values in the template with new data
   */
  populateTemplate(html: string, data: Partial<CRMEPData>): string {
    let result = html;

    // Handle special multi-select fields first
    if (data.selected_environments && Array.isArray(data.selected_environments)) {
      const badgesHTML = this.generateEnvironmentBadges(data.selected_environments);
      const badgesRegex = /<div data-field="selected_environments"[^>]*>[\s\S]*?<\/div>/gi;
      result = result.replace(badgesRegex, `<div data-field="selected_environments" style="display: inline-flex; gap: 12px; flex-wrap: wrap;">${badgesHTML}</div>`);
    }

    if (data.selected_countries && Array.isArray(data.selected_countries)) {
      const countriesHTML = this.generateCountryList(data.selected_countries);
      const countriesRegex = /<span data-field="selected_countries"[^>]*>[\s\S]*?<\/span>/gi;
      result = result.replace(countriesRegex, `<span data-field="selected_countries">${countriesHTML}</span>`);
    }

    // Generate chart configurations automatically
    const chartUSConfig = this.generateUSChartConfig(data);
    const chartTestsConfig = this.generateTestsChartConfig(data);
    const chartDefautsConfig = this.generateDefautsChartConfig(data);

    // Replace chart configurations in script tags
    result = result.replace(
      /(<script id="chart_us_config"[^>]*>)[\s\S]*?(<\/script>)/gi,
      `$1${chartUSConfig}$2`
    );
    result = result.replace(
      /(<script id="chart_tests_config"[^>]*>)[\s\S]*?(<\/script>)/gi,
      `$1${chartTestsConfig}$2`
    );
    result = result.replace(
      /(<script id="chart_defauts_config"[^>]*>)[\s\S]*?(<\/script>)/gi,
      `$1${chartDefautsConfig}$2`
    );

    // Replace each field value
    Object.entries(data).forEach(([fieldName, value]) => {
      if (value === undefined || value === null) return;

      // Skip arrays (already handled above)
      if (Array.isArray(value)) return;

      // Skip chart fields (already handled by automatic generation above)
      if (fieldName === 'chart_us' || fieldName === 'chart_tests' || fieldName === 'chart_defauts') {
        return;
      }

      // Handle list fields (Bilan & Recommandations) - extract from HTML or plain text
      if (fieldName === 'bilan_points_forts' || fieldName === 'bilan_actions_post_mep' || fieldName === 'bilan_defauts_resolus') {
        const listContent = String(value);

        // Find <ul data-list="fieldName">...</ul> and replace the content
        const listRegex = new RegExp(
          `<ul([^>]*data-list="${fieldName}"[^>]*)>\\s*<!--[^>]*-->\\s*</ul>`,
          'gi'
        );

        // Check if content is HTML (from RichTextEditor) or plain text
        let listHTML = '';
        if (listContent && listContent.trim() !== '') {
          if (listContent.trim().startsWith('<')) {
            // HTML from TipTap - extract content from <ul> tags
            const ulMatch = listContent.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
            if (ulMatch && ulMatch[1]) {
              listHTML = ulMatch[1].trim();
            } else {
              // If no <ul> found, just inject the HTML as-is (might be <p> or other tags)
              listHTML = listContent;
            }
          } else {
            // Plain text - convert lines to <li>
            const lines = listContent.split('\n').filter(line => line.trim() !== '');
            listHTML = lines
              .map(line => {
                const escapedLine = line.trim()
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
                return `<li>${escapedLine}</li>`;
              })
              .join('\n                            ');
          }
        } else {
          listHTML = '<li style="color: rgba(0,0,0,0.4); font-style: italic;">Aucun élément à afficher</li>';
        }

        // Replace the entire <ul> with the new content
        result = result.replace(listRegex, `<ul$1>\n                            ${listHTML}\n                        </ul>`);
        return; // Don't process as regular field
      }

      // Handle rich text HTML fields (paragraphs that should render as HTML)
      if (fieldName === 'bs_validation_intro_text' ||
          fieldName === 'conclusion_paragraph_1' ||
          fieldName === 'conclusion_paragraph_2' ||
          fieldName === 'conclusion_paragraph_3') {
        const htmlContent = String(value);

        if (htmlContent && htmlContent.trim() !== '') {
          // Replace the entire <p> tag containing the span with our HTML content
          // Match: <p ...><span data-field="fieldName"></span></p>
          const pRegex = new RegExp(
            `<p([^>]*)>\\s*<span data-field="${fieldName}"><\\/span>\\s*<\\/p>`,
            'gi'
          );

          // Inject the HTML directly (preserve TipTap formatting)
          result = result.replace(pRegex, `<div$1 data-html-content="true">${htmlContent}</div>`);
        }
        return; // Don't process as regular field
      }

      // Convert value to string
      let stringValue = String(value);

      // Format numbers and percentages
      if (typeof value === 'number') {
        if (fieldName.startsWith('pct_') || fieldName.includes('taux_')) {
          stringValue = `${value}%`;
        }
      }

      // Handle regular fields (in span tags)
      const spanRegex = new RegExp(
        `(<span[^>]*data-field="${fieldName}"[^>]*>)([^<]*)(</span>)`,
        'g'
      );
      result = result.replace(spanRegex, `$1${stringValue}$3`);

      // Handle div tags with data-field (for rich content)
      const divRegex = new RegExp(
        `(<div[^>]*data-field="${fieldName}"[^>]*>)[\\s\\S]*?(</div>)`,
        'gi'
      );
      result = result.replace(divRegex, `$1${stringValue}$2`);
    });

    // ==========================================
    // HYPERLINKS INJECTION
    // ==========================================

    // Mapping: link field → target data-field(s) to make clickable
    const linkMappings: Record<string, string[]> = {
      link_package_dashboard: ['package_version'],
      link_us_scope_total: ['nb_user_stories'],
      link_us_qa_complete: ['nb_us_qa_complete'],
      link_us_in_progress: ['nb_us_in_progress'],
      link_us_uat_delivered: ['nb_us_uat_delivered'],
      link_us_new: ['nb_us_new'],
      link_us_technical: ['nb_us_technical'],
      link_us_closed: ['nb_us_closed'],
      link_plan_tests: ['nb_tests_total'],
      link_tests_nr: ['nb_tests_non_regression_total'],
      link_tests_passed: ['nb_tests_passed'],
      link_tests_blocked: ['nb_tests_blocked'],
      link_tests_failed: ['nb_tests_not_run'],
      link_tests_not_applicable: ['nb_tests_not_applicable'],
      link_defauts_all: ['nb_defauts_identifies'],
      link_defauts_actifs: ['nb_defauts_actifs'],
      link_defauts_resolus: ['nb_defauts_resolus'],
      link_defauts_closed: ['nb_defauts_closed'],
      link_defauts_new: ['nb_defauts_new'],
      link_defauts_in_progress: ['nb_defauts_in_progress'],
      link_defauts_uat_delivered: ['nb_defauts_uat_delivered'],
      link_defauts_sit_delivered: ['nb_defauts_sit_delivered'],
      link_defauts_critical: ['nb_defauts_critical'],
      link_defauts_high: ['nb_defauts_high'],
      link_defauts_medium: ['nb_defauts_medium'],
      link_defauts_low: ['nb_defauts_low'],
      link_bs_validation_uat: ['bs_taux_validation_uat', 'bs_nb_uat_validees', 'bs_nb_uat_total'],
      link_bs_evolutions: ['bs_nb_evolutions'],
      link_bs_anomalies: ['bs_nb_anomalies_non_bloquantes'],
      link_bs_blocages: ['bs_nb_blocages'],
    };

    // Process each link
    Object.entries(linkMappings).forEach(([linkField, targetFields]) => {
      const url = (data as any)[linkField];

      if (url && url.trim() !== '') {
        targetFields.forEach(targetField => {
          // Find all spans/divs with this data-field and wrap them in <a>
          // We'll use a more specific regex to avoid double-wrapping
          const wrapRegex = new RegExp(
            `(?<!<a[^>]*>)(<(?:span|div)[^>]*data-field="${targetField}"[^>]*>[^<]*</(?:span|div)>)(?!</a>)`,
            'g'
          );

          result = result.replace(wrapRegex, (match) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">${match}</a>`;
          });
        });
      }
    });

    return result;
  }

  /**
   * Extract current values from a populated template
   */
  extractData(html: string): Partial<CRMEPData> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('[data-field]');

    const data: any = {};

    elements.forEach((element) => {
      const fieldName = element.getAttribute('data-field');
      if (!fieldName) return;

      let value: string | number = element.textContent?.trim() || '';

      // Parse numbers and percentages
      if (fieldName.startsWith('nb_') || fieldName.startsWith('bs_')) {
        value = parseInt(value, 10) || 0;
      } else if (fieldName.startsWith('pct_') || fieldName.includes('taux_')) {
        value = parseFloat(value.replace('%', '')) || 0;
      }

      data[fieldName] = value;
    });

    return data;
  }

  /**
   * Migrate old data format to new format
   * Handles the transition from 'package' field to 'package_version' and 'sprint'
   */
  migrateOldDataFormat(data: any): any {
    // If old 'package' field exists, migrate to new structure
    if (data.package) {
      // If package_version doesn't look like a version (no dots), it's probably the sprint
      if (data.package_version && !data.package_version.includes('.')) {
        data.sprint = data.package_version;
      }
      // Move package to package_version
      data.package_version = data.package;
      // Remove old package field
      delete data.package;
    }
    return data;
  }

  /**
   * Get default/empty data structure
   */
  getDefaultData(): CRMEPData {
    return {
      // Metadata
      package_version: '',
      sprint: '',
      date_deploiement: '',
      statut_mep: '',
      prenom_nom: '',
      fonction: '',
      ville: '',
      equipe: '',

      // Multi-select
      selected_environments: [],
      selected_countries: [],

      // Rich content
      nouvelles_fonctionnalites: '',
      ameliorations: '',
      corrections: '',
      synthese_livraison: '',

      // User Stories metrics
      nb_us_total: 0,
      nb_us_completees: 0,
      pct_us_completees: 0,
      nb_user_stories: 0,

      // Tests metrics
      nb_tests_total: 0,
      nb_tests_valides: 0,
      pct_tests_reussis: 0,
      nb_tests_non_regression_total: 0,
      nb_tests_non_regression_reussis: 0,
      pct_tests_non_regression: 0,

      // Defects metrics
      nb_defauts_identifies: 0,
      nb_defauts_resolus: 0,
      nb_defauts_actifs: 0,
      taux_resolution: 0,

      // Defects by criticality
      nb_defauts_critical: 0,
      nb_defauts_high: 0,
      nb_defauts_medium: 0,
      nb_defauts_low: 0,

      // Defects by status
      nb_defauts_closed: 0,
      nb_defauts_new: 0,
      nb_defauts_in_progress: 0,
      nb_defauts_uat_delivered: 0,
      nb_defauts_sit_delivered: 0,
      nb_defauts_cancelled: 0,

      // User Stories distribution
      nb_us_qa_complete: 0,
      nb_us_in_progress: 0,
      nb_us_uat_delivered: 0,
      nb_us_new: 0,
      nb_us_technical: 0,
      nb_us_closed: 0,

      // Test Plan status
      nb_tests_passed: 0,
      nb_tests_not_run: 0,
      nb_tests_blocked: 0,
      nb_tests_not_applicable: 0,

      // Business metrics
      bs_nb_uat_total: 0,
      bs_nb_uat_validees: 0,
      bs_taux_validation_uat: 0,
      bs_nb_evolutions: 0,
      bs_nb_anomalies_non_bloquantes: 0,
      bs_nb_blocages: 0,
      pct_ddr: 0,

      // Business Support - Validation details
      bs_validation_intro_text: '',
      bs_evolutions_description: '',
      bs_anomalies_description: '',
      bs_blocages_description: '',

      // Bilan & Recommandations
      bilan_points_forts: '',
      bilan_actions_post_mep: '',
      bilan_defauts_resolus: '',

      // Conclusion
      conclusion_paragraph_1: '',
      conclusion_paragraph_2: '',
      conclusion_paragraph_3: '',

      // Charts (empty for now)
      chart_us: '',
      chart_tests: '',
      chart_defauts: '',
    };
  }
}

// Singleton instance
export const templateParser = new TemplateParser();

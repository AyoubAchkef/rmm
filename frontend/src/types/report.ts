// Types for MEP Report structure

export type SectionType =
  | 'hero'
  | 'synthese'
  | 'bilan'
  | 'metriques'
  | 'defauts'
  | 'user-stories'
  | 'plan-test'
  | 'validation-business'
  | 'bilan-recommandations'
  | 'conclusion';

export interface MetricValue {
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export interface TableRow {
  id: string;
  cells: (string | number | MetricValue)[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface HeroContent {
  title: string;
  package: string;
  packageLink?: string;
  date: Date;
  backgroundImage?: string;
}

export interface SyntheseContent {
  mepDate: Date;
  stats: {
    usCompleted: MetricValue;
    totalUS: MetricValue;
    defectsResolved: MetricValue;
    testsPassed: MetricValue;
  };
}

export interface BilanContent {
  summary: string;
  highlights: string[];
  concerns: string[];
}

export interface MetriquesContent {
  quality: {
    testCoverage: MetricValue;
    codeQuality: MetricValue;
    performance: MetricValue;
  };
  charts: ChartData[];
}

export interface DefautsContent {
  total: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  resolved: number;
  remaining: number;
  table?: TableRow[];
}

export interface UserStoriesContent {
  total: number;
  completed: number;
  inProgress: number;
  chart?: ChartData;
  table?: TableRow[];
}

export interface PlanTestContent {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: MetricValue;
  table?: TableRow[];
}

export interface ValidationBusinessContent {
  validated: boolean;
  validatedBy: string;
  validatedAt?: Date;
  comments: string;
  signatures: {
    name: string;
    role: string;
    date: Date;
  }[];
}

export interface BilanRecommandationsContent {
  bilan: string;
  recommendations: string[];
  nextSteps: string[];
}

export interface ConclusionContent {
  summary: string;
  finalThoughts: string;
}

export type SectionContent =
  | HeroContent
  | SyntheseContent
  | BilanContent
  | MetriquesContent
  | DefautsContent
  | UserStoriesContent
  | PlanTestContent
  | ValidationBusinessContent
  | BilanRecommandationsContent
  | ConclusionContent;

export interface ReportSection {
  id: string;
  type: SectionType;
  title: string;
  content: SectionContent;
  editable: boolean;
  visible: boolean;
  order: number;
}

export interface ReportMetadata {
  createdBy: string;
  createdAt: Date;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  aiAssisted: boolean;
  version: string;
  status: 'draft' | 'in-review' | 'approved' | 'published';
}

export interface Report {
  id: string;
  title: string;
  package: string;
  type: 'cr-mep' | 'cr-post-mep' | 'sprint-review' | 'presentation';
  sections: ReportSection[];
  metadata: ReportMetadata;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  links?: {
    id: string;
    title: string;
    url: string;
    type: 'azure-devops' | 'confluence' | 'external';
  }[];
}

export interface EditorState {
  activeSection: string | null;
  editingField: string | null;
  hasUnsavedChanges: boolean;
  isAIProcessing: boolean;
}

export interface Deduction {
  id: string;
  clause_id?: string;
  clause_title?: string;
  criterion: 'clarity' | 'completeness' | 'fairness' | 'legal_risk' | 'compliance';
  points: number;
  reason: string;
  trigger_text?: string;
  source: 'rule' | 'llm';
  remedy_hint?: string;
}

export interface CriterionScore {
  criterion: string;
  score: number;
  weight: number;
  weighted_score: number;
  deductions: Deduction[];
}

export interface ScoreBreakdown {
  overall_score: number;
  risk_band: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  formula: string;
  step_by_step_derivation: string[];
  criteria: Record<string, CriterionScore>;
  total_deductions_count: number;
}

export interface Clause {
  id: string;
  document_id: string;
  index: number;
  title: string;
  text: string;
  start_char: number;
  end_char: number;
  clause_type: string;
  risk_level: 'SAFE' | 'WARNING' | 'DANGER';
  score: number;
  flagged_issues: string[];
}

export interface DocumentSummary {
  document_id: string;
  purpose: string;
  parties_identified: string[];
  key_obligations: string[];
  key_dates_and_amounts: string[];
  red_flags: string[];
  governing_law_detected?: string;
}

export interface AnalyzeResponse {
  document_id: string;
  overall_score: number;
  risk_band: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  breakdown: ScoreBreakdown;
  clauses: Clause[];
  global_summary: DocumentSummary;
}

export interface LegalTerm {
  term: string;
  definition: string;
  context: string;
}

export interface ClauseExplanation {
  clause_id: string;
  clause_title: string;
  plain_english: string;
  what_this_means_for_you: string;
  risk_flag?: string;
  risk_reason?: string;
  legal_terms: LegalTerm[];
  questions_for_lawyer: string[];
  regional_language_translation?: Record<string, string>;
}

export interface DiffToken {
  type: 'equal' | 'delete' | 'insert';
  value: string;
}

export interface ClauseCorrection {
  id: string;
  clause_id: string;
  clause_title: string;
  original_text: string;
  revised_text: string;
  reason: string;
  legal_doctrine?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  diff_tokens: DiffToken[];
}

export interface CorrectionResponse {
  document_id: string;
  total_flagged: number;
  corrections: ClauseCorrection[];
}

export interface RescoreResponse {
  document_id: string;
  before_score: number;
  after_score: number;
  delta: number;
  improved: boolean;
  breakdown: ScoreBreakdown;
  change_log: {
    clause_title: string;
    summary: string;
    original_snippet: string;
    revised_snippet: string;
  }[];
}

export interface TemplateField {
  key: string;
  label: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required: boolean;
  default_value?: any;
  options?: string[];
  help_text?: string;
}

export interface TemplateClauseOption {
  id: string;
  title: string;
  category: string;
  is_recommended: boolean;
  is_default: boolean;
  layman_explanation: string;
  text_template: string;
}

export interface LegalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  jurisdiction_supported: string[];
  fields: TemplateField[];
  optional_clauses: TemplateClauseOption[];
}

export interface GenerateResponse {
  generated_id: string;
  title: string;
  full_text: string;
  score_preview: number;
  risk_band: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  clauses: { title: string; text: string }[];
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context_used?: string;
  source?: 'rag' | 'llm' | 'template' | 'system';
}

export interface ChatResponse {
  session_id: string;
  question: string;
  answer: string;
  context_used: string;
  turn: number;
  source: string;
}

export type ExportFormat = 'docx' | 'pdf' | 'json';
export type ExportMode = 'clean' | 'tracked_changes';

export interface LanguageOption {
  code: string;
  label: string;
}

export interface PlatformConfig {
  online: boolean;
  service: string;
  version: string;
  llm_provider?: string;
  weights: Record<string, number>;
  languages: LanguageOption[];
  accepted_uploads: string[];
  max_upload_mb: number;
  export_formats: string[];
  export_modes: string[];
  disclaimer: string;
}

export interface SampleContract {
  id: string;
  filename: string;
  title: string;
  category: string;
  description: string;
  file_type: string;
}

export interface DocumentUploadResult {
  document_id: string;
  file_name: string;
  file_type?: string;
  clause_count: number;
  char_count: number;
  sha256_hash?: string;
  message?: string;
}


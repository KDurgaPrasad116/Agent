import type {
  AnalyzeResponse,
  ClauseExplanation,
  CorrectionResponse,
  RescoreResponse,
  LegalTemplate,
  GenerateResponse,
  ChatResponse,
  PlatformConfig,
  SampleContract,
  DocumentUploadResult,
} from '../types';

const API_BASE = '/api';

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((item: { msg?: string }) => item.msg || JSON.stringify(item)).join('; ');
    }
    return data?.message || res.statusText || 'Request failed';
  } catch {
    return res.statusText || `Request failed (${res.status})`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return (await res.json()) as T;
}

function defaultConfig(online: boolean): PlatformConfig {
  return {
    online,
    service: 'LexClear',
    version: '',
    weights: {},
    languages: [{ code: 'en', label: 'English' }],
    accepted_uploads: ['pdf', 'docx', 'txt'],
    max_upload_mb: 15,
    export_formats: ['docx', 'pdf'],
    export_modes: ['clean', 'tracked_changes'],
    disclaimer: 'LexClear helps you read contracts. It is not legal advice.',
  };
}

export const apiClient = {
  async checkHealth(): Promise<PlatformConfig> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return defaultConfig(false);
      const data = await res.json();
      return {
        online: true,
        service: data.service || 'LexClear',
        version: data.version || '1.0.0',
        llm_provider: data.llm_provider,
        weights: data.weights || {},
        languages: data.languages?.length ? data.languages : [{ code: 'en', label: 'English' }],
        accepted_uploads: data.accepted_uploads || ['pdf', 'docx', 'txt'],
        max_upload_mb: data.max_upload_mb || 15,
        export_formats: data.export_formats || ['docx', 'pdf'],
        export_modes: data.export_modes || ['clean', 'tracked_changes'],
        disclaimer: data.disclaimer || defaultConfig(true).disclaimer,
      };
    } catch {
      return defaultConfig(false);
    }
  },

  async listSamples(): Promise<SampleContract[]> {
    return request<SampleContract[]>('/samples');
  },

  async openSample(sampleId: string): Promise<DocumentUploadResult> {
    return request<DocumentUploadResult>(`/samples/${encodeURIComponent(sampleId)}/open`, {
      method: 'POST',
    });
  },

  async uploadFile(file: File): Promise<DocumentUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  },

  async uploadText(rawText: string, fileName = 'pasted_contract.txt'): Promise<DocumentUploadResult> {
    const formData = new FormData();
    formData.append('raw_text', rawText);
    formData.append('file_name', fileName);
    const res = await fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  },

  async analyze(documentId: string): Promise<AnalyzeResponse> {
    return request<AnalyzeResponse>('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId }),
    });
  },

  async explainClause(clauseId: string, lang = 'en'): Promise<ClauseExplanation> {
    return request<ClauseExplanation>(
      `/clauses/${encodeURIComponent(clauseId)}/explain?lang=${encodeURIComponent(lang)}`
    );
  },

  async getCorrections(documentId: string): Promise<CorrectionResponse> {
    return request<CorrectionResponse>('/correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId }),
    });
  },

  async rescore(documentId: string, updatedClauses: Record<string, string>): Promise<RescoreResponse> {
    return request<RescoreResponse>('/rescore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, updated_clauses: updatedClauses }),
    });
  },

  async chat(sessionId: string, question: string): Promise<ChatResponse> {
    return request<ChatResponse>('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
  },

  async clearChatSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/chat/session/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await readError(res));
  },

  async getTemplates(): Promise<LegalTemplate[]> {
    return request<LegalTemplate[]>('/templates');
  },

  async generateDocument(
    templateId: string,
    fieldValues: Record<string, unknown>,
    selectedClauseIds: string[],
    jurisdiction: string
  ): Promise<GenerateResponse> {
    return request<GenerateResponse>('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: templateId,
        field_values: fieldValues,
        selected_clause_ids: selectedClauseIds,
        jurisdiction,
      }),
    });
  },

  async exportDocument(documentId: string, format: 'docx' | 'pdf', mode: 'clean' | 'tracked_changes'): Promise<Blob> {
    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: documentId,
        export_format: format,
        mode,
      }),
    });
    if (!res.ok) throw new Error(await readError(res));
    return res.blob();
  },

  async deleteDocument(documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(documentId)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await readError(res));
  },

  async purgeAll(): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/purge/all`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await readError(res));
  },
};

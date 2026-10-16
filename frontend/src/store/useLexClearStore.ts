import { create } from 'zustand';
import type {
  AnalyzeResponse,
  Clause,
  ClauseExplanation,
  ClauseCorrection,
  RescoreResponse,
  ChatMessage,
  PlatformConfig,
  SampleContract,
  DocumentUploadResult,
} from '../types';
import { apiClient } from '../api/client';

export type ActiveNavView = 'landing' | 'workspace' | 'generator' | 'methodology';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const THEME_KEY = 'lexclear-theme';

function readStoredTheme(): boolean {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    /* ignore */
  }
  return false;
}

function applyTheme(isDark: boolean) {
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch {
    /* ignore */
  }
}

function emptyConfig(): PlatformConfig {
  return {
    online: false,
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

function welcomeMessage(): ChatMessage {
  return {
    id: 'welcome-msg',
    role: 'assistant',
    content: 'Ask about a clause, a payment term, or who can walk away. I’ll quote the document you opened.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'system',
  };
}

interface LexClearState {
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleTheme: () => void;

  backendStatus: 'checking' | 'online' | 'offline';
  platform: PlatformConfig;
  samples: SampleContract[];
  checkBackendStatus: () => Promise<void>;
  loadSamples: () => Promise<void>;

  documentId: string | null;
  fileName: string;
  rawText: string;
  analyzeData: AnalyzeResponse | null;
  isLoading: boolean;
  error: string | null;

  selectedClauseId: string | null;
  selectedClause: Clause | null;
  clauseExplanation: ClauseExplanation | null;
  isExplaining: boolean;
  explainLanguage: string;
  setSelectedClauseId: (id: string | null) => Promise<void> | void;
  setExplainLanguage: (lang: string) => Promise<void> | void;

  workspaceTab: 'score' | 'explain' | 'changes' | 'chat';
  setWorkspaceTab: (tab: 'score' | 'explain' | 'changes' | 'chat') => void;
  diffViewMode: 'split' | 'inline';
  setDiffViewMode: (mode: 'split' | 'inline') => void;

  corrections: Record<string, ClauseCorrection>;
  rescoreResult: RescoreResponse | null;
  acceptCorrection: (clauseId: string) => void;
  rejectCorrection: (clauseId: string) => void;
  modifyCorrection: (clauseId: string, customText: string) => void;
  acceptAllCorrections: () => void;
  resetCorrections: () => void;
  rescoreWithPatches: () => Promise<void>;

  chatSessionId: string | null;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  sendChatMessage: (question: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;

  loadSampleContract: (sampleId: string) => Promise<void>;
  uploadAndAnalyzeText: (text: string, filename?: string) => Promise<void>;
  uploadAndAnalyzeFile: (file: File) => Promise<void>;
  clearDocument: () => void;
  deleteActiveDocument: () => Promise<void>;
  purgeAllData: () => Promise<void>;
}

export const useLexClearStore = create<LexClearState>((set, get) => ({
  activeView: 'landing',
  setActiveView: (view) => set({ activeView: view }),
  isDark: readStoredTheme(),
  setIsDark: (isDark) => {
    applyTheme(isDark);
    set({ isDark });
  },
  toggleTheme: () => get().setIsDark(!get().isDark),

  backendStatus: 'checking',
  platform: emptyConfig(),
  samples: [],
  checkBackendStatus: async () => {
    const health = await apiClient.checkHealth();
    set({
      platform: health,
      backendStatus: health.online ? 'online' : 'offline',
    });
    if (health.online) {
      await get().loadSamples();
    }
  },
  loadSamples: async () => {
    try {
      const samples = await apiClient.listSamples();
      set({ samples });
    } catch {
      set({ samples: [] });
    }
  },

  documentId: null,
  fileName: '',
  rawText: '',
  analyzeData: null,
  isLoading: false,
  error: null,

  selectedClauseId: null,
  selectedClause: null,
  clauseExplanation: null,
  isExplaining: false,
  explainLanguage: 'en',
  setSelectedClauseId: async (id) => {
    if (!id) {
      set({ selectedClauseId: null, selectedClause: null, clauseExplanation: null });
      return;
    }

    const data = get().analyzeData;
    const clause = data?.clauses.find((c) => c.id === id) || null;
    set({ selectedClauseId: id, selectedClause: clause, isExplaining: true });

    try {
      const expl = await apiClient.explainClause(id, get().explainLanguage);
      set({ clauseExplanation: expl, isExplaining: false });
    } catch (e: unknown) {
      set({ isExplaining: false });
      get().addToast(e instanceof Error ? e.message : 'Could not explain this clause', 'error');
    }
  },
  setExplainLanguage: async (lang) => {
    set({ explainLanguage: lang });
    const currentId = get().selectedClauseId;
    if (!currentId) return;
    try {
      const expl = await apiClient.explainClause(currentId, lang);
      set({ clauseExplanation: expl });
    } catch (e: unknown) {
      get().addToast(e instanceof Error ? e.message : 'Could not switch language', 'error');
    }
  },

  workspaceTab: 'score',
  setWorkspaceTab: (workspaceTab) => set({ workspaceTab }),
  diffViewMode: 'split',
  setDiffViewMode: (diffViewMode) => set({ diffViewMode }),

  corrections: {},
  rescoreResult: null,

  acceptCorrection: (clauseId) => {
    const existing = get().corrections[clauseId];
    if (!existing) return;
    set({
      corrections: {
        ...get().corrections,
        [clauseId]: { ...existing, status: 'accepted' },
      },
    });
    get().addToast(`Kept the rewrite for ${existing.clause_title || 'this clause'}`, 'success');
    get().rescoreWithPatches();
  },

  rejectCorrection: (clauseId) => {
    const existing = get().corrections[clauseId];
    if (!existing) return;
    set({
      corrections: {
        ...get().corrections,
        [clauseId]: { ...existing, status: 'rejected' },
      },
    });
    get().addToast(`Left ${existing.clause_title || 'this clause'} as written`, 'info');
    get().rescoreWithPatches();
  },

  modifyCorrection: (clauseId, customText) => {
    const existing = get().corrections[clauseId];
    if (!existing) return;
    set({
      corrections: {
        ...get().corrections,
        [clauseId]: { ...existing, revised_text: customText, status: 'modified' },
      },
    });
    get().addToast('Saved your wording', 'success');
    get().rescoreWithPatches();
  },

  acceptAllCorrections: () => {
    const updated: Record<string, ClauseCorrection> = {};
    for (const [id, c] of Object.entries(get().corrections)) {
      updated[id] = { ...c, status: 'accepted' };
    }
    set({ corrections: updated });
    get().addToast('Applied every suggested rewrite', 'success');
    get().rescoreWithPatches();
  },

  resetCorrections: () => {
    const updated: Record<string, ClauseCorrection> = {};
    for (const [id, c] of Object.entries(get().corrections)) {
      updated[id] = { ...c, status: 'pending' };
    }
    set({ corrections: updated, rescoreResult: null });
    get().addToast('Rewrites reset', 'info');
  },

  rescoreWithPatches: async () => {
    const docId = get().documentId;
    if (!docId) return;

    const acceptedPatches: Record<string, string> = {};
    for (const c of Object.values(get().corrections)) {
      if (c.status === 'accepted' || c.status === 'modified') {
        acceptedPatches[c.clause_id] = c.revised_text;
      }
    }

    try {
      const rescore = await apiClient.rescore(docId, acceptedPatches);
      set({ rescoreResult: rescore });
      if (get().analyzeData) {
        set({
          analyzeData: {
            ...get().analyzeData!,
            overall_score: rescore.after_score,
            risk_band: rescore.breakdown.risk_band,
            breakdown: rescore.breakdown,
          },
        });
      }
    } catch (e: unknown) {
      get().addToast(e instanceof Error ? e.message : 'Could not recalculate the score', 'error');
    }
  },

  chatSessionId: null,
  chatMessages: [welcomeMessage()],
  isChatLoading: false,
  isChatOpen: false,
  setChatOpen: (isChatOpen) => set({ isChatOpen }),

  sendChatMessage: async (question) => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set({
      chatMessages: [...get().chatMessages, userMsg],
      isChatLoading: true,
    });

    const sessionId = get().chatSessionId || get().documentId;
    if (!sessionId) {
      set({ isChatLoading: false });
      get().addToast('Open a contract first', 'warning');
      return;
    }

    try {
      const response = await apiClient.chat(sessionId, question);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        context_used: response.context_used,
        source: (response.source as ChatMessage['source']) || 'rag',
      };
      set({
        chatMessages: [...get().chatMessages, assistantMsg],
        isChatLoading: false,
        chatSessionId: response.session_id || sessionId,
      });
    } catch (e: unknown) {
      set({ isChatLoading: false });
      get().addToast(e instanceof Error ? e.message : 'Chat failed', 'error');
    }
  },

  clearChatHistory: async () => {
    const sessionId = get().chatSessionId;
    if (sessionId) {
      try {
        await apiClient.clearChatSession(sessionId);
      } catch {
        /* local reset still happens */
      }
    }
    set({ chatMessages: [welcomeMessage()] });
    get().addToast('Chat cleared', 'info');
  },

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  isExportModalOpen: false,
  setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),

  loadSampleContract: async (sampleId) => {
    set({ isLoading: true, error: null });
    try {
      const uploadRes = await apiClient.openSample(sampleId);
      await hydrateFromUpload(get, set, uploadRes);
      get().addToast('Sample opened. Scoring is live from the server.', 'success');
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Could not open sample' });
      get().addToast(e instanceof Error ? e.message : 'Could not open sample', 'error');
    }
  },

  uploadAndAnalyzeText: async (text, filename = 'pasted_agreement.txt') => {
    set({ isLoading: true, error: null });
    try {
      const uploadRes = await apiClient.uploadText(text, filename);
      await hydrateFromUpload(get, set, uploadRes, text);
      get().addToast('Finished reading the text you pasted', 'success');
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Analysis failed' });
      get().addToast(e instanceof Error ? e.message : 'Analysis failed', 'error');
    }
  },

  uploadAndAnalyzeFile: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const uploadRes = await apiClient.uploadFile(file);
      let pasted = '';
      if (file.name.toLowerCase().endsWith('.txt') || file.type.startsWith('text/')) {
        pasted = await file.text();
      }
      await hydrateFromUpload(get, set, uploadRes, pasted);
      get().addToast(`Read ${uploadRes.clause_count} sections from ${file.name}`, 'success');
    } catch (e: unknown) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Upload failed' });
      get().addToast(e instanceof Error ? e.message : 'Upload failed', 'error');
    }
  },

  clearDocument: () => {
    set({
      documentId: null,
      fileName: '',
      rawText: '',
      analyzeData: null,
      selectedClauseId: null,
      selectedClause: null,
      clauseExplanation: null,
      corrections: {},
      rescoreResult: null,
      error: null,
      chatMessages: [welcomeMessage()],
    });
  },

  deleteActiveDocument: async () => {
    const docId = get().documentId;
    if (!docId) return;
    try {
      await apiClient.deleteDocument(docId);
      get().clearDocument();
      get().addToast('That file was removed from local storage', 'info');
    } catch (e: unknown) {
      get().addToast(e instanceof Error ? e.message : 'Could not delete', 'error');
    }
  },

  purgeAllData: async () => {
    try {
      await apiClient.purgeAll();
      get().clearDocument();
      get().addToast('Local files cleared', 'warning');
    } catch (e: unknown) {
      get().addToast(e instanceof Error ? e.message : 'Could not clear storage', 'error');
    }
  },
}));

async function hydrateFromUpload(
  get: () => LexClearState,
  set: (partial: Partial<LexClearState>) => void,
  uploadRes: DocumentUploadResult,
  pastedText?: string
) {
  const analysis = await apiClient.analyze(uploadRes.document_id);
  const correctionsRes = await apiClient.getCorrections(uploadRes.document_id);

  const correctionMap: Record<string, ClauseCorrection> = {};
  for (const c of correctionsRes.corrections) {
    correctionMap[c.clause_id] = c;
  }

  const rawText =
    pastedText ||
    analysis.clauses.map((c) => `${c.title}\n${c.text}`).join('\n\n');

  set({
    documentId: uploadRes.document_id,
    fileName: uploadRes.file_name,
    rawText,
    analyzeData: analysis,
    selectedClauseId: analysis.clauses[0]?.id || null,
    selectedClause: analysis.clauses[0] || null,
    corrections: correctionMap,
    rescoreResult: null,
    workspaceTab: 'score',
    activeView: 'workspace',
    chatSessionId: uploadRes.document_id,
    chatMessages: [welcomeMessage()],
    isLoading: false,
    error: null,
  });

  if (analysis.clauses[0]) {
    await get().setSelectedClauseId(analysis.clauses[0].id);
  }
}

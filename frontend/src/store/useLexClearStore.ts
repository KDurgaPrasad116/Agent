import { create } from 'zustand';
import type {
  AnalyzeResponse,
  Clause,
  ClauseExplanation,
  ClauseCorrection,
  RescoreResponse,
  ChatMessage,
} from '../types';
import { SAMPLE_CONTRACTS, getMockClauseExplanation, getMockCorrections } from '../mocks/contracts';
import { apiClient } from '../api/client';

export type ActiveNavView = 'landing' | 'workspace' | 'generator' | 'methodology';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface LexClearState {
  // Navigation & Theme
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  toggleTheme: () => void;

  // Backend Connectivity
  backendStatus: 'checking' | 'online' | 'offline';
  useMockMode: boolean;
  setUseMockMode: (mock: boolean) => void;
  checkBackendStatus: () => Promise<void>;

  // Document & Analysis
  documentId: string | null;
  fileName: string;
  rawText: string;
  analyzeData: AnalyzeResponse | null;
  isLoading: boolean;
  error: string | null;

  // Selected Clause & Layman Mode
  selectedClauseId: string | null;
  selectedClause: Clause | null;
  clauseExplanation: ClauseExplanation | null;
  isExplaining: boolean;
  explainLanguage: 'en' | 'hi' | 'kn';
  setSelectedClauseId: (id: string | null) => void;
  setExplainLanguage: (lang: 'en' | 'hi' | 'kn') => void;

  // Workspace View Modes & Tabs
  workspaceTab: 'score' | 'explain' | 'changes' | 'chat';
  setWorkspaceTab: (tab: 'score' | 'explain' | 'changes' | 'chat') => void;
  diffViewMode: 'split' | 'inline';
  setDiffViewMode: (mode: 'split' | 'inline') => void;

  // Redlines & Live Re-Score
  corrections: Record<string, ClauseCorrection>;
  rescoreResult: RescoreResponse | null;
  acceptCorrection: (clauseId: string) => void;
  rejectCorrection: (clauseId: string) => void;
  modifyCorrection: (clauseId: string, customText: string) => void;
  acceptAllCorrections: () => void;
  resetCorrections: () => void;
  rescoreWithPatches: () => Promise<void>;

  // RAG Conversational Legal Assistant
  chatSessionId: string | null;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  sendChatMessage: (question: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Modals
  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;

  // Actions
  loadPresetContract: (presetId: string) => void;
  uploadAndAnalyzeText: (text: string, filename?: string) => Promise<void>;
  uploadAndAnalyzeFile: (file: File) => Promise<void>;
  clearDocument: () => void;
  deleteActiveDocument: () => Promise<void>;
  purgeAllData: () => Promise<void>;
}

export const useLexClearStore = create<LexClearState>((set, get) => ({
  // Default Settings
  activeView: 'landing',
  setActiveView: (view) => set({ activeView: view }),
  isDark: true,
  setIsDark: (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark });
  },
  toggleTheme: () => {
    const next = !get().isDark;
    get().setIsDark(next);
  },

  // Backend Connectivity
  backendStatus: 'checking',
  useMockMode: false,
  setUseMockMode: (useMockMode) => {
    set({ useMockMode });
    get().addToast(
      useMockMode ? 'Switched to 100% Offline Benchmark Mocks' : 'Switched to Live FastAPI Backend',
      'info'
    );
  },
  checkBackendStatus: async () => {
    const health = await apiClient.checkHealth();
    set({ backendStatus: health.online ? 'online' : 'offline' });
  },

  // Document & Analysis
  documentId: null,
  fileName: '',
  rawText: '',
  analyzeData: null,
  isLoading: false,
  error: null,

  // Selected Clause & Layman Mode
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

    // Fetch explanation dynamically
    try {
      const expl = await apiClient.explainClause(id, get().explainLanguage);
      set({ clauseExplanation: expl, isExplaining: false });
    } catch {
      set({
        clauseExplanation: getMockClauseExplanation(id, get().explainLanguage),
        isExplaining: false,
      });
    }
  },
  setExplainLanguage: async (lang) => {
    set({ explainLanguage: lang });
    const currentId = get().selectedClauseId;
    if (currentId) {
      try {
        const expl = await apiClient.explainClause(currentId, lang);
        set({ clauseExplanation: expl });
      } catch {
        set({ clauseExplanation: getMockClauseExplanation(currentId, lang) });
      }
    }
  },

  // Workspace View
  workspaceTab: 'score',
  setWorkspaceTab: (workspaceTab) => set({ workspaceTab }),
  diffViewMode: 'split',
  setDiffViewMode: (diffViewMode) => set({ diffViewMode }),

  // Redlines & Live Re-score
  corrections: {},
  rescoreResult: null,

  acceptCorrection: (clauseId) => {
    const existing = get().corrections[clauseId];
    if (existing) {
      set({
        corrections: {
          ...get().corrections,
          [clauseId]: { ...existing, status: 'accepted' },
        },
      });
      get().addToast(`Accepted revision for clause ${existing.clause_title || clauseId}`, 'success');
      get().rescoreWithPatches();
    }
  },

  rejectCorrection: (clauseId) => {
    const existing = get().corrections[clauseId];
    if (existing) {
      set({
        corrections: {
          ...get().corrections,
          [clauseId]: { ...existing, status: 'rejected' },
        },
      });
      get().addToast(`Rejected revision for clause ${existing.clause_title || clauseId}`, 'info');
      get().rescoreWithPatches();
    }
  },

  modifyCorrection: (clauseId, customText) => {
    const existing = get().corrections[clauseId];
    if (existing) {
      set({
        corrections: {
          ...get().corrections,
          [clauseId]: { ...existing, revised_text: customText, status: 'modified' },
        },
      });
      get().addToast('Custom revision saved and queued for re-score', 'success');
      get().rescoreWithPatches();
    }
  },

  acceptAllCorrections: () => {
    const updated: Record<string, ClauseCorrection> = {};
    for (const [id, c] of Object.entries(get().corrections)) {
      updated[id] = { ...c, status: 'accepted' };
    }
    set({ corrections: updated });
    get().addToast('Accepted all recommended redline amendments', 'success');
    get().rescoreWithPatches();
  },

  resetCorrections: () => {
    const updated: Record<string, ClauseCorrection> = {};
    for (const [id, c] of Object.entries(get().corrections)) {
      updated[id] = { ...c, status: 'pending' };
    }
    set({ corrections: updated, rescoreResult: null });
    get().addToast('Reset redlines to initial contract baseline', 'info');
  },

  rescoreWithPatches: async () => {
    const docId = get().documentId;
    if (!docId) return;

    const acceptedPatches: Record<string, string> = {};
    for (const [id, c] of Object.entries(get().corrections)) {
      if (c.status === 'accepted' || c.status === 'modified') {
        acceptedPatches[c.clause_id] = c.revised_text;
      }
    }

    try {
      const rescore = await apiClient.rescore(docId, acceptedPatches);
      set({ rescoreResult: rescore });

      // Update active analyzeData score preview
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
    } catch (e) {
      console.warn('Rescore error:', e);
    }
  },

  // RAG Conversational Legal Assistant
  chatSessionId: null,
  chatMessages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Hello! I am your explainable legal intelligence assistant. Ask me questions about clauses, indemnities, liability caps, or potential risks in this document.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'system',
    },
  ],
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

    const sessionId = get().chatSessionId || get().documentId || 'default-session';

    try {
      const response = await apiClient.chat(sessionId, question);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        context_used: response.context_used,
        source: 'rag',
      };

      set({
        chatMessages: [...get().chatMessages, assistantMsg],
        isChatLoading: false,
        chatSessionId: response.session_id || sessionId,
      });
    } catch {
      set({ isChatLoading: false });
      get().addToast('Failed to retrieve chat response', 'error');
    }
  },

  clearChatHistory: async () => {
    const sessionId = get().chatSessionId;
    if (sessionId) {
      try {
        await apiClient.clearChatSession(sessionId);
      } catch {
        // fallback
      }
    }
    set({
      chatMessages: [
        {
          id: 'cleared-welcome',
          role: 'assistant',
          content: 'Conversation history cleared. How can I assist you with this document?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'system',
        },
      ],
    });
    get().addToast('Conversation memory cleared', 'info');
  },

  // Toasts
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, message, type };
    set({ toasts: [...get().toasts, newToast] });

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  // Modals
  isExportModalOpen: false,
  setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),

  // Actions
  loadPresetContract: (presetId) => {
    const preset = SAMPLE_CONTRACTS.find((p) => p.id === presetId) || SAMPLE_CONTRACTS[0];
    const initialCorrections: Record<string, ClauseCorrection> = {};

    const mockCorr = getMockCorrections(preset.analyzeData.document_id);
    for (const c of mockCorr.corrections) {
      initialCorrections[c.clause_id] = c;
    }

    set({
      documentId: preset.analyzeData.document_id,
      fileName: `${preset.title}.txt`,
      rawText: preset.rawText,
      analyzeData: preset.analyzeData,
      selectedClauseId: preset.analyzeData.clauses[0]?.id || null,
      selectedClause: preset.analyzeData.clauses[0] || null,
      corrections: initialCorrections,
      rescoreResult: null,
      workspaceTab: 'score',
      activeView: 'workspace',
      chatSessionId: preset.analyzeData.document_id,
      error: null,
    });

    // Populate initial clause explanation
    if (preset.analyzeData.clauses[0]) {
      const expl = getMockClauseExplanation(preset.analyzeData.clauses[0].id, get().explainLanguage);
      set({ clauseExplanation: expl });
    }

    get().addToast(`Loaded benchmark agreement: ${preset.title}`, 'success');
  },

  uploadAndAnalyzeText: async (text, filename = 'pasted_agreement.txt') => {
    set({ isLoading: true, error: null });
    try {
      const uploadRes = await apiClient.uploadText(text, filename);
      const analysis = await apiClient.analyze(uploadRes.document_id);
      const correctionsRes = await apiClient.getCorrections(uploadRes.document_id);

      const correctionMap: Record<string, ClauseCorrection> = {};
      for (const c of correctionsRes.corrections) {
        correctionMap[c.clause_id] = c;
      }

      set({
        documentId: uploadRes.document_id,
        fileName: filename,
        rawText: text,
        analyzeData: analysis,
        selectedClauseId: analysis.clauses[0]?.id || null,
        selectedClause: analysis.clauses[0] || null,
        corrections: correctionMap,
        rescoreResult: null,
        workspaceTab: 'score',
        activeView: 'workspace',
        chatSessionId: uploadRes.document_id,
        isLoading: false,
      });

      if (analysis.clauses[0]) {
        get().setSelectedClauseId(analysis.clauses[0].id);
      }

      get().addToast('Document successfully analyzed & segmented', 'success');
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Analysis failed' });
      get().addToast('Error during document analysis', 'error');
    }
  },

  uploadAndAnalyzeFile: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const uploadRes = await apiClient.uploadFile(file);
      const analysis = await apiClient.analyze(uploadRes.document_id);
      const correctionsRes = await apiClient.getCorrections(uploadRes.document_id);

      const correctionMap: Record<string, ClauseCorrection> = {};
      for (const c of correctionsRes.corrections) {
        correctionMap[c.clause_id] = c;
      }

      const fileContent = await file.text();

      set({
        documentId: uploadRes.document_id,
        fileName: file.name,
        rawText: fileContent || `[Uploaded binary: ${file.name}]`,
        analyzeData: analysis,
        selectedClauseId: analysis.clauses[0]?.id || null,
        selectedClause: analysis.clauses[0] || null,
        corrections: correctionMap,
        rescoreResult: null,
        workspaceTab: 'score',
        activeView: 'workspace',
        chatSessionId: uploadRes.document_id,
        isLoading: false,
      });

      if (analysis.clauses[0]) {
        get().setSelectedClauseId(analysis.clauses[0].id);
      }

      get().addToast(`Parsed ${uploadRes.clause_count} clauses from ${file.name}`, 'success');
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'File upload failed' });
      get().addToast('File upload failed', 'error');
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
    });
  },

  deleteActiveDocument: async () => {
    const docId = get().documentId;
    if (docId) {
      await apiClient.deleteDocument(docId);
      get().clearDocument();
      get().addToast('Document deleted and wiped from database', 'info');
    }
  },

  purgeAllData: async () => {
    await apiClient.purgeAll();
    get().clearDocument();
    get().addToast('Database purged: All audit caches cleared', 'warning');
  },
}));

/**
 * Legal AI Advisor — Professional Demo Controller
 * Enterprise Contract Risk & Statutory Compliance Presentation Suite
 */

// Application State
let selectedFile = null;
let currentFileName = "Contract Document";
let currentSessionId = null;
let currentAnalysisData = null;
let activeFilter = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initDropzone();
  loadDynamicStats();
  loadDynamicPresets();
  initAnalysisAction();
  initFiltersAndSearch();
  initChat();
  initDemoControls();
});

/* ── Dynamic System Performance Metrics ───────────────────────── */
async function loadDynamicStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const stats = await res.json();
      const badgeElem = document.getElementById('engine-badge-text');

      if (badgeElem && stats.engine_name) {
        badgeElem.textContent = `${stats.engine_name} Active (Legality F1: ${stats.statutory_legality_f1 || '97.8%'})`;
      }
    }
  } catch (e) {
    console.warn("Stats fetch error:", e);
  }
}

/* ── Benchmark Presets for Professional Demo ───────────────────── */
async function loadDynamicPresets() {
  const container = document.getElementById('presets-container');
  if (!container) return;

  const presetDescriptions = {
    "bitter_software": "Predatory Vendor Contract (8 Statutory Traps &amp; Penalties)",
    "bitter_sale_deed": "Severely Illegal Sale Deed (16 Statutory Violations)",
    "fair_sale_deed": "Standard Fair Sale Deed (0 False Positives • Safe to Sign)",
    "hindi_contract": "Multilingual Hindi Employment Pact (Sec 27 ICA Enforceability)"
  };

  try {
    const res = await fetch('/api/presets');
    if (res.ok) {
      const data = await res.json();
      container.innerHTML = '';

      if (data.presets && data.presets.length > 0) {
        data.presets.forEach((p) => {
          const btn = document.createElement('button');
          btn.className = 'preset-card-btn';
          btn.type = 'button';

          const cleanTitle = p.label.replace(/^[^\w\s]+/, '').trim();
          const desc = presetDescriptions[p.id] || "Pre-configured benchmark document fixture";

          btn.innerHTML = `
            <div class="preset-card-title">${escapeHtml(cleanTitle)}</div>
            <div class="preset-card-desc">${desc}</div>
          `;

          btn.addEventListener('click', () => {
            const tabBtnText = document.getElementById('tab-btn-text');
            const textArea = document.getElementById('text-input');
            if (tabBtnText) tabBtnText.click();
            if (textArea) {
              textArea.value = p.text;
              textArea.focus();
            }
            currentFileName = cleanTitle;
            selectedFile = null;

            // Visual feedback
            const dropBadge = document.getElementById('selected-file-badge');
            const dropLabel = document.getElementById('selected-filename');
            if (dropBadge && dropLabel) {
              dropLabel.textContent = cleanTitle;
              dropBadge.style.display = 'inline-block';
            }

            // Update step
            updateStep(1);
          });

          container.appendChild(btn);
        });
      }
    }
  } catch (e) {
    console.warn("Presets fetch error:", e);
  }
}

/* ── Input Tabs Handling ──────────────────────────────────────── */
function initTabs() {
  const tabBtnFile = document.getElementById('tab-btn-file');
  const tabBtnText = document.getElementById('tab-btn-text');
  const paneFile = document.getElementById('tab-pane-file');
  const paneText = document.getElementById('tab-pane-text');

  if (!tabBtnFile || !tabBtnText) return;

  tabBtnFile.addEventListener('click', () => {
    tabBtnFile.classList.add('active');
    tabBtnText.classList.remove('active');
    paneFile.classList.add('active');
    paneText.classList.remove('active');
  });

  tabBtnText.addEventListener('click', () => {
    tabBtnText.classList.add('active');
    tabBtnFile.classList.remove('active');
    paneText.classList.add('active');
    paneFile.classList.remove('active');
  });
}

/* ── File Drag & Drop ─────────────────────────────────────────── */
function initDropzone() {
  const dropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');
  const fileBadge = document.getElementById('selected-file-badge');
  const filenameLabel = document.getElementById('selected-filename');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    selectedFile = file;
    currentFileName = file.name;
    filenameLabel.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileBadge.style.display = 'inline-block';
    updateStep(1);
  }
}

/* ── Analysis Pipeline Execution ──────────────────────────────── */
function initAnalysisAction() {
  const actionBtn = document.getElementById('btn-brew-action');
  const progressBox = document.getElementById('brew-progress-box');
  const progressText = document.getElementById('brew-status-text');
  const progressFill = document.getElementById('progress-bar-fill');
  const resultsSection = document.getElementById('results-section');

  if (!actionBtn) return;

  actionBtn.addEventListener('click', async () => {
    const isFileTab = document.getElementById('tab-btn-file').classList.contains('active');
    const textInput = document.getElementById('text-input').value.trim();

    let uploadPayload = null;
    let fileNameToUse = "contract.txt";

    if (isFileTab && selectedFile) {
      uploadPayload = selectedFile;
      fileNameToUse = selectedFile.name;
    } else if (textInput.length > 0) {
      uploadPayload = new Blob([textInput], { type: 'text/plain' });
      fileNameToUse = currentFileName.endsWith('.txt') ? currentFileName : `${currentFileName}.txt`;
    } else {
      alert("Please select a contract document file or choose one of the benchmark demo fixtures.");
      return;
    }

    // Advance to Step 2
    updateStep(2);

    // UI Loading state
    actionBtn.disabled = true;
    progressBox.style.display = 'block';
    progressFill.style.width = '25%';
    progressText.textContent = "Extracting clauses and normalizing legal language...";

    const timer1 = setTimeout(() => {
      progressFill.style.width = '60%';
      progressText.textContent = "Running Dual-Engine Classifiers & Sublinear TF-IDF...";
    }, 450);

    const timer2 = setTimeout(() => {
      progressFill.style.width = '88%';
      progressText.textContent = "Verifying statutory legality against Indian Contract Act & Property Doctrines...";
    }, 950);

    const formData = new FormData();
    formData.append('file', uploadPayload, fileNameToUse);

    try {
      let response = await fetch('/analyze/multilingual', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        response = await fetch('/analyze', {
          method: 'POST',
          body: formData
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Analysis failed with status ${response.status}`);
      }

      const result = await response.json();
      currentAnalysisData = result;
      currentSessionId = result.session_id || 'session_' + Date.now();

      progressFill.style.width = '100%';
      progressText.textContent = "Synthesizing executive findings...";

      setTimeout(() => {
        progressBox.style.display = 'none';
        actionBtn.disabled = false;
        renderResults(result);
        resultsSection.style.display = 'block';
        updateStep(3);
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }, 400);

    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      progressBox.style.display = 'none';
      actionBtn.disabled = false;
      alert("Analysis error: " + err.message);
    }
  });
}

/* ── Render Analysis Results & Executive Findings ─────────────── */
function renderResults(data) {
  const overallRisk = (data.overall_risk_score !== undefined && data.overall_risk_score !== null)
    ? data.overall_risk_score
    : (data.avg_risk_score !== undefined ? data.avg_risk_score : 0);

  const overallBenefit = (data.overall_benefit_score !== undefined && data.overall_benefit_score !== null)
    ? data.overall_benefit_score
    : (data.clauses && data.clauses.length ? Math.round((data.clauses.reduce((acc, c) => acc + (c.benefit_score || 0), 0) / data.clauses.length) * 10) / 10 : 0);

  const illegalCount = (data.illegal_clause_count !== undefined && data.illegal_clause_count !== null)
    ? data.illegal_clause_count
    : (data.illegal_clauses_count !== undefined ? data.illegal_clauses_count : (data.clauses ? data.clauses.filter(c => c.is_legal === false).length : 0));

  const totalClauses = data.total_clauses || (data.clauses ? data.clauses.length : 0);
  const decision = data.decision || "Needs Review";
  const decisionReasoning = data.decision_reasoning || data.explanation || "Evaluated against statutory doctrines.";

  // Update Toolbar Meta
  const fileMetaElem = document.getElementById('analyzed-filename');
  if (fileMetaElem) fileMetaElem.textContent = currentFileName;

  // Render Numeric KPIs
  document.getElementById('val-risk-score').textContent = `${(Math.round(overallRisk * 10) / 10).toFixed(1)}/10`;
  document.getElementById('val-benefit-score').textContent = `${(Math.round(overallBenefit * 10) / 10).toFixed(1)}/10`;
  document.getElementById('val-illegal-count').textContent = illegalCount;
  document.getElementById('val-total-clauses').textContent = totalClauses;

  // Dynamic Meter Fills
  const riskFill = document.getElementById('meter-risk-fill');
  const benefitFill = document.getElementById('meter-benefit-fill');
  const violationFill = document.getElementById('meter-violation-fill');

  if (riskFill) riskFill.style.width = `${Math.min(100, Math.max(0, overallRisk * 10))}%`;
  if (benefitFill) benefitFill.style.width = `${Math.min(100, Math.max(0, overallBenefit * 10))}%`;
  if (violationFill) violationFill.style.width = `${Math.min(100, illegalCount * 12.5)}%`;

  // Severity Subtexts
  const riskSub = document.getElementById('risk-severity-sub');
  if (riskSub) {
    if (overallRisk >= 7) riskSub.textContent = "High Risk Exposure";
    else if (overallRisk >= 4) riskSub.textContent = "Moderate Risk Terms";
    else riskSub.textContent = "Low Risk Profile";
  }

  const illegalSub = document.getElementById('illegal-severity-sub');
  if (illegalSub) {
    illegalSub.textContent = illegalCount === 0 ? "0 Violations Detected" : `${illegalCount} Unlawful Terms Flagged`;
  }

  // Verdict Banner Styling
  const bannerContainer = document.getElementById('verdict-banner-container');
  const verdictIcon = document.getElementById('verdict-icon');
  const verdictTitle = document.getElementById('verdict-title');
  const verdictSubtitle = document.getElementById('verdict-subtitle');
  const verdictBadge = document.getElementById('verdict-action-badge');

  bannerContainer.classList.remove('safe', 'review', 'reject');
  verdictSubtitle.textContent = decisionReasoning;
  verdictBadge.textContent = decision.toUpperCase();

  const decLower = decision.toLowerCase();
  if (decLower.includes("safe") || decLower.includes("accept")) {
    bannerContainer.classList.add('safe');
    verdictIcon.textContent = '✓';
    verdictTitle.textContent = `Safe to Sign (${decision})`;
  } else if (decLower.includes("not sign") || decLower.includes("reject") || illegalCount >= 3) {
    bannerContainer.classList.add('reject');
    verdictIcon.textContent = '✕';
    verdictTitle.textContent = `Do Not Sign (${decision})`;
  } else {
    bannerContainer.classList.add('review');
    verdictIcon.textContent = '⚠';
    verdictTitle.textContent = `Needs Review (${decision})`;
  }

  // Populate clauses stack
  let clauses = data.clauses || [];
  updateFilterCounts(clauses);
  renderClausesList(clauses, activeFilter, currentSearchQuery);
}

/* ── Filter Counts & Clause Rendering ─────────────────────────── */
function updateFilterCounts(clauses) {
  let fav = 0, bit = 0, std = 0, ill = 0;

  clauses.forEach(c => {
    const isIllegal = c.is_legal === false;
    const type = (c.clause_type || c.type || c.classification || "Neutral").toLowerCase();

    if (isIllegal) ill++;
    if (type === 'positive') fav++;
    else if (type === 'negative') bit++;
    else std++;
  });

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('count-all', clauses.length);
  setTxt('count-illegal', ill);
  setTxt('count-bitter', bit);
  setTxt('count-favorable', fav);
  setTxt('count-standard', std);
}

function initFiltersAndSearch() {
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(btn => {
    btn.addEventListener('click', () => {
      filterChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      if (currentAnalysisData && currentAnalysisData.clauses) {
        renderClausesList(currentAnalysisData.clauses, activeFilter, currentSearchQuery);
      }
    });
  });

  const searchBox = document.getElementById('clause-search-box');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      if (currentAnalysisData && currentAnalysisData.clauses) {
        renderClausesList(currentAnalysisData.clauses, activeFilter, currentSearchQuery);
      }
    });
  }
}

function renderClausesList(clauses, filter, query = '') {
  const container = document.getElementById('clauses-container');
  if (!container) return;
  container.innerHTML = '';

  const filtered = clauses.filter(c => {
    const isIllegal = c.is_legal === false;
    const type = (c.clause_type || c.type || c.classification || "Neutral").toLowerCase();

    // Type filter
    let matchesType = true;
    if (filter === 'favorable') matchesType = (type === 'positive' && !isIllegal);
    else if (filter === 'bitter') matchesType = (type === 'negative' && !isIllegal);
    else if (filter === 'standard') matchesType = (type === 'neutral' && !isIllegal);
    else if (filter === 'illegal') matchesType = isIllegal;

    if (!matchesType) return false;

    // Search query filter
    if (query) {
      const text = (c.clause || c.text || c.text_translated || c.text_original || '').toLowerCase();
      const reason = (c.illegality_reason || c.illegal_reason || '').toLowerCase();
      const rag = (c.rag_context || '').toLowerCase();
      return text.includes(query) || reason.includes(query) || rag.includes(query);
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-default);">
        No clauses match your filter criteria.
      </div>
    `;
    return;
  }

  filtered.forEach((c, idx) => {
    const isIllegal = c.is_legal === false;
    const clauseType = c.clause_type || c.type || c.classification || "Neutral";
    const riskScore = c.risk_score !== undefined ? c.risk_score : 5;
    const benefitScore = c.benefit_score !== undefined ? c.benefit_score : 5;
    const text = c.clause || c.text || c.text_translated || c.text_original || "";
    const origText = c.text_original && c.text_original !== text ? c.text_original : null;
    const reason = c.illegality_reason || c.illegal_reason || "";
    const ragContext = c.rag_context || "";
    const action = c.action || (isIllegal ? "Reject" : (riskScore >= 7 ? "Review" : "Accept"));
    const factors = c.risk_factors || c.risk_flags || [];

    const card = document.createElement('div');
    card.className = `clause-card ${isIllegal ? 'illegal-alert' : (clauseType.toLowerCase() === 'positive' ? 'positive-favorable' : '')}`;

    let typeBadgeClass = 'badge-type-neutral';
    if (clauseType.toLowerCase() === 'positive') typeBadgeClass = 'badge-type-positive';
    if (clauseType.toLowerCase() === 'negative') typeBadgeClass = 'badge-type-negative';

    let actionColorClass = 'badge-action-accept';
    if (action.toLowerCase() === 'review') actionColorClass = 'badge-action-review';
    if (action.toLowerCase() === 'reject') actionColorClass = 'badge-action-reject';

    card.innerHTML = `
      <div class="clause-card-top">
        <div class="clause-meta-row">
          <span class="clause-id-tag">Clause #${idx + 1}</span>
          <span class="badge ${typeBadgeClass}">${clauseType}</span>
          <span class="badge ${isIllegal ? 'badge-illegal' : 'badge-legal'}">${isIllegal ? 'Statutory Violation' : '✓ Legally Valid'}</span>
          <span class="badge ${actionColorClass}">Action: ${action}</span>
        </div>
        <div class="clause-scores-text">
          Risk: <span class="score-highlight">${riskScore}/10</span> &bull; 
          Benefit: <span class="score-highlight">${benefitScore}/10</span>
        </div>
      </div>

      ${isIllegal ? `
        <div class="illegal-warning-strip">
          <strong>Statutory Breach:</strong> ${escapeHtml(reason || "Violates mandatory statutory regulations")}
        </div>
      ` : ''}

      <div class="clause-body-text">
        ${escapeHtml(text)}
      </div>

      ${origText ? `
        <div class="clause-orig-sub">
          <strong>Original Indic Text:</strong> ${escapeHtml(origText)}
        </div>
      ` : ''}

      ${factors && factors.length > 0 ? `
        <div class="risk-factor-pills">
          ${factors.map(f => `<span class="factor-pill">${escapeHtml(f)}</span>`).join('')}
        </div>
      ` : ''}

      ${(ragContext || reason) ? `
        <div>
          <button class="details-toggle-btn" type="button">Inspect Legal Grounds &amp; Precedents &blacktriangledown;</button>
          <div class="details-content-box">
            <p><strong>Statutory Grounds &amp; Case Doctrine:</strong> ${escapeHtml(ragContext || reason)}</p>
          </div>
        </div>
      ` : ''}
    `;

    // Hook collapsible drawer
    const toggleBtn = card.querySelector('.details-toggle-btn');
    const drawer = card.querySelector('.details-content-box');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
        toggleBtn.innerHTML = drawer.classList.contains('open') 
          ? "Hide Legal Grounds &blacktriangle;" 
          : "Inspect Legal Grounds &amp; Precedents &blacktriangledown;";
      });
    }

    container.appendChild(card);
  });
}

/* ── Interactive Legal Counsel Chat Assistant ─────────────────── */
function initChat() {
  const sendBtn = document.getElementById('btn-chat-send');
  const chatInput = document.getElementById('chat-query-input');
  const chatWindow = document.getElementById('chat-window');
  const demoChips = document.querySelectorAll('.demo-chip');

  if (!sendBtn || !chatInput || !chatWindow) return;

  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-q');
      chatInput.value = q;
      sendMessage(q);
    });
  });

  sendBtn.addEventListener('click', () => {
    const q = chatInput.value.trim();
    if (q) sendMessage(q);
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = chatInput.value.trim();
      if (q) sendMessage(q);
    }
  });

  async function sendMessage(question) {
    if (!currentSessionId) {
      currentSessionId = 'session_demo_' + Date.now();
    }

    appendMessage(question, 'user', null, 'Executive');
    chatInput.value = '';

    const typingId = 'typing_' + Date.now();
    appendMessage("Analyzing legal doctrine and contract memory...", 'counsel', typingId, 'Legal Advisor');

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          question: question
        })
      });

      const typingElem = document.getElementById(typingId);
      if (typingElem) typingElem.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        appendMessage("Advisory Note: " + (errData.detail || "Unable to consult document memory right now."), 'counsel', null, 'Legal Advisor');
        return;
      }

      const chatData = await res.json();
      appendMessage(chatData.answer, 'counsel', null, 'Legal Advisor');

    } catch (e) {
      const typingElem = document.getElementById(typingId);
      if (typingElem) typingElem.remove();
      appendMessage("Network connection interrupted: " + e.message, 'counsel', null, 'System');
    }
  }

  function appendMessage(text, role, elemId = null, senderLabel = 'Counsel') {
    const msg = document.createElement('div');
    msg.className = `chat-bubble ${role}`;
    if (elemId) msg.id = elemId;

    msg.innerHTML = `
      <div class="bubble-sender">${senderLabel}</div>
      <div class="bubble-body">${escapeHtml(text)}</div>
    `;

    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

/* ── Demo Presentation Controls (Print, Reset, Step Tracker) ─── */
function initDemoControls() {
  const printBtn = document.getElementById('btn-export-pdf');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const inputPanel = document.getElementById('input-panel');
      if (inputPanel) {
        inputPanel.scrollIntoView({ behavior: 'smooth' });
        updateStep(1);
      }
    });
  }
}

function updateStep(stepNumber) {
  const s1 = document.getElementById('step-nav-1');
  const s2 = document.getElementById('step-nav-2');
  const s3 = document.getElementById('step-nav-3');

  [s1, s2, s3].forEach((s, idx) => {
    if (s) {
      if (idx + 1 <= stepNumber) s.classList.add('active');
      else s.classList.remove('active');
    }
  });
}

/* ── Utility Helper ───────────────────────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

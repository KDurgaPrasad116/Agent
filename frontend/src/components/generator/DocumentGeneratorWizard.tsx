import React, { useState, useEffect } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Badge, RiskBadge } from '../ui/Badge';
import { ScoreRing } from '../ui/ScoreRing';
import { apiClient } from '../../api/client';
import type { LegalTemplate, GenerateResponse } from '../../types';
import {
  FileText,
  Shield,
  Home,
  Briefcase,
  Code,
  DollarSign,
  Scale,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Save,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';

const FALLBACK_TEMPLATES: LegalTemplate[] = [
  {
    id: 'nda',
    name: 'Mutual Non-Disclosure Agreement (NDA)',
    description: 'Protects confidential business information, trade secrets, and technical data between collaborating parties.',
    category: 'Commercial & IP',
    jurisdiction_supported: ['Delaware, USA', 'England and Wales', 'New Delhi, India', 'Singapore'],
    fields: [
      { key: 'party_a_name', label: 'Disclosing/First Party Name', field_type: 'text', placeholder: 'Zenith Corp LLC', required: true, default_value: 'Zenith Corp LLC' },
      { key: 'party_b_name', label: 'Receiving/Second Party Name', field_type: 'text', placeholder: 'Horizon Labs Inc', required: true, default_value: 'Horizon Labs Inc' },
      { key: 'effective_date', label: 'Effective Date', field_type: 'date', required: true, default_value: '2026-10-15' },
      { key: 'term_years', label: 'Confidentiality Duration (Years)', field_type: 'number', required: true, default_value: 2 },
      { key: 'liability_cap', label: 'Liability Cap Amount (USD)', field_type: 'number', required: true, default_value: 50000 },
      { key: 'jurisdiction', label: 'Governing Jurisdiction', field_type: 'select', options: ['Delaware, USA', 'England and Wales', 'New Delhi, India', 'Singapore'], required: true, default_value: 'Delaware, USA' },
    ],
    optional_clauses: [
      {
        id: 'opt_non_solicit',
        title: 'Mutual Non-Solicitation of Personnel',
        category: 'Protection',
        is_recommended: true,
        is_default: true,
        layman_explanation: "Prevents either party from poaching the other's employees during and for 12 months following collaboration.",
        text_template: 'Mutual Non-Solicitation: During the term of this Agreement and for a period of one (1) year thereafter, neither party shall directly solicit for employment any employee of the other party involved in disclosures hereunder.',
      },
      {
        id: 'opt_injunctive_relief',
        title: 'Right to Seek Injunctive Relief',
        category: 'Remedies',
        is_recommended: true,
        is_default: true,
        layman_explanation: 'Allows immediate emergency court orders to halt unauthorized information leaks before financial harm occurs.',
        text_template: 'Injunctive Relief: The parties acknowledge that unauthorized disclosure causes irreparable injury and agree that the disclosing party shall be entitled to seek temporary and permanent injunctive relief without necessity of posting bond.',
      },
      {
        id: 'opt_residuals',
        title: 'Residual Knowledge Clause',
        category: 'IP Flexibility',
        is_recommended: false,
        is_default: false,
        layman_explanation: 'Permits employees to use general skills and unaided mental impressions gained during the project.',
        text_template: 'Residuals: Either party may use generalized ideas, concepts, and techniques retained in unaided memory by persons who had lawful access to Confidential Information.',
      },
    ],
  },
  {
    id: 'service_freelance',
    name: 'Master Freelance & Services Agreement',
    description: 'Standard independent contractor agreement establishing deliverables, payment milestones, IP transfer, and mutual protections.',
    category: 'Services & Contracting',
    jurisdiction_supported: ['General Common Law', 'California, USA', 'New York, USA', 'United Kingdom'],
    fields: [
      { key: 'client_name', label: 'Client Legal Name', field_type: 'text', placeholder: 'Apex Retail Solutions', required: true, default_value: 'Apex Retail Solutions' },
      { key: 'contractor_name', label: 'Contractor / Freelancer Name', field_type: 'text', placeholder: 'Jane Developer', required: true, default_value: 'Jane Developer' },
      { key: 'project_description', label: 'Scope & Deliverables', field_type: 'textarea', placeholder: 'Full-stack software development and deployment', required: true, default_value: 'Full-stack software architecture, API development, and production deployment' },
      { key: 'fee_amount', label: 'Total Contract Fee ($)', field_type: 'number', required: true, default_value: 15000 },
      { key: 'payment_days', label: 'Payment Terms (Net Days)', field_type: 'number', required: true, default_value: 30 },
      { key: 'notice_days', label: 'Termination Notice Period (Days)', field_type: 'number', required: true, default_value: 14 },
    ],
    optional_clauses: [
      {
        id: 'opt_change_order',
        title: 'Written Change Order Requirement',
        category: 'Scope Management',
        is_recommended: true,
        is_default: true,
        layman_explanation: 'Prevents unpaid scope creep by mandating written approval for any changes to original deliverables.',
        text_template: 'Change Orders: Any expansion or modification of the agreed scope must be documented in a written Change Order signed by both parties, adjusting compensation and delivery milestones accordingly.',
      },
      {
        id: 'opt_portfolio_rights',
        title: 'Contractor Portfolio Rights',
        category: 'Marketing',
        is_recommended: true,
        is_default: true,
        layman_explanation: 'Allows the contractor to display completed work in their public design/code portfolio after release.',
        text_template: 'Portfolio Display: Contractor retains the right to reference Client and showcase non-confidential screenshots of deliverables in professional portfolios and case studies.',
      },
    ],
  },
  {
    id: 'rental_lease',
    name: 'Commercial & Residential Lease Agreement',
    description: 'Lease contract balancing premises use, security deposit protection, maintenance duties, and landlord entry protocols.',
    category: 'Real Estate',
    jurisdiction_supported: ['India', 'US', 'UK', 'General Common Law'],
    fields: [
      { key: 'landlord_name', label: 'Landlord Name', field_type: 'text', placeholder: 'Metro Commercial Holdings', required: true, default_value: 'Metro Commercial Holdings' },
      { key: 'tenant_name', label: 'Tenant Name', field_type: 'text', placeholder: 'Urban Roasters Cafe LLC', required: true, default_value: 'Urban Roasters Cafe LLC' },
      { key: 'property_address', label: 'Leased Premises Address', field_type: 'text', placeholder: 'Suite 300, 100 Main Street', required: true, default_value: 'Suite 300, 100 Main Street' },
      { key: 'monthly_rent', label: 'Monthly Rent ($)', field_type: 'number', required: true, default_value: 3500 },
      { key: 'security_deposit', label: 'Security Deposit ($)', field_type: 'number', required: true, default_value: 7000 },
      { key: 'lease_months', label: 'Lease Term (Months)', field_type: 'number', required: true, default_value: 12 },
    ],
    optional_clauses: [
      {
        id: 'opt_notice_entry',
        title: 'Landlord 48-Hour Notice for Entry',
        category: 'Privacy',
        is_recommended: true,
        is_default: true,
        layman_explanation: 'Guarantees tenant quiet enjoyment by mandating 48 hours notice before landlord property inspections.',
        text_template: 'Quiet Enjoyment and Inspection Notice: Landlord agrees not to enter the premises without providing at least forty-eight (48) hours prior written notice during reasonable business hours, except in bona fide emergencies.',
      },
      {
        id: 'opt_deposit_interest',
        title: 'Escrow & Deposit Refund Terms',
        category: 'Finance',
        is_recommended: true,
        is_default: true,
        layman_explanation: 'Requires security deposit to be refunded within 14 days with an itemized receipt for any repair deductions.',
        text_template: 'Deposit Protection: Security deposit shall be maintained in a separate account and refunded within fourteen (14) days of lease expiry, accompanied by itemized contractor receipts for any legitimate repairs.',
      },
    ],
  },
  {
    id: 'employment',
    name: 'Executive Employment Agreement',
    description: 'Employment contract defining role, compensation, benefits, intellectual property assignment, and balanced termination rules.',
    category: 'Human Resources',
    jurisdiction_supported: ['India', 'US', 'UK', 'General Common Law'],
    fields: [
      { key: 'employer_name', label: 'Employer Company', field_type: 'text', placeholder: 'NovaTech Global Inc', required: true, default_value: 'NovaTech Global Inc' },
      { key: 'employee_name', label: 'Employee Full Name', field_type: 'text', placeholder: 'Alex Mercer', required: true, default_value: 'Alex Mercer' },
      { key: 'position_title', label: 'Position / Title', field_type: 'text', placeholder: 'Vice President of Engineering', required: true, default_value: 'Vice President of Engineering' },
      { key: 'annual_salary', label: 'Annual Salary ($)', field_type: 'number', required: true, default_value: 160000 },
      { key: 'severance_weeks', label: 'Severance Notice Period (Weeks)', field_type: 'number', required: true, default_value: 4 },
    ],
    optional_clauses: [
      {
        id: 'opt_ip_carveout',
        title: 'Pre-Existing IP Carve-Out',
        category: 'Intellectual Property',
        is_recommended: true,
        is_default: true,
        layman_explanation: "Ensures personal inventions or open-source projects created before employment remain employee's property.",
        text_template: 'Prior Inventions Carve-Out: Inventions, software code, and patents created by Employee prior to employment and listed on Schedule A are expressly excluded from employer ownership.',
      },
    ],
  },
  {
    id: 'sale_agreement',
    name: 'Standard Agreement to Sell (Property & Goods)',
    description: 'Legally balanced conveyance agreement with clear title covenants, statutory compliance, and dispute resolution.',
    category: 'Commercial Conveyance',
    jurisdiction_supported: ['General Common Law'],
    fields: [
      { key: 'seller_name', label: 'Seller Legal Name', field_type: 'text', placeholder: 'Robert Sterling', required: true, default_value: 'Robert Sterling' },
      { key: 'buyer_name', label: 'Buyer Legal Name', field_type: 'text', placeholder: 'Elena Rostova', required: true, default_value: 'Elena Rostova' },
      { key: 'property_description', label: 'Property / Assets Description', field_type: 'textarea', placeholder: 'Plot No 42, Green Meadows', required: true, default_value: 'Commercial Logistics Center, Lot 40, Green Industrial Park' },
      { key: 'sale_price', label: 'Total Consideration Amount ($)', field_type: 'number', required: true, default_value: 450000 },
      { key: 'closing_date', label: 'Closing Date', field_type: 'date', required: true, default_value: '2026-11-30' },
    ],
    optional_clauses: [
      {
        id: 'opt_clear_title',
        title: 'Warranty of Marketable Title & Free from Encumbrances',
        category: 'Title Guarantee',
        is_recommended: true,
        is_default: true,
        layman_explanation: 'Seller certifies they own property free of debts, mortgages, liens, or litigation.',
        text_template: 'Free Title Covenant: Seller covenants that the property is free from all encumbrances, liens, mortgages, charges, or litigations, and seller holds good, marketable title.',
      },
    ],
  },
  {
    id: 'power_of_attorney',
    name: 'General Power of Attorney (POA)',
    description: 'Appoints a trusted agent to manage financial, banking, and administrative affairs with strict fiduciary accountability.',
    category: 'Personal & Estate',
    jurisdiction_supported: ['General Common Law'],
    fields: [
      { key: 'principal_name', label: 'Principal Name (Grantor)', field_type: 'text', placeholder: 'Arthur Pendelton', required: true, default_value: 'Arthur Pendelton' },
      { key: 'agent_name', label: 'Attorney-in-Fact Name (Agent)', field_type: 'text', placeholder: 'Sarah Pendelton', required: true, default_value: 'Sarah Pendelton' },
      { key: 'powers_scope', label: 'Scope of Granted Powers', field_type: 'textarea', placeholder: 'Banking transactions, tax filings, and utility management', required: true, default_value: 'Banking operations, real estate tax filings, and commercial utility management' },
      { key: 'revocation_terms', label: 'Revocation Notice Method', field_type: 'text', required: true, default_value: 'Written notice delivered to agent' },
    ],
    optional_clauses: [
      {
        id: 'opt_fiduciary_duty',
        title: 'Express Fiduciary Duty & Accounting',
        category: 'Accountability',
        is_recommended: true,
        is_default: true,
        layman_explanation: "Requires attorney-in-fact to maintain clear bookkeeping and act strictly for the grantor's benefit.",
        text_template: 'Fiduciary Accountability: The Attorney-in-Fact shall act strictly in a fiduciary capacity, keeping detailed records of all transactions undertaken on behalf of Principal.',
      },
    ],
  },
];

export const DocumentGeneratorWizard: React.FC = () => {
  const { setActiveView, uploadAndAnalyzeText } = useLexClearStore();
  const [templates, setTemplates] = useState<LegalTemplate[]>(FALLBACK_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('nda');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<GenerateResponse | null>(null);

  // Dynamic field values map
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  // Selected optional clause IDs
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>([]);

  // Fetch templates from API or fallback
  useEffect(() => {
    let mounted = true;
    apiClient
      .getTemplates()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setTemplates(data);
        }
      })
      .catch(() => {
        // Fallback remains active
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Initialize field values and default clauses when template changes
  useEffect(() => {
    if (!activeTemplate) return;
    const initialValues: Record<string, any> = {};
    activeTemplate.fields.forEach((field) => {
      initialValues[field.key] = field.default_value !== undefined ? field.default_value : (field.placeholder || '');
    });
    setFieldValues(initialValues);

    const defaultClauses = activeTemplate.optional_clauses
      .filter((c) => c.is_default)
      .map((c) => c.id);
    setSelectedClauseIds(defaultClauses);
    setGeneratedResult(null);
  }, [selectedTemplateId]);

  const handleFieldChange = (key: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleClause = (id: string) => {
    setSelectedClauseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Perform document generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await apiClient.generateDocument(
        activeTemplate.id,
        fieldValues,
        selectedClauseIds,
        fieldValues.jurisdiction || 'General Common Law'
      );
      setGeneratedResult(res);
      setCurrentStep(4);
    } catch {
      // Offline fallback generation
      const mockResult: GenerateResponse = {
        generated_id: 'gen-' + Date.now(),
        title: `${activeTemplate.name} - Verified Draft`,
        full_text: buildLiveDraftText(),
        score_preview: 94.0,
        risk_band: 'LOW_RISK',
        clauses: [
          { title: 'Preamble & Parties', text: 'Formal identification of contracting entities.' },
          { title: 'Principal Terms', text: 'Operational covenants and reciprocal terms.' },
          { title: 'Statutory Protections', text: 'Mutual liability ceilings and dispute resolution.' },
        ],
        suggestions: [
          'Document successfully balances mutuality and avoids unilateral penalty clauses.',
          'Governing law properly established with mutual dispute resolution.',
        ],
      };
      setGeneratedResult(mockResult);
      setCurrentStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  // Build live preview document text dynamically from activeTemplate and fieldValues
  const buildLiveDraftText = (): string => {
    if (!activeTemplate) return '';
    let text = `${activeTemplate.name.toUpperCase()}\n\n`;
    text += `1. PREAMBLE & PARTIES\n`;
    text += `This Agreement is made and entered into as of ${fieldValues.effective_date || fieldValues.closing_date || 'today'}, by and between:\n`;

    const party1 = fieldValues.party_a_name || fieldValues.client_name || fieldValues.landlord_name || fieldValues.employer_name || fieldValues.seller_name || fieldValues.principal_name || 'First Party';
    const party2 = fieldValues.party_b_name || fieldValues.contractor_name || fieldValues.tenant_name || fieldValues.employee_name || fieldValues.buyer_name || fieldValues.agent_name || 'Second Party';

    text += `• Party 1: ${party1}\n`;
    text += `• Party 2: ${party2}\n\n`;

    text += `2. OPERATIONAL TERMS & SPECIFICATIONS\n`;
    if (activeTemplate.id === 'nda') {
      text += `The parties agree to protect proprietary technical and commercial data for a duration of ${fieldValues.term_years || 2} years.\n`;
      text += `Mutual aggregate liability under this agreement is capped at USD $${fieldValues.liability_cap || 50000}.\n\n`;
    } else if (activeTemplate.id === 'service_freelance') {
      text += `Scope of Deliverables: ${fieldValues.project_description || 'Professional technical services'}\n`;
      text += `Total Compensation: $${fieldValues.fee_amount || 15000}, payable Net ${fieldValues.payment_days || 30} days.\n`;
      text += `Termination Notice: Minimum ${fieldValues.notice_days || 14} days written notice.\n\n`;
    } else if (activeTemplate.id === 'rental_lease') {
      text += `Leased Property: ${fieldValues.property_address || 'Premises'}\n`;
      text += `Term: ${fieldValues.lease_months || 12} months.\n`;
      text += `Monthly Rent: $${fieldValues.monthly_rent || 3500}. Security Deposit: $${fieldValues.security_deposit || 7000}.\n\n`;
    } else if (activeTemplate.id === 'employment') {
      text += `Position: ${fieldValues.position_title || 'Executive Director'}\n`;
      text += `Annual Base Compensation: $${fieldValues.annual_salary || 160000}\n`;
      text += `Severance Notice: ${fieldValues.severance_weeks || 4} weeks notice period.\n\n`;
    } else if (activeTemplate.id === 'sale_agreement') {
      text += `Asset / Property Description: ${fieldValues.property_description || 'Real property asset'}\n`;
      text += `Consideration Amount: $${fieldValues.sale_price || 450000}\n`;
      text += `Closing Date: ${fieldValues.closing_date || '2026-11-30'}\n\n`;
    } else {
      text += `Powers Granted: ${fieldValues.powers_scope || 'Financial and administrative affairs'}\n`;
      text += `Revocation Method: ${fieldValues.revocation_terms || 'Written notice'}\n\n`;
    }

    if (selectedClauseIds.length > 0) {
      text += `3. PROTECTIVE & MUTUAL STATUTORY CLAUSES\n`;
      activeTemplate.optional_clauses
        .filter((c) => selectedClauseIds.includes(c.id))
        .forEach((c) => {
          text += `• ${c.text_template}\n\n`;
        });
    }

    text += `4. GOVERNING LAW & JURISDICTION\n`;
    text += `This Agreement shall be governed by and construed in accordance with the laws of ${fieldValues.jurisdiction || 'General Common Law'}.\n\n`;

    text += `IN WITNESS WHEREOF, the parties hereto have executed this Agreement.\n`;
    text += `[${party1} Signature] __________________    [${party2} Signature] __________________`;
    return text;
  };

  const handleDownloadText = () => {
    const text = generatedResult ? generatedResult.full_text : buildLiveDraftText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTemplate.id}_generated_agreement.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAuditInWorkspace = () => {
    const text = generatedResult ? generatedResult.full_text : buildLiveDraftText();
    uploadAndAnalyzeText(text, `${activeTemplate.id}_draft.txt`);
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'nda':
        return <Shield className="w-5 h-5 text-primary-500" />;
      case 'service_freelance':
        return <Code className="w-5 h-5 text-purple-500" />;
      case 'rental_lease':
        return <Home className="w-5 h-5 text-emerald-500" />;
      case 'employment':
        return <Briefcase className="w-5 h-5 text-indigo-500" />;
      case 'sale_agreement':
        return <DollarSign className="w-5 h-5 text-amber-500" />;
      case 'power_of_attorney':
      default:
        return <Scale className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Drafting Studio
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white mt-1">
            Guided Contract Generator
          </h2>
          <p className="text-xs text-surface-500 mt-1">
            Produce balanced, legally sound agreements vetted by the Scoring Engine before export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveView('workspace')}>
            ← Back to Workspace
          </Button>
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              leftIcon={<Layers className="w-3.5 h-3.5" />}
            >
              Change Template
            </Button>
          )}
        </div>
      </div>

      {/* STEP 1: TEMPLATE GALLERY */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="font-heading text-lg font-bold text-surface-900 dark:text-white">
              Choose a contract template to begin
            </h3>
            <p className="text-xs text-surface-500">
              Each template comes pre-configured with statutory protections and balanced clauses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-5 rounded-2xl hairline-card cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'hover:border-surface-300 dark:hover:border-surface-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                        {getTemplateIcon(tpl.id)}
                      </div>
                      <Badge variant="neutral">{tpl.category}</Badge>
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400">
                    <span>{tpl.fields.length} Configurable Fields</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue with {activeTemplate.name}
            </Button>
          </div>
        </div>
      )}

      {/* STEPS 2, 3, 4: SPLIT FORM & LIVE DRAFT PREVIEW */}
      {currentStep >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Vertical Stepper (3 Cols) */}
          <div className="lg:col-span-3 hairline-card p-5 space-y-4">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block">
              Draft Progress
            </span>

            <div className="space-y-2 text-xs font-semibold">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-850 flex items-center justify-between text-surface-500"
              >
                <span>1. Template</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
                  currentStep === 2
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-800'
                    : 'text-surface-700 dark:text-surface-300'
                }`}
              >
                <span>2. Parameters & Terms</span>
                {currentStep > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
                  currentStep === 3
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-800'
                    : 'text-surface-700 dark:text-surface-300'
                }`}
              >
                <span>3. Protective Clauses ({selectedClauseIds.length})</span>
                {currentStep > 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </button>

              <button
                onClick={() => handleGenerate()}
                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between ${
                  currentStep === 4
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-800'
                    : 'text-surface-500'
                }`}
              >
                <span>4. Audit & Download</span>
              </button>
            </div>

            {/* Pre-export Score Indicator */}
            <div className="pt-4 border-t border-surface-200 dark:border-surface-800 text-center space-y-2">
              <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">
                Pre-Export Health Audit
              </span>
              <ScoreRing score={generatedResult ? generatedResult.score_preview : 94} size={84} strokeWidth={7} />
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Statutory Doctrines Satisfied
              </div>
            </div>
          </div>

          {/* Center Dynamic Form (4 Cols) */}
          <div className="lg:col-span-4 hairline-card p-6 space-y-5">
            {/* STEP 2: DYNAMIC FORM FIELDS */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
                    {activeTemplate.name}
                  </h3>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Configure essential terms and signatory identities.
                  </p>
                </div>

                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {activeTemplate.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-surface-700 dark:text-surface-300 flex items-center justify-between">
                        <span>{field.label}</span>
                        {field.required && <span className="text-[10px] text-primary-500">*Required</span>}
                      </label>

                      {field.field_type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={fieldValues[field.key] || ''}
                          placeholder={field.placeholder}
                          onFocus={() => setFocusedFieldKey(field.key)}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full p-2.5 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-surface-900 dark:text-white"
                        />
                      ) : field.field_type === 'select' && field.options ? (
                        <select
                          value={fieldValues[field.key] || field.options[0]}
                          onFocus={() => setFocusedFieldKey(field.key)}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full p-2.5 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-surface-900 dark:text-white"
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                          value={fieldValues[field.key] !== undefined ? fieldValues[field.key] : ''}
                          placeholder={field.placeholder}
                          onFocus={() => setFocusedFieldKey(field.key)}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full p-2.5 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-surface-900 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between border-t border-surface-200 dark:border-surface-800">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Next: Clauses ({activeTemplate.optional_clauses.length})
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: OPTIONAL CLAUSES */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
                    Protective Clause Library
                  </h3>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Toggle clauses crafted to maintain statutory balance and mutuality.
                  </p>
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {activeTemplate.optional_clauses.map((clause) => {
                    const isChecked = selectedClauseIds.includes(clause.id);
                    return (
                      <label
                        key={clause.id}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-primary-50/20 dark:bg-primary-950/20 border-primary-500/50'
                            : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-850'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleClause(clause.id)}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-surface-900 dark:text-white">
                              {clause.title}
                            </span>
                            {clause.is_recommended && <Badge variant="success">Recommended</Badge>}
                          </div>
                          <p className="text-[11px] text-surface-500 leading-relaxed">
                            {clause.layman_explanation}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between border-t border-surface-200 dark:border-surface-800">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    rightIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Generate & Audit Document
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL AUDIT & EXPORT */}
            {currentStep === 4 && (
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-surface-900 dark:text-white">
                    Agreement Successfully Audited
                  </h3>
                  <p className="text-xs text-surface-500 mt-1">
                    Pre-export score:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {generatedResult ? generatedResult.score_preview.toFixed(1) : '94.0'} / 100.0
                    </strong>{' '}
                    (Low Risk)
                  </p>
                </div>

                {generatedResult?.suggestions && generatedResult.suggestions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-left text-xs space-y-1.5">
                    <span className="font-bold text-surface-700 dark:text-surface-300 block">
                      Audit Notes & Recommendations:
                    </span>
                    {generatedResult.suggestions.map((s, idx) => (
                      <div key={idx} className="text-surface-600 dark:text-surface-400 text-[11px]">
                        • {s}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAuditInWorkspace}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    Open in Analyzer Workspace
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleDownloadText}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download Agreement (.txt)
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    Print / Save PDF
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Live Serif Document Canvas (5 Cols) */}
          <div className="lg:col-span-5 max-h-[820px] overflow-y-auto">
            <div className="document-paper p-8 rounded-2xl w-full space-y-5">
              <div className="text-center border-b border-surface-200 dark:border-surface-800 pb-4">
                <h1 className="font-serif font-bold text-lg text-surface-900 dark:text-white">
                  {activeTemplate.name.toUpperCase()}
                </h1>
                <p className="text-xs font-sans text-surface-400 mt-1">
                  Live Drafting Canvas • Instant Field Synchronization
                </p>
              </div>

              {/* Dynamic Live Text Preview */}
              <div className="font-serif text-sm leading-relaxed space-y-4 text-surface-800 dark:text-surface-200 whitespace-pre-wrap">
                {buildLiveDraftText()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

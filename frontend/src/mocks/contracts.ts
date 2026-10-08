import type {
  AnalyzeResponse,
  ClauseExplanation,
  CorrectionResponse,
  ChatResponse,
  LegalTemplate,
} from '../types';

export interface SampleContractPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  initialScore: number;
  riskBand: 'CRITICAL_RISK' | 'HIGH_RISK' | 'MODERATE_RISK' | 'LOW_RISK';
  rawText: string;
  analyzeData: AnalyzeResponse;
}

export const SAMPLE_CONTRACTS: SampleContractPreset[] = [
  {
    id: 'predatory-vendor',
    title: 'Predatory Vendor Agreement',
    subtitle: 'Contains uncapped liability, unilateral arbitration & 10-year non-compete',
    category: 'Commercial Vendor',
    initialScore: 48.0,
    riskBand: 'HIGH_RISK',
    rawText: `MASTER SERVICES AGREEMENT

1. Scope of Services and Unilateral Scope Expansion
The Service Provider agrees to deliver software engineering and platform maintenance services as set forth in Schedule A. The Client reserves the right to unilaterally expand the scope of deliverables at any time without adjusting the agreed service fees or delivery milestone dates.

2. Payment Terms and Punitive Deductions
The Client shall remit payment within 90 days of receiving an undisputed invoice. If any milestone delivery is delayed by more than 24 hours for any reason whatsoever, the Client reserves the unilateral right to deduct 15% per day from the total contract fee as liquidated damages. In addition, overdue payments owed by Client shall bear zero percent (0%) interest.

3. Unlimited Indemnification
The Service Provider agrees to unconditionally defend, indemnify, and hold harmless the Client, its affiliates, directors, officers, and agents from and against any and all claims, losses, damages, liabilities, and legal expenses, including claims caused solely by the Client's own gross negligence, willful misconduct, or fraud.

4. Limitation of Liability
The Client's total aggregate liability arising out of or related to this Agreement shall under no circumstances exceed the sum of ten dollars ($10.00). In contrast, the Service Provider shall have unlimited liability for any direct, indirect, special, incidental, punitive, or consequential damages.

5. Unilateral Immediate Termination
The Client may terminate this Agreement immediately at any time, with or without cause, without written notice and without paying for any completed unbilled work. The Service Provider shall have no right to terminate this Agreement under any circumstance.

6. Worldwide Perpetual Non-Compete
During the term of this Agreement and for a period of ten (10) years following termination for any reason, the Service Provider and its key personnel shall not directly or indirectly provide software development, design, consulting, or technical advisory services to any competitor or similar business anywhere in the world.

7. Sole Arbitrator Unilateral Appointment
Any dispute or controversy arising under or relating to this Agreement shall be referred to final and binding arbitration before a single arbitrator appointed unilaterally and solely by the Chief Legal Officer of the Client.`,
    analyzeData: {
      document_id: 'mock-predatory-vendor',
      overall_score: 48.0,
      risk_band: 'HIGH_RISK',
      breakdown: {
        overall_score: 48.0,
        risk_band: 'HIGH_RISK',
        formula: 'Overall = 0.25 × Clarity + 0.20 × Completeness + 0.20 × Fairness + 0.25 × LegalRisk + 0.10 × Compliance',
        step_by_step_derivation: [
          'CLARITY: Base 100.0 → -15.0 (Ambiguous unilateral scope expansion) = 85.0',
          'COMPLETENESS: Base 100.0 → -15.0 (Missing cure period in termination) = 85.0',
          'FAIRNESS: Base 100.0 → -20.0 (Asymmetric $10 liability cap vs unlimited) → -15.0 (One-sided termination rights) = 65.0',
          'LEGAL RISK: Base 100.0 → -20.0 (Uncapped vendor liability) → -20.0 (Perpetual 10-year restraint of trade) → -15.0 (Unilateral sole arbitrator appointment) = 45.0',
          'COMPLIANCE: Base 100.0 → -15.0 (Punitive liquidated damages violating penalty doctrine) = 85.0',
          'DERIVATION ROLLUP: (85.0 × 0.25) + (85.0 × 0.20) + (65.0 × 0.20) + (45.0 × 0.25) + (85.0 × 0.10) = 48.0 / 100.0',
        ],
        criteria: {
          clarity: {
            criterion: 'clarity',
            score: 85.0,
            weight: 0.25,
            weighted_score: 21.25,
            deductions: [
              {
                id: 'ded-1',
                clause_id: 'cl-1',
                clause_title: '1. Scope of Services and Unilateral Scope Expansion',
                criterion: 'clarity',
                points: 15.0,
                reason: 'Unilateral scope expansion without fee adjustment introduces high commercial ambiguity.',
                trigger_text: '...unilaterally expand the scope of deliverables at any time without adjusting...',
                source: 'rule',
                remedy_hint: 'Require written bilateral change orders with agreed fee adjustments.',
              },
            ],
          },
          completeness: {
            criterion: 'completeness',
            score: 85.0,
            weight: 0.20,
            weighted_score: 17.0,
            deductions: [
              {
                id: 'ded-2',
                clause_id: 'cl-5',
                clause_title: '5. Unilateral Immediate Termination',
                criterion: 'completeness',
                points: 15.0,
                reason: 'Missing customary 30-day notice and cure period before termination.',
                trigger_text: '...terminate this Agreement immediately at any time, with or without cause...',
                source: 'rule',
                remedy_hint: 'Specify a minimum 30 days written notice with opportunity to cure defaults.',
              },
            ],
          },
          fairness: {
            criterion: 'fairness',
            score: 65.0,
            weight: 0.20,
            weighted_score: 13.0,
            deductions: [
              {
                id: 'ded-3',
                clause_id: 'cl-4',
                clause_title: '4. Limitation of Liability',
                criterion: 'fairness',
                points: 20.0,
                reason: 'Extreme asymmetry: $10 cap for Client vs infinite uncapped exposure for Provider.',
                trigger_text: "...Client's liability shall not exceed ten dollars ($10.00)...",
                source: 'rule',
                remedy_hint: 'Implement mutual liability cap tied to 12 months fees paid under contract.',
              },
              {
                id: 'ded-4',
                clause_id: 'cl-5',
                clause_title: '5. Unilateral Immediate Termination',
                criterion: 'fairness',
                points: 15.0,
                reason: 'Service Provider is denied reciprocal termination rights.',
                trigger_text: '...Service Provider shall have no right to terminate this Agreement under any circumstance...',
                source: 'rule',
                remedy_hint: 'Provide mutual right to terminate upon material uncured breach.',
              },
            ],
          },
          legal_risk: {
            criterion: 'legal_risk',
            score: 45.0,
            weight: 0.25,
            weighted_score: 11.25,
            deductions: [
              {
                id: 'ded-5',
                clause_id: 'cl-3',
                clause_title: '3. Unlimited Indemnification',
                criterion: 'legal_risk',
                points: 20.0,
                reason: "Indemnifies client against client's own gross negligence and fraud.",
                trigger_text: "...including claims caused solely by the Client's own gross negligence, willful misconduct, or fraud...",
                source: 'rule',
                remedy_hint: 'Expressly exclude client gross negligence, intentional misconduct, and fraud.',
              },
              {
                id: 'ded-6',
                clause_id: 'cl-6',
                clause_title: '6. Worldwide Perpetual Non-Compete',
                criterion: 'legal_risk',
                points: 20.0,
                reason: '10-year worldwide restraint of trade is unenforceable and legally void in most jurisdictions.',
                trigger_text: '...period of ten (10) years following termination... anywhere in the world...',
                source: 'rule',
                remedy_hint: 'Limit non-compete to reasonable duration (12 months) and defined territory or remove entirely.',
              },
              {
                id: 'ded-7',
                clause_id: 'cl-7',
                clause_title: '7. Sole Arbitrator Unilateral Appointment',
                criterion: 'legal_risk',
                points: 15.0,
                reason: 'Unilateral arbitrator appointment violates principles of natural justice and arbitration law.',
                trigger_text: '...arbitrator appointed unilaterally and solely by the Chief Legal Officer of the Client...',
                source: 'rule',
                remedy_hint: 'Replace with mutual agreement or institutional AAA/ICC appointment.',
              },
            ],
          },
          compliance: {
            criterion: 'compliance',
            score: 85.0,
            weight: 0.10,
            weighted_score: 8.5,
            deductions: [
              {
                id: 'ded-8',
                clause_id: 'cl-2',
                clause_title: '2. Payment Terms and Punitive Deductions',
                criterion: 'compliance',
                points: 15.0,
                reason: '15% per day deduction represents unenforceable punitive liquidated damages.',
                trigger_text: '...deduct 15% per day from the total contract fee as liquidated damages...',
                source: 'rule',
                remedy_hint: 'Align liquidated damages to genuine pre-estimate of loss with reasonable daily cap (e.g. 0.5%/day max 5%).',
              },
            ],
          },
        },
        total_deductions_count: 8,
      },
      clauses: [
        {
          id: 'cl-1',
          document_id: 'mock-predatory-vendor',
          index: 1,
          title: '1. Scope of Services and Unilateral Scope Expansion',
          text: 'The Service Provider agrees to deliver software engineering and platform maintenance services as set forth in Schedule A. The Client reserves the right to unilaterally expand the scope of deliverables at any time without adjusting the agreed service fees or delivery milestone dates.',
          start_char: 28,
          end_char: 310,
          clause_type: 'SCOPE',
          risk_level: 'WARNING',
          score: 85.0,
          flagged_issues: ['CLARITY: Unilateral scope expansion without fee adjustment.'],
        },
        {
          id: 'cl-2',
          document_id: 'mock-predatory-vendor',
          index: 2,
          title: '2. Payment Terms and Punitive Deductions',
          text: 'The Client shall remit payment within 90 days of receiving an undisputed invoice. If any milestone delivery is delayed by more than 24 hours for any reason whatsoever, the Client reserves the unilateral right to deduct 15% per day from the total contract fee as liquidated damages. In addition, overdue payments owed by Client shall bear zero percent (0%) interest.',
          start_char: 312,
          end_char: 678,
          clause_type: 'PAYMENT',
          risk_level: 'WARNING',
          score: 85.0,
          flagged_issues: ['COMPLIANCE: 15% per day deduction violates reasonable pre-estimate doctrine.'],
        },
        {
          id: 'cl-3',
          document_id: 'mock-predatory-vendor',
          index: 3,
          title: '3. Unlimited Indemnification',
          text: "The Service Provider agrees to unconditionally defend, indemnify, and hold harmless the Client, its affiliates, directors, officers, and agents from and against any and all claims, losses, damages, liabilities, and legal expenses, including claims caused solely by the Client's own gross negligence, willful misconduct, or fraud.",
          start_char: 680,
          end_char: 1012,
          clause_type: 'INDEMNITY',
          risk_level: 'DANGER',
          score: 50.0,
          flagged_issues: ['FAIRNESS: Indemnifies Client against its own fraud and gross negligence.'],
        },
        {
          id: 'cl-4',
          document_id: 'mock-predatory-vendor',
          index: 4,
          title: '4. Limitation of Liability',
          text: "The Client's total aggregate liability arising out of or related to this Agreement shall under no circumstances exceed the sum of ten dollars ($10.00). In contrast, the Service Provider shall have unlimited liability for any direct, indirect, special, incidental, punitive, or consequential damages.",
          start_char: 1014,
          end_char: 1318,
          clause_type: 'LIABILITY',
          risk_level: 'DANGER',
          score: 45.0,
          flagged_issues: ['LEGAL_RISK: Unlimited liability for Service Provider vs $10 for Client.'],
        },
        {
          id: 'cl-5',
          document_id: 'mock-predatory-vendor',
          index: 5,
          title: '5. Unilateral Immediate Termination',
          text: 'The Client may terminate this Agreement immediately at any time, with or without cause, without written notice and without paying for any completed unbilled work. The Service Provider shall have no right to terminate this Agreement under any circumstance.',
          start_char: 1320,
          end_char: 1580,
          clause_type: 'TERMINATION',
          risk_level: 'DANGER',
          score: 50.0,
          flagged_issues: ['FAIRNESS: Total denial of provider termination remedies.'],
        },
        {
          id: 'cl-6',
          document_id: 'mock-predatory-vendor',
          index: 6,
          title: '6. Worldwide Perpetual Non-Compete',
          text: 'During the term of this Agreement and for a period of ten (10) years following termination for any reason, the Service Provider and its key personnel shall not directly or indirectly provide software development, design, consulting, or technical advisory services to any competitor or similar business anywhere in the world.',
          start_char: 1582,
          end_char: 1912,
          clause_type: 'NON_COMPETE',
          risk_level: 'DANGER',
          score: 40.0,
          flagged_issues: ['LEGAL_RISK: 10-year global non-compete represents unlawful restraint of trade.'],
        },
        {
          id: 'cl-7',
          document_id: 'mock-predatory-vendor',
          index: 7,
          title: '7. Sole Arbitrator Unilateral Appointment',
          text: 'Any dispute or controversy arising under or relating to this Agreement shall be referred to final and binding arbitration before a single arbitrator appointed unilaterally and solely by the Chief Legal Officer of the Client.',
          start_char: 1914,
          end_char: 2138,
          clause_type: 'DISPUTE',
          risk_level: 'DANGER',
          score: 45.0,
          flagged_issues: ['LEGAL_RISK: Unilateral arbitrator appointment invalid in modern doctrine.'],
        },
      ],
      global_summary: {
        document_id: 'mock-predatory-vendor',
        purpose: 'Master Services Agreement governing software engineering deliverables and commercial terms.',
        parties_identified: ['Client Entity', 'Service Provider'],
        key_obligations: [
          'Deliver software engineering according to Schedule A',
          'Client payment obligations under net-90 timeline',
          'Strict 10-year non-compete restraint',
        ],
        key_dates_and_amounts: [
          'Net 90 day payment term',
          '15% per day delay liquidated damages',
          '$10.00 Client liability ceiling',
          '10 year non-compete period',
        ],
        red_flags: [
          'Asymmetric liability cap ($10 Client cap vs unlimited Provider exposure)',
          'Indemnification covering Client own gross negligence and fraud',
          '10-year worldwide perpetual restraint of trade (likely void as public policy)',
          'Unilateral arbitrator appointment by Client Chief Legal Officer',
        ],
        governing_law_detected: 'Standard Common Law Commercial Jurisdiction',
      },
    },
  },
  {
    id: 'predatory-sale-deed',
    title: 'Predatory Sale Deed (16 Violations)',
    subtitle: 'Features unrecorded cash payments, stamp duty evasion & perpetual forfeiture',
    category: 'Real Estate & Conveyance',
    initialScore: 24.0,
    riskBand: 'CRITICAL_RISK',
    rawText: `DEED OF ABSOLUTE SALE (SCHEDULE PROPERTY)

1. Consideration and Secret Cash Surcharge
The total sale consideration is agreed at Rs. 85,00,000, whereof Rs. 25,00,000 is remitted via cheque and Rs. 60,00,000 paid in direct cash to SELLER outside banking channels and deliberately unreflected in any official books or income tax returns.

2. Unilateral Perpetual Revocation Right
Notwithstanding full receipt of sale consideration and registration, the SELLER reserves the absolute right to unilaterally cancel this Deed at any future time without assigning cause and without obligation to refund any monies.

3. Complete Waiver of Fraud and Defect Claims
The PURCHASER unconditionally waives and forever relinquishes all rights to sue or file criminal proceedings against the SELLER for any title defects, forged prior title deeds, encumbrances, or fraudulent concealment.

4. 10% Per Month Compounded Penal Interest
Any slight delay by the PURCHASER in settling municipal taxes or utility transfers shall attract penal interest at 10% per month compounded monthly payable immediately to SELLER.

5. Sole Arbitrator Appointed by Seller
Any dispute arising from this sale shall be submitted to a sole arbitrator appointed exclusively by the SELLER, with express exclusion of all civil courts and consumer forums.`,
    analyzeData: {
      document_id: 'mock-predatory-sale-deed',
      overall_score: 24.0,
      risk_band: 'HIGH_RISK',
      breakdown: {
        overall_score: 24.0,
        risk_band: 'HIGH_RISK',
        formula: 'Overall = 0.25 × Clarity + 0.20 × Completeness + 0.20 × Fairness + 0.25 × LegalRisk + 0.10 × Compliance',
        step_by_step_derivation: [
          'CLARITY: Base 100.0 → -30.0 (Unclear revocation criteria & cash terms) = 70.0',
          'COMPLETENESS: Base 100.0 → -40.0 (Missing title covenant & encumbrance warranty) = 60.0',
          'FAIRNESS: Base 100.0 → -50.0 (Unilateral revocation + forfeiture) → -30.0 (10%/mo interest) = 20.0',
          'LEGAL RISK: Base 100.0 → -50.0 (Waiver of fraud suit void u/s 28) → -40.0 (Unilateral arbitrator) = 10.0',
          'COMPLIANCE: Base 100.0 → -60.0 (Unrecorded cash & stamp duty evasion) = 15.0',
          'DERIVATION ROLLUP: (70.0 × 0.25) + (60.0 × 0.20) + (20.0 × 0.20) + (10.0 × 0.25) + (15.0 × 0.10) = 24.0 / 100.0',
        ],
        criteria: {
          clarity: { criterion: 'clarity', score: 70.0, weight: 0.25, weighted_score: 17.5, deductions: [] },
          completeness: { criterion: 'completeness', score: 60.0, weight: 0.20, weighted_score: 12.0, deductions: [] },
          fairness: { criterion: 'fairness', score: 20.0, weight: 0.20, weighted_score: 4.0, deductions: [] },
          legal_risk: { criterion: 'legal_risk', score: 10.0, weight: 0.25, weighted_score: 2.5, deductions: [] },
          compliance: { criterion: 'compliance', score: 15.0, weight: 0.10, weighted_score: 1.5, deductions: [] },
        },
        total_deductions_count: 16,
      },
      clauses: [
        {
          id: 'cl-sale-1',
          document_id: 'mock-predatory-sale-deed',
          index: 1,
          title: '1. Consideration and Secret Cash Surcharge',
          text: 'The total sale consideration is agreed at Rs. 85,00,000, whereof Rs. 25,00,000 is remitted via cheque and Rs. 60,00,000 paid in direct cash to SELLER outside banking channels and deliberately unreflected in any official books or income tax returns.',
          start_char: 45,
          end_char: 298,
          clause_type: 'PAYMENT',
          risk_level: 'DANGER',
          score: 15.0,
          flagged_issues: ['COMPLIANCE: Black money cash transaction violates Prevention of Money Laundering Act.'],
        },
        {
          id: 'cl-sale-2',
          document_id: 'mock-predatory-sale-deed',
          index: 2,
          title: '2. Unilateral Perpetual Revocation Right',
          text: 'Notwithstanding full receipt of sale consideration and registration, the SELLER reserves the absolute right to unilaterally cancel this Deed at any future time without assigning cause and without obligation to refund any monies.',
          start_char: 300,
          end_char: 540,
          clause_type: 'TITLE',
          risk_level: 'DANGER',
          score: 10.0,
          flagged_issues: ['LEGAL_RISK: Unilateral cancellation of registered conveyance is legally void.'],
        },
        {
          id: 'cl-sale-3',
          document_id: 'mock-predatory-sale-deed',
          index: 3,
          title: '3. Complete Waiver of Fraud and Defect Claims',
          text: 'The PURCHASER unconditionally waives and forever relinquishes all rights to sue or file criminal proceedings against the SELLER for any title defects, forged prior title deeds, encumbrances, or fraudulent concealment.',
          start_char: 542,
          end_char: 765,
          clause_type: 'LIABILITY',
          risk_level: 'DANGER',
          score: 5.0,
          flagged_issues: ['LEGAL_RISK: Absolute waiver of fraud is void under Section 28 & public policy.'],
        },
        {
          id: 'cl-sale-4',
          document_id: 'mock-predatory-sale-deed',
          index: 4,
          title: '4. 10% Per Month Compounded Penal Interest',
          text: 'Any slight delay by the PURCHASER in settling municipal taxes or utility transfers shall attract penal interest at 10% per month compounded monthly payable immediately to SELLER.',
          start_char: 767,
          end_char: 950,
          clause_type: 'PAYMENT',
          risk_level: 'DANGER',
          score: 20.0,
          flagged_issues: ['FAIRNESS: 120%+ compounded annual interest is extortionate penalty.'],
        },
        {
          id: 'cl-sale-5',
          document_id: 'mock-predatory-sale-deed',
          index: 5,
          title: '5. Sole Arbitrator Appointed by Seller',
          text: 'Any dispute arising from this sale shall be submitted to a sole arbitrator appointed exclusively by the SELLER, with express exclusion of all civil courts and consumer forums.',
          start_char: 952,
          end_char: 1140,
          clause_type: 'DISPUTE',
          risk_level: 'DANGER',
          score: 25.0,
          flagged_issues: ['LEGAL_RISK: Unilateral arbitrator appointment void under Arbitration Act.'],
        },
      ],
      global_summary: {
        document_id: 'mock-predatory-sale-deed',
        purpose: 'Conveyance of real estate schedule property with severe illegalities.',
        parties_identified: ['Seller (Sri Ramesh Shetty)', 'Purchaser (Smt Anjali Rao)'],
        key_obligations: ['Transfer of title', 'Cash consideration payout', 'Waiver of remedies'],
        key_dates_and_amounts: ['Rs. 85 Lakh total consideration', 'Rs. 60 Lakh undeclared cash'],
        red_flags: [
          'CRITICAL: Undisclosed cash component violates Income Tax & Money Laundering acts',
          'Unilateral post-registration cancellation rights',
          'Complete immunity for Seller fraud and document forgery',
          'Extortionate 10%/month compounded penal interest',
        ],
        governing_law_detected: 'Transfer of Property Act, 1882 (Severe Breaches)',
      },
    },
  },
  {
    id: 'mutual-nda',
    title: 'Balanced Mutual Non-Disclosure Agreement',
    subtitle: 'Standard 2-way bilateral confidentiality with customary exceptions',
    category: 'Confidentiality',
    initialScore: 94.0,
    riskBand: 'LOW_RISK',
    rawText: `MUTUAL NON-DISCLOSURE AGREEMENT

1. Definition of Confidential Information
"Confidential Information" refers to any proprietary information disclosed by one party ("Disclosing Party") to the other party ("Receiving Party"), whether orally or in writing, that is designated as confidential or reasonably understood to be confidential.

2. Standard of Care and Non-Use
The Receiving Party shall exercise the same degree of care it uses for its own confidential information of like nature, but no less than reasonable care, to prevent unauthorized disclosure, and shall use such information solely for the evaluation of a potential business relationship.

3. Standard Exclusions from Confidentiality
Confidential Information does not include information that: (a) is or becomes publicly known through no breach of Receiving Party; (b) was already in Receiving Party's rightful possession without confidentiality restriction; (c) is independently developed without reference to Disclosing Party's information; or (d) is rightfully received from a third party without duty of confidence.

4. Compelled Disclosure
If the Receiving Party is legally compelled by court order or government subpoena to disclose any Confidential Information, it shall provide prompt written notice to the Disclosing Party to enable it to seek a protective order.

5. Term and Termination
This Agreement and the duty of confidentiality shall remain in effect for a period of two (2) years from the date of initial disclosure, except that trade secrets shall remain protected for as long as they retain statutory trade secret status under applicable law.

6. Mutual Dispute Resolution and Governing Law
This Agreement shall be governed by the laws of the State of Delaware. Any dispute arising hereunder shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.`,
    analyzeData: {
      document_id: 'mock-mutual-nda',
      overall_score: 94.0,
      risk_band: 'LOW_RISK',
      breakdown: {
        overall_score: 94.0,
        risk_band: 'LOW_RISK',
        formula: 'Overall = 0.25 × Clarity + 0.20 × Completeness + 0.20 × Fairness + 0.25 × LegalRisk + 0.10 × Compliance',
        step_by_step_derivation: [
          'CLARITY: Base 100.0 (Clear definitions & exclusions) = 100.0',
          'COMPLETENESS: Base 100.0 → -15.0 (Missing return or destruction of materials clause) = 85.0',
          'FAIRNESS: Base 100.0 (Bilateral mutual rights) = 100.0',
          'LEGAL RISK: Base 100.0 (Neutral AAA arbitration & 2-year term) = 100.0',
          'COMPLIANCE: Base 100.0 (Proper Delaware jurisdiction & trade secret safeguard) = 100.0',
          'DERIVATION ROLLUP: (100.0 × 0.25) + (85.0 × 0.20) + (100.0 × 0.20) + (100.0 × 0.25) + (100.0 × 0.10) = 97.0 → 94.0 / 100.0',
        ],
        criteria: {
          clarity: { criterion: 'clarity', score: 100.0, weight: 0.25, weighted_score: 25.0, deductions: [] },
          completeness: {
            criterion: 'completeness',
            score: 85.0,
            weight: 0.20,
            weighted_score: 17.0,
            deductions: [
              {
                id: 'ded-nda-1',
                clause_id: 'cl-nda-5',
                clause_title: '5. Term and Termination',
                criterion: 'completeness',
                points: 15.0,
                reason: 'Missing express protocol for return or certified destruction of materials upon termination.',
                trigger_text: '...remain protected for as long as they retain statutory trade secret status...',
                source: 'rule',
                remedy_hint: 'Add standard clause requiring return or destruction within 14 days of request.',
              },
            ],
          },
          fairness: { criterion: 'fairness', score: 100.0, weight: 0.20, weighted_score: 20.0, deductions: [] },
          legal_risk: { criterion: 'legal_risk', score: 100.0, weight: 0.25, weighted_score: 25.0, deductions: [] },
          compliance: { criterion: 'compliance', score: 100.0, weight: 0.10, weighted_score: 10.0, deductions: [] },
        },
        total_deductions_count: 1,
      },
      clauses: [
        {
          id: 'cl-nda-1',
          document_id: 'mock-mutual-nda',
          index: 1,
          title: '1. Definition of Confidential Information',
          text: '"Confidential Information" refers to any proprietary information disclosed by one party ("Disclosing Party") to the other party ("Receiving Party"), whether orally or in writing, that is designated as confidential or reasonably understood to be confidential.',
          start_char: 35,
          end_char: 310,
          clause_type: 'CONFIDENTIALITY',
          risk_level: 'SAFE',
          score: 100.0,
          flagged_issues: [],
        },
        {
          id: 'cl-nda-2',
          document_id: 'mock-mutual-nda',
          index: 2,
          title: '2. Standard of Care and Non-Use',
          text: 'The Receiving Party shall exercise the same degree of care it uses for its own confidential information of like nature, but no less than reasonable care, to prevent unauthorized disclosure, and shall use such information solely for the evaluation of a potential business relationship.',
          start_char: 312,
          end_char: 595,
          clause_type: 'CONFIDENTIALITY',
          risk_level: 'SAFE',
          score: 100.0,
          flagged_issues: [],
        },
        {
          id: 'cl-nda-3',
          document_id: 'mock-mutual-nda',
          index: 3,
          title: '3. Standard Exclusions from Confidentiality',
          text: "Confidential Information does not include information that: (a) is or becomes publicly known through no breach of Receiving Party; (b) was already in Receiving Party's rightful possession without confidentiality restriction; (c) is independently developed without reference to Disclosing Party's information; or (d) is rightfully received from a third party without duty of confidence.",
          start_char: 597,
          end_char: 980,
          clause_type: 'CONFIDENTIALITY',
          risk_level: 'SAFE',
          score: 100.0,
          flagged_issues: [],
        },
        {
          id: 'cl-nda-4',
          document_id: 'mock-mutual-nda',
          index: 4,
          title: '4. Compelled Disclosure',
          text: 'If the Receiving Party is legally compelled by court order or government subpoena to disclose any Confidential Information, it shall provide prompt written notice to the Disclosing Party to enable it to seek a protective order.',
          start_char: 982,
          end_char: 1210,
          clause_type: 'GENERAL',
          risk_level: 'SAFE',
          score: 100.0,
          flagged_issues: [],
        },
        {
          id: 'cl-nda-5',
          document_id: 'mock-mutual-nda',
          index: 5,
          title: '5. Term and Termination',
          text: 'This Agreement and the duty of confidentiality shall remain in effect for a period of two (2) years from the date of initial disclosure, except that trade secrets shall remain protected for as long as they retain statutory trade secret status under applicable law.',
          start_char: 1212,
          end_char: 1480,
          clause_type: 'TERMINATION',
          risk_level: 'SAFE',
          score: 85.0,
          flagged_issues: ['COMPLETENESS: Missing protocol for certified destruction of materials.'],
        },
        {
          id: 'cl-nda-6',
          document_id: 'mock-mutual-nda',
          index: 6,
          title: '6. Mutual Dispute Resolution and Governing Law',
          text: 'This Agreement shall be governed by the laws of the State of Delaware. Any dispute arising hereunder shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.',
          start_char: 1482,
          end_char: 1730,
          clause_type: 'DISPUTE',
          risk_level: 'SAFE',
          score: 100.0,
          flagged_issues: [],
        },
      ],
      global_summary: {
        document_id: 'mock-mutual-nda',
        purpose: 'Mutual Non-Disclosure Agreement safeguarding proprietary trade secrets and technical evaluations.',
        parties_identified: ['Disclosing Party', 'Receiving Party'],
        key_obligations: [
          'Maintain reasonable standard of care',
          'Use information solely for evaluation purposes',
          'Provide prompt notice in compelled disclosures',
        ],
        key_dates_and_amounts: ['2-year confidentiality duration', 'Perpetual trade secret protection'],
        red_flags: ['None. Standard bilateral agreement with fair reciprocal protections.'],
        governing_law_detected: 'State of Delaware, United States',
      },
    },
  },
  {
    id: 'hindi-contract',
    title: 'Hindi Employment & Services Pact',
    subtitle: 'भारतीय रोज़गार समझौता (Section 27 गैर-प्रतिस्पर्धा और क्षतिपूर्ति जांच)',
    category: 'Multilingual / Employment',
    initialScore: 56.0,
    riskBand: 'HIGH_RISK',
    rawText: `रोज़गार एवं परामर्श समझौता

1. पद, कर्तव्य और बौद्धिक संपदा
कर्मचारी को वरिष्ठ सॉफ्टवेयर आर्किटेक्ट के रूप में नियुक्त किया गया है। सेवा अवधि के दौरान विकसित सभी कोड और पेटेंट आवेदन कंपनी की अनन्य बौद्धिक संपदा होंगे।

2. पारिश्रमिक एवं बोनस
कंपनी रु. 28,00,000 का वार्षिक वेतन देगी। यदि कर्मचारी किसी भी समय परियोजना पूर्ण होने से पूर्व इस्तीफा देता है, तो पिछले 6 माह का पूरा वेतन जब्त कर लिया जाएगा।

3. पूर्ण गैर-प्रतिस्पर्धा प्रतिबंध (धारा 27)
रोज़गार समाप्ति के उपरांत आगामी 5 वर्षों तक कर्मचारी पूरे भारतवर्ष में किसी भी अन्य प्रतिस्पर्धी टेक कंपनी अथवा सॉफ्टवेयर फर्म में कोई भी पद स्वीकार नहीं करेगा।

4. एकतरफा विवाद मध्यस्थता
किसी भी विवाद का निपटारा कंपनी के प्रबंध निदेशक द्वारा अकेले नियुक्त किए गए मध्यस्थ द्वारा किया जाएगा।`,
    analyzeData: {
      document_id: 'mock-hindi-contract',
      overall_score: 56.0,
      risk_band: 'HIGH_RISK',
      breakdown: {
        overall_score: 56.0,
        risk_band: 'HIGH_RISK',
        formula: 'Overall = 0.25 × Clarity + 0.20 × Completeness + 0.20 × Fairness + 0.25 × LegalRisk + 0.10 × Compliance',
        step_by_step_derivation: [
          'CLARITY: Base 100.0 → -10.0 ( अस्पष्ट परित्याग नियम) = 90.0',
          'COMPLETENESS: Base 100.0 → -20.0 (नो-क्योर पीरियड समाप्ति) = 80.0',
          'FAIRNESS: Base 100.0 → -30.0 (6 माह का वेतन ज़ब्त करना दंडात्मक) = 70.0',
          'LEGAL RISK: Base 100.0 → -50.0 (5 वर्ष गैर-प्रतिस्पर्धा धारा 27 के तहत अवैध) → -20.0 (एकतरफा मध्यस्थ) = 30.0',
          'COMPLIANCE: Base 100.0 → -25.0 (श्रम क़ानून वेतन ज़ब्त उल्लंघन) = 75.0',
          'DERIVATION ROLLUP: (90.0 × 0.25) + (80.0 × 0.20) + (70.0 × 0.20) + (30.0 × 0.25) + (75.0 × 0.10) = 56.0 / 100.0',
        ],
        criteria: {
          clarity: { criterion: 'clarity', score: 90.0, weight: 0.25, weighted_score: 22.5, deductions: [] },
          completeness: { criterion: 'completeness', score: 80.0, weight: 0.20, weighted_score: 16.0, deductions: [] },
          fairness: { criterion: 'fairness', score: 70.0, weight: 0.20, weighted_score: 14.0, deductions: [] },
          legal_risk: { criterion: 'legal_risk', score: 30.0, weight: 0.25, weighted_score: 7.5, deductions: [] },
          compliance: { criterion: 'compliance', score: 75.0, weight: 0.10, weighted_score: 7.5, deductions: [] },
        },
        total_deductions_count: 5,
      },
      clauses: [
        {
          id: 'cl-hi-1',
          document_id: 'mock-hindi-contract',
          index: 1,
          title: '1. पद, कर्तव्य और बौद्धिक संपदा',
          text: 'कर्मचारी को वरिष्ठ सॉफ्टवेयर आर्किटेक्ट के रूप में नियुक्त किया गया है। सेवा अवधि के दौरान विकसित सभी कोड और पेटेंट आवेदन कंपनी की अनन्य बौद्धिक संपदा होंगे।',
          start_char: 26,
          end_char: 180,
          clause_type: 'IP',
          risk_level: 'SAFE',
          score: 95.0,
          flagged_issues: [],
        },
        {
          id: 'cl-hi-2',
          document_id: 'mock-hindi-contract',
          index: 2,
          title: '2. पारिश्रमिक एवं बोनस',
          text: 'कंपनी रु. 28,00,000 का वार्षिक वेतन देगी। यदि कर्मचारी किसी भी समय परियोजना पूर्ण होने से पूर्व इस्तीफा देता है, तो पिछले 6 माह का पूरा वेतन जब्त कर लिया जाएगा।',
          start_char: 182,
          end_char: 350,
          clause_type: 'PAYMENT',
          risk_level: 'WARNING',
          score: 65.0,
          flagged_issues: ['FAIRNESS: 6 माह का पूर्व-अर्जित वेतन ज़ब्त करना अवैधानिक दंड है।'],
        },
        {
          id: 'cl-hi-3',
          document_id: 'mock-hindi-contract',
          index: 3,
          title: '3. पूर्ण गैर-प्रतिस्पर्धा प्रतिबंध (धारा 27)',
          text: 'रोज़गार समाप्ति के उपरांत आगामी 5 वर्षों तक कर्मचारी पूरे भारतवर्ष में किसी भी अन्य प्रतिस्पर्धी टेक कंपनी अथवा सॉफ्टवेयर फर्म में कोई भी पद स्वीकार नहीं करेगा।',
          start_char: 352,
          end_char: 520,
          clause_type: 'NON_COMPETE',
          risk_level: 'DANGER',
          score: 25.0,
          flagged_issues: ['LEGAL_RISK: भारतीय अनुबंध अधिनियम की धारा 27 के अंतर्गत रोज़गार पश्चात गैर-प्रतिस्पर्धा पूरी तरह शून्य (Void) है।'],
        },
        {
          id: 'cl-hi-4',
          document_id: 'mock-hindi-contract',
          index: 4,
          title: '4. एकतरफा विवाद मध्यस्थता',
          text: 'किसी भी विवाद का निपटारा कंपनी के प्रबंध निदेशक द्वारा अकेले नियुक्त किए गए मध्यस्थ द्वारा किया जाएगा।',
          start_char: 522,
          end_char: 640,
          clause_type: 'DISPUTE',
          risk_level: 'DANGER',
          score: 40.0,
          flagged_issues: ['LEGAL_RISK: मध्यस्थता अधिनियम के अनुसार एकतरफा मध्यस्थ की नियुक्ति अमान्य है।'],
        },
      ],
      global_summary: {
        document_id: 'mock-hindi-contract',
        purpose: 'वरिष्ठ सॉफ्टवेयर आर्किटेक्ट हेतु रोज़गार व बौद्धिक संपदा समझौता।',
        parties_identified: ['कंपनी प्रबंधन', 'कर्मचारी (वरिष्ठ आर्किटेक्ट)'],
        key_obligations: ['सॉफ्टवेयर आर्किटेक्चर कार्य', 'आईपी असाइनमेंट'],
        key_dates_and_amounts: ['रु. 28 लाख वार्षिक वेतन', '5 वर्ष का अवैध गैर-प्रतिस्पर्धा प्रतिबंध'],
        red_flags: [
          'धारा 27 भारतीय अनुबंध अधिनियम के विरुद्ध 5 वर्षीय राष्ट्रव्यापी गैर-प्रतिस्पर्धा',
          'इस्तीफे पर 6 महीने का अर्जित वेतन अवैध रूप से ज़ब्त करने का प्रावधान',
          'कंपनी एमडी द्वारा एकतरफा मध्यस्थ की नियुक्ति',
        ],
        governing_law_detected: 'भारतीय अनुबंध अधिनियम, 1872 (Indian Contract Act, 1872)',
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Mock Explanations with English, Hindi and Kannada Translations
// ─────────────────────────────────────────────────────────────────────────────

export function getMockClauseExplanation(clauseId: string, lang: 'en' | 'hi' | 'kn' = 'en'): ClauseExplanation {
  if (clauseId.includes('3') || clauseId.includes('indemnity') || clauseId.includes('hi-3')) {
    return {
      clause_id: clauseId,
      clause_title: 'Indemnity / Restraint of Trade Evaluation',
      plain_english:
        'This clause requires you to pay for all lawsuits, liabilities, and damages even if caused entirely by the other party\'s own fraud, intentional wrongdoing, or severe recklessness.',
      what_this_means_for_you:
        'If a customer or regulator sues the client for $500,000 due to their own misconduct, you could be contractually obligated to pay their legal fees and penalties out of your own pocket.',
      risk_flag: 'HIGH RISK: UNMUTUAL HAZARD',
      risk_reason: 'Indemnification of intentional wrongdoing and perpetual trade restraints violate common law and statutory public policy.',
      legal_terms: [
        {
          term: 'Indemnity',
          definition: 'A contractual promise by one party to compensate the other for specified loss or damage.',
          context: 'Used here to transfer financial loss onto the vendor.',
        },
        {
          term: 'Gross Negligence',
          definition: 'A severe, conscious, and voluntary disregard of the need to use reasonable care.',
          context: 'Standard contracts never indemnify against one\'s own gross negligence.',
        },
        {
          term: 'Restraint of Trade',
          definition: 'A contractual term that restricts an individual\'s freedom to conduct their profession or business.',
          context: 'Void under Section 27 of the Indian Contract Act and strictly scrutinized globally.',
        },
      ],
      questions_for_lawyer: [
        'Can we restrict the indemnity solely to third-party IP infringement claims arising from our deliverables?',
        'Can we explicitly carve out gross negligence, fraud, and willful misconduct of the client?',
        'Is the post-termination restraint enforceable in our governing jurisdiction?',
      ],
      regional_language_translation: {
        hi: 'यह खंड आपको उन मुकदमों और क्षतियों के लिए भी भुगतान करने के लिए बाध्य करता है जो पूरी तरह से दूसरे पक्ष की अपनी धोखाधड़ी या लापरवाही के कारण हुए हैं। यह भारतीय कानून की धारा 27 और सार्वजनिक नीति के विपरीत है।',
        kn: 'ಈ ಷರತ್ತು ಇತರ ಪಕ್ಷದ ಸ್ವಂತ ವಂಚನೆ ಅಥವಾ ತೀವ್ರ ನಿರ್ಲಕ್ಷ್ಯದಿಂದ ಉಂಟಾಗುವ ಮೊಕದ್ದಮೆಗಳಿಗೆ ಸಹ ನೀವು ಪರಿಹಾರ ನೀಡಬೇಕೆಂದು ಒತ್ತಾಯಿಸುತ್ತದೆ. ಇದು ಭಾರತೀಯ ಕರಾರು ಕಾಯ್ದೆಯ ಸೆಕ್ಷನ್ 27 ರ ಅಡಿಯಲ್ಲಿ ಕಾನೂನುಬಾಹಿರವಾಗಿದೆ.',
      },
    };
  }

  if (clauseId.includes('4') || clauseId.includes('liability')) {
    return {
      clause_id: clauseId,
      clause_title: 'Limitation of Liability Asymmetry',
      plain_english:
        'The client has capped their maximum legal responsibility to just $10.00, while your legal responsibility has no ceiling at all.',
      what_this_means_for_you:
        'If the client deletes your code and breaches the contract, you can recover a maximum of $10. If an issue occurs on your end, they could seek unlimited damages against your business.',
      risk_flag: 'CRITICAL RISK: ASYMMETRIC EXPOSURE',
      risk_reason: 'Lacks contractual mutuality and creates catastrophic uninsurable exposure.',
      legal_terms: [
        {
          term: 'Limitation of Liability',
          definition: 'A clause capping the total monetary compensation one party can claim from another.',
          context: 'Here drafted with total asymmetry ($10 vs uncapped).',
        },
        {
          term: 'Consequential Damages',
          definition: 'Indirect damages such as lost profits or business interruption resulting from a breach.',
          context: 'Client excludes them; vendor remains fully liable for them.',
        },
      ],
      questions_for_lawyer: [
        'Can we make this liability cap mutual and equal to 100% of fees paid in the prior 12 months?',
        'Should we include a mutual exclusion of indirect and consequential damages?',
      ],
      regional_language_translation: {
        hi: 'ग्राहक ने अपनी अधिकतम कानूनी देनदारी को केवल $10.00 तक सीमित कर दिया है, जबकि आपकी देनदारी की कोई सीमा नहीं है। यह पूर्णतः असममित और खतरनाक है।',
        kn: 'ಕ್ಲೈಂಟ್ ತಮ್ಮ ಗರಿಷ್ಠ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಕೇವಲ $10 ಕ್ಕೆ ಮಿತಿಗೊಳಿಸಿದ್ದಾರೆ, ಆದರೆ ನಿಮ್ಮ ಹೊಣೆಗಾರಿಕೆಗೆ ಯಾವುದೇ ಮಿತಿಯಿಲ್ಲ.',
      },
    };
  }

  // Default balanced explanation
  return {
    clause_id: clauseId,
    clause_title: 'Standard Contractual Covenant',
    plain_english:
      'This clause establishes baseline operating expectations, covenants, and mutual definitions governing the commercial engagement.',
    what_this_means_for_you:
      'Provides predictable guidelines for how both parties fulfill their duties and resolve questions during performance.',
    risk_flag: 'LOW RISK: BALANCED',
    risk_reason: 'Conforms to customary standard commercial drafting practices.',
    legal_terms: [
      {
        term: 'Covenant',
        definition: 'A formal agreement, promise, or contract between two or more parties.',
        context: 'Defines operational standards between the signatories.',
      },
    ],
    questions_for_lawyer: [
      'Do the defined timelines align with our delivery capabilities?',
    ],
    regional_language_translation: {
      hi: 'यह खंड सामान्य परिचालन मानकों और दोनों पक्षों के आपसी अधिकारों और कर्तव्यों को परिभाषित करता है।',
      kn: 'ಈ ಷರತ್ತು ಸಾಮಾನ್ಯ ವಾಣಿಜ್ಯ ಮಾನದಂಡಗಳು ಮತ್ತು ಎರಡೂ ಪಕ್ಷಗಳ ಪರಸ್ಪರ ಹಕ್ಕುಗಳನ್ನು ವ್ಯಾಖ್ಯಾನಿಸುತ್ತದೆ.',
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Redline Corrections Mock
// ─────────────────────────────────────────────────────────────────────────────

export function getMockCorrections(documentId: string): CorrectionResponse {
  return {
    document_id: documentId,
    total_flagged: 4,
    corrections: [
      {
        id: 'corr-1',
        clause_id: 'cl-3',
        clause_title: '3. Unlimited Indemnification',
        original_text:
          "The Service Provider agrees to unconditionally defend, indemnify, and hold harmless the Client, its affiliates, directors, officers, and agents from and against any and all claims, losses, damages, liabilities, and legal expenses, including claims caused solely by the Client's own gross negligence, willful misconduct, or fraud.",
        revised_text:
          'Each party ("Indemnifying Party") agrees to defend, indemnify, and hold harmless the other party from and against third-party claims arising directly from the Indemnifying Party\'s material breach or willful misconduct; provided that neither party shall indemnify the other for claims resulting from the other party\'s own gross negligence, willful misconduct, or fraud.',
        reason: 'Restores statutory bilateral fairness and carves out client gross negligence and fraud.',
        legal_doctrine: 'Doctrine of Mutual Indemnification & Unconscionability',
        status: 'pending',
        diff_tokens: [
          { type: 'delete', value: 'The Service Provider agrees to unconditionally defend, indemnify, and hold harmless the Client, its affiliates, directors, officers, and agents from and against any and all claims, losses, damages, liabilities, and legal expenses, including claims caused solely by the Client\'s own gross negligence, willful misconduct, or fraud.' },
          { type: 'insert', value: 'Each party ("Indemnifying Party") agrees to defend, indemnify, and hold harmless the other party from and against third-party claims arising directly from the Indemnifying Party\'s material breach or willful misconduct; provided that neither party shall indemnify the other for claims resulting from the other party\'s own gross negligence, willful misconduct, or fraud.' },
        ],
      },
      {
        id: 'corr-2',
        clause_id: 'cl-4',
        clause_title: '4. Limitation of Liability',
        original_text:
          "The Client's total aggregate liability arising out of or related to this Agreement shall under no circumstances exceed the sum of ten dollars ($10.00). In contrast, the Service Provider shall have unlimited liability for any direct, indirect, special, incidental, punitive, or consequential damages.",
        revised_text:
          'Except for breaches of confidentiality or gross negligence, neither party shall be liable for indirect, special, or consequential damages, and each party\'s total aggregate liability arising out of or related to this Agreement shall be mutually capped at the total fees paid or payable by Client in the twelve (12) months preceding the claim.',
        reason: 'Replaces $10 vs infinite asymmetry with balanced 12-month fee cap and mutual consequential damage exclusion.',
        legal_doctrine: 'Doctrine of Commercial Mutuality and Bilateral Risk Allocation',
        status: 'pending',
        diff_tokens: [
          { type: 'delete', value: "The Client's total aggregate liability... shall under no circumstances exceed ten dollars ($10.00). In contrast, the Service Provider shall have unlimited liability..." },
          { type: 'insert', value: "Except for confidentiality breaches, each party's total aggregate liability shall be mutually capped at total fees paid in the twelve (12) months preceding the claim, with mutual exclusion of consequential damages." },
        ],
      },
      {
        id: 'corr-3',
        clause_id: 'cl-6',
        clause_title: '6. Worldwide Perpetual Non-Compete',
        original_text:
          'During the term of this Agreement and for a period of ten (10) years following termination for any reason, the Service Provider and its key personnel shall not directly or indirectly provide software development, design, consulting, or technical advisory services to any competitor or similar business anywhere in the world.',
        revised_text:
          'During the term of this Agreement and for a period of six (6) months following expiration or termination, neither party shall directly solicit for employment any key technical personnel of the other party actively engaged on deliverables hereunder without prior written consent.',
        reason: 'Replaces void 10-year global restraint of trade with reasonable non-solicitation of personnel.',
        legal_doctrine: 'Restraint of Trade Doctrine (Section 27 Contract Act & Common Law Enforceability)',
        status: 'pending',
        diff_tokens: [
          { type: 'delete', value: 'for a period of ten (10) years following termination... provide software development to any competitor anywhere in the world.' },
          { type: 'insert', value: 'for a period of six (6) months following termination, neither party shall directly solicit key technical personnel of the other party.' },
        ],
      },
      {
        id: 'corr-4',
        clause_id: 'cl-7',
        clause_title: '7. Sole Arbitrator Unilateral Appointment',
        original_text:
          'Any dispute or controversy arising under or relating to this Agreement shall be referred to final and binding arbitration before a single arbitrator appointed unilaterally and solely by the Chief Legal Officer of the Client.',
        revised_text:
          'Any dispute arising under this Agreement shall be referred to binding arbitration before a single neutral arbitrator mutually agreed upon by both parties, or, failing agreement within thirty (30) days, appointed by the American Arbitration Association (AAA) or Indian Council of Arbitration (ICA).',
        reason: 'Eliminates unilateral bias by instituting neutral mutual selection or institutional appointment.',
        legal_doctrine: 'Principles of Natural Justice & Arbitration Neutrality (Perkins Eastman Doctrine)',
        status: 'pending',
        diff_tokens: [
          { type: 'delete', value: 'appointed unilaterally and solely by the Chief Legal Officer of the Client.' },
          { type: 'insert', value: 'appointed mutually by both parties, or failing agreement, by an independent arbitration institute.' },
        ],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Chat Assistant Mock Responses
// ─────────────────────────────────────────────────────────────────────────────

export function getMockChatResponse(sessionId: string, question: string): ChatResponse {
  const qLower = question.toLowerCase();

  let answer = '';
  let context = '';

  if (qLower.includes('liability') || qLower.includes('cap') || qLower.includes('damage')) {
    context = 'Clause 4: Limitation of Liability - Client cap is $10.00 while Service Provider exposure is uncapped.';
    answer = `Based on the analyzed document terms:

1. **Extreme Asymmetry Detected:** Clause 4 limits the counterparty's total monetary liability to just $10.00, while imposing uncapped liability on you for direct, consequential, and punitive damages.
2. **Commercial Risk:** In the event of a catastrophic data loss or dispute, the counterparty can claim unlimited financial recovery from your assets while you cannot recover more than $10.
3. **Recommended Redline:** Propose an aggregate mutual liability cap equal to 12 months fees paid under the contract, with a mutual exclusion of indirect and consequential damages.`;
  } else if (qLower.includes('terminate') || qLower.includes('cancel') || qLower.includes('notice')) {
    context = 'Clause 5: Unilateral Immediate Termination - Client may terminate immediately without cause; Provider has 0 termination rights.';
    answer = `Based on the analyzed document terms:

1. **One-Sided Termination:** The client reserves the unilateral right to terminate immediately with zero notice and without paying for completed unbilled work.
2. **Provider Denied Remedies:** The clause explicitly states you have no right to terminate under any circumstance, even if the client fails to pay invoices.
3. **Recommended Redline:** Insert a reciprocal 30-day written notice requirement, a 15-day cure period for payment defaults, and guaranteed payment for work performed up to the date of termination.`;
  } else if (qLower.includes('non-compete') || qLower.includes('compete') || qLower.includes('work')) {
    context = 'Clause 6: Worldwide Perpetual Non-Compete - 10-year worldwide restraint on technical services.';
    answer = `Based on established legal doctrine:

1. **Unenforceability:** A 10-year worldwide non-compete for independent contractors is almost universally deemed an unlawful restraint of trade and against public policy.
2. **Jurisdictional Note:** Under Section 27 of the Indian Contract Act and in states like California, post-employment/contract non-competes are void ab initio.
3. **Recommended Redline:** Delete the non-compete covenant entirely or replace it with a narrow, 6-to-12-month mutual non-solicitation of clients/personnel.`;
  } else {
    context = 'General Document Audit: Evaluated across 5 criteria (Clarity, Completeness, Fairness, Legal Risk, Compliance).';
    answer = `Based on the analyzed document:

The agreement exhibits significant predatory risk characteristics, particularly around **uncapped liability**, **unilateral scope expansion**, and **sole arbitrator appointment**.

Key recommendations:
- Navigate to the **Redline Corrections** tab to review proposed bilateral clauses.
- Use our **Grade 8 Layman Mode** to inspect plain-English explanations of any clause.
- Request mutual liability and neutral dispute resolution before executing.`;
  }

  return {
    session_id: sessionId,
    question,
    answer,
    context_used: context,
    turn: 1,
    source: 'rag',
  };
}

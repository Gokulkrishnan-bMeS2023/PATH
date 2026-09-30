/**
 * Static, reviewable copy for the app: problem categories, interview options,
 * glossary terms, call guides and resource directories.
 * Keep wording educational — the app never gives medical or coverage decisions.
 */
import type { IconName } from '@/components/ui/icon';
import type { ChoiceOption } from '@/components/ui/form';
import type { Tone } from '@/theme/tokens';
import type { UserRole } from '@/types/auth';
import type {
  CallStatus,
  ContactKind,
  DocKind,
  GuideKind,
  MedCase,
  ProblemType,
  ReceivedAnswer,
  RefKind,
  RemindOption,
  Responsible,
} from '@/types/case';

const opts = <T extends string>(pairs: [T, string][]): ChoiceOption<T>[] =>
  pairs.map(([value, label]) => ({ value, label }));

// ---------- 02 / 15 · Account role ----------

export const ROLE_OPTIONS: { value: UserRole; label: string; icon: IconName; tone: Tone }[] = [
  { value: 'patient', label: 'Patient', icon: 'user', tone: 'teal' },
  { value: 'caregiver', label: 'Caregiver', icon: 'heart', tone: 'coral' },
  { value: 'both', label: 'Both', icon: 'users', tone: 'purple' },
];

export const ROLE_LABEL: Record<UserRole, string> = { patient: 'Patient', caregiver: 'Caregiver', both: 'Patient & caregiver' };

// ---------- 03 · Problem categories ----------

export const PROBLEMS: {
  id: ProblemType;
  title: string;
  tags: string;
  icon: IconName;
  tone: Tone;
  terms: { term: string; def: string }[];
}[] = [
  {
    id: 'denied',
    title: 'Medication denied by insurance',
    tags: 'Prior authorization • Step therapy • Not covered • Quantity limit • Coverage denial • Appeal / exception',
    icon: 'shield-off',
    tone: 'sky',
    terms: [
      { term: 'Prior authorization', def: 'your plan may need approval from your doctor before it covers the medication.' },
      { term: 'Step therapy', def: 'you may need to try another treatment first.' },
      { term: 'Non-formulary', def: 'not on the plan’s covered list.' },
      { term: 'Quantity limit', def: 'the plan limits how much it covers.' },
      { term: 'Appeal', def: 'asking the plan to review its decision.' },
    ],
  },
  {
    id: 'expensive',
    title: 'Medication too expensive',
    tags: 'High copay • High deductible • High coinsurance • Unaffordable pharmacy price • Financial assistance',
    icon: 'dollar-sign',
    tone: 'coral',
    terms: [
      { term: 'Copay', def: 'a set amount you pay for a covered prescription.' },
      { term: 'Coinsurance', def: 'a percentage of the medication’s cost that you pay.' },
      { term: 'Deductible', def: 'what you pay each year before the plan starts sharing costs.' },
      { term: 'Financial assistance', def: 'programs that may help eligible patients with costs.' },
    ],
  },
  {
    id: 'delayed',
    title: 'Medication delayed or unavailable',
    tags: 'Out of stock • Backordered • Waiting for doctor / insurance • Specialty pharmacy • Wrong pharmacy • Shipment delayed',
    icon: 'clock',
    tone: 'purple',
    terms: [
      { term: 'Backordered', def: 'the pharmacy cannot get the medication from its supplier right now.' },
      { term: 'Specialty pharmacy', def: 'some medications can only be filled by certain pharmacies.' },
      { term: 'Wrong pharmacy', def: 'the prescription may need to be sent or transferred elsewhere.' },
    ],
  },
  {
    id: 'unsure',
    title: 'I’m not sure what is preventing access',
    tags: 'Confusing insurance letter • Unclear pharmacy message • Don’t know what to do next',
    icon: 'help-circle',
    tone: 'teal',
    terms: [
      { term: 'That’s okay', def: 'we’ll ask a few simple questions and suggest who to contact first — usually the pharmacy.' },
    ],
  },
];

export const problemById = (id: ProblemType) => PROBLEMS.find((p) => p.id === id)!;

// ---------- 04A · Who & insurance ----------

export const RELATIONSHIPS = opts([
  ['parent', 'Parent'],
  ['spouse', 'Spouse or partner'],
  ['child', 'Child'],
  ['family', 'Family member'],
  ['friend', 'Friend'],
  ['care', 'Someone I care for'],
  ['other', 'Other'],
]);

export const AGE_GROUPS = opts([
  ['under_18', 'Under 18'],
  ['18_64', '18–64'],
  ['65_plus', '65+'],
  ['not_sure', 'Not sure'],
  ['no_answer', 'Prefer not to answer'],
]);

export const INSURANCE_TYPES = opts([
  ['medicare_d', 'Medicare Part D'],
  ['medicare_adv', 'Medicare Advantage'],
  ['commercial', 'Commercial / employer'],
  ['marketplace', 'Marketplace'],
  ['medicaid', 'Medicaid'],
  ['none', 'No insurance'],
  ['other', 'Other'],
  ['not_sure', 'Not sure'],
]);

export const INSURANCE_EXPLAINER =
  'Medicare Part D is stand-alone drug coverage. Medicare Advantage bundles medical and drug coverage through a private plan. ' +
  'Commercial / employer plans come through a job. Marketplace plans are bought through HealthCare.gov or a state exchange. ' +
  'Medicaid is state-run coverage based on income. If you are not sure, check your insurance card or choose “Not sure”.';

// ---------- 04B · Supply ----------

export const SUPPLY_LEFT = opts([
  ['none', 'None'],
  ['lt3', 'Less than 3 days'],
  ['3to7', '3–7 days'],
  ['gt7', 'More than 7 days'],
  ['not_started', 'Not started'],
  ['not_sure', 'Not sure'],
  ['na', 'Not applicable'],
]);

/** Supply answers that trigger the "contact your clinician promptly" safety notice. */
export const LOW_SUPPLY = new Set(['none', 'lt3']);

// ---------- 04C · Denied path ----------

export const DENIED_REASONS: (ChoiceOption<string> & { info?: string; icon?: IconName; tone?: Tone })[] = [
  {
    value: 'prior_auth',
    label: 'Prior authorization required',
    info: 'Your insurance may require your doctor to send information and get approval before covering the medication.',
  },
  { value: 'step_therapy', label: 'Step therapy required', info: 'Your plan may want you to try another treatment first.' },
  { value: 'not_covered', label: 'Medication not covered', info: 'The medication may not be on the plan’s list of covered drugs (formulary).' },
  { value: 'quantity_limit', label: 'Quantity limit', info: 'The plan may limit how much of the medication it covers at one time.' },
  { value: 'refill_too_soon', label: 'Refill too soon' },
  { value: 'request_denied', label: 'Insurance request denied', icon: 'file-text', tone: 'sky' },
  { value: 'other', label: 'Other' },
  { value: 'not_sure', label: 'Not sure', icon: 'help-circle', tone: 'sky' },
];

export const YES_NO_UNSURE = opts([
  ['yes', 'Yes'],
  ['no', 'No'],
  ['not_sure', 'Not sure'],
]);
export const YES_NO = opts([
  ['yes', 'Yes'],
  ['no', 'No'],
]);

export const LEARNED_FROM = opts([
  ['pharmacy', 'Pharmacy'],
  ['insurance', 'Insurance'],
  ['doctor', 'Doctor’s office'],
  ['letter', 'Letter, email, portal or text'],
  ['other', 'Other'],
  ['not_sure', 'Not sure'],
]);

// ---------- 04D · Expensive / delayed / not sure ----------

export const PRICE_SOURCE = opts([
  ['pharmacy', 'Pharmacy'],
  ['insurance', 'Insurance'],
  ['doctor', 'Doctor'],
  ['online', 'Online account'],
  ['other', 'Other'],
  ['not_sure', 'Not sure'],
]);

export const APPROX_COST = opts([
  ['lt50', 'Under $50'],
  ['50_250', '$50–$250'],
  ['251_1000', '$251–$1,000'],
  ['gt1000', 'Over $1,000'],
]);

export const DELAY_REASONS = opts([
  ['out_of_stock', 'Out of stock'],
  ['backordered', 'Backordered'],
  ['waiting_insurance', 'Waiting for insurance'],
  ['waiting_doctor', 'Waiting for doctor'],
  ['specialty', 'Specialty pharmacy'],
  ['wrong_pharmacy', 'Wrong pharmacy'],
  ['rx_problem', 'Prescription problem'],
  ['shipment', 'Shipment delayed'],
  ['other', 'Other'],
  ['not_sure', 'Not sure'],
]);

export const WAITING_TIME = opts([
  ['lt1w', 'Under 1 week'],
  ['1_2w', '1–2 weeks'],
  ['gt2w', 'Over 2 weeks'],
  ['not_sure', 'Not sure'],
]);

export const CONTACTED_WHO = opts([
  ['pharmacy', 'Pharmacy'],
  ['doctor', 'Doctor'],
  ['neither', 'Neither'],
]);

// ---------- 06 · Record a call ----------

export const CONTACT_KINDS: ChoiceOption<ContactKind>[] = opts([
  ['doctor', 'Doctor’s office'],
  ['insurance', 'Insurance'],
  ['pharmacy', 'Pharmacy'],
  ['assistance', 'Assistance program'],
  ['other', 'Other'],
]);

export const CONTACT_KIND_LABEL: Record<ContactKind, string> = {
  doctor: 'Doctor or clinic',
  insurance: 'Insurance',
  pharmacy: 'Pharmacy',
  assistance: 'Assistance program',
  other: 'Other contact',
};

export const RESPONSIBLE: ChoiceOption<Responsible>[] = opts([
  ['me', 'Me'],
  ['doctor', 'Doctor’s office'],
  ['insurance', 'Insurance'],
  ['pharmacy', 'Pharmacy'],
  ['assistance', 'Assistance program'],
]);

export const CALL_STATUSES: ChoiceOption<CallStatus>[] = opts([
  ['contacted', 'Contacted'],
  ['waiting', 'Waiting'],
  ['more_info', 'More information needed'],
  ['submitted', 'Submitted'],
  ['approved', 'Approved'],
  ['denied', 'Denied'],
  ['delayed', 'Delayed'],
  ['resolved', 'Resolved'],
  ['not_sure', 'Not sure'],
]);

export const CALL_STATUS_LABEL = Object.fromEntries(CALL_STATUSES.map((s) => [s.value, s.label])) as Record<
  CallStatus,
  string
>;

// ---------- 07 · Reminders ----------

export const REMIND_OPTIONS = opts<RemindOption>([
  ['on_due', 'On due date'],
  ['1_day', '1 day before'],
  ['3_days', '3 days before'],
  ['1_week', '1 week before'],
  ['custom', 'Custom'],
  ['weekly', 'Weekly until done'],
]);

export const REMIND_OFFSET_DAYS: Record<string, number> = { on_due: 0, '1_day': 1, '3_days': 3, '1_week': 7 };

export const REMIND_LABEL = Object.fromEntries(REMIND_OPTIONS.map((o) => [o.value, o.label])) as Record<string, string>;

// ---------- 05a · Terms ----------

export const TERMS: { id: string; term: string; means: string; next: string; guide?: GuideKind; financial?: boolean }[] = [
  {
    id: 'prior_auth',
    term: 'Prior authorization',
    means: 'Your insurance may require your doctor to send information and get approval before it covers the medication.',
    next: 'The doctor’s office submits a request; the plan approves, denies or asks for more information.',
    guide: 'doctor',
  },
  {
    id: 'step_therapy',
    term: 'Step therapy',
    means: 'The plan may want you to try one or more other treatments before it covers this medication.',
    next: 'The doctor’s office may explain why another treatment is not appropriate and ask for an exception.',
    guide: 'doctor',
  },
  {
    id: 'formulary',
    term: 'Formulary / not covered',
    means: 'A formulary is the plan’s list of covered medications. “Non-formulary” means the medication is not on that list.',
    next: 'You can ask whether a covered alternative may be appropriate, or whether the doctor can request an exception.',
    guide: 'insurance',
  },
  {
    id: 'quantity_limit',
    term: 'Quantity limit',
    means: 'The plan limits how much of a medication it covers over a period of time.',
    next: 'The doctor’s office may be able to request an exception if a different amount is needed.',
    guide: 'doctor',
  },
  {
    id: 'appeal',
    term: 'Appeal',
    means: 'A formal request asking the plan to review and change its decision.',
    next: 'Plans set deadlines for appeals. Ask the insurer how to appeal and write down the deadline they give you.',
    guide: 'insurance',
  },
  {
    id: 'exception',
    term: 'Coverage exception',
    means: 'A request asking the plan to cover a medication or amount it normally does not cover.',
    next: 'Usually the prescriber supports the request with information about why it is needed.',
    guide: 'doctor',
  },
  {
    id: 'specialty',
    term: 'Specialty pharmacy',
    means: 'Some medications can only be filled by pharmacies that handle special storage, shipping or support.',
    next: 'Ask which specialty pharmacy your plan uses and whether the prescription has been sent there.',
    guide: 'pharmacy',
  },
  {
    id: 'copay',
    term: 'Copay',
    means: 'A fixed amount you pay for a covered prescription, such as $20 per fill.',
    next: 'Ask the pharmacy or insurer why the amount is what it is, and whether a lower-cost option exists.',
    guide: 'pharmacy',
  },
  {
    id: 'coinsurance',
    term: 'Coinsurance',
    means: 'A percentage of the medication’s price that you pay, such as 25%.',
    next: 'Because it is a percentage, costly medications can mean a high amount. Financial assistance may help.',
    financial: true,
  },
  {
    id: 'deductible',
    term: 'Deductible',
    means: 'The amount you pay each year before your plan starts sharing the cost.',
    next: 'Costs are often highest early in the plan year. Ask the insurer how much of the deductible is left.',
    guide: 'insurance',
  },
  {
    id: 'assistance',
    term: 'Financial assistance program',
    means: 'A program that may help eligible patients with medication-related costs. Each program sets its own rules.',
    next: 'The program decides eligibility. Ask what documents are needed and how long approval takes.',
    financial: true,
  },
];

// ---------- 05b · Call guides ----------

export type GuideContext = { caregiver: boolean; patientName: string; medication: string; userName: string };

export type CallGuide = {
  kind: GuideKind;
  title: string;
  orgLabel: string;
  before: string[];
  opening: (c: GuideContext) => string;
  askFirst: string[];
  ifSections: { title: string; body: string }[];
  beforeHangUp: string[];
};

const med = (c: GuideContext) => c.medication || '[Medication]';
const yourRx = (c: GuideContext) =>
  c.caregiver ? `${c.patientName ? `${c.patientName}’s` : 'the patient’s'} prescription` : 'my prescription';

export const CALL_GUIDES: Record<GuideKind, CallGuide> = {
  doctor: {
    kind: 'doctor',
    title: 'Doctor Call Guide',
    orgLabel: 'Doctor’s office',
    before: [
      'Medication name and dose',
      'Insurance card',
      'Pharmacy name',
      'Any notice or reference number',
      'Something to write with',
    ],
    opening: (c) =>
      `Hi, my name is ${c.userName || '[Name]'}. I’m calling about ${yourRx(c)} for ${med(c)} that the insurance has not approved yet. Can you help me check its status?`,
    askFirst: [
      'Has the prescription been received and reviewed?',
      'Does the insurance require prior authorization?',
      'Has it been submitted?',
      'Is anything still needed from me?',
      'What happens next, and who is responsible?',
    ],
    ifSections: [
      { title: 'If step therapy is involved', body: 'What treatment is required first? Can an exception be requested?' },
      {
        title: 'If the medication is not covered',
        body: 'Is there a covered alternative that may be medically appropriate? Can an exception be requested?',
      },
    ],
    beforeHangUp: [
      'When should I follow up?',
      'Who should I contact?',
      'What number or extension?',
      'Is there a reference number?',
    ],
  },
  insurance: {
    kind: 'insurance',
    title: 'Insurance Call Guide',
    orgLabel: 'Insurance member services',
    before: [
      'Insurance card (member ID)',
      'Medication name and dose',
      'Any denial notice or letter',
      'Doctor and pharmacy names',
      'Something to write with',
    ],
    opening: (c) =>
      `Hi, my name is ${c.userName || '[Name]'}. I’m calling about ${yourRx(c)} for ${med(c)}. I was told it isn’t covered or needs approval. Can you tell me the exact reason and what the next steps are?`,
    askFirst: [
      'What is the exact reason the medication is not covered right now?',
      'Is prior authorization, step therapy or a quantity limit involved?',
      'Has a request been received from the doctor? What is its status?',
      'Is there a covered alternative on the formulary?',
      'How do I appeal or request an exception, and what is the deadline?',
    ],
    ifSections: [
      { title: 'If a request was denied', body: 'Can you send the denial in writing? What information would change the decision?' },
      { title: 'If the cost is the problem', body: 'Which tier is it on? How much of my deductible is left? Is there a lower-cost option?' },
    ],
    beforeHangUp: [
      'What is the reference or call number?',
      'Who did I speak with?',
      'When should I hear back?',
      'Is there a deadline I need to know?',
    ],
  },
  pharmacy: {
    kind: 'pharmacy',
    title: 'Pharmacy Call Guide',
    orgLabel: 'Pharmacy',
    before: [
      'Medication name and dose',
      'Insurance card',
      'Prescribing doctor’s name',
      'Date of birth of the patient',
      'Something to write with',
    ],
    opening: (c) =>
      `Hi, my name is ${c.userName || '[Name]'}. I’m calling about ${yourRx(c)} for ${med(c)}. Can you tell me what is preventing it from being filled?`,
    askFirst: [
      'Have you received the prescription?',
      'What message did you get from the insurance, if any?',
      'Is the medication in stock, or when will it be?',
      'Does it need to go to a specialty pharmacy?',
      'What is the price, and is there a lower-cost option?',
    ],
    ifSections: [
      { title: 'If it is out of stock or backordered', body: 'When do you expect it? Can another location or pharmacy fill it?' },
      { title: 'If it needs a different pharmacy', body: 'Which pharmacy? Can you transfer the prescription, or does the doctor need to send it?' },
    ],
    beforeHangUp: [
      'When will it be ready?',
      'Who should I contact if it is not?',
      'Is there a reference or claim number?',
      'Do I need to do anything else?',
    ],
  },
};

// ---------- 08 · Financial assistance ----------

/**
 * Program directory. Phone numbers and detailed descriptions must be verified by
 * the content team before release; unverified fields stay null and the UI says so.
 */
export const FINANCIAL_RESOURCES: {
  id: string;
  name: string;
  serves: string;
  description: string;
  phone: string | null;
  website: string | null;
  lastVerified: string | null;
}[] = [
  {
    id: 'extra_help',
    name: 'Medicare Extra Help',
    serves: 'people with Medicare',
    description: 'A federal program that may help with Medicare drug-plan costs for people with limited income and resources.',
    phone: null,
    website: 'https://www.ssa.gov',
    lastVerified: null,
  },
  {
    id: 'ship',
    name: 'State Health Insurance Assistance Program (SHIP)',
    serves: 'people with Medicare and caregivers',
    description: 'Free, unbiased one-on-one counseling about Medicare coverage and costs.',
    phone: null,
    website: 'https://www.shiphelp.org',
    lastVerified: null,
  },
  {
    id: 'paf',
    name: 'Patient Advocate Foundation',
    serves: 'to be verified',
    description: 'Case management and navigation support for patients facing access or cost barriers.',
    phone: null,
    website: 'https://www.patientadvocate.org',
    lastVerified: null,
  },
  {
    id: 'totalassist',
    name: 'TotalAssist',
    serves: 'to be verified',
    description: 'Description to be verified.',
    phone: null,
    website: null,
    lastVerified: null,
  },
  {
    id: 'copay_relief',
    name: 'Co-Pay Relief',
    serves: 'to be verified',
    description: 'Copay assistance for eligible patients with certain diagnoses.',
    phone: null,
    website: 'https://www.copays.org',
    lastVerified: null,
  },
];

export const PROGRAM_QUESTIONS = [
  'Who and which insurance types do you serve?',
  'Are there income or resource requirements?',
  'Is my medication included?',
  'What documents are needed?',
  'Can I apply directly? Does my doctor fill anything?',
  'Is funding open, or is there a waitlist?',
  'How long does it last, and how do I renew?',
  'What is my application or case number?',
  'What happens if I’m denied?',
];

// ---------- 09 · Additional support ----------

export const SUPPORT_RESOURCES = [
  { name: 'SHIP counseling', purpose: 'Medicare coverage questions' },
  { name: 'Patient Advocate Foundation navigation', purpose: 'Case management' },
  { name: 'Hospital social worker', purpose: 'Local resources and coordination' },
  { name: 'Hospital financial counselor', purpose: 'Bills and cost options' },
  { name: 'Specialty-pharmacy support', purpose: 'Specialty fills and shipping' },
  { name: 'Manufacturer patient support', purpose: 'Programs for a specific medication' },
  { name: 'Advocacy organization', purpose: 'Condition-specific help' },
];

export const REF_KINDS: { kind: RefKind; label: string }[] = [
  { kind: 'prior_auth', label: 'Prior-auth reference' },
  { kind: 'appeal', label: 'Appeal reference' },
  { kind: 'insurance', label: 'Insurance reference' },
  { kind: 'assistance', label: 'Assistance application' },
  { kind: 'extension', label: 'Direct extension' },
  { kind: 'other', label: 'Other' },
];

// ---------- 10 · Documents ----------

export const DOC_KINDS: { value: DocKind; label: string; icon: IconName }[] = [
  { value: 'denial_letter', label: 'Denial letter', icon: 'file-text' },
  { value: 'insurance_notice', label: 'Insurance notice', icon: 'mail' },
  { value: 'pharmacy_notice', label: 'Pharmacy notice', icon: 'package' },
  { value: 'assistance_application', label: 'Assistance application', icon: 'clipboard' },
  { value: 'other', label: 'Other relevant document', icon: 'file' },
];

// ---------- 11 · Weekly check-in ----------

export const RECEIVED_OPTIONS: { value: ReceivedAnswer; label: string; icon: IconName; tone: Tone }[] = [
  { value: 'yes', label: 'Yes', icon: 'check-circle', tone: 'green' },
  { value: 'no', label: 'No', icon: 'x-circle', tone: 'coral' },
  { value: 'cost_problem', label: 'Received it, but cost remains a problem', icon: 'dollar-sign', tone: 'sun' },
  { value: 'not_needed', label: 'This case is no longer needed', icon: 'archive', tone: 'sky' },
];

export const BARRIERS: { value: string; label: string; icon: IconName; tone: Tone }[] = [
  { value: 'insurance', label: 'Insurance', icon: 'shield', tone: 'sky' },
  { value: 'cost', label: 'Cost', icon: 'dollar-sign', tone: 'coral' },
  { value: 'doctor', label: 'Doctor’s office', icon: 'activity', tone: 'teal' },
  { value: 'pharmacy', label: 'Pharmacy / availability', icon: 'package', tone: 'purple' },
  { value: 'assistance', label: 'Assistance program', icon: 'heart', tone: 'green' },
  { value: 'waiting', label: 'Waiting for a response', icon: 'clock', tone: 'sun' },
  { value: 'not_sure', label: 'Not sure', icon: 'help-circle', tone: 'sky' },
];

export const WEEKLY_CHANGES = opts([
  ['submitted', 'Request submitted'],
  ['more_info', 'More information requested'],
  ['approved', 'Approved'],
  ['denied', 'Denied'],
  ['price_changed', 'Price changed'],
  ['cannot_fill', 'Pharmacy still cannot fill'],
  ['nothing', 'Nothing changed'],
  ['other', 'Other'],
]);

// ---------- 12 · Still stuck ----------

export const STUCK_REASONS: { value: string; label: string; icon: IconName; tone: Tone }[] = [
  { value: 'denied_again', label: 'Insurance denied it again', icon: 'shield-off', tone: 'sky' },
  { value: 'no_response', label: 'No one responded', icon: 'phone-missed', tone: 'sun' },
  { value: 'doctor_pending', label: 'Doctor’s office has not completed next step', icon: 'activity', tone: 'teal' },
  { value: 'cannot_fill', label: 'Pharmacy still cannot fill', icon: 'package', tone: 'purple' },
  { value: 'unaffordable', label: 'Medication still unaffordable', icon: 'dollar-sign', tone: 'coral' },
  { value: 'assistance_denied', label: 'Assistance application denied', icon: 'x-circle', tone: 'coral' },
  { value: 'unclear', label: 'I don’t understand the latest response', icon: 'help-circle', tone: 'sky' },
];

export const STUCK_ACTIONS: Record<
  string,
  { actions: string[]; primary: { label: string; guide?: GuideKind; route?: 'financial' | 'terms' | 'contacts' } }
> = {
  denied_again: {
    actions: [
      'Confirm the exact denial reason',
      'Ask about appeal, exception or review',
      'Record any deadline',
      'Identify missing information and who submits it',
      'Open Doctor Guide if clinical information is needed',
    ],
    primary: { label: 'Open Insurance Call Guide', guide: 'insurance' },
  },
  no_response: {
    actions: [
      'Call again and ask for a status update',
      'Ask for a direct extension or another contact',
      'Ask for a reference number',
      'Set a reminder for the next follow-up',
    ],
    primary: { label: 'Open Doctor Call Guide', guide: 'doctor' },
  },
  doctor_pending: {
    actions: [
      'Ask what step is still pending and who owns it',
      'Ask whether anything is needed from you',
      'Ask when it will be completed',
      'Record the answer and set a reminder',
    ],
    primary: { label: 'Open Doctor Call Guide', guide: 'doctor' },
  },
  cannot_fill: {
    actions: [
      'Ask the pharmacy exactly why it cannot be filled',
      'Ask whether another pharmacy or location could fill it',
      'Ask whether the doctor needs to send it elsewhere',
      'Record what they said',
    ],
    primary: { label: 'Open Pharmacy Call Guide', guide: 'pharmacy' },
  },
  unaffordable: {
    actions: [
      'Ask the pharmacy about lower-cost options',
      'Ask the insurer which tier the medication is on',
      'Review financial assistance programs',
      'Ask the doctor about covered alternatives',
    ],
    primary: { label: 'See Financial Assistance', route: 'financial' },
  },
  assistance_denied: {
    actions: [
      'Ask the program why the application was denied',
      'Ask whether you can re-apply or appeal',
      'Look for another program that may fit',
      'Talk to a support resource such as SHIP or a social worker',
    ],
    primary: { label: 'See Financial Assistance', route: 'financial' },
  },
  unclear: {
    actions: [
      'Write down the exact words from the message or letter',
      'Look up unfamiliar terms',
      'Ask the sender to explain it in plain language',
      'Ask a support resource for help',
    ],
    primary: { label: 'Understand the Terms', route: 'terms' },
  },
};

// ---------- display labels ----------

export function labelOf(options: readonly ChoiceOption<string>[], value: string | null | undefined): string {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label ?? value;
}

export function describePatient(c: MedCase): string {
  if (c.whoFor === 'self') return 'Myself';
  const rel = labelOf(RELATIONSHIPS, c.relationship).toLowerCase();
  const name = c.patientName || 'Someone else';
  return rel ? `${name} (${rel})` : name;
}

export function describeProblem(c: MedCase): string {
  const a = c.answers;
  switch (c.problem) {
    case 'denied': {
      const r = DENIED_REASONS.find((d) => d.value === a.deniedReason);
      return r && r.value !== 'not_sure' && r.value !== 'other' ? `Denied — ${r.label.replace(' required', '').toLowerCase()}` : 'Denied by insurance';
    }
    case 'expensive':
      return a.approxCost ? `Too expensive — ${labelOf(APPROX_COST, a.approxCost)}` : 'Too expensive';
    case 'delayed':
      return a.toldReason ? `Delayed — ${labelOf(DELAY_REASONS, a.toldReason).toLowerCase()}` : 'Delayed or unavailable';
    case 'unsure':
      return 'Not sure yet';
  }
}

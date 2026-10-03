export type ProblemType = 'denied' | 'expensive' | 'delayed' | 'unsure';
export type WhoFor = 'self' | 'other';
export type CaseStatus = 'open' | 'closed' | 'resolved';

export type CallStatus =
  | 'contacted'
  | 'waiting'
  | 'more_info'
  | 'submitted'
  | 'approved'
  | 'denied'
  | 'delayed'
  | 'resolved'
  | 'not_sure';

export type ContactKind = 'doctor' | 'insurance' | 'pharmacy' | 'assistance' | 'other';
export type GuideKind = 'doctor' | 'insurance' | 'pharmacy';
export type Responsible = 'me' | 'doctor' | 'insurance' | 'pharmacy' | 'assistance';

/** Answers to the problem-specific "path" questions (screens 04C / 04D). */
export interface PathAnswers {
  // Denied by insurance
  deniedReason?: string;
  noticeReceived?: string;
  learnedFrom?: string;
  contactedDoctor?: string;
  // Too expensive
  priceSource?: string;
  approxCost?: string;
  approvedByInsurance?: string;
  assistanceContacted?: string;
  // Delayed or unavailable
  toldReason?: string;
  waitingTime?: string;
  spokePharmacy?: string;
  spokeDoctor?: string;
  // Not sure
  whatHappened?: string;
  receivedMessage?: string;
  contactedWho?: string;
}

export interface MedCase {
  id: number;
  userId: number;
  status: CaseStatus;
  problem: ProblemType;
  whoFor: WhoFor;
  patientName: string;
  relationship: string | null;
  ageGroup: string | null;
  insuranceType: string | null;
  insuranceCompany: string;
  medicationName: string;
  medicationUnknown: boolean;
  supplyLeft: string | null;
  answers: PathAnswers;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface InsuranceCard {
  memberId: string;
  groupNumber: string;
  memberPhone: string;
  rxBin: string;
  rxPcn: string;
  rxGroup: string;
}

/** Everything collected by the 3-step interview before the case is saved. */
export interface CaseDraft {
  problem: ProblemType | null;
  whoFor: WhoFor;
  patientName: string;
  relationship: string | null;
  ageGroup: string | null;
  insuranceType: string | null;
  insuranceCompany: string;
  card: InsuranceCard;
  medicationName: string;
  medicationUnknown: boolean;
  medicationLater: boolean;
  doctorName: string;
  pharmacyName: string;
  supplyLeft: string | null;
  answers: PathAnswers;
}

export interface CallRecord {
  id: number;
  caseId: number;
  contactKind: ContactKind;
  organization: string;
  person: string;
  phone: string;
  callDate: string | null;
  callTime: string;
  reference: string;
  summary: string;
  nextStep: string;
  responsible: Responsible | null;
  missingInfo: string;
  followUpDate: string | null;
  followUpUnknown: boolean;
  status: CallStatus;
  createdAt: string;
}

export type RemindOption = 'on_due' | '1_day' | '3_days' | '1_week' | 'custom' | 'weekly';

export interface Task {
  id: number;
  caseId: number;
  title: string;
  organization: string;
  phoneOrUrl: string;
  reason: string;
  dueDate: string | null;
  reminderDate: string | null;
  dueUnknown: boolean;
  remindOption: RemindOption | null;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyDevice: boolean;
  notes: string;
  done: boolean;
  createdAt: string;
}

export interface Contact {
  id: number;
  caseId: number;
  kind: ContactKind;
  name: string;
  contactPerson: string;
  phone: string;
  extension: string;
  website: string;
  address: string;
  notes: string;
  /** Insurance only: plan name, member ID etc. Assistance: case number. */
  plan: string;
  memberId: string;
  groupNumber: string;
  pharmacyBenefitPhone: string;
  rxBin: string;
  rxPcn: string;
  rxGroup: string;
  caseNumber: string;
}

export type RefKind = 'prior_auth' | 'appeal' | 'insurance' | 'assistance' | 'extension' | 'other';

export interface RefNumber {
  id: number;
  caseId: number;
  kind: RefKind;
  value: string;
}

export type DocKind = 'denial_letter' | 'insurance_notice' | 'pharmacy_notice' | 'assistance_application' | 'other';

export interface CaseDocument {
  id: number;
  caseId: number;
  kind: DocKind;
  name: string;
  uri: string;
  mimeType: string;
  /** Who the document is for, when it isn't the case's own patient (e.g. another family member). */
  personName: string;
  createdAt: string;
}

export type ReceivedAnswer = 'yes' | 'no' | 'cost_problem' | 'not_needed';

export interface CheckIn {
  id: number;
  caseId: number;
  received: ReceivedAnswer;
  barrier: string | null;
  changes: string[];
  createdAt: string;
}

export interface CaseResource {
  caseId: number;
  resourceId: string;
  inPlan: boolean;
  contactedAt: string | null;
}

/**
 * Plan engine: turns interview answers + case activity into the dashboard's
 * "Your next step" card and the progress tracker.
 *
 * First-contact rules (from the flow map):
 *   not sure → pharmacy · prior auth / step therapy → doctor · exact denial reason → insurer
 *   cost → pharmacy / insurer / assistance · inventory → pharmacy
 * After a call is recorded, the latest call's status drives the next step.
 */
import type { CallRecord, CheckIn, ContactKind, GuideKind, MedCase, Task } from '@/types/case';
import type { ProgressState } from '@/components/ui/blocks';
import { CALL_STATUS_LABEL } from '@/lib/content';
import { shortDate, todayISO } from '@/lib/dates';

export type NextStep = {
  title: string;
  reason: string;
  why: string;
  target: ContactKind;
  /** Call guide to open, when the next step is a call. */
  guide: GuideKind | null;
  /** Special destination when there is no call guide. */
  route?: 'financial' | 'success' | 'still-stuck';
};

export const PROGRESS_LABELS = [
  'Case created',
  'Identify blocker',
  'Contact organization',
  'Record response',
  'Set follow-up',
  'Review outcome',
  'Medication received',
];

const TARGET_LABEL: Record<ContactKind, string> = {
  doctor: 'the doctor’s office',
  insurance: 'the insurance plan',
  pharmacy: 'the pharmacy',
  assistance: 'the assistance program',
  other: 'the contact',
};

const guideFor = (k: ContactKind): GuideKind | null =>
  k === 'doctor' || k === 'insurance' || k === 'pharmacy' ? k : null;

function step(target: ContactKind, title: string, reason: string, why: string, route?: NextStep['route']): NextStep {
  return { target, title, reason, why, guide: route ? null : guideFor(target), route };
}

/** Where to go first, based only on the interview. */
export function firstContact(c: MedCase): NextStep {
  const a = c.answers;
  switch (c.problem) {
    case 'denied':
      switch (a.deniedReason) {
        case 'prior_auth':
          return step(
            'doctor',
            'Contact the doctor’s office',
            'Prior authorization may be involved.',
            'Prior authorization requests are usually sent by the prescriber, so the doctor’s office can tell you whether one was submitted.',
          );
        case 'step_therapy':
          return step(
            'doctor',
            'Contact the doctor’s office',
            'Step therapy may be involved.',
            'The prescriber can explain whether another treatment is required first, or request an exception.',
          );
        case 'not_covered':
        case 'quantity_limit':
          return step(
            'doctor',
            'Contact the doctor’s office',
            'An exception or covered alternative may be possible.',
            'Exception requests usually need information from the prescriber.',
          );
        case 'refill_too_soon':
          return step(
            'pharmacy',
            'Contact the pharmacy',
            'The plan may think it is too early for a refill.',
            'The pharmacy can see the claim message and the date a refill is allowed.',
          );
        default:
          return step(
            'insurance',
            'Contact the insurance plan',
            'Ask for the exact denial reason.',
            'The insurer can tell you exactly why the claim was denied and what options exist, such as an appeal.',
          );
      }
    case 'expensive':
      if (a.approvedByInsurance === 'no')
        return step(
          'insurance',
          'Contact the insurance plan',
          'Confirm whether the medication is covered.',
          'If the plan has not approved the medication, the price may be the full cash price.',
        );
      if (a.assistanceContacted === 'yes')
        return step(
          'assistance',
          'Follow up with the assistance program',
          'Track your application.',
          'You already contacted a program — keep track of its status and case number.',
          'financial',
        );
      return step(
        'pharmacy',
        'Contact the pharmacy',
        'Ask how the price was calculated and about lower-cost options.',
        'The pharmacy can see the claim, the copay or coinsurance applied, and whether a lower-cost option exists. Financial assistance may also help.',
      );
    case 'delayed':
      switch (a.toldReason) {
        case 'waiting_insurance':
          return step('insurance', 'Contact the insurance plan', 'Ask about the status of the request.', 'The insurer can see where the coverage request is.');
        case 'waiting_doctor':
        case 'rx_problem':
          return step(
            'doctor',
            'Contact the doctor’s office',
            'The prescription may need attention from the prescriber.',
            'Only the prescriber can fix or re-send a prescription.',
          );
        default:
          return step(
            'pharmacy',
            'Contact the pharmacy',
            'Ask when the medication will be available.',
            'The pharmacy knows about stock, shipments and whether another pharmacy can fill it.',
          );
      }
    case 'unsure':
    default:
      return step(
        'pharmacy',
        'Contact the pharmacy',
        'Ask what is preventing the prescription from being filled.',
        'The pharmacy usually sees the exact message from the insurer, so it is a good first contact when the problem is unclear.',
      );
  }
}

export function computeNextStep(c: MedCase, calls: CallRecord[], checkIns: CheckIn[]): NextStep {
  const lastCheckIn = checkIns[0];
  if (lastCheckIn?.received === 'yes') {
    return {
      target: 'pharmacy',
      title: 'Medication received',
      reason: 'Your last check-in says the medication was received.',
      why: 'You can close the case, or keep it open if you expect more problems.',
      guide: null,
      route: 'success',
    };
  }
  if (lastCheckIn?.received === 'cost_problem') {
    return step(
      'assistance',
      'Look into financial assistance',
      'The medication was received but the cost is still a problem.',
      'Programs may help eligible patients with ongoing costs.',
      'financial',
    );
  }

  const last = calls[0];
  if (!last) return firstContact(c);

  const who = last.organization || TARGET_LABEL[last.contactKind];
  switch (last.status) {
    case 'approved':
    case 'resolved':
      return step(
        'pharmacy',
        'Confirm the pharmacy can fill it',
        `${capitalize(who)} reported: ${CALL_STATUS_LABEL[last.status].toLowerCase()}.`,
        'Approval doesn’t always reach the pharmacy right away — confirm it can be filled and what it will cost.',
      );
    case 'denied':
      return {
        ...step(
          'insurance',
          'Ask about an appeal or exception',
          'The request was denied.',
          'Plans have appeal and exception processes with deadlines. Ask for the exact reason and deadline, and record it.',
        ),
        route: 'still-stuck',
      };
    case 'more_info':
      if (last.responsible === 'me' || !last.responsible)
        return step(
          last.contactKind,
          'Send the missing information',
          last.missingInfo ? `Needed: ${last.missingInfo}` : 'More information was requested.',
          'The request can’t move forward until the missing information is received.',
        );
      return step(
        last.responsible,
        `Check that ${TARGET_LABEL[last.responsible]} sent what’s needed`,
        last.missingInfo ? `Needed: ${last.missingInfo}` : 'More information was requested.',
        'Confirming saves days of waiting if something was missed.',
      );
    case 'delayed':
      return step('pharmacy', 'Check on the delay with the pharmacy', 'The medication is delayed.', 'Ask when it will arrive or whether another pharmacy can fill it.');
    default: {
      const target = last.responsible && last.responsible !== 'me' ? last.responsible : last.contactKind;
      if (last.followUpDate) {
        const overdue = last.followUpDate <= todayISO();
        return step(
          target,
          `Follow up with ${TARGET_LABEL[target]}${overdue ? '' : ` on ${shortDate(last.followUpDate)}`}`,
          overdue ? 'Your follow-up date has arrived.' : `Status: ${CALL_STATUS_LABEL[last.status]}.`,
          'Following up on the date you were given keeps the request from stalling.',
        );
      }
      return step(
        target,
        `Ask ${TARGET_LABEL[target]} when to follow up`,
        `Status: ${CALL_STATUS_LABEL[last.status]}.`,
        'Without a follow-up date it is easy for a request to stall. Ask when you should expect an answer.',
      );
    }
  }
}

export function computeProgress(c: MedCase, calls: CallRecord[], tasks: Task[], checkIns: CheckIn[]): ProgressState[] {
  const received = c.status === 'resolved' || checkIns.some((k) => k.received === 'yes');
  const hasCall = calls.length > 0;
  const done = [
    true,
    c.problem !== 'unsure' || hasCall,
    hasCall,
    calls.some((k) => k.status !== 'contacted' || !!k.nextStep),
    tasks.length > 0 || calls.some((k) => !!k.followUpDate),
    hasCall && checkIns.length > 0,
    received,
  ];
  if (received) return done.map(() => 'done');
  const current = done.findIndex((d) => !d);
  return done.map((d, i) => (d ? 'done' : i === current ? 'current' : 'todo'));
}

export function currentStatus(calls: CallRecord[], checkIns: CheckIn[], next: NextStep): string {
  const received = checkIns[0]?.received;
  if (received === 'yes') return 'Medication received';
  if (received === 'cost_problem') return 'Received · cost is still a problem';
  const last = calls[0];
  if (!last) return `Waiting to contact ${TARGET_LABEL[next.target].replace(/^the /, '')}`;
  return `${CALL_STATUS_LABEL[last.status]} · ${last.organization || TARGET_LABEL[last.contactKind].replace(/^the /, '')}`;
}

/** Tasks due (or whose reminder date has arrived) and not done. */
export function dueTasks(tasks: Task[]): Task[] {
  const today = todayISO();
  return tasks.filter((t) => !t.done && ((t.reminderDate && t.reminderDate <= today) || (t.dueDate && t.dueDate <= today)));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

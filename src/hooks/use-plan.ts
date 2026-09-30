import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useCase } from '@/context/case-context';
import { computeNextStep, computeProgress, currentStatus, dueTasks } from '@/lib/plan';
import type { GuideContext } from '@/lib/content';
import type { ContactKind } from '@/types/case';

/**
 * Derived plan state for the active case. Only call from screens under
 * /plan, whose layout guarantees an active case.
 */
export function usePlan() {
  const { data, mutate, refresh } = useCase();
  const { user } = useAuth();
  if (!data) throw new Error('usePlan requires an active case');

  const derived = useMemo(() => {
    const { medCase, calls, tasks, checkIns, contacts } = data;
    const next = computeNextStep(medCase, calls, checkIns);
    const caregiver = medCase.whoFor === 'other';
    const guideCtx: GuideContext = {
      caregiver,
      patientName: medCase.patientName,
      medication: medCase.medicationName,
      userName: user ? `${user.firstName}` : '',
    };
    const contactOf = (kind: ContactKind) => contacts.find((c) => c.kind === kind);
    return {
      next,
      progress: computeProgress(medCase, calls, tasks, checkIns),
      status: currentStatus(calls, checkIns, next),
      due: dueTasks(tasks),
      caregiver,
      /** "your" vs "the patient’s" — wording adapts to who needs help. */
      whose: caregiver ? (medCase.patientName ? `${medCase.patientName}’s` : 'the patient’s') : 'your',
      guideCtx,
      contactOf,
    };
  }, [data, user]);

  return { ...data, ...derived, mutate, refresh };
}

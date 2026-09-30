import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { CaseDraft } from '@/types/case';

export const emptyDraft = (): CaseDraft => ({
  problem: null,
  whoFor: 'self',
  patientName: '',
  relationship: null,
  ageGroup: null,
  insuranceType: null,
  insuranceCompany: '',
  card: { memberId: '', groupNumber: '', memberPhone: '', rxBin: '', rxPcn: '', rxGroup: '' },
  medicationName: '',
  medicationUnknown: false,
  medicationLater: false,
  doctorName: '',
  pharmacyName: '',
  supplyLeft: null,
  answers: {},
});

type InterviewContextType = {
  draft: CaseDraft;
  update: (patch: Partial<CaseDraft>) => void;
  updateAnswers: (patch: Partial<CaseDraft['answers']>) => void;
  updateCard: (patch: Partial<CaseDraft['card']>) => void;
  reset: () => void;
};

const InterviewContext = createContext<InterviewContextType | null>(null);

/** Holds the in-progress interview (screens 03–04D) until "Create My Action Plan". */
export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<CaseDraft>(emptyDraft);

  const update = useCallback((patch: Partial<CaseDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const updateAnswers = useCallback(
    (patch: Partial<CaseDraft['answers']>) => setDraft((d) => ({ ...d, answers: { ...d.answers, ...patch } })),
    [],
  );
  const updateCard = useCallback(
    (patch: Partial<CaseDraft['card']>) => setDraft((d) => ({ ...d, card: { ...d.card, ...patch } })),
    [],
  );
  const reset = useCallback(() => setDraft(emptyDraft()), []);

  const value = useMemo(
    () => ({ draft, update, updateAnswers, updateCard, reset }),
    [draft, update, updateAnswers, updateCard, reset],
  );
  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider');
  return ctx;
}

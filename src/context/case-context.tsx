import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useAuth } from '@/context/auth-context';
import { getActiveCase } from '@/lib/repo/cases';
import { listContacts, listRefNumbers } from '@/lib/repo/contacts';
import {
  listCalls,
  listCaseResources,
  listCheckIns,
  listDocuments,
  listTasks,
} from '@/lib/repo/activity';
import type {
  CallRecord,
  CaseDocument,
  CaseResource,
  CheckIn,
  Contact,
  MedCase,
  RefNumber,
  Task,
} from '@/types/case';

export type CaseData = {
  medCase: MedCase;
  calls: CallRecord[];
  tasks: Task[];
  checkIns: CheckIn[];
  contacts: Contact[];
  refs: RefNumber[];
  documents: CaseDocument[];
  resources: CaseResource[];
};

type CaseContextType = {
  data: CaseData | null;
  loading: boolean;
  refresh: () => Promise<CaseData | null>;
  /**
   * Runs a write against the active case, then reloads the case data.
   * Throws if there is no active case.
   */
  mutate: (fn: (db: SQLiteDatabase, caseId: number) => Promise<unknown>) => Promise<void>;
};

const CaseContext = createContext<CaseContextType | null>(null);

async function loadCase(db: SQLiteDatabase, userId: number): Promise<CaseData | null> {
  const medCase = await getActiveCase(db, userId);
  if (!medCase) return null;
  const id = medCase.id;
  const [calls, tasks, checkIns, contacts, refs, documents, resources] = await Promise.all([
    listCalls(db, id),
    listTasks(db, id),
    listCheckIns(db, id),
    listContacts(db, id),
    listRefNumbers(db, id),
    listDocuments(db, id),
    listCaseResources(db, id),
  ]);
  return { medCase, calls, tasks, checkIns, contacts, refs, documents, resources };
}

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const { user } = useAuth();
  // Data is tagged with the user it was loaded for, so a freshly signed-in user
  // is "loading" until their own case has been read (no stale/empty flash).
  const [state, setState] = useState<{ userId: number | null; data: CaseData | null }>({ userId: null, data: null });
  const userId = user?.id ?? null;
  const loading = userId !== null && state.userId !== userId;
  const data = state.userId === userId ? state.data : null;

  const refresh = useCallback(async () => {
    if (userId === null) return null;
    const next = await loadCase(db, userId);
    setState({ userId, data: next });
    return next;
  }, [db, userId]);

  // Load the signed-in user's active case whenever the user changes.
  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    loadCase(db, userId)
      .then((next) => !cancelled && setState({ userId, data: next }))
      .catch(() => !cancelled && setState({ userId, data: null }));
    return () => {
      cancelled = true;
    };
  }, [db, userId]);

  const mutate = useCallback<CaseContextType['mutate']>(
    async (fn) => {
      const caseId = data?.medCase.id;
      if (!caseId) throw new Error('NO_ACTIVE_CASE');
      await fn(db, caseId);
      await refresh();
    },
    [db, data?.medCase.id, refresh],
  );

  const value = useMemo(() => ({ data, loading, refresh, mutate }), [data, loading, refresh, mutate]);
  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase(): CaseContextType {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error('useCase must be used within CaseProvider');
  return ctx;
}

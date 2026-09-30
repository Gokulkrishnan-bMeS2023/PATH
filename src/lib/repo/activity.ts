import { type SQLiteDatabase } from 'expo-sqlite';
import type {
  CallRecord,
  CaseDocument,
  CaseResource,
  CheckIn,
  DocKind,
  ReceivedAnswer,
  Task,
} from '@/types/case';
import { setRefNumber } from '@/lib/repo/contacts';
import { touchCase } from '@/lib/repo/cases';

// ---------- calls ----------

type CallRow = {
  id: number;
  case_id: number;
  contact_kind: CallRecord['contactKind'];
  organization: string;
  person: string;
  phone: string;
  call_date: string | null;
  call_time: string;
  reference: string;
  summary: string;
  next_step: string;
  responsible: CallRecord['responsible'];
  missing_info: string;
  follow_up_date: string | null;
  follow_up_unknown: number;
  status: CallRecord['status'];
  created_at: string;
};

const rowToCall = (r: CallRow): CallRecord => ({
  id: r.id,
  caseId: r.case_id,
  contactKind: r.contact_kind,
  organization: r.organization,
  person: r.person,
  phone: r.phone,
  callDate: r.call_date,
  callTime: r.call_time,
  reference: r.reference,
  summary: r.summary,
  nextStep: r.next_step,
  responsible: r.responsible,
  missingInfo: r.missing_info,
  followUpDate: r.follow_up_date,
  followUpUnknown: !!r.follow_up_unknown,
  status: r.status,
  createdAt: r.created_at,
});

export async function listCalls(db: SQLiteDatabase, caseId: number): Promise<CallRecord[]> {
  const rows = await db.getAllAsync<CallRow>('SELECT * FROM calls WHERE case_id = ? ORDER BY id DESC', caseId);
  return rows.map(rowToCall);
}

export type NewCall = Omit<CallRecord, 'id' | 'caseId' | 'createdAt'>;

/**
 * Saves a call and applies its side effects in one transaction:
 * a follow-up task (when a date was given) and the reference number.
 */
export async function recordCall(db: SQLiteDatabase, caseId: number, c: NewCall): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO calls (case_id, contact_kind, organization, person, phone, call_date, call_time, reference,
         summary, next_step, responsible, missing_info, follow_up_date, follow_up_unknown, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      caseId,
      c.contactKind,
      c.organization,
      c.person,
      c.phone,
      c.callDate,
      c.callTime,
      c.reference,
      c.summary,
      c.nextStep,
      c.responsible,
      c.missingInfo,
      c.followUpDate,
      c.followUpUnknown ? 1 : 0,
      c.status,
    );

    if (c.followUpDate) {
      await db.runAsync(
        `INSERT INTO tasks (case_id, title, organization, phone_or_url, reason, due_date, reminder_date, remind_option)
         VALUES (?, ?, ?, ?, ?, ?, ?, '1_day')`,
        caseId,
        `Follow up with ${c.organization || KIND_LABEL[c.contactKind]}`,
        c.organization || KIND_LABEL[c.contactKind],
        c.phone,
        c.nextStep || 'Follow-up from recorded call',
        c.followUpDate,
        dayBefore(c.followUpDate),
      );
    }

    if (c.reference.trim()) {
      const kind =
        c.contactKind === 'insurance' ? 'insurance' : c.contactKind === 'assistance' ? 'assistance' : 'other';
      await setRefNumber(db, caseId, kind, c.reference);
    }
    await touchCase(db, caseId);
  });
}

const KIND_LABEL: Record<CallRecord['contactKind'], string> = {
  doctor: "doctor's office",
  insurance: 'insurance',
  pharmacy: 'pharmacy',
  assistance: 'assistance program',
  other: 'contact',
};

function dayBefore(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ---------- tasks / reminders ----------

type TaskRow = {
  id: number;
  case_id: number;
  title: string;
  organization: string;
  phone_or_url: string;
  reason: string;
  due_date: string | null;
  reminder_date: string | null;
  due_unknown: number;
  remind_option: Task['remindOption'];
  notify_in_app: number;
  notify_email: number;
  notify_device: number;
  notes: string;
  done: number;
  created_at: string;
};

const rowToTask = (r: TaskRow): Task => ({
  id: r.id,
  caseId: r.case_id,
  title: r.title,
  organization: r.organization,
  phoneOrUrl: r.phone_or_url,
  reason: r.reason,
  dueDate: r.due_date,
  reminderDate: r.reminder_date,
  dueUnknown: !!r.due_unknown,
  remindOption: r.remind_option,
  notifyInApp: !!r.notify_in_app,
  notifyEmail: !!r.notify_email,
  notifyDevice: !!r.notify_device,
  notes: r.notes,
  done: !!r.done,
  createdAt: r.created_at,
});

export async function listTasks(db: SQLiteDatabase, caseId: number): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks WHERE case_id = ?
     ORDER BY done, CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date, id`,
    caseId,
  );
  return rows.map(rowToTask);
}

export type TaskInput = Omit<Task, 'id' | 'caseId' | 'createdAt' | 'done'>;

export async function saveTask(db: SQLiteDatabase, caseId: number, t: TaskInput, taskId?: number) {
  const values = [
    t.title,
    t.organization,
    t.phoneOrUrl,
    t.reason,
    t.dueDate,
    t.reminderDate,
    t.dueUnknown ? 1 : 0,
    t.remindOption,
    t.notifyInApp ? 1 : 0,
    t.notifyEmail ? 1 : 0,
    t.notifyDevice ? 1 : 0,
    t.notes,
  ];
  if (taskId) {
    await db.runAsync(
      `UPDATE tasks SET title = ?, organization = ?, phone_or_url = ?, reason = ?, due_date = ?, reminder_date = ?,
         due_unknown = ?, remind_option = ?, notify_in_app = ?, notify_email = ?, notify_device = ?, notes = ?
       WHERE id = ? AND case_id = ?`,
      ...values,
      taskId,
      caseId,
    );
  } else {
    await db.runAsync(
      `INSERT INTO tasks (title, organization, phone_or_url, reason, due_date, reminder_date, due_unknown,
         remind_option, notify_in_app, notify_email, notify_device, notes, case_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ...values,
      caseId,
    );
  }
  await touchCase(db, caseId);
}

export async function setTaskDone(db: SQLiteDatabase, caseId: number, taskId: number, done: boolean) {
  await db.runAsync('UPDATE tasks SET done = ? WHERE id = ? AND case_id = ?', done ? 1 : 0, taskId, caseId);
}

export async function deleteTask(db: SQLiteDatabase, caseId: number, taskId: number) {
  await db.runAsync('DELETE FROM tasks WHERE id = ? AND case_id = ?', taskId, caseId);
}

// ---------- weekly check-ins ----------

export async function listCheckIns(db: SQLiteDatabase, caseId: number): Promise<CheckIn[]> {
  const rows = await db.getAllAsync<{
    id: number;
    case_id: number;
    received: ReceivedAnswer;
    barrier: string | null;
    changes: string;
    created_at: string;
  }>('SELECT * FROM check_ins WHERE case_id = ? ORDER BY id DESC', caseId);
  return rows.map((r) => {
    let changes: string[] = [];
    try {
      changes = JSON.parse(r.changes);
    } catch {}
    return { id: r.id, caseId: r.case_id, received: r.received, barrier: r.barrier, changes, createdAt: r.created_at };
  });
}

export async function addCheckIn(
  db: SQLiteDatabase,
  caseId: number,
  c: { received: ReceivedAnswer; barrier: string | null; changes: string[] },
) {
  await db.runAsync(
    'INSERT INTO check_ins (case_id, received, barrier, changes) VALUES (?, ?, ?, ?)',
    caseId,
    c.received,
    c.barrier,
    JSON.stringify(c.changes),
  );
  await touchCase(db, caseId);
}

// ---------- documents ----------

export async function listDocuments(db: SQLiteDatabase, caseId: number): Promise<CaseDocument[]> {
  const rows = await db.getAllAsync<{
    id: number;
    case_id: number;
    kind: DocKind;
    name: string;
    uri: string;
    mime_type: string;
    created_at: string;
  }>('SELECT * FROM documents WHERE case_id = ? ORDER BY id DESC', caseId);
  return rows.map((r) => ({
    id: r.id,
    caseId: r.case_id,
    kind: r.kind,
    name: r.name,
    uri: r.uri,
    mimeType: r.mime_type,
    createdAt: r.created_at,
  }));
}

export async function addDocument(
  db: SQLiteDatabase,
  caseId: number,
  d: { kind: DocKind; name: string; uri: string; mimeType: string },
) {
  await db.runAsync(
    'INSERT INTO documents (case_id, kind, name, uri, mime_type) VALUES (?, ?, ?, ?, ?)',
    caseId,
    d.kind,
    d.name,
    d.uri,
    d.mimeType,
  );
}

export async function deleteDocument(db: SQLiteDatabase, caseId: number, docId: number) {
  await db.runAsync('DELETE FROM documents WHERE id = ? AND case_id = ?', docId, caseId);
}

// ---------- checklists (call-guide ticks, next-action lists) ----------

export async function getChecklist(db: SQLiteDatabase, caseId: number, listKey: string): Promise<Record<string, boolean>> {
  const rows = await db.getAllAsync<{ item_key: string; checked: number }>(
    'SELECT item_key, checked FROM checklist_items WHERE case_id = ? AND list_key = ?',
    caseId,
    listKey,
  );
  return Object.fromEntries(rows.map((r) => [r.item_key, !!r.checked]));
}

export async function setChecklistItem(db: SQLiteDatabase, caseId: number, listKey: string, itemKey: string, checked: boolean) {
  await db.runAsync(
    `INSERT INTO checklist_items (case_id, list_key, item_key, checked) VALUES (?, ?, ?, ?)
     ON CONFLICT (case_id, list_key, item_key) DO UPDATE SET checked = excluded.checked`,
    caseId,
    listKey,
    itemKey,
    checked ? 1 : 0,
  );
}

// ---------- financial-assistance resources saved to the plan ----------

export async function listCaseResources(db: SQLiteDatabase, caseId: number): Promise<CaseResource[]> {
  const rows = await db.getAllAsync<{ case_id: number; resource_id: string; in_plan: number; contacted_at: string | null }>(
    'SELECT * FROM case_resources WHERE case_id = ?',
    caseId,
  );
  return rows.map((r) => ({ caseId: r.case_id, resourceId: r.resource_id, inPlan: !!r.in_plan, contactedAt: r.contacted_at }));
}

export async function setResourceInPlan(db: SQLiteDatabase, caseId: number, resourceId: string, inPlan: boolean) {
  await db.runAsync(
    `INSERT INTO case_resources (case_id, resource_id, in_plan) VALUES (?, ?, ?)
     ON CONFLICT (case_id, resource_id) DO UPDATE SET in_plan = excluded.in_plan`,
    caseId,
    resourceId,
    inPlan ? 1 : 0,
  );
}

export async function setResourceContacted(db: SQLiteDatabase, caseId: number, resourceId: string, contacted: boolean) {
  await db.runAsync(
    `INSERT INTO case_resources (case_id, resource_id, contacted_at) VALUES (?, ?, CASE WHEN ? THEN datetime('now') END)
     ON CONFLICT (case_id, resource_id) DO UPDATE SET contacted_at = excluded.contacted_at`,
    caseId,
    resourceId,
    contacted ? 1 : 0,
  );
}

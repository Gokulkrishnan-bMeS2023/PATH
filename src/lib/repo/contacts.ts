import { type SQLiteDatabase } from 'expo-sqlite';
import type { Contact, ContactKind, RefKind, RefNumber } from '@/types/case';

type ContactRow = {
  id: number;
  case_id: number;
  kind: ContactKind;
  name: string;
  contact_person: string;
  phone: string;
  extension: string;
  website: string;
  address: string;
  notes: string;
  plan: string;
  member_id: string;
  group_number: string;
  pharmacy_benefit_phone: string;
  rx_bin: string;
  rx_pcn: string;
  rx_group: string;
  case_number: string;
};

export type ContactFields = Partial<Omit<Contact, 'id' | 'caseId' | 'kind'>>;

/** Maps camelCase contact fields to their column names (also acts as a whitelist). */
const COLUMN: Record<keyof ContactFields, string> = {
  name: 'name',
  contactPerson: 'contact_person',
  phone: 'phone',
  extension: 'extension',
  website: 'website',
  address: 'address',
  notes: 'notes',
  plan: 'plan',
  memberId: 'member_id',
  groupNumber: 'group_number',
  pharmacyBenefitPhone: 'pharmacy_benefit_phone',
  rxBin: 'rx_bin',
  rxPcn: 'rx_pcn',
  rxGroup: 'rx_group',
  caseNumber: 'case_number',
};

function rowToContact(r: ContactRow): Contact {
  return {
    id: r.id,
    caseId: r.case_id,
    kind: r.kind,
    name: r.name,
    contactPerson: r.contact_person,
    phone: r.phone,
    extension: r.extension,
    website: r.website,
    address: r.address,
    notes: r.notes,
    plan: r.plan,
    memberId: r.member_id,
    groupNumber: r.group_number,
    pharmacyBenefitPhone: r.pharmacy_benefit_phone,
    rxBin: r.rx_bin,
    rxPcn: r.rx_pcn,
    rxGroup: r.rx_group,
    caseNumber: r.case_number,
  };
}

export async function listContacts(db: SQLiteDatabase, caseId: number): Promise<Contact[]> {
  const rows = await db.getAllAsync<ContactRow>('SELECT * FROM contacts WHERE case_id = ? ORDER BY id', caseId);
  return rows.map(rowToContact);
}

function setClause(fields: ContactFields): { sql: string; values: string[] } {
  const keys = (Object.keys(fields) as (keyof ContactFields)[]).filter((k) => k in COLUMN && fields[k] !== undefined);
  return {
    sql: keys.map((k) => `${COLUMN[k]} = ?`).join(', '),
    values: keys.map((k) => String(fields[k] ?? '')),
  };
}

export async function addContact(db: SQLiteDatabase, caseId: number, kind: ContactKind, fields: ContactFields) {
  const res = await db.runAsync('INSERT INTO contacts (case_id, kind) VALUES (?, ?)', caseId, kind);
  await updateContact(db, caseId, res.lastInsertRowId, fields);
  return res.lastInsertRowId;
}

export async function updateContact(db: SQLiteDatabase, caseId: number, contactId: number, fields: ContactFields) {
  const { sql, values } = setClause(fields);
  if (!sql) return;
  await db.runAsync(`UPDATE contacts SET ${sql} WHERE id = ? AND case_id = ?`, ...values, contactId, caseId);
}

/** Updates the first contact of a kind (doctor, pharmacy…) or creates it. */
export async function upsertContactOfKind(db: SQLiteDatabase, caseId: number, kind: ContactKind, fields: ContactFields) {
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM contacts WHERE case_id = ? AND kind = ? ORDER BY id LIMIT 1',
    caseId,
    kind,
  );
  if (existing) {
    await updateContact(db, caseId, existing.id, fields);
    return existing.id;
  }
  return addContact(db, caseId, kind, fields);
}

export async function deleteContact(db: SQLiteDatabase, caseId: number, contactId: number) {
  await db.runAsync('DELETE FROM contacts WHERE id = ? AND case_id = ?', contactId, caseId);
}

// ---------- important reference numbers ----------

export async function listRefNumbers(db: SQLiteDatabase, caseId: number): Promise<RefNumber[]> {
  const rows = await db.getAllAsync<{ id: number; case_id: number; kind: RefKind; value: string }>(
    'SELECT * FROM reference_numbers WHERE case_id = ?',
    caseId,
  );
  return rows.map((r) => ({ id: r.id, caseId: r.case_id, kind: r.kind, value: r.value }));
}

export async function setRefNumber(db: SQLiteDatabase, caseId: number, kind: RefKind, value: string) {
  const v = value.trim();
  if (!v) {
    await db.runAsync('DELETE FROM reference_numbers WHERE case_id = ? AND kind = ?', caseId, kind);
    return;
  }
  await db.runAsync(
    `INSERT INTO reference_numbers (case_id, kind, value) VALUES (?, ?, ?)
     ON CONFLICT (case_id, kind) DO UPDATE SET value = excluded.value`,
    caseId,
    kind,
    v,
  );
}

import { type SQLiteDatabase } from 'expo-sqlite';
import type { CaseDraft, CaseStatus, MedCase, PathAnswers } from '@/types/case';
import { upsertContactOfKind } from '@/lib/repo/contacts';

type CaseRow = {
  id: number;
  user_id: number;
  status: CaseStatus;
  problem: MedCase['problem'];
  who_for: MedCase['whoFor'];
  patient_name: string;
  relationship: string | null;
  age_group: string | null;
  insurance_type: string | null;
  insurance_company: string;
  medication_name: string;
  medication_unknown: number;
  supply_left: string | null;
  answers: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

function parseAnswers(raw: string): PathAnswers {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as PathAnswers) : {};
  } catch {
    return {};
  }
}

function rowToCase(r: CaseRow): MedCase {
  return {
    id: r.id,
    userId: r.user_id,
    status: r.status,
    problem: r.problem,
    whoFor: r.who_for,
    patientName: r.patient_name,
    relationship: r.relationship,
    ageGroup: r.age_group,
    insuranceType: r.insurance_type,
    insuranceCompany: r.insurance_company,
    medicationName: r.medication_name,
    medicationUnknown: !!r.medication_unknown,
    supplyLeft: r.supply_left,
    answers: parseAnswers(r.answers),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    closedAt: r.closed_at,
  };
}

/** The user's most recent open case, if any. */
export async function getActiveCase(db: SQLiteDatabase, userId: number): Promise<MedCase | null> {
  const row = await db.getFirstAsync<CaseRow>(
    `SELECT * FROM cases WHERE user_id = ? AND status = 'open' ORDER BY updated_at DESC, id DESC LIMIT 1`,
    userId,
  );
  return row ? rowToCase(row) : null;
}

export async function getCase(db: SQLiteDatabase, userId: number, caseId: number): Promise<MedCase | null> {
  const row = await db.getFirstAsync<CaseRow>('SELECT * FROM cases WHERE id = ? AND user_id = ?', caseId, userId);
  return row ? rowToCase(row) : null;
}

/** Saves a finished interview as a new case, plus the contacts it mentions. */
export async function createCaseFromDraft(db: SQLiteDatabase, userId: number, d: CaseDraft): Promise<number> {
  if (!d.problem) throw new Error('PROBLEM_REQUIRED');
  let caseId = 0;
  await db.withTransactionAsync(async () => {
    const res = await db.runAsync(
      `INSERT INTO cases (user_id, problem, who_for, patient_name, relationship, age_group, insurance_type,
         insurance_company, medication_name, medication_unknown, supply_left, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      userId,
      d.problem,
      d.whoFor,
      d.patientName.trim(),
      d.whoFor === 'other' ? d.relationship : null,
      d.ageGroup,
      d.insuranceType,
      d.insuranceCompany.trim(),
      d.medicationUnknown ? '' : d.medicationName.trim(),
      d.medicationUnknown ? 1 : 0,
      d.supplyLeft,
      JSON.stringify(d.answers),
    );
    caseId = res.lastInsertRowId;

    if (d.doctorName.trim()) {
      await upsertContactOfKind(db, caseId, 'doctor', { name: d.doctorName.trim() });
    }
    if (d.pharmacyName.trim()) {
      await upsertContactOfKind(db, caseId, 'pharmacy', { name: d.pharmacyName.trim() });
    }
    const c = d.card;
    const hasCard = Object.values(c).some((v) => v.trim());
    if (hasCard || d.insuranceCompany.trim()) {
      await upsertContactOfKind(db, caseId, 'insurance', {
        name: d.insuranceCompany.trim(),
        memberId: c.memberId.trim(),
        groupNumber: c.groupNumber.trim(),
        phone: c.memberPhone.trim(),
        rxBin: c.rxBin.trim(),
        rxPcn: c.rxPcn.trim(),
        rxGroup: c.rxGroup.trim(),
      });
    }
  });
  return caseId;
}

export async function setCaseStatus(db: SQLiteDatabase, userId: number, caseId: number, status: CaseStatus) {
  await db.runAsync(
    `UPDATE cases SET status = ?, updated_at = datetime('now'),
       closed_at = CASE WHEN ? = 'open' THEN NULL ELSE datetime('now') END
     WHERE id = ? AND user_id = ?`,
    status,
    status,
    caseId,
    userId,
  );
}

export async function touchCase(db: SQLiteDatabase, caseId: number) {
  await db.runAsync(`UPDATE cases SET updated_at = datetime('now') WHERE id = ?`, caseId);
}

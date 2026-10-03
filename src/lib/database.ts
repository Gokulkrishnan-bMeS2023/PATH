import { Platform } from 'react-native';
import { type SQLiteDatabase } from 'expo-sqlite';

/**
 * Schema migrations, applied in order. `PRAGMA user_version` records how many
 * have run, so each migration executes exactly once per device.
 * Never edit a shipped migration — append a new one instead.
 */
const MIGRATIONS: string[] = [
  // 1 — accounts
  `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT    NOT NULL,
    last_name     TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    salt          TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'patient',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  `,
  // 2 — medication-access cases and everything tracked inside one
  `
  CREATE TABLE IF NOT EXISTS cases (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status             TEXT    NOT NULL DEFAULT 'open',
    problem            TEXT    NOT NULL,
    who_for            TEXT    NOT NULL DEFAULT 'self',
    patient_name       TEXT    NOT NULL DEFAULT '',
    relationship       TEXT,
    age_group          TEXT,
    insurance_type     TEXT,
    insurance_company  TEXT    NOT NULL DEFAULT '',
    medication_name    TEXT    NOT NULL DEFAULT '',
    medication_unknown INTEGER NOT NULL DEFAULT 0,
    supply_left        TEXT,
    answers            TEXT    NOT NULL DEFAULT '{}',
    created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    closed_at          TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id, status);

  CREATE TABLE IF NOT EXISTS contacts (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id                INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    kind                   TEXT    NOT NULL,
    name                   TEXT    NOT NULL DEFAULT '',
    contact_person         TEXT    NOT NULL DEFAULT '',
    phone                  TEXT    NOT NULL DEFAULT '',
    extension              TEXT    NOT NULL DEFAULT '',
    website                TEXT    NOT NULL DEFAULT '',
    address                TEXT    NOT NULL DEFAULT '',
    notes                  TEXT    NOT NULL DEFAULT '',
    plan                   TEXT    NOT NULL DEFAULT '',
    member_id              TEXT    NOT NULL DEFAULT '',
    group_number           TEXT    NOT NULL DEFAULT '',
    pharmacy_benefit_phone TEXT    NOT NULL DEFAULT '',
    rx_bin                 TEXT    NOT NULL DEFAULT '',
    rx_pcn                 TEXT    NOT NULL DEFAULT '',
    rx_group               TEXT    NOT NULL DEFAULT '',
    case_number            TEXT    NOT NULL DEFAULT ''
  );
  CREATE INDEX IF NOT EXISTS idx_contacts_case ON contacts(case_id);

  CREATE TABLE IF NOT EXISTS calls (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id           INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    contact_kind      TEXT    NOT NULL,
    organization      TEXT    NOT NULL DEFAULT '',
    person            TEXT    NOT NULL DEFAULT '',
    phone             TEXT    NOT NULL DEFAULT '',
    call_date         TEXT,
    call_time         TEXT    NOT NULL DEFAULT '',
    reference         TEXT    NOT NULL DEFAULT '',
    summary           TEXT    NOT NULL DEFAULT '',
    next_step         TEXT    NOT NULL DEFAULT '',
    responsible       TEXT,
    missing_info      TEXT    NOT NULL DEFAULT '',
    follow_up_date    TEXT,
    follow_up_unknown INTEGER NOT NULL DEFAULT 0,
    status            TEXT    NOT NULL,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_calls_case ON calls(case_id, created_at);

  CREATE TABLE IF NOT EXISTS tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id       INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title         TEXT    NOT NULL,
    organization  TEXT    NOT NULL DEFAULT '',
    phone_or_url  TEXT    NOT NULL DEFAULT '',
    reason        TEXT    NOT NULL DEFAULT '',
    due_date      TEXT,
    reminder_date TEXT,
    due_unknown   INTEGER NOT NULL DEFAULT 0,
    remind_option TEXT,
    notify_in_app INTEGER NOT NULL DEFAULT 1,
    notify_email  INTEGER NOT NULL DEFAULT 0,
    notify_device INTEGER NOT NULL DEFAULT 0,
    notes         TEXT    NOT NULL DEFAULT '',
    done          INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_case ON tasks(case_id, done);

  CREATE TABLE IF NOT EXISTS reference_numbers (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    kind    TEXT    NOT NULL,
    value   TEXT    NOT NULL,
    UNIQUE (case_id, kind)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id    INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    kind       TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    uri        TEXT    NOT NULL,
    mime_type  TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS check_ins (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id    INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    received   TEXT    NOT NULL,
    barrier    TEXT,
    changes    TEXT    NOT NULL DEFAULT '[]',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    case_id  INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    list_key TEXT    NOT NULL,
    item_key TEXT    NOT NULL,
    checked  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (case_id, list_key, item_key)
  );

  CREATE TABLE IF NOT EXISTS case_resources (
    case_id      INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    resource_id  TEXT    NOT NULL,
    in_plan      INTEGER NOT NULL DEFAULT 0,
    contacted_at TEXT,
    PRIMARY KEY (case_id, resource_id)
  );
  `,
  // 3 — who a document belongs to, when it's not the case's own patient
  `
  ALTER TABLE documents ADD COLUMN person_name TEXT NOT NULL DEFAULT '';
  `,
];

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // Per-connection settings (not persisted by SQLite).
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let v = current; v < MIGRATIONS.length; v++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[v]);
      await db.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}

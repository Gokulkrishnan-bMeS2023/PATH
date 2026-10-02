import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User, RegisterData, UserRole } from '@/types/auth';

const SESSION_KEY = 'path_session_user_id';

// ---------- password hashing ----------

async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);
}

// ---------- session storage ----------

export async function getStoredUserId(): Promise<number | null> {
  try {
    if (Platform.OS === 'web') {
      const val = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
      return val ? parseInt(val, 10) : null;
    }
    const val = await SecureStore.getItemAsync(SESSION_KEY);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

export async function saveSession(userId: number): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_KEY, String(userId));
    }
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, String(userId));
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

// ---------- DB row type ----------

type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password_hash: string;
  salt: string;
  role: UserRole;
  created_at: string;
};

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    username: row.username,
    role: row.role,
    createdAt: row.created_at,
  };
}

// ---------- errors ----------

/** The email and/or username already belongs to another account. */
export class AccountTakenError extends Error {
  constructor(
    readonly email: boolean,
    readonly username: boolean,
  ) {
    super(email ? 'EMAIL_TAKEN' : 'USERNAME_TAKEN');
  }
}

/**
 * Like `db.runAsync`, but keeps SQLite's own error. On web, `runAsync` finalizes the
 * failed statement in a `finally`, and that cleanup throws "Error finalizing statement",
 * which replaces the real error (e.g. "UNIQUE constraint failed: users.email").
 */
async function run(db: SQLiteDatabase, source: string, ...params: (string | number)[]) {
  const statement = await db.prepareAsync(source);
  try {
    return await statement.executeAsync(...params);
  } finally {
    await statement.finalizeAsync().catch(() => {});
  }
}

/** Throws AccountTakenError if another account (other than `exceptId`) uses this email or username. */
async function assertAvailable(db: SQLiteDatabase, email: string, username: string, exceptId = -1) {
  // Both columns are COLLATE NOCASE, so these comparisons ignore case.
  const rows = await db.getAllAsync<{ email: string; username: string }>(
    'SELECT email, username FROM users WHERE (email = ? OR username = ?) AND id != ?',
    email,
    username,
    exceptId,
  );
  const emailTaken = rows.some((r) => r.email.toLowerCase() === email);
  const usernameTaken = rows.some((r) => r.username.toLowerCase() === username);
  if (emailTaken || usernameTaken) throw new AccountTakenError(emailTaken, usernameTaken);
}

/** Maps a UNIQUE violation (e.g. two sign-ups racing) to AccountTakenError. */
function asTakenError(err: unknown): unknown {
  const msg = err instanceof Error ? err.message : '';
  const email = msg.includes('UNIQUE constraint failed: users.email');
  const username = msg.includes('UNIQUE constraint failed: users.username');
  return email || username ? new AccountTakenError(email, username) : err;
}

/** A plain-language reason for an unexpected error while saving account details. */
export function describeAccountError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/disk is full|QuotaExceeded|Error code 13\b/i.test(msg)) {
    return 'This device is out of storage space, so your details couldn’t be saved. Free up some space and try again.';
  }
  if (/database is locked|Error code 5\b|Access Handle|NoModificationAllowed/i.test(msg)) {
    return 'PATH is open in another tab or window, so your details couldn’t be saved. Close the other one and try again.';
  }
  if (/Database not found|Failed to initialize|SharedArrayBuffer|navigator\.storage/i.test(msg)) {
    return 'The app’s storage isn’t available right now. Reload the page or restart the app, then try again.';
  }
  return `Your details couldn’t be saved because of an unexpected error. Please try again. (Details: ${msg || 'unknown error'})`;
}

// ---------- auth operations ----------

export async function registerUser(db: SQLiteDatabase, data: RegisterData): Promise<User> {
  const email = data.email.toLowerCase().trim();
  const username = data.username.toLowerCase().trim();
  await assertAvailable(db, email, username);

  const salt = await generateSalt();
  const passwordHash = await hashPassword(data.password, salt);

  let result;
  try {
    result = await run(
      db,
      `INSERT INTO users (first_name, last_name, email, username, password_hash, salt, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.firstName.trim(),
      data.lastName.trim(),
      email,
      username,
      passwordHash,
      salt,
      data.role,
    );
  } catch (err: unknown) {
    throw asTakenError(err);
  }

  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', result.lastInsertRowId);
  if (!row) throw new Error('The new account could not be read back from storage.');
  return rowToUser(row);
}

export async function loginUser(
  db: SQLiteDatabase,
  usernameOrEmail: string,
  password: string,
): Promise<User> {
  const trimmed = usernameOrEmail.trim().toLowerCase();
  const isEmail = trimmed.includes('@');

  const row = await db.getFirstAsync<UserRow>(
    isEmail ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?',
    trimmed,
  );

  if (!row) throw new Error('INVALID_CREDENTIALS');

  const hash = await hashPassword(password, row.salt);
  if (hash !== row.password_hash) throw new Error('INVALID_CREDENTIALS');

  return rowToUser(row);
}

export async function getUserById(db: SQLiteDatabase, id: number): Promise<User | null> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
  return row ? rowToUser(row) : null;
}

export type ProfileData = Pick<User, 'firstName' | 'lastName' | 'email' | 'username' | 'role'>;

export async function updateUserProfile(db: SQLiteDatabase, id: number, data: ProfileData): Promise<User> {
  const email = data.email.toLowerCase().trim();
  const username = data.username.toLowerCase().trim();
  await assertAvailable(db, email, username, id);
  try {
    await run(
      db,
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, role = ? WHERE id = ?`,
      data.firstName.trim(),
      data.lastName.trim(),
      email,
      username,
      data.role,
      id,
    );
  } catch (err: unknown) {
    throw asTakenError(err);
  }
  const user = await getUserById(db, id);
  if (!user) throw new Error('DB_ERROR');
  return user;
}

/** Verifies the current password, then stores a new salted hash. */
export async function changeUserPassword(db: SQLiteDatabase, id: number, current: string, next: string): Promise<void> {
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
  if (!row) throw new Error('DB_ERROR');
  if ((await hashPassword(current, row.salt)) !== row.password_hash) throw new Error('INVALID_CREDENTIALS');
  const salt = await generateSalt();
  await db.runAsync('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?', await hashPassword(next, salt), salt, id);
}

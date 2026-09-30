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

// ---------- auth operations ----------

export async function registerUser(db: SQLiteDatabase, data: RegisterData): Promise<User> {
  const salt = await generateSalt();
  const passwordHash = await hashPassword(data.password, salt);

  try {
    const result = await db.runAsync(
      `INSERT INTO users (first_name, last_name, email, username, password_hash, salt, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.firstName.trim(),
      data.lastName.trim(),
      data.email.toLowerCase().trim(),
      data.username.toLowerCase().trim(),
      passwordHash,
      salt,
      data.role,
    );

    const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', result.lastInsertRowId);
    if (!row) throw new Error('DB_ERROR');
    return rowToUser(row);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      if (err.message.includes('users.email')) throw new Error('EMAIL_TAKEN');
      if (err.message.includes('users.username')) throw new Error('USERNAME_TAKEN');
    }
    throw err;
  }
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
  try {
    await db.runAsync(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, role = ? WHERE id = ?`,
      data.firstName.trim(),
      data.lastName.trim(),
      data.email.toLowerCase().trim(),
      data.username.toLowerCase().trim(),
      data.role,
      id,
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      if (err.message.includes('users.email')) throw new Error('EMAIL_TAKEN');
      if (err.message.includes('users.username')) throw new Error('USERNAME_TAKEN');
    }
    throw err;
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

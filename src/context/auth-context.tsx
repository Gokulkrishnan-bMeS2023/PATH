import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { User, RegisterData } from '@/types/auth';
import {
  changeUserPassword,
  clearSession,
  getStoredUserId,
  getUserById,
  loginUser,
  registerUser,
  saveSession,
  updateUserProfile,
  type ProfileData,
} from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (usernameOrEmail: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getStoredUserId();
        if (userId !== null) {
          const stored = await getUserById(db, userId);
          // A session for an account that no longer exists (e.g. cleared browser storage) is dropped.
          if (!stored) await clearSession();
          setUser(stored);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [db]);

  const register = useCallback(
    async (data: RegisterData) => {
      const newUser = await registerUser(db, data);
      await saveSession(newUser.id);
      setUser(newUser);
    },
    [db],
  );

  const login = useCallback(
    async (usernameOrEmail: string, password: string, remember = true) => {
      const loggedIn = await loginUser(db, usernameOrEmail, password);
      if (remember) await saveSession(loggedIn.id);
      setUser(loggedIn);
    },
    [db],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: ProfileData) => {
      if (!user) throw new Error('NOT_SIGNED_IN');
      setUser(await updateUserProfile(db, user.id, data));
    },
    [db, user],
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) throw new Error('NOT_SIGNED_IN');
      await changeUserPassword(db, user.id, current, next);
    },
    [db, user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

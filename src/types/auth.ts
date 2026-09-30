export type UserRole = 'patient' | 'caregiver' | 'both';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

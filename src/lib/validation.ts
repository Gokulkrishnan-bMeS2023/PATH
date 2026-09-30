/** Account-field rules shared by Register, Profile and password screens. */

export const LIMITS = { name: 50, email: 254, username: 20, password: 64 } as const;

export const validators = {
  firstName: (v: string) => (!v.trim() ? 'First name is required.' : undefined),
  lastName: (v: string) => (!v.trim() ? 'Last name is required.' : undefined),
  email: (v: string) => {
    if (!v.trim()) return 'Email address is required.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : 'Please enter a valid email address.';
  },
  username: (v: string) => {
    if (!v.trim()) return 'Username is required.';
    if (v.trim().length < 3) return 'Username must be at least 3 characters.';
    return /^[a-zA-Z0-9_]{3,20}$/.test(v.trim()) ? undefined : 'Only letters, numbers, and underscores are allowed.';
  },
  password: (v: string) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-zA-Z]/.test(v) || !/[0-9]/.test(v)) return 'Must contain at least one letter and one number.';
    return undefined;
  },
};

/** Input filters applied while typing. */
export const sanitize = {
  name: (v: string) => v.replace(/[^\p{L} '-]/gu, ''),
  email: (v: string) => v.replace(/\s/g, ''),
  username: (v: string) => v.replace(/[^a-zA-Z0-9_]/g, ''),
};

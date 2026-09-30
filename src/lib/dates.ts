const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses "MM/DD/YYYY" into an ISO date "YYYY-MM-DD"; returns null if invalid. */
export function parseUSDate(input: string): string | null {
  const m = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [mm, dd, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

/** "2026-10-02" → "10/02/2026" (for editing). */
export function toUSDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${m}/${d}/${y}`;
}

/** "2026-10-02" → "Oct 2". Accepts SQLite "YYYY-MM-DD HH:MM:SS" too. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** Auto-inserts slashes while the user types a date. */
export function maskDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Validates an optional date field; returns an error message or undefined. */
export function dateError(text: string): string | undefined {
  if (!text.trim()) return undefined;
  return parseUSDate(text) ? undefined : 'Use MM/DD/YYYY.';
}

export function maskMiddle(value: string): string {
  const v = value.trim();
  if (v.length <= 4) return v;
  return `${'•'.repeat(Math.min(6, v.length - 4))}${v.slice(-4)}`;
}

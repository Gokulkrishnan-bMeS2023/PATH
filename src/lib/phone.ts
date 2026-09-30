import { Linking } from 'react-native';

/** Opens the dialer for a phone number; returns false if it couldn't. */
export async function callNumber(phone: string): Promise<boolean> {
  const digits = phone.replace(/[^0-9+]/g, '');
  if (!digits) return false;
  try {
    await Linking.openURL(`tel:${digits}`);
    return true;
  } catch {
    return false;
  }
}

/** Opens an http(s) URL; bare domains get https:// prepended. */
export async function openWebsite(url: string): Promise<boolean> {
  const u = url.trim();
  if (!u) return false;
  const full = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  try {
    await Linking.openURL(full);
    return true;
  } catch {
    return false;
  }
}

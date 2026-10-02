import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Field, PasswordField, RadioList } from '@/components/ui/form';
import { Bubble, Card, Note, Reveal, Row, Section, Warn } from '@/components/ui/blocks';
import { useAuth } from '@/context/auth-context';
import { AccountTakenError, describeAccountError } from '@/lib/auth';
import { ROLE_OPTIONS } from '@/lib/content';
import { LIMITS, sanitize, validators } from '@/lib/validation';
import type { UserRole } from '@/types/auth';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-30 10:12:00" → "Sep 30, 2026" */
function memberSince(createdAt: string) {
  const [y, m, d] = createdAt.slice(0, 10).split('-').map(Number);
  return y && m && d ? `${MONTHS[m - 1]} ${d}, ${y}` : '';
}

type ProfileErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'username', string>>;

/** 15 · My profile */
export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
  }));
  const [role, setRole] = useState<UserRole>(user?.role ?? 'patient');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  if (!user) return null;

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: validators[key](value) }));
    setStatus('idle');
  };

  const save = async () => {
    const next: ProfileErrors = {
      firstName: validators.firstName(form.firstName),
      lastName: validators.lastName(form.lastName),
      email: validators.email(form.email),
      username: validators.username(form.username),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setStatus('saving');
    try {
      await updateProfile({ ...form, role });
      setStatus('saved');
    } catch (err) {
      if (err instanceof AccountTakenError) {
        setErrors((e) => ({
          ...e,
          email: err.email ? 'An account with this email already exists.' : e.email,
          username: err.username ? 'This username is already taken.' : e.username,
        }));
        setStatus('idle');
      } else {
        console.error('Save profile failed:', err);
        setSaveError(describeAccountError(err));
        setStatus('error');
      }
    }
  };

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">My profile</AppText>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Bubble icon="user" tone="solid" size={40} />
          <View style={{ flex: 1 }}>
            <AppText variant="h2">
              {user.firstName} {user.lastName}
            </AppText>
            <AppText variant="small">Member since {memberSince(user.createdAt)}</AppText>
          </View>
        </View>
      </Card>

      <Row>
        <Field
          label="First name"
          placeholder="First name"
          maxLength={LIMITS.name}
          autoComplete="given-name"
          value={form.firstName}
          onChangeText={(v) => set('firstName', sanitize.name(v))}
          error={errors.firstName}
        />
        <Field
          label="Last name"
          placeholder="Last name"
          maxLength={LIMITS.name}
          autoComplete="family-name"
          value={form.lastName}
          onChangeText={(v) => set('lastName', sanitize.name(v))}
          error={errors.lastName}
        />
      </Row>
      <Field
        label="Email address"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={LIMITS.email}
        value={form.email}
        onChangeText={(v) => set('email', sanitize.email(v))}
        error={errors.email}
      />
      <Field
        label="Username"
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={LIMITS.username}
        value={form.username}
        onChangeText={(v) => set('username', sanitize.username(v))}
        error={errors.username}
      />

      <AppText variant="label">I am using this app as a…</AppText>
      <RadioList
        icons
        options={ROLE_OPTIONS.filter((r) => r.value !== 'both')}
        value={role}
        onChange={(v) => {
          setRole(v);
          setStatus('idle');
        }}
      />
      <AppText variant="small">
        Wording adapts: “Contact your doctor’s office” vs “Contact the patient’s doctor’s office.”
      </AppText>

      <Section title="Change password" icon="key" tone="sun">
        <ChangePassword />
      </Section>

      {status === 'saved' ? (
        <Reveal>
          <Note icon="check-circle">Your profile has been saved.</Note>
        </Reveal>
      ) : null}
      {status === 'error' ? <Warn>{saveError}</Warn> : null}

      <Button variant="primary" icon="save" label="Save Changes" loading={status === 'saving'} onPress={save} />
      <Button variant="danger-outline" icon="log-out" label="Log Out" onPress={() => router.push('/logout')} />
    </Screen>
  );
}

function ChangePassword() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const submit = async () => {
    const e = {
      current: current ? undefined : 'Enter your current password.',
      next: validators.password(next) ?? (next === current ? 'Choose a password you haven’t used here.' : undefined),
      confirm: confirm === next ? undefined : 'Passwords do not match.',
    };
    setErrors(e);
    if (e.current || e.next || e.confirm) return;
    setStatus('saving');
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setStatus('saved');
    } catch (err) {
      setErrors({
        current:
          err instanceof Error && err.message === 'INVALID_CREDENTIALS'
            ? 'That isn’t your current password.'
            : 'Something went wrong. Please try again.',
      });
      setStatus('idle');
    }
  };

  const edit = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setStatus('idle');
  };

  return (
    <>
      <PasswordField label="Current password" autoComplete="current-password" maxLength={LIMITS.password} value={current} onChangeText={edit(setCurrent)} error={errors.current} />
      <PasswordField label="New password" autoComplete="new-password" maxLength={LIMITS.password} value={next} onChangeText={edit(setNext)} error={errors.next} />
      <AppText variant="small">At least 8 characters · one letter and one number</AppText>
      <PasswordField label="Confirm new password" autoComplete="new-password" maxLength={LIMITS.password} value={confirm} onChangeText={edit(setConfirm)} error={errors.confirm} />
      {status === 'saved' ? (
        <Reveal>
          <Note icon="check-circle">Your password has been changed.</Note>
        </Reveal>
      ) : null}
      <Button size="sm" icon="lock" label="Update Password" loading={status === 'saving'} onPress={submit} />
    </>
  );
}

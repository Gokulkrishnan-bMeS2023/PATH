import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Field, PasswordField, RadioList, Segmented } from '@/components/ui/form';
import { Row, Warn } from '@/components/ui/blocks';
import { useAuth } from '@/context/auth-context';
import { ROLE_OPTIONS } from '@/lib/content';
import { LIMITS, sanitize, validators } from '@/lib/validation';
import type { UserRole } from '@/types/auth';

/** Sign-up offers Patient or Caregiver; "Both" can still be chosen later in My Profile. */
const ROLES = ROLE_OPTIONS.filter((r) => r.value !== 'both');

type Errors = Partial<Record<'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'confirm', string>>;

/** 02 · Register */
export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', confirm: '' });
  const [role, setRole] = useState<UserRole>('patient');
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mismatch = form.confirm.length > 0 && form.password !== form.confirm;

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in validators) {
      setErrors((e) => ({ ...e, [key]: validators[key as keyof typeof validators](value) }));
    }
    if (summary) setSummary('');
  };

  const submit = async () => {
    const next: Errors = {
      firstName: validators.firstName(form.firstName),
      lastName: validators.lastName(form.lastName),
      email: validators.email(form.email),
      username: validators.username(form.username),
      password: validators.password(form.password),
      confirm: !form.confirm ? 'Please re-enter your password.' : form.confirm !== form.password ? 'Passwords do not match.' : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setSummary('Please correct the highlighted fields.');
      return;
    }
    setSubmitting(true);
    try {
      // The root layout routes signed-in users onward (to /problem-selection).
      await register({ ...form, role });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'EMAIL_TAKEN') setErrors((e) => ({ ...e, email: 'An account with this email already exists.' }));
      else if (msg === 'USERNAME_TAKEN') setErrors((e) => ({ ...e, username: 'This username is already taken.' }));
      else setSummary('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen left={{ kind: 'back' }}>
      <Segmented
        options={[
          { value: 'register', label: 'Create account' },
          { value: 'login', label: 'Log in' },
        ]}
        value="register"
        onChange={(v) => v === 'login' && router.replace('/login')}
      />
      <AppText variant="h1">Create your account</AppText>

      {summary ? <Warn>{summary}</Warn> : null}

      <Row>
        <Field
          label="First name"
          placeholder="First name"
          required
          value={form.firstName}
          maxLength={LIMITS.name}
          autoComplete="given-name"
          onChangeText={(v) => set('firstName', sanitize.name(v))}
          error={errors.firstName}
        />
        <Field
          label="Last name"
          placeholder="Last name"
          required
          value={form.lastName}
          maxLength={LIMITS.name}
          autoComplete="family-name"
          onChangeText={(v) => set('lastName', sanitize.name(v))}
          error={errors.lastName}
        />
      </Row>
      <Field
        label="Email address"
        placeholder="you@example.com"
        required
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
        placeholder="Choose a username"
        required
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={LIMITS.username}
        value={form.username}
        onChangeText={(v) => set('username', sanitize.username(v))}
        error={errors.username}
      />
      <PasswordField
        label="Password"
        placeholder="Password"
        required
        maxLength={LIMITS.password}
        autoComplete="new-password"
        value={form.password}
        onChangeText={(v) => set('password', v)}
        error={errors.password}
      />
      <AppText variant="small">At least 8 characters · one letter and one number</AppText>
      <PasswordField
        label="Confirm password"
        placeholder="Re-enter password"
        required
        maxLength={LIMITS.password}
        value={form.confirm}
        onChangeText={(v) => set('confirm', v)}
        error={mismatch ? undefined : errors.confirm}
      />
      {mismatch ? <Warn>Passwords do not match.</Warn> : null}

      <AppText variant="label">I am using this app as a…</AppText>
      <RadioList icons options={ROLES} value={role} onChange={setRole} />
      <AppText variant="small">
        {role === 'patient'
          ? 'We’ll say things like “Contact your doctor’s office.”'
          : 'We’ll say things like “Contact the patient’s doctor’s office.”'}
      </AppText>

      <Button variant="primary" icon="check" label="Create Account" onPress={submit} loading={submitting} />
      <AppText variant="small" align="center">
        You’ll be logged in automatically.
      </AppText>
    </Screen>
  );
}

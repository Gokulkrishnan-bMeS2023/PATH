import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, PasswordField, Segmented } from '@/components/ui/form';
import { Warn } from '@/components/ui/blocks';
import { useAuth } from '@/context/auth-context';
import { Fonts } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

const MAX_ID = 254;
const MAX_PASSWORD = 64;

/** 02 · Log in */
export default function LoginScreen() {
  const { login } = useAuth();
  const { p, fs } = useTokens();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ id?: string; password?: string }>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next = {
      id: !id.trim() ? 'Username or email is required.' : undefined,
      password: !password ? 'Password is required.' : undefined,
    };
    setErrors(next);
    if (next.id || next.password) return;
    setSubmitting(true);
    setMessage('');
    try {
      // On success the root layout opens the current plan (or problem selection).
      await login(id, password, remember);
    } catch (err) {
      setMessage(
        err instanceof Error && err.message === 'INVALID_CREDENTIALS'
          ? 'Incorrect username/email or password.'
          : 'Something went wrong. Please try again.',
      );
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
        value="login"
        onChange={(v) => v === 'register' && router.replace('/register')}
      />
      <AppText variant="h1">Welcome back</AppText>

      {message ? <Warn>{message}</Warn> : null}

      <Field
        label="Username or email"
        placeholder="Username or email"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        maxLength={MAX_ID}
        value={id}
        onChangeText={(v) => {
          setId(v.replace(/\s/g, ''));
          setMessage('');
        }}
        error={errors.id}
      />
      <PasswordField
        label="Password"
        placeholder="Password"
        maxLength={MAX_PASSWORD}
        autoComplete="current-password"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setMessage('');
        }}
        onSubmitEditing={submit}
        error={errors.password}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Checkbox label="Remember me" checked={remember} onChange={setRemember} />
        <Pressable accessibilityRole="link" accessibilityLabel="Forgot password?" onPress={() => router.push('/forgot-password')} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ fontFamily: Fonts.sansSemiBold, fontSize: fs(14), color: p.primary, textDecorationLine: 'underline' }}>
            Forgot password?
          </AppText>
        </Pressable>
      </View>
      <Button variant="primary" icon="log-in" label="Log In" onPress={submit} loading={submitting} />
      <AppText variant="small" align="center">
        If you have an open medication case, we’ll take you straight to your current plan.
      </AppText>
    </Screen>
  );
}

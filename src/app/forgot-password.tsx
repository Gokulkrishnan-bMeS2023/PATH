import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/form';
import { Card, CardTitle, Note, Warn } from '@/components/ui/blocks';
import { passwordResetAvailable, requestPasswordReset, resetLinkExpiry } from '@/lib/password-reset';

type Status = 'idle' | 'sending' | 'sent' | 'unavailable' | 'error';

/** 02c · Forgot password */
export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [status, setStatus] = useState<Status>('idle');

  const send = async () => {
    if (!identifier.trim()) {
      setFieldError('Enter your email address or username.');
      return;
    }
    setFieldError(undefined);
    if (!passwordResetAvailable) {
      setStatus('unavailable');
      return;
    }
    setStatus('sending');
    try {
      await requestPasswordReset(identifier);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Forgot your password?</AppText>
      <AppText>Enter the email address or username for your account. We’ll send a link to reset your password.</AppText>

      <Field
        label="Email address or username"
        placeholder="you@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        maxLength={254}
        value={identifier}
        onChangeText={(v) => {
          setIdentifier(v.replace(/\s/g, ''));
          if (status !== 'sending') setStatus('idle');
        }}
        onSubmitEditing={send}
        error={fieldError}
      />
      <Button variant="primary" icon="send" label="Send Reset Link" loading={status === 'sending'} onPress={send} />

      {status === 'sent' ? (
        <Card>
          <CardTitle icon="mail" tone="green" tag="After sending" />
          <AppText variant="h2">Check your email</AppText>
          <AppText>
            If an account matches, a reset link is sent to its email address.{' '}
            {resetLinkExpiry ? `The link expires after ${resetLinkExpiry}.` : 'The link expires after a limited time.'}
          </AppText>
          <Button size="sm" icon="refresh-cw" label="Resend Link" onPress={send} />
        </Card>
      ) : null}

      {status === 'unavailable' ? (
        <Warn>
          Password reset by email isn’t available yet. Your PATH account is stored only on this device — if you can’t
          remember your password, you can create a new account.
        </Warn>
      ) : null}

      {status === 'error' ? <Warn>We couldn’t send the link right now. Check your connection and try again.</Warn> : null}

      <Note icon="lock">We never ask for your Social Security number, full Medicare number, or health records.</Note>

      <Button icon="log-in" label="Back to Log In" onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
    </Screen>
  );
}

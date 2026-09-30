import React from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/blocks';
import { CALL_GUIDES, TERMS } from '@/lib/content';

/** 05a · Understand insurance & pharmacy terms */
export default function TermsScreen() {
  const readText = TERMS.map((t) => `${t.term}. ${t.means} ${t.next}`).join(' ');

  return (
    <Screen left={{ kind: 'back' }} readAloud={readText}>
      <AppText variant="h1">Understand insurance &amp; pharmacy terms</AppText>
      {TERMS.map((t, i) => (
        <Section key={t.id} title={t.term} icon="book-open" tone="teal" defaultOpen={i === 0}>
          <AppText variant="label">What it means</AppText>
          <AppText>{t.means}</AppText>
          <AppText variant="label">What often happens next</AppText>
          <AppText>{t.next}</AppText>
          {t.guide || t.financial ? (
            <>
              <AppText variant="label">{t.guide ? 'Call guide that may help' : 'Resources that may help'}</AppText>
              {t.guide ? (
                <Button
                  size="sm"
                  icon="phone-call"
                  label={`Open ${CALL_GUIDES[t.guide].title}`}
                  onPress={() => router.push({ pathname: '/plan/guide/[kind]', params: { kind: t.guide! } })}
                />
              ) : (
                <Button size="sm" icon="dollar-sign" label="Financial Assistance Resources" onPress={() => router.push('/plan/financial')} />
              )}
            </>
          ) : null}
        </Section>
      ))}
    </Screen>
  );
}

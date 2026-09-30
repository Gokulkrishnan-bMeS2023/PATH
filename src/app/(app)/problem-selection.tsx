import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { InfoLink } from '@/components/ui/form';
import { Card, CardTitle, Note, Reveal } from '@/components/ui/blocks';
import { useAuth } from '@/context/auth-context';
import { useCase } from '@/context/case-context';
import { emptyDraft, useInterview } from '@/context/interview-context';
import { PROBLEMS } from '@/lib/content';
import { useTokens } from '@/theme/use-tokens';
import type { ProblemType } from '@/types/case';

/** 03 · Choose the problem (interview step 0) */
export default function ProblemSelectionScreen() {
  const { user } = useAuth();
  const { data: activeCase } = useCase();
  const { draft, update } = useInterview();
  const { p } = useTokens();
  const [openInfo, setOpenInfo] = useState<ProblemType | null>(null);

  const select = (id: ProblemType) => {
    if (draft.problem === null && draft.whoFor === emptyDraft().whoFor) {
      // First choice of a fresh interview: pre-fill "who" from the account role.
      update({ problem: id, whoFor: user?.role === 'caregiver' ? 'other' : 'self' });
    } else {
      update({ problem: id, answers: id === draft.problem ? draft.answers : {} });
    }
  };

  return (
    <Screen
      left={{ kind: 'brand' }}
      right="Step 0 · Problem"
      bottom={
        <Button
          variant="primary"
          label="Continue"
          trailingIcon="arrow-right"
          disabled={!draft.problem}
          onPress={() => router.push('/interview/who')}
          accessibilityHint={draft.problem ? undefined : 'Select a problem first'}
        />
      }>
      {activeCase ? (
        <Card>
          <CardTitle icon="folder" tone="teal" tag="Returning user · active case" />
          <AppText>You have an open medication case.</AppText>
          <Button icon="map" label="Open My Current Plan" onPress={() => router.replace('/plan')} />
        </Card>
      ) : null}

      <AppText variant="h1">How can we help today?</AppText>
      <AppText>Choose the closest match. You don’t need to know the technical term.</AppText>

      {PROBLEMS.map((prob) => {
        const selected = draft.problem === prob.id;
        const infoOpen = openInfo === prob.id;
        return (
          <Card key={prob.id} style={selected ? { borderColor: p.primary, borderWidth: 2 } : undefined}>
            <CardTitle icon={prob.icon} tone={prob.tone} title={prob.title} />
            <AppText variant="small">{prob.tags}</AppText>
            <InfoLink
              label="What does this mean?"
              expanded={infoOpen}
              onPress={() => setOpenInfo(infoOpen ? null : prob.id)}
            />
            {infoOpen ? (
              <Reveal>
                <Note>
                  <View style={{ gap: 4 }}>
                    {prob.terms.map((t) => (
                      <AppText key={t.term}>
                        <AppText variant="strong">{t.term}</AppText> — {t.def}
                      </AppText>
                    ))}
                  </View>
                </Note>
              </Reveal>
            ) : null}
            <Button
              size="sm"
              variant={selected ? 'primary' : 'secondary'}
              icon={selected ? 'check' : undefined}
              label={selected ? 'Selected' : 'Select This Problem'}
              accessibilityLabel={selected ? `${prob.title}, selected` : `Select: ${prob.title}`}
              onPress={() => select(prob.id)}
            />
          </Card>
        );
      })}

    </Screen>
  );
}

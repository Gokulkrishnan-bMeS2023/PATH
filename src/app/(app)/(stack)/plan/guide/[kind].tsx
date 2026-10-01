import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form';
import { Card, CardTitle, Numbered, Quote, Section } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { CALL_GUIDES } from '@/lib/content';
import { getChecklist, setChecklistItem } from '@/lib/repo/activity';
import { callNumber } from '@/lib/phone';
import type { GuideKind } from '@/types/case';

const ICON = { doctor: 'activity', insurance: 'shield', pharmacy: 'package' } as const;
const TONE = { doctor: 'teal', insurance: 'sky', pharmacy: 'purple' } as const;

/** 05b · Call guide — same template for doctor, insurance and pharmacy. */
export default function CallGuideScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const valid = kind === 'doctor' || kind === 'insurance' || kind === 'pharmacy';
  if (!valid) return <Redirect href="/plan" />;
  return <Guide kind={kind as GuideKind} />;
}

function Guide({ kind }: { kind: GuideKind }) {
  const db = useSQLiteContext();
  const { medCase, guideCtx, contactOf, caregiver } = usePlan();
  const g = CALL_GUIDES[kind];
  const contact = contactOf(kind);
  const listKey = `guide:${kind}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getChecklist(db, medCase.id, listKey).then(setChecked).catch(() => {});
  }, [db, medCase.id, listKey]);

  const toggle = (item: string, value: boolean) => {
    setChecked((c) => ({ ...c, [item]: value }));
    setChecklistItem(db, medCase.id, listKey, item, value).catch(() => {});
  };

  const opening = g.opening(guideCtx);
  const readText = [
    g.title,
    'Before you call, have ready: ' + g.before.join(', '),
    'Suggested opening: ' + opening,
    'Ask these first: ' + g.askFirst.join(' '),
    ...g.ifSections.map((s) => `${s.title}: ${s.body}`),
    'Before you hang up, ask: ' + g.beforeHangUp.join(' '),
  ].join('. ');

  const orgName = contact?.name || `[${kind === 'doctor' ? 'Clinic' : kind === 'insurance' ? 'Plan' : 'Pharmacy'} name]`;

  return (
    <Screen left={{ kind: 'back' }} readAloud={readText}>
      <AppText variant="tag">Call guide</AppText>
      <AppText variant="h1">{g.title}</AppText>

      <Card>
        <CardTitle icon={ICON[kind]} tone={TONE[kind]} tag={g.orgLabel} title={orgName} />
        {contact?.phone ? (
          <Button size="sm" icon="phone" label={`Call ${contact.phone}${contact.extension ? ` ext. ${contact.extension}` : ''}`} onPress={() => callNumber(contact.phone)} />
        ) : (
          <Button
            size="sm"
            icon="plus"
            label="Add Phone Number"
            onPress={() => router.push({ pathname: '/plan/contacts', params: { edit: kind } })}
          />
        )}
      </Card>

      <Section title="Before you call" icon="check-square" tone="teal" defaultOpen>
        {g.before.map((item) => (
          <Checkbox key={item} label={item} checked={!!checked[`before:${item}`]} onChange={(v) => toggle(`before:${item}`, v)} />
        ))}
      </Section>

      <Section title="Suggested opening" icon="message-circle" tone="purple" defaultOpen>
        <Quote>{opening}</Quote>
        <AppText variant="small">
          {caregiver ? 'Worded for a caregiver calling about the patient’s prescription.' : 'Worded for calling about your own prescription.'}
        </AppText>
      </Section>

      <Section title="Ask these first" icon="list" tone="purple" defaultOpen>
        {g.askFirst.map((q, i) => (
          <Numbered key={q} n={i + 1}>
            {q}
          </Numbered>
        ))}
      </Section>

      {g.ifSections.map((s) => (
        <Section key={s.title} title={s.title} icon="git-branch" tone="sky">
          <AppText>{s.body}</AppText>
        </Section>
      ))}

      <Section title="Before you hang up" icon="phone-off" tone="coral" defaultOpen>
        {g.beforeHangUp.map((item) => (
          <Checkbox key={item} label={item} checked={!!checked[`end:${item}`]} onChange={(v) => toggle(`end:${item}`, v)} />
        ))}
      </Section>

      <View style={{ gap: 10 }}>
        <Button
          variant="primary"
          icon="check-circle"
          label="I Called"
          onPress={() => router.push({ pathname: '/plan/record-call', params: { kind } })}
        />
        <Button
          icon="bell"
          label="Remind Me to Call Later"
          onPress={() =>
            router.push({
              pathname: '/plan/reminders',
              params: { title: `Call ${g.orgLabel.toLowerCase()}`, org: contact?.name ?? '', phone: contact?.phone ?? '' },
            })
          }
        />
      </View>
    </Screen>
  );
}

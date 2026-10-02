import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox, RadioList } from '@/components/ui/form';
import { CardTitle, Hero, Reveal, Section } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { STUCK_ACTIONS, STUCK_REASONS } from '@/lib/content';
import { getChecklist, setChecklistItem } from '@/lib/repo/activity';

/** 12 · I still can't get the medication */
export default function StillStuckScreen() {
  const db = useSQLiteContext();
  const { medCase } = usePlan();
  const [reason, setReason] = useState<string>('denied_again');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const listKey = `stuck:${reason}`;
  const plan = STUCK_ACTIONS[reason];

  useEffect(() => {
    getChecklist(db, medCase.id, listKey).then(setChecked).catch(() => setChecked({}));
  }, [db, medCase.id, listKey]);

  const toggle = (item: string, v: boolean) => {
    setChecked((c) => ({ ...c, [item]: v }));
    setChecklistItem(db, medCase.id, listKey, item, v).catch(() => {});
  };

  const openPrimary = () => {
    const pr = plan.primary;
    if (pr.guide) router.push({ pathname: '/plan/guide/[kind]', params: { kind: pr.guide } });
    else if (pr.route === 'financial') router.push('/plan/financial');
    else if (pr.route === 'terms') router.push('/terms');
    else router.push('/plan/contacts');
  };

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">I still can’t get the medication</AppText>
      <AppText variant="h2">What happened?</AppText>
      <RadioList icons options={STUCK_REASONS} value={reason} onChange={setReason} />

      <Hero>
        <CardTitle icon="list" tone="teal" tag="Your next actions" />
        {/* Keyed by reason so a new checklist rises in when the answer changes. */}
        <Reveal key={reason} style={{ gap: 2 }}>
          {plan.actions.map((a) => (
            <Checkbox key={a} label={a} checked={!!checked[a]} onChange={(v) => toggle(a, v)} />
          ))}
        </Reveal>
        <Button variant="primary" icon="arrow-right" label={plan.primary.label} onPress={openPrimary} />
        <Button icon="calendar" label="Record Deadline" onPress={() => router.push({ pathname: '/plan/reminders', params: { title: 'Deadline' } })} />
      </Hero>

      <Section title="Additional Support Resources" icon="life-buoy" tone="sky" onPress={() => router.push('/plan/contacts')} />
      <Section title="Record a Call" icon="phone" tone="green" onPress={() => router.push('/plan/record-call')} />
    </Screen>
  );
}

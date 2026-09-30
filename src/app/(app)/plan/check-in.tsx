import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ChipMulti, RadioList } from '@/components/ui/form';
import { Note, Warn } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { BARRIERS, RECEIVED_OPTIONS, WEEKLY_CHANGES } from '@/lib/content';
import { shortDate } from '@/lib/dates';
import { addCheckIn } from '@/lib/repo/activity';
import type { ReceivedAnswer } from '@/types/case';

/** 11 · Weekly check-in */
export default function CheckInScreen() {
  const { caregiver, medCase, checkIns, mutate } = usePlan();
  const [received, setReceived] = useState<ReceivedAnswer | null>(null);
  const [barrier, setBarrier] = useState<string | null>(null);
  const [changes, setChanges] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const last = checkIns[0];

  const save = async () => {
    if (!received) {
      setError('Choose whether the medication has been received.');
      return;
    }
    setSaving(true);
    try {
      await mutate((db, caseId) => addCheckIn(db, caseId, { received, barrier: received === 'no' ? barrier : null, changes }));
      if (received === 'yes' || received === 'not_needed') router.replace('/plan/success');
      else router.dismissTo('/plan');
    } finally {
      setSaving(false);
    }
  };

  const who = caregiver ? (medCase.patientName ? medCase.patientName : 'the patient') : 'you';

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="tag">Weekly check-in</AppText>
      {last ? <AppText variant="small">Last check-in: {shortDate(last.createdAt)}</AppText> : null}
      <AppText variant="h1">{who === 'you' ? 'Have you received the medication?' : `Has ${who} received the medication?`}</AppText>
      <RadioList
        icons
        options={RECEIVED_OPTIONS}
        value={received}
        onChange={(v) => {
          setReceived(v);
          setError('');
        }}
      />

      {received === 'no' ? (
        <>
          <AppText variant="h2">What is currently preventing access?</AppText>
          <RadioList icons options={BARRIERS} value={barrier} onChange={setBarrier} />
        </>
      ) : null}

      <AppText variant="h2">What changed since last week?</AppText>
      <ChipMulti options={WEEKLY_CHANGES} value={changes} onChange={setChanges} label="What changed since last week" />

      {received === 'no' ? (
        <Note>Your next step will update based on your answers. If you’re stuck, try “I Still Can’t Get the Medication”.</Note>
      ) : null}
      {error ? <Warn>{error}</Warn> : null}

      <Button variant="primary" icon="save" label="Save Check-In" loading={saving} onPress={save} />
    </Screen>
  );
}

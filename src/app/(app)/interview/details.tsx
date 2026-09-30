import React, { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ChipSelect, Field, RadioList } from '@/components/ui/form';
import { Card, CardTitle, Row, StepBar, Warn } from '@/components/ui/blocks';
import { useAuth } from '@/context/auth-context';
import { useCase } from '@/context/case-context';
import { useInterview } from '@/context/interview-context';
import { createCaseFromDraft } from '@/lib/repo/cases';
import {
  APPROX_COST,
  CONTACTED_WHO,
  DELAY_REASONS,
  DENIED_REASONS,
  LEARNED_FROM,
  PRICE_SOURCE,
  WAITING_TIME,
  YES_NO,
  YES_NO_UNSURE,
  problemById,
} from '@/lib/content';

/** 04C / 04D · Problem-specific questions (step 3 of 3) */
export default function InterviewDetails() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { refresh } = useCase();
  const { draft, updateAnswers, reset } = useInterview();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const a = draft.answers;

  if (!draft.problem) return <Redirect href="/problem-selection" />;
  const prob = problemById(draft.problem);

  const create = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await createCaseFromDraft(db, user.id, draft);
      await refresh();
      reset();
      if (router.canDismiss()) router.dismissAll();
      router.replace('/plan');
    } catch {
      setError('We couldn’t save your plan. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Screen
      left={{ kind: 'back' }}
      right="Step 3 of 3"
      bottom={
        <Row>
          <Button icon="arrow-left" label="Back" onPress={() => router.back()} />
          <Button variant="primary" icon="zap" label="Create My Action Plan" loading={saving} onPress={create} />
        </Row>
      }>
      <StepBar total={3} current={3} />
      {error ? <Warn>{error}</Warn> : null}

      {draft.problem === 'denied' ? (
        <>
          <AppText variant="tag">Path · Denied by insurance</AppText>
          <AppText variant="h1">Do you know the stated reason?</AppText>
          <RadioList icons options={DENIED_REASONS} value={a.deniedReason} onChange={(v) => updateAnswers({ deniedReason: v })} />

          <AppText variant="h2">Did you receive a notice?</AppText>
          <ChipSelect options={YES_NO_UNSURE} value={a.noticeReceived} onChange={(v) => updateAnswers({ noticeReceived: v ?? undefined })} />

          <AppText variant="h2">Where did you learn about the problem?</AppText>
          <ChipSelect options={LEARNED_FROM} value={a.learnedFrom} onChange={(v) => updateAnswers({ learnedFrom: v ?? undefined })} />

          <AppText variant="h2">Have you contacted the doctor’s office?</AppText>
          <ChipSelect options={YES_NO_UNSURE} value={a.contactedDoctor} onChange={(v) => updateAnswers({ contactedDoctor: v ?? undefined })} />
        </>
      ) : null}

      {draft.problem === 'expensive' ? (
        <Card>
          <CardTitle icon={prob.icon} tone={prob.tone} tag="Path · Too expensive" />
          <AppText variant="h2">Where did you learn the price?</AppText>
          <ChipSelect options={PRICE_SOURCE} value={a.priceSource} onChange={(v) => updateAnswers({ priceSource: v ?? undefined })} />
          <AppText variant="h2">Approximate cost (optional)</AppText>
          <ChipSelect options={APPROX_COST} value={a.approxCost} onChange={(v) => updateAnswers({ approxCost: v ?? undefined })} />
          <AppText variant="h2">Approved by insurance?</AppText>
          <ChipSelect options={YES_NO_UNSURE} value={a.approvedByInsurance} onChange={(v) => updateAnswers({ approvedByInsurance: v ?? undefined })} />
          <AppText variant="h2">Assistance program contacted?</AppText>
          <ChipSelect options={YES_NO_UNSURE} value={a.assistanceContacted} onChange={(v) => updateAnswers({ assistanceContacted: v ?? undefined })} />
        </Card>
      ) : null}

      {draft.problem === 'delayed' ? (
        <Card>
          <CardTitle icon={prob.icon} tone={prob.tone} tag="Path · Delayed or unavailable" />
          <AppText variant="h2">What were you told?</AppText>
          <ChipSelect options={DELAY_REASONS} value={a.toldReason} onChange={(v) => updateAnswers({ toldReason: v ?? undefined })} />
          <AppText variant="h2">How long have you been waiting?</AppText>
          <ChipSelect options={WAITING_TIME} value={a.waitingTime} onChange={(v) => updateAnswers({ waitingTime: v ?? undefined })} />
          <AppText variant="h2">Spoken with the pharmacy?</AppText>
          <ChipSelect options={YES_NO} value={a.spokePharmacy} onChange={(v) => updateAnswers({ spokePharmacy: v ?? undefined })} />
          <AppText variant="h2">Spoken with the doctor’s office?</AppText>
          <ChipSelect options={YES_NO} value={a.spokeDoctor} onChange={(v) => updateAnswers({ spokeDoctor: v ?? undefined })} />
        </Card>
      ) : null}

      {draft.problem === 'unsure' ? (
        <Card>
          <CardTitle icon="help-circle" tone="sun" tag="Path · Not sure" />
          <Field
            label="What happened?"
            placeholder="In your own words"
            multiline
            maxLength={1000}
            value={a.whatHappened ?? ''}
            onChangeText={(v) => updateAnswers({ whatHappened: v })}
          />
          <AppText variant="h2">Did you receive a message or letter?</AppText>
          <ChipSelect options={YES_NO_UNSURE} value={a.receivedMessage} onChange={(v) => updateAnswers({ receivedMessage: v ?? undefined })} />
          <AppText variant="h2">Contacted the pharmacy or doctor?</AppText>
          <ChipSelect options={CONTACTED_WHO} value={a.contactedWho} onChange={(v) => updateAnswers({ contactedWho: v ?? undefined })} />
        </Card>
      ) : null}

      <AppText variant="small">All questions are optional — answer what you know.</AppText>
    </Screen>
  );
}

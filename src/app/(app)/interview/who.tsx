import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ChipSelect, Field, InfoLink, OptionRow } from '@/components/ui/form';
import { Card, Note, Row, Section, StepBar } from '@/components/ui/blocks';
import { useInterview } from '@/context/interview-context';
import { AGE_GROUPS, INSURANCE_EXPLAINER, INSURANCE_TYPES, RELATIONSHIPS } from '@/lib/content';

/** 04A · Who needs help & insurance (step 1 of 3) */
export default function InterviewWho() {
  const { draft, update } = useInterview();
  const [explain, setExplain] = useState(false);
  const other = draft.whoFor === 'other';

  return (
    <Screen
      left={{ kind: 'back' }}
      right="Step 1 of 3"
      bottom={
        <Row>
          <Button icon="arrow-left" label="Back" onPress={() => router.back()} />
          <Button variant="primary" label="Next" trailingIcon="arrow-right" onPress={() => router.push('/interview/card')} />
        </Row>
      }>
      <StepBar total={3} current={1} />
      <AppText variant="h1">Who needs help?</AppText>

      <Row>
        <OptionRow label="Myself" icon="user" tone="teal" selected={!other} onPress={() => update({ whoFor: 'self' })} />
        <OptionRow label="Someone else" icon="heart" tone="coral" selected={other} onPress={() => update({ whoFor: 'other' })} />
      </Row>

      {other ? (
        <Card>
          <Field
            label="Patient first name or nickname (optional)"
            placeholder="e.g. Mom"
            maxLength={40}
            value={draft.patientName}
            onChangeText={(v) => update({ patientName: v })}
          />
          <AppText variant="label">Relationship</AppText>
          <ChipSelect
            label="Relationship"
            options={RELATIONSHIPS}
            value={draft.relationship}
            onChange={(v) => update({ relationship: v })}
          />
        </Card>
      ) : null}

      <AppText variant="h2">Age group</AppText>
      <ChipSelect label="Age group" options={AGE_GROUPS} value={draft.ageGroup} onChange={(v) => update({ ageGroup: v })} />

      <AppText variant="h2">Insurance type</AppText>
      <InfoLink label="Explain" expanded={explain} onPress={() => setExplain((e) => !e)} />
      {explain ? <Note>{INSURANCE_EXPLAINER}</Note> : null}
      <ChipSelect
        label="Insurance type"
        options={INSURANCE_TYPES}
        value={draft.insuranceType}
        onChange={(v) => update({ insuranceType: v })}
      />

      {draft.insuranceType !== 'none' ? (
        <Field
          label="Insurance company (optional)"
          placeholder="Company name"
          maxLength={80}
          value={draft.insuranceCompany}
          onChangeText={(v) => update({ insuranceCompany: v })}
        />
      ) : null}

      <Section
        title="Add insurance-card details, optional"
        icon="credit-card"
        tone="sky"
        onPress={() => router.push({ pathname: '/interview/card', params: { openCard: '1' } })}
      />
      <AppText variant="small">We never ask about gender.</AppText>
    </Screen>
  );
}

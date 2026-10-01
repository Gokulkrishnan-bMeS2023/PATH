import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ChipSelect, Field, InfoLink, OptionRow } from '@/components/ui/form';
import { Card, Note, Row, Section, StepBar, Warn } from '@/components/ui/blocks';
import { useInterview } from '@/context/interview-context';
import { AGE_GROUPS, INSURANCE_EXPLAINER, INSURANCE_TYPES, RELATIONSHIPS } from '@/lib/content';
import { useTokens } from '@/theme/use-tokens';

type Errors = Partial<Record<'relationship' | 'ageGroup' | 'insuranceType', string>>;

/** 04A · Who needs help & insurance (step 1 of 3) */
export default function InterviewWho() {
  const { draft, update } = useInterview();
  const { p } = useTokens();
  const [explain, setExplain] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const other = draft.whoFor === 'other';
  const hasErrors = Object.values(errors).some(Boolean);

  const next = () => {
    const nextErrors: Errors = {
      relationship: other && !draft.relationship ? 'Please choose a relationship.' : undefined,
      ageGroup: !draft.ageGroup ? 'Please choose an age group.' : undefined,
      insuranceType: !draft.insuranceType ? 'Please choose an insurance type.' : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    router.push('/interview/card');
  };

  return (
    <Screen
      left={{ kind: 'back' }}
      right="Step 1 of 3"
      bottom={
        <Row>
          <Button
            icon="arrow-left"
            label="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/problem-selection'))}
          />
          <Button variant="primary" label="Next" trailingIcon="arrow-right" onPress={next} />
        </Row>
      }>
      <StepBar total={3} current={1} />
      <AppText variant="h1">Who needs help?</AppText>

      {hasErrors ? <Warn>Please correct the highlighted fields.</Warn> : null}

      <Row>
        <OptionRow
          label="Myself"
          icon="user"
          tone="teal"
          selected={!other}
          onPress={() => {
            update({ whoFor: 'self' });
            setErrors((e) => ({ ...e, relationship: undefined }));
          }}
        />
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
          <AppText variant="label">
            Relationship
            <AppText variant="label" color={p.danger}> *</AppText>
          </AppText>
          <ChipSelect
            label="Relationship"
            options={RELATIONSHIPS}
            value={draft.relationship}
            onChange={(v) => {
              update({ relationship: v });
              setErrors((e) => ({ ...e, relationship: undefined }));
            }}
            error={errors.relationship}
          />
        </Card>
      ) : null}

      <AppText variant="h2">
        Age group
        <Text style={{ color: p.danger }}> *</Text>
      </AppText>
      <ChipSelect
        label="Age group"
        options={AGE_GROUPS}
        value={draft.ageGroup}
        onChange={(v) => {
          update({ ageGroup: v });
          setErrors((e) => ({ ...e, ageGroup: undefined }));
        }}
        error={errors.ageGroup}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <AppText variant="h2">
          Insurance type
          <Text style={{ color: p.danger }}> *</Text>
        </AppText>
        <InfoLink label="Explain" expanded={explain} onPress={() => setExplain((e) => !e)} />
      </View>
      {explain ? <Note>{INSURANCE_EXPLAINER}</Note> : null}
      <ChipSelect
        label="Insurance type"
        options={INSURANCE_TYPES}
        value={draft.insuranceType}
        onChange={(v) => {
          update({ insuranceType: v });
          setErrors((e) => ({ ...e, insuranceType: undefined }));
        }}
        error={errors.insuranceType}
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

import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox, ChipSelect, Field, PasswordField } from '@/components/ui/form';
import { Note, Row, Section, StepBar, Warn } from '@/components/ui/blocks';
import { useInterview } from '@/context/interview-context';
import { LOW_SUPPLY, SUPPLY_LEFT } from '@/lib/content';
import { useTokens } from '@/theme/use-tokens';

const digitsAndDashes = (v: string) => v.replace(/[^0-9()\-\s+]/g, '');
const alnum = (v: string) => v.replace(/[^a-zA-Z0-9-]/g, '');

/** 04B · Insurance card & medication (step 2 of 3) */
export default function InterviewCard() {
  const { openCard } = useLocalSearchParams<{ openCard?: string }>();
  const { draft, update, updateCard } = useInterview();
  const { p } = useTokens();
  const c = draft.card;
  const hasCard = Object.values(c).some((v) => v.trim());
  const lowSupply = !!draft.supplyLeft && LOW_SUPPLY.has(draft.supplyLeft);

  return (
    <Screen
      left={{ kind: 'back' }}
      right="Step 2 of 3"
      bottom={
        <Row>
          <Button icon="arrow-left" label="Back" onPress={() => router.back()} />
          <Button variant="primary" label="Next" trailingIcon="arrow-right" onPress={() => router.push('/interview/details')} />
        </Row>
      }>
      <StepBar total={3} current={2} />
      <AppText variant="h1">Insurance card &amp; medication</AppText>

      <Section title="Insurance-card details (optional)" icon="credit-card" tone="sky" defaultOpen={openCard === '1' || hasCard}>
        <PasswordField
          label="Member ID"
          placeholder="Member ID"
          maxLength={30}
          value={c.memberId}
          onChangeText={(v) => updateCard({ memberId: alnum(v) })}
        />
        <Row>
          <Field label="Group number" placeholder="Group #" maxLength={30} value={c.groupNumber} onChangeText={(v) => updateCard({ groupNumber: alnum(v) })} />
          <Field
            label="Member-services phone"
            placeholder="(555) 555-5555"
            keyboardType="phone-pad"
            maxLength={20}
            value={c.memberPhone}
            onChangeText={(v) => updateCard({ memberPhone: digitsAndDashes(v) })}
          />
        </Row>
        <Row gap={8}>
          <Field label="Rx BIN" placeholder="BIN" maxLength={10} value={c.rxBin} onChangeText={(v) => updateCard({ rxBin: alnum(v) })} />
          <Field label="Rx PCN" placeholder="PCN" maxLength={15} value={c.rxPcn} onChangeText={(v) => updateCard({ rxPcn: alnum(v) })} />
          <Field label="Rx Group" placeholder="Group" maxLength={15} value={c.rxGroup} onChangeText={(v) => updateCard({ rxGroup: alnum(v) })} />
        </Row>
        <AppText variant="small">Saved numbers show masked. You can add these later under My Contacts.</AppText>
      </Section>

      <Note icon="lock">We never ask for your Social Security number, full Medicare number, or health records.</Note>

      <AppText variant="h2">Medication basics</AppText>
      <Field
        label="Medication name"
        placeholder="Medication name"
        maxLength={80}
        editable={!draft.medicationUnknown}
        value={draft.medicationUnknown ? '' : draft.medicationName}
        onChangeText={(v) => update({ medicationName: v })}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20 }}>
        <Checkbox
          label="I don't know"
          checked={draft.medicationUnknown}
          onChange={(v) => update({ medicationUnknown: v, medicationLater: v ? false : draft.medicationLater })}
        />
        <Checkbox
          label="I'll add it later"
          checked={draft.medicationLater}
          onChange={(v) => update({ medicationLater: v, medicationUnknown: v ? false : draft.medicationUnknown })}
        />
      </View>
      <Field
        label="Prescribing doctor or clinic (optional)"
        placeholder="Doctor or clinic"
        maxLength={80}
        value={draft.doctorName}
        onChangeText={(v) => update({ doctorName: v })}
      />
      <Field
        label="Pharmacy (optional)"
        placeholder="Pharmacy name"
        maxLength={80}
        value={draft.pharmacyName}
        onChangeText={(v) => update({ pharmacyName: v })}
      />

      <AppText variant="h2">How much medication do you have left?</AppText>
      <ChipSelect label="Medication left" options={SUPPLY_LEFT} value={draft.supplyLeft} onChange={(v) => update({ supplyLeft: v })} />

      <Warn>
        <AppText color={p.sunInk}>
          {lowSupply ? <AppText variant="strong">Contact your clinician or pharmacist promptly. </AppText> : null}
          For a medical emergency, call emergency services. Do not change, substitute, split or ration medication based
          on this app.
        </AppText>
      </Warn>
    </Screen>
  );
}

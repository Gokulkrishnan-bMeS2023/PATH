import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox, ChipSelect, Field } from '@/components/ui/form';
import { Row, Warn } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { CALL_STATUSES, CONTACT_KINDS, RESPONSIBLE } from '@/lib/content';
import { dateError, maskDateInput, parseUSDate, toUSDate, todayISO } from '@/lib/dates';
import { recordCall } from '@/lib/repo/activity';
import { upsertContactOfKind } from '@/lib/repo/contacts';
import type { CallStatus, ContactKind, Responsible } from '@/types/case';

const isKind = (k: unknown): k is ContactKind =>
  k === 'doctor' || k === 'insurance' || k === 'pharmacy' || k === 'assistance' || k === 'other';

const maskTime = (t: string) => {
  const d = t.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
};

/** 06 · Record a call */
export default function RecordCallScreen() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const { contactOf, mutate } = usePlan();
  const initialKind: ContactKind = isKind(params.kind) ? params.kind : 'doctor';
  const initialContact = contactOf(initialKind);

  const [kind, setKind] = useState<ContactKind>(initialKind);
  const [f, setF] = useState({
    organization: initialContact?.name ?? '',
    person: '',
    phone: initialContact?.phone ?? '',
    date: toUSDate(todayISO()),
    time: '',
    reference: '',
    summary: '',
    nextStep: '',
    missingInfo: '',
    followUp: '',
  });
  const [responsible, setResponsible] = useState<Responsible | null>(null);
  const [followUpUnknown, setFollowUpUnknown] = useState(false);
  const [status, setStatus] = useState<CallStatus | null>(null);
  const [errors, setErrors] = useState<{ date?: string; followUp?: string; status?: string }>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [key]: v }));

  const changeKind = (k: ContactKind | null) => {
    if (!k) return;
    setKind(k);
    const c = contactOf(k);
    // Pre-fill from saved contacts unless the user already typed something.
    setF((s) => ({
      ...s,
      organization: s.organization && s.organization !== contactOf(kind)?.name ? s.organization : c?.name ?? '',
      phone: s.phone && s.phone !== contactOf(kind)?.phone ? s.phone : c?.phone ?? '',
    }));
  };

  const save = async () => {
    const next = {
      date: dateError(f.date),
      followUp: followUpUnknown ? undefined : dateError(f.followUp),
      status: status ? undefined : 'Choose the current status.',
    };
    setErrors(next);
    if (next.date || next.followUp || next.status || !status) return;

    setSaving(true);
    try {
      await mutate(async (db, caseId) => {
        await recordCall(db, caseId, {
          contactKind: kind,
          organization: f.organization.trim(),
          person: f.person.trim(),
          phone: f.phone.trim(),
          callDate: parseUSDate(f.date),
          callTime: f.time,
          reference: f.reference.trim(),
          summary: f.summary.trim(),
          nextStep: f.nextStep.trim(),
          responsible,
          missingInfo: f.missingInfo.trim(),
          followUpDate: followUpUnknown ? null : parseUSDate(f.followUp),
          followUpUnknown,
          status,
        });
        // Remember new organization details in My Contacts.
        const existing = contactOf(kind);
        if (kind !== 'other' && (f.organization.trim() || f.phone.trim())) {
          await upsertContactOfKind(db, caseId, kind, {
            name: existing?.name || f.organization.trim(),
            phone: existing?.phone || f.phone.trim(),
            contactPerson: existing?.contactPerson || f.person.trim(),
          });
        }
      });
      router.dismissTo('/plan');
    } catch {
      setSaving(false);
    }
  };

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Record a call</AppText>

      <AppText variant="h2">Who was contacted?</AppText>
      <ChipSelect options={CONTACT_KINDS} value={kind} onChange={changeKind} label="Who was contacted" />

      <Field label="Organization" placeholder="Organization" maxLength={80} value={f.organization} onChangeText={set('organization')} />
      <Field label="Person or department" placeholder="e.g. Prior-auth team" maxLength={80} value={f.person} onChangeText={set('person')} />
      <Field
        label="Phone number"
        placeholder="(555) 555-5555"
        keyboardType="phone-pad"
        maxLength={20}
        value={f.phone}
        onChangeText={(v) => set('phone')(v.replace(/[^0-9()\-\s+]/g, ''))}
      />
      <Row>
        <Field
          label="Date"
          placeholder="MM/DD/YYYY"
          keyboardType="number-pad"
          value={f.date}
          onChangeText={(v) => set('date')(maskDateInput(v))}
          error={errors.date}
        />
        <Field label="Time" placeholder="HH:MM" keyboardType="number-pad" value={f.time} onChangeText={(v) => set('time')(maskTime(v))} />
      </Row>
      <Field label="Reference or case number" placeholder="e.g. A7K-4821" maxLength={40} value={f.reference} onChangeText={set('reference')} />
      <Field label="What did they say?" placeholder="In your own words" multiline maxLength={2000} value={f.summary} onChangeText={set('summary')} />
      <Field label="Next step" placeholder="e.g. Doctor sends documentation" maxLength={200} value={f.nextStep} onChangeText={set('nextStep')} />

      <AppText variant="h2">Who is responsible?</AppText>
      <ChipSelect options={RESPONSIBLE} value={responsible} onChange={setResponsible} label="Who is responsible" />

      <Field label="Missing information" placeholder="Anything they still need" multiline maxLength={1000} value={f.missingInfo} onChangeText={set('missingInfo')} />
      {!followUpUnknown ? (
        <Field
          label="Follow-up date"
          placeholder="MM/DD/YYYY"
          keyboardType="number-pad"
          value={f.followUp}
          onChangeText={(v) => set('followUp')(maskDateInput(v))}
          error={errors.followUp}
        />
      ) : null}
      <Checkbox label="I don’t know the follow-up date" checked={followUpUnknown} onChange={setFollowUpUnknown} />

      <AppText variant="h2">Current status</AppText>
      <ChipSelect options={CALL_STATUSES} value={status} onChange={setStatus} label="Current status" />
      {errors.status ? <Warn>{errors.status}</Warn> : null}

      <Button variant="primary" icon="save" label="Save Call" loading={saving} onPress={save} />
      <AppText variant="small">Saving updates status, next step, progress, reminder and call history.</AppText>
    </Screen>
  );
}

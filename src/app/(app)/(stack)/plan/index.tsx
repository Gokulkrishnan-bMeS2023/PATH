import React, { useState } from 'react';
import { View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Chip, InfoBadge, InfoLink } from '@/components/ui/form';
import { Card, CardTitle, Hero, KV, Note, ProgressStep, Reveal, Row, Section, Warn } from '@/components/ui/blocks';
import { Icon } from '@/components/ui/icon';
import { usePlan } from '@/hooks/use-plan';
import { CALL_GUIDES, INSURANCE_TYPES, SUPPLY_LEFT, AGE_GROUPS, describePatient, describeProblem, labelOf } from '@/lib/content';
import { PROGRESS_LABELS } from '@/lib/plan';
import { callNumber } from '@/lib/phone';
import { setCaseStatus } from '@/lib/repo/cases';
import { shortDate } from '@/lib/dates';
import { useTokens } from '@/theme/use-tokens';

/** 05 · Action Plan Dashboard */
export default function Dashboard() {
  const plan = usePlan();
  const { p } = useTokens();
  const { medCase: c, next, progress, status, due, contactOf, whose } = plan;
  const [moreDetails, setMoreDetails] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const target = contactOf(next.target);
  const targetPhone = target?.phone;
  const targetName = { doctor: 'Doctor’s Office', insurance: 'Insurance', pharmacy: 'Pharmacy', assistance: 'Program', other: 'Contact' }[next.target];

  const openNext = () => {
    if (next.route === 'success') router.push('/plan/success');
    else if (next.route === 'financial') router.push('/plan/financial');
    else if (next.route === 'still-stuck') router.push('/plan/still-stuck');
    else if (next.guide) router.push({ pathname: '/plan/guide/[kind]', params: { kind: next.guide } });
  };
  const nextCta =
    next.route === 'success'
      ? 'Review Outcome'
      : next.route === 'financial'
        ? 'Open Financial Assistance'
        : next.route === 'still-stuck'
          ? 'See What To Do Next'
          : next.guide
            ? `Open ${CALL_GUIDES[next.guide].title}`
            : 'Open';

  const insurance = [labelOf(INSURANCE_TYPES, c.insuranceType), c.insuranceCompany].filter(Boolean).join(' · ');
  const doctor = contactOf('doctor');
  const pharmacy = contactOf('pharmacy');

  const closeCase = async () => {
    await plan.mutate((db) => setCaseStatus(db, c.userId, c.id, 'closed'));
    router.replace('/problem-selection');
  };

  const link = (href: Href) => () => router.push(href);
  const guide = (kind: 'doctor' | 'insurance' | 'pharmacy') => () =>
    router.push({ pathname: '/plan/guide/[kind]', params: { kind } });


  return (
    <Screen
      left={{ kind: 'brand' }}>
      <Warn>
        <AppText color={p.sunInk}>
          <AppText variant="strong" color={p.sunInk}>
            Important:{' '}
          </AppText>
          if you are running out of medication, symptoms are getting worse, or there is a medical emergency, contact a
          healthcare professional or emergency services promptly.
        </AppText>
      </Warn>

      <AppText variant="h1">Your Action Plan</AppText>

      <Section title="Your Situation" icon="clipboard" tone="sky" defaultOpen>
        <KV k="Patient" v={describePatient(c)} />
        <KV k="Medication" v={c.medicationUnknown ? 'Not known yet' : c.medicationName || 'Not added yet'} />
        <KV k="Insurance" v={insurance || 'Not added'} />
        <KV k="Main problem" v={describeProblem(c)} />
        <KV k="Current status" v={status} />
        <KV k="Goal" v="Receive medication" />
        {moreDetails ? (
          <>
            <KV k="Age group" v={labelOf(AGE_GROUPS, c.ageGroup) || '—'} />
            <KV k="Medication left" v={labelOf(SUPPLY_LEFT, c.supplyLeft) || '—'} />
            <KV k="Doctor or clinic" v={doctor?.name || '—'} />
            <KV k="Pharmacy" v={pharmacy?.name || '—'} />
            <KV k="Case opened" v={shortDate(c.createdAt)} />
            <KV k="Calls recorded" v={String(plan.calls.length)} />
          </>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          label={moreDetails ? 'Show Fewer Case Details' : 'Show More Case Details'}
          onPress={() => setMoreDetails((m) => !m)}
        />
      </Section>

      <Hero>
        <CardTitle icon="navigation" tone="teal" tag="Your next step" />
        <Reveal key={next.title}>
          <AppText variant="h1">{next.title}</AppText>
        </Reveal>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <AppText style={{ flex: 1 }}>{next.reason}</AppText>
          <InfoBadge onPress={() => setShowWhy((s) => !s)} label="Why this step?" />
        </View>
        <Button variant="primary" icon={next.guide ? 'phone-call' : 'arrow-right'} label={nextCta} onPress={openNext} />
        {next.route !== 'success' ? (
          <Row>
            {targetPhone ? (
              <Button size="sm" icon="phone" label={`Call ${targetName}`} onPress={() => callNumber(targetPhone)} />
            ) : (
              <Button
                size="sm"
                icon="plus"
                label={`Add ${targetName} Phone`}
                onPress={() => router.push({ pathname: '/plan/contacts', params: { edit: next.target } })}
              />
            )}
            <Button size="sm" icon="bell" label="Set a Reminder" onPress={link('/plan/reminders')} />
          </Row>
        ) : null}
        <InfoLink label="Why this step?" expanded={showWhy} onPress={() => setShowWhy((s) => !s)} />
        {showWhy ? (
          <Reveal>
            <Note>{next.why}</Note>
          </Reveal>
        ) : null}
        <AppText variant="small">Guidance is not a guarantee that this contact will resolve the case.</AppText>
      </Hero>

      {due.length > 0 ? (
        <Card>
          <CardTitle icon="bell" tone="coral" tag={`${due.length} reminder${due.length > 1 ? 's' : ''} due`} />
          {due.slice(0, 3).map((t) => (
            <View key={t.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="clock" size={14} color={p.coral} />
              <AppText variant="strong" style={{ flex: 1 }}>
                {t.title}
              </AppText>
              {t.dueDate ? <AppText variant="small">Due {shortDate(t.dueDate)}</AppText> : null}
            </View>
          ))}
          <Button size="sm" label="Open Reminders" onPress={link('/plan/reminders')} />
        </Card>
      ) : null}

      <Section title="Progress" icon="trending-up" tone="green" defaultOpen>
        {PROGRESS_LABELS.map((label, i) => (
          <ProgressStep key={label} label={label} state={progress[i]} />
        ))}
      </Section>

      <AppText variant="label">More sections</AppText>
      <Section title="Understand Insurance and Pharmacy Terms" icon="book-open" tone="teal" onPress={link('/terms')} />
      <Section title="Doctor Call Guide" icon="activity" tone="teal" onPress={guide('doctor')} />
      <Section title="Insurance Call Guide" icon="shield" tone="sky" onPress={guide('insurance')} />
      <Section title="Pharmacy Call Guide" icon="package" tone="purple" onPress={guide('pharmacy')} />
      <Section
        title="Record a Call / Call History"
        icon="phone"
        tone="green"
        onPress={link('/plan/calls')}
        right={plan.calls.length ? <AppText variant="small">{plan.calls.length}</AppText> : null}
      />
      <Section
        title="Deadlines and Reminders"
        icon="calendar"
        tone="coral"
        onPress={link('/plan/reminders')}
        right={due.length ? <Chip tone="due" label={`${due.length} due`} /> : null}
      />
      <Section title="Financial Assistance Resources" icon="dollar-sign" tone="sun" onPress={link('/plan/financial')} />
      <Section title="Additional Support Resources" icon="life-buoy" tone="sky" onPress={link('/plan/contacts')} />
      <Section title="My Contacts" icon="users" tone="purple" onPress={link('/plan/contacts')} />
      <Section title="Documents, Optional" icon="file-text" tone="sky" onPress={link('/plan/documents')} />
      <Section title="Weekly Check-In" icon="check-square" tone="green" onPress={link('/plan/check-in')} />
      <Section title="I Still Can’t Get the Medication" icon="alert-octagon" tone="coral" onPress={link('/plan/still-stuck')} />

      {confirmClose ? (
        <Card>
          <AppText variant="h2">Close this case?</AppText>
          <AppText>Closing stops future reminders for {whose} medication case. Call history is kept.</AppText>
          <Row>
            <Button size="sm" label="Cancel" onPress={() => setConfirmClose(false)} />
            <Button size="sm" variant="primary" label="Close Case" onPress={closeCase} />
          </Row>
        </Card>
      ) : (
        <Button variant="ghost" icon="archive" label="Close Case" onPress={() => setConfirmClose(true)} />
      )}

    </Screen>
  );
}

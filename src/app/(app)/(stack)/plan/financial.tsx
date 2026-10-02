import React from 'react';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Note, Row, Section } from '@/components/ui/blocks';
import { showToast } from '@/components/ui/toast';
import { usePlan } from '@/hooks/use-plan';
import { FINANCIAL_RESOURCES, PROGRAM_QUESTIONS } from '@/lib/content';
import { shortDate } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { callNumber, openWebsite } from '@/lib/phone';
import { setResourceContacted, setResourceInPlan } from '@/lib/repo/activity';
import { addContact } from '@/lib/repo/contacts';

/** 08 · Financial assistance resources */
export default function FinancialScreen() {
  const { resources, contacts, mutate } = usePlan();
  const stateOf = (id: string) => resources.find((r) => r.resourceId === id);

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Financial assistance resources</AppText>
      <AppText>
        A program may help eligible patients with medication-related costs. Each program has its own rules and decides
        eligibility.
      </AppText>
      <Note>
        <AppText italic>“This resource may be relevant. The program will determine eligibility.”</AppText>
      </Note>

      {FINANCIAL_RESOURCES.map((r) => {
        const st = stateOf(r.id);
        const inPlan = !!st?.inPlan;
        const contacted = !!st?.contactedAt;
        const meta = [
          r.phone ?? 'Phone: check official website',
          r.website ? r.website.replace(/^https?:\/\/(www\.)?/, '') : 'Website: to be verified',
          r.lastVerified ? `Last verified ${r.lastVerified}` : 'Not yet verified',
        ].join(' · ');

        return (
          <Card key={r.id}>
            <CardTitle icon="heart" tone="green" title={r.name} />
            <AppText variant="small">Generally serves: {r.serves}</AppText>
            <AppText>{r.description}</AppText>
            <AppText variant="mono">{meta}</AppText>
            {/* Only offer what exists; the line above already says when a number or site is still unverified. */}
            {r.phone || r.website ? (
              <Row>
                {r.phone ? <Button size="sm" icon="phone" label="Call" onPress={() => r.phone && callNumber(r.phone)} /> : null}
                {r.website ? (
                  <Button size="sm" icon="external-link" label="Website" onPress={() => r.website && openWebsite(r.website)} />
                ) : null}
              </Row>
            ) : null}
            <Row>
              <Button
                size="sm"
                variant={inPlan ? 'secondary' : 'primary'}
                icon={inPlan ? 'check' : 'plus'}
                label={inPlan ? 'In My Plan' : 'Add to My Plan'}
                accessibilityLabel={inPlan ? `${r.name} is in your plan. Remove` : `Add ${r.name} to my plan`}
                onPress={async () => {
                  // Adding a program also lists it under My Contacts.
                  const addsContact = !inPlan && !contacts.some((c) => c.kind === 'assistance' && c.name === r.name);
                  await mutate(async (db, caseId) => {
                    await setResourceInPlan(db, caseId, r.id, !inPlan);
                    if (addsContact) {
                      await addContact(db, caseId, 'assistance', { name: r.name, phone: r.phone ?? '', website: r.website ?? '' });
                    }
                  });
                  if (inPlan) showToast(`${r.name} removed from your plan`, 'info');
                  else showToast(`${r.name} added to your plan${addsContact ? ' and My Contacts' : ''}`);
                }}
              />
              <Button
                size="sm"
                icon={contacted ? 'check-circle' : 'phone-outgoing'}
                label={contacted ? `Contacted ${shortDate(st?.contactedAt)}` : 'Mark as Contacted'}
                onPress={() => {
                  if (!contacted) haptics.success();
                  return mutate((db, caseId) => setResourceContacted(db, caseId, r.id, !contacted));
                }}
              />
            </Row>
          </Card>
        );
      })}

      <Section title="Questions to ask a program" icon="help-circle" tone="sky">
        {PROGRAM_QUESTIONS.map((q) => (
          <AppText key={q} variant="small">
            • {q}
          </AppText>
        ))}
      </Section>
    </Screen>
  );
}

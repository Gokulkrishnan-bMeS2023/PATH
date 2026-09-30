import React from 'react';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Note, Row, Section } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { FINANCIAL_RESOURCES, PROGRAM_QUESTIONS } from '@/lib/content';
import { shortDate } from '@/lib/dates';
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
            <Row>
              <Button size="sm" icon="phone" label="Call" disabled={!r.phone} onPress={() => r.phone && callNumber(r.phone)} />
              <Button size="sm" icon="external-link" label="Website" disabled={!r.website} onPress={() => r.website && openWebsite(r.website)} />
            </Row>
            <Row>
              <Button
                size="sm"
                variant={inPlan ? 'secondary' : 'primary'}
                icon={inPlan ? 'check' : 'plus'}
                label={inPlan ? 'In My Plan' : 'Add to My Plan'}
                accessibilityLabel={inPlan ? `${r.name} is in your plan. Remove` : `Add ${r.name} to my plan`}
                onPress={() =>
                  mutate(async (db, caseId) => {
                    await setResourceInPlan(db, caseId, r.id, !inPlan);
                    // Adding a program also lists it under My Contacts.
                    if (!inPlan && !contacts.some((c) => c.kind === 'assistance' && c.name === r.name)) {
                      await addContact(db, caseId, 'assistance', { name: r.name, phone: r.phone ?? '', website: r.website ?? '' });
                    }
                  })
                }
              />
              <Button
                size="sm"
                icon={contacted ? 'check-circle' : 'phone-outgoing'}
                label={contacted ? `Contacted ${shortDate(st?.contactedAt)}` : 'Mark as Contacted'}
                onPress={() => mutate((db, caseId) => setResourceContacted(db, caseId, r.id, !contacted))}
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

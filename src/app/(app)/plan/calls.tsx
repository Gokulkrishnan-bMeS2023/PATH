import React from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, KV, Note } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { CALL_STATUS_LABEL, CONTACT_KIND_LABEL, RESPONSIBLE, labelOf } from '@/lib/content';
import { shortDate } from '@/lib/dates';
import type { ContactKind } from '@/types/case';

const ICON = { doctor: 'activity', insurance: 'shield', pharmacy: 'package', assistance: 'heart', other: 'phone' } as const;
const TONE = { doctor: 'teal', insurance: 'sky', pharmacy: 'purple', assistance: 'green', other: 'sun' } as const;

/** Call history (reached from "Record a Call / Call History"). */
export default function CallHistoryScreen() {
  const { calls, next } = usePlan();
  const suggested: ContactKind = next.target;

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Calls</AppText>
      <Button
        variant="primary"
        icon="plus"
        label="Record a Call"
        onPress={() => router.push({ pathname: '/plan/record-call', params: { kind: suggested } })}
      />

      {calls.length === 0 ? (
        <Note>No calls recorded yet. After each call, record what they said so your next step stays up to date.</Note>
      ) : (
        <AppText variant="h2">Call history</AppText>
      )}

      {calls.map((c) => (
        <Card key={c.id}>
          <CardTitle
            icon={ICON[c.contactKind]}
            tone={TONE[c.contactKind]}
            tag={`${shortDate(c.callDate ?? c.createdAt)}${c.callTime ? ` · ${c.callTime}` : ''} · ${CALL_STATUS_LABEL[c.status]}`}
            title={c.organization || CONTACT_KIND_LABEL[c.contactKind]}
          />
          {c.person ? <KV k="Spoke with" v={c.person} /> : null}
          {c.reference ? <KV k="Reference" v={c.reference} mono /> : null}
          {c.summary ? <KV k="What they said" v={c.summary} /> : null}
          {c.nextStep ? <KV k="Next step" v={c.nextStep} /> : null}
          {c.responsible ? <KV k="Responsible" v={labelOf(RESPONSIBLE, c.responsible)} /> : null}
          {c.missingInfo ? <KV k="Missing information" v={c.missingInfo} /> : null}
          <KV k="Follow-up" v={c.followUpDate ? shortDate(c.followUpDate) : c.followUpUnknown ? 'Not known — ask next time' : '—'} />
        </Card>
      ))}
    </Screen>
  );
}

import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Field, PasswordField } from '@/components/ui/form';
import { Card, CardTitle, KV, Row, Section } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { CONTACT_KIND_LABEL, REF_KINDS, SUPPORT_RESOURCES } from '@/lib/content';
import { maskMiddle } from '@/lib/dates';
import { callNumber, openWebsite } from '@/lib/phone';
import { addContact, deleteContact, setRefNumber, updateContact, type ContactFields } from '@/lib/repo/contacts';
import { Fonts } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';
import type { Contact, ContactKind, RefKind } from '@/types/case';

const ICON = { doctor: 'activity', insurance: 'shield', pharmacy: 'package', assistance: 'heart', other: 'user' } as const;
const TONE = { doctor: 'teal', insurance: 'sky', pharmacy: 'purple', assistance: 'green', other: 'sun' } as const;
/**
 * Outline buttons coloured by meaning (wireframe round 2): purple = phone calls, blue = information,
 * teal = main action, green = done, coral = needs attention, grey = cancel. Call / Website keep full colour
 * even when there's no number or site yet.
 */
const NO_FADE = { opacity: 1 } as const;

type FieldDef = { key: keyof ContactFields; label: string; phone?: boolean; secret?: boolean; multiline?: boolean };

const FIELDS: Record<ContactKind, FieldDef[]> = {
  doctor: [
    { key: 'name', label: 'Clinic or doctor name' },
    { key: 'contactPerson', label: 'Contact person' },
    { key: 'phone', label: 'Phone', phone: true },
    { key: 'extension', label: 'Extension' },
    { key: 'website', label: 'Portal / website' },
    { key: 'notes', label: 'Notes', multiline: true },
  ],
  pharmacy: [
    { key: 'name', label: 'Pharmacy name' },
    { key: 'phone', label: 'Phone', phone: true },
    { key: 'contactPerson', label: 'Pharmacist / contact' },
    { key: 'address', label: 'Address (optional)' },
    { key: 'notes', label: 'Notes', multiline: true },
  ],
  insurance: [
    { key: 'name', label: 'Insurance company' },
    { key: 'plan', label: 'Plan name' },
    { key: 'phone', label: 'Member-services phone', phone: true },
    { key: 'pharmacyBenefitPhone', label: 'Pharmacy-benefit phone', phone: true },
    { key: 'memberId', label: 'Member ID', secret: true },
    { key: 'groupNumber', label: 'Group number' },
    { key: 'rxBin', label: 'Rx BIN' },
    { key: 'rxPcn', label: 'Rx PCN' },
    { key: 'rxGroup', label: 'Rx Group' },
  ],
  assistance: [
    { key: 'name', label: 'Program' },
    { key: 'phone', label: 'Phone', phone: true },
    { key: 'website', label: 'Website' },
    { key: 'caseNumber', label: 'Case number' },
  ],
  other: [
    { key: 'name', label: 'Name or organization' },
    { key: 'contactPerson', label: 'Contact person' },
    { key: 'phone', label: 'Phone', phone: true },
    { key: 'website', label: 'Website' },
    { key: 'notes', label: 'Notes', multiline: true },
  ],
};

type Editing = { kind: ContactKind; id: number | null } | null;

/** 09 · Additional support & my contacts */
export default function ContactsScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { contacts, refs, mutate } = usePlan();
  const { p, fs } = useTokens();

  const initialEditing = (): Editing => {
    if (edit !== 'doctor' && edit !== 'pharmacy' && edit !== 'insurance' && edit !== 'assistance') return null;
    const existing = contacts.find((c) => c.kind === edit);
    return { kind: edit, id: existing?.id ?? null };
  };
  const [editing, setEditing] = useState<Editing>(initialEditing);
  const [editingRef, setEditingRef] = useState<RefKind | null>(null);
  const [refValue, setRefValue] = useState('');

  const primaryKinds: ContactKind[] = ['doctor', 'pharmacy', 'insurance'];
  const cards: (Contact | { kind: ContactKind; placeholder: true })[] = [
    ...primaryKinds.map((k) => contacts.find((c) => c.kind === k) ?? { kind: k, placeholder: true as const }),
    ...contacts.filter((c) => c.kind === 'assistance'),
    ...contacts.filter((c) => c.kind === 'other'),
  ];

  const renderCard = (item: (typeof cards)[number], index: number) => {
    const isPlaceholder = 'placeholder' in item;
    const c = isPlaceholder ? null : item;
    const kind = item.kind;
    if (editing && editing.kind === kind && editing.id === (c?.id ?? null)) {
      return (
        <ContactEditor
          key={`edit-${kind}-${c?.id ?? 'new'}`}
          kind={kind}
          contact={c}
          onCancel={() => setEditing(null)}
          onSave={async (fields) => {
            await mutate((db, caseId) => (c ? updateContact(db, caseId, c.id, fields) : addContact(db, caseId, kind, fields)));
            setEditing(null);
          }}
          onDelete={
            c && (kind === 'other' || kind === 'assistance')
              ? async () => {
                  await mutate((db, caseId) => deleteContact(db, caseId, c.id));
                  setEditing(null);
                }
              : undefined
          }
        />
      );
    }
    return (
      <Card key={c ? c.id : `${kind}-${index}`}>
        <CardTitle icon={ICON[kind]} tone={TONE[kind]} tag={CONTACT_KIND_LABEL[kind]} />
        {kind === 'doctor' ? (
          <>
            <KV k="Name" v={c?.name} />
            <KV k="Contact person" v={c?.contactPerson} />
            <KV k="Phone · ext." v={c?.phone ? `${c.phone}${c.extension ? ` · ${c.extension}` : ''}` : ''} />
            <KV k="Portal / website" v={c?.website} />
            <KV k="Notes" v={c?.notes} />
          </>
        ) : kind === 'pharmacy' ? (
          <>
            <KV k="Name" v={c?.name} />
            <KV k="Phone" v={c?.phone} />
            <KV k="Pharmacist / contact" v={c?.contactPerson} />
            <KV k="Address (optional)" v={c?.address} />
          </>
        ) : kind === 'insurance' ? (
          <>
            <KV k="Company · plan" v={[c?.name, c?.plan].filter(Boolean).join(' · ')} />
            <KV k="Member services" v={c?.phone} />
            <KV k="Pharmacy benefit" v={c?.pharmacyBenefitPhone} />
            <KV k="Member ID" v={c?.memberId ? maskMiddle(c.memberId) : ''} mono />
            <KV k="Group" v={c?.groupNumber} />
          </>
        ) : kind === 'assistance' ? (
          <>
            <KV k="Program" v={c?.name} />
            <KV k="Phone" v={c?.phone} />
            <KV k="Case number" v={c?.caseNumber} mono />
          </>
        ) : (
          <>
            <KV k="Name" v={c?.name} />
            <KV k="Contact person" v={c?.contactPerson} />
            <KV k="Phone" v={c?.phone} />
            <KV k="Notes" v={c?.notes} />
          </>
        )}
        <Row gap={8}>
          <Button size="sm" tone="purple" icon="phone" label="Call" accessibilityLabel={`Call ${c?.name || CONTACT_KIND_LABEL[kind]}`} disabled={!c?.phone} style={NO_FADE} onPress={() => c?.phone && callNumber(c.phone)} />
          {kind === 'assistance' || kind === 'other' ? (
            <Button size="sm" tone="sky" icon="external-link" label="Website" accessibilityLabel={`Website for ${c?.name || CONTACT_KIND_LABEL[kind]}`} disabled={!c?.website} style={NO_FADE} onPress={() => c?.website && openWebsite(c.website)} />
          ) : null}
          <Button size="sm" tone="teal" icon={c ? 'edit-2' : 'plus'} label={c ? 'Edit' : 'Add'} accessibilityLabel={`${c ? 'Edit' : 'Add'} ${CONTACT_KIND_LABEL[kind].toLowerCase()}`} onPress={() => setEditing({ kind, id: c?.id ?? null })} />
        </Row>
      </Card>
    );
  };

  const refOf = (k: RefKind) => refs.find((r) => r.kind === k)?.value;

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Support &amp; contacts</AppText>

      <Section title="Additional Support Resources" icon="life-buoy" tone="sky">
        {SUPPORT_RESOURCES.map((r) => (
          <KV key={r.name} k={r.name} v={r.purpose} />
        ))}
        <AppText variant="small">
          Ask your clinic, hospital or pharmacy how to reach these. Verified phone numbers and websites will be listed here
          once checked.
        </AppText>
      </Section>

      <AppText variant="h2">My Contacts</AppText>
      {cards.map(renderCard)}

      {editing && editing.kind === 'other' && editing.id === null ? (
        <ContactEditor
          kind="other"
          contact={null}
          onCancel={() => setEditing(null)}
          onSave={async (fields) => {
            await mutate((db, caseId) => addContact(db, caseId, 'other', fields));
            setEditing(null);
          }}
        />
      ) : (
        <Button
          tone="teal"
          icon="user-plus"
          label="Add Other Contact"
          onPress={() => setEditing({ kind: 'other', id: null })}
        />
      )}

      <Section title="Important numbers" icon="hash" tone="purple" defaultOpen={refs.length > 0}>
        {REF_KINDS.map(({ kind, label }) =>
          editingRef === kind ? (
            <View key={kind} style={{ gap: 8 }}>
              <Field label={label} value={refValue} maxLength={40} autoFocus onChangeText={setRefValue} />
              <Row>
                <Button size="sm" tone="neutral" icon="x" label="Cancel" onPress={() => setEditingRef(null)} />
                <Button
                  size="sm"
                  tone="green"
                  icon="save"
                  label="Save"
                  onPress={async () => {
                    await mutate((db, caseId) => setRefNumber(db, caseId, kind, refValue));
                    setEditingRef(null);
                  }}
                />
              </Row>
            </View>
          ) : (
            <KV
              key={kind}
              k={label}
              mono
              v={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={refOf(kind) ? `Edit ${label}` : `Add ${label}`}
                  hitSlop={10}
                  onPress={() => {
                    setEditingRef(kind);
                    setRefValue(refOf(kind) ?? '');
                  }}>
                  <AppText style={{ fontFamily: Fonts.mono, fontSize: fs(13), color: refOf(kind) ? p.ink : p.primary }}>
                    {refOf(kind) ?? '+ Add'}
                  </AppText>
                </Pressable>
              }
            />
          ),
        )}
      </Section>
    </Screen>
  );
}

function ContactEditor({
  kind,
  contact,
  onSave,
  onCancel,
  onDelete,
}: {
  kind: ContactKind;
  contact: Contact | null;
  onSave: (fields: ContactFields) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [values, setValues] = useState<ContactFields>(() =>
    Object.fromEntries(FIELDS[kind].map((f) => [f.key, contact ? contact[f.key] : ''])),
  );
  const [saving, setSaving] = useState(false);

  return (
    <Card>
      <CardTitle icon={ICON[kind]} tone={TONE[kind]} tag={`${contact ? 'Edit' : 'Add'} · ${CONTACT_KIND_LABEL[kind]}`} />
      {FIELDS[kind].map((f) => {
        const common = {
          label: f.label,
          value: String(values[f.key] ?? ''),
          maxLength: f.multiline ? 1000 : 120,
          onChangeText: (v: string) =>
            setValues((s) => ({ ...s, [f.key]: f.phone ? v.replace(/[^0-9()\-\s+]/g, '') : v })),
        };
        return f.secret ? (
          <PasswordField key={f.key} {...common} />
        ) : (
          <Field
            key={f.key}
            {...common}
            multiline={f.multiline}
            keyboardType={f.phone ? 'phone-pad' : 'default'}
            autoCapitalize={f.key === 'website' ? 'none' : 'sentences'}
          />
        );
      })}
      <Row>
        <Button size="sm" tone="neutral" icon="x" label="Cancel" onPress={onCancel} />
        <Button
          size="sm"
          tone="green"
          icon="save"
          label="Save"
          loading={saving}
          onPress={async () => {
            setSaving(true);
            try {
              await onSave(values);
            } finally {
              setSaving(false);
            }
          }}
        />
      </Row>
      {onDelete ? <Button size="sm" variant="danger-outline" icon="trash-2" label="Remove Contact" onPress={onDelete} /> : null}
    </Card>
  );
}

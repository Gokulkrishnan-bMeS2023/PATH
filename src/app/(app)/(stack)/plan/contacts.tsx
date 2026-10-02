import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, ScrollIntoView } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button, ConfirmButton } from '@/components/ui/button';
import { Field, PasswordField } from '@/components/ui/form';
import { Card, CardTitle, KV, Row, Section } from '@/components/ui/blocks';
import { showToast } from '@/components/ui/toast';
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

/** Which contact is being edited, and which field gets the cursor when the form opens. */
type Editing = { kind: ContactKind; id: number | null; focus?: keyof ContactFields } | null;

/** 09 · Additional support & my contacts */
export default function ContactsScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { contacts, refs, mutate } = usePlan();
  const { p, fs } = useTokens();

  // `edit` comes from the "Add … Phone" buttons on the plan and call guides.
  const initialEditing = (): Editing => {
    if (edit !== 'doctor' && edit !== 'pharmacy' && edit !== 'insurance' && edit !== 'assistance') return null;
    const existing = contacts.find((c) => c.kind === edit);
    return { kind: edit, id: existing?.id ?? null, focus: 'phone' };
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
    const label = CONTACT_KIND_LABEL[kind];
    if (editing && editing.kind === kind && editing.id === (c?.id ?? null)) {
      return (
        <ScrollIntoView key={`edit-${kind}-${c?.id ?? 'new'}`}>
          <ContactEditor
            kind={kind}
            contact={c}
            focus={editing.focus}
            onCancel={() => setEditing(null)}
            onSave={async (fields) => {
              await mutate((db, caseId) => (c ? updateContact(db, caseId, c.id, fields) : addContact(db, caseId, kind, fields)));
              setEditing(null);
              showToast(`${fields.name || label} saved`);
            }}
            onDelete={
              c && (kind === 'other' || kind === 'assistance')
                ? async () => {
                    await mutate((db, caseId) => deleteContact(db, caseId, c.id));
                    setEditing(null);
                    showToast(`${c.name || label} removed`, 'info');
                  }
                : undefined
            }
          />
        </ScrollIntoView>
      );
    }

    // Nothing saved yet: one line and one button instead of a card full of dashes.
    if (!c) {
      return (
        <Card key={`${kind}-${index}`}>
          <CardTitle icon={ICON[kind]} tone={TONE[kind]} tag={label} />
          <AppText>No {label.toLowerCase()} saved yet.</AppText>
          <Button
            size="sm"
            tone="teal"
            icon="plus"
            label={`Add ${label}`}
            onPress={() => setEditing({ kind, id: null })}
          />
        </Card>
      );
    }

    const call = c.phone ? () => callNumber(c.phone) : undefined;
    return (
      <Card key={c.id}>
        <CardTitle icon={ICON[kind]} tone={TONE[kind]} tag={label} />
        {kind === 'doctor' ? (
          <>
            <KV k="Name" v={c.name} />
            <KV k="Contact person" v={c.contactPerson} />
            <KV k="Phone · ext." v={c.phone ? `${c.phone}${c.extension ? ` · ${c.extension}` : ''}` : ''} onPress={call} />
            <KV k="Portal / website" v={c.website} />
            <KV k="Notes" v={c.notes} />
          </>
        ) : kind === 'pharmacy' ? (
          <>
            <KV k="Name" v={c.name} />
            <KV k="Phone" v={c.phone} onPress={call} />
            <KV k="Pharmacist / contact" v={c.contactPerson} />
            <KV k="Address (optional)" v={c.address} />
          </>
        ) : kind === 'insurance' ? (
          <>
            <KV k="Company · plan" v={[c.name, c.plan].filter(Boolean).join(' · ')} />
            <KV k="Member services" v={c.phone} onPress={call} />
            <KV
              k="Pharmacy benefit"
              v={c.pharmacyBenefitPhone}
              onPress={c.pharmacyBenefitPhone ? () => callNumber(c.pharmacyBenefitPhone) : undefined}
            />
            <KV k="Member ID" v={c.memberId ? maskMiddle(c.memberId) : ''} mono />
            <KV k="Group" v={c.groupNumber} />
          </>
        ) : kind === 'assistance' ? (
          <>
            <KV k="Program" v={c.name} />
            <KV k="Phone" v={c.phone} onPress={call} />
            <KV k="Case number" v={c.caseNumber} mono />
          </>
        ) : (
          <>
            <KV k="Name" v={c.name} />
            <KV k="Contact person" v={c.contactPerson} />
            <KV k="Phone" v={c.phone} onPress={call} />
            <KV k="Notes" v={c.notes} />
          </>
        )}
        {/* Outline buttons coloured by meaning (wireframe round 2): purple = phone calls,
            blue = information, teal = main action. A missing number or site becomes "Add …". */}
        <Row gap={8}>
          <Button
            size="sm"
            tone="purple"
            icon={c.phone ? 'phone' : 'plus'}
            label={c.phone ? 'Call' : 'Add Phone'}
            accessibilityLabel={c.phone ? `Call ${c.name || label}` : `Add a phone number for ${c.name || label}`}
            onPress={call ?? (() => setEditing({ kind, id: c.id, focus: 'phone' }))}
          />
          {kind === 'assistance' || kind === 'other' ? (
            <Button
              size="sm"
              tone="sky"
              icon={c.website ? 'external-link' : 'plus'}
              label={c.website ? 'Website' : 'Add Website'}
              accessibilityLabel={c.website ? `Website for ${c.name || label}` : `Add a website for ${c.name || label}`}
              onPress={
                c.website ? () => openWebsite(c.website) : () => setEditing({ kind, id: c.id, focus: 'website' })
              }
            />
          ) : null}
          <Button
            size="sm"
            tone="teal"
            icon="edit-2"
            label="Edit"
            accessibilityLabel={`Edit ${label.toLowerCase()}`}
            onPress={() => setEditing({ kind, id: c.id })}
          />
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
        <ScrollIntoView key="edit-other-new">
          <ContactEditor
            kind="other"
            contact={null}
            onCancel={() => setEditing(null)}
            onSave={async (fields) => {
              await mutate((db, caseId) => addContact(db, caseId, 'other', fields));
              setEditing(null);
              showToast(`${fields.name || 'Contact'} added`);
            }}
          />
        </ScrollIntoView>
      ) : (
        <Button
          key="add-other"
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
                    showToast(`${label} saved`);
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
  focus,
  onSave,
  onCancel,
  onDelete,
}: {
  kind: ContactKind;
  contact: Contact | null;
  /** Field that gets the cursor when the form opens; defaults to the first one. */
  focus?: keyof ContactFields;
  onSave: (fields: ContactFields) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [values, setValues] = useState<ContactFields>(() =>
    Object.fromEntries(FIELDS[kind].map((f) => [f.key, contact ? contact[f.key] : ''])),
  );
  const [saving, setSaving] = useState(false);
  const focusKey = focus && FIELDS[kind].some((f) => f.key === focus) ? focus : FIELDS[kind][0].key;

  return (
    <Card>
      <CardTitle icon={ICON[kind]} tone={TONE[kind]} tag={`${contact ? 'Edit' : 'Add'} · ${CONTACT_KIND_LABEL[kind]}`} />
      {FIELDS[kind].map((f) => {
        const common = {
          label: f.label,
          value: String(values[f.key] ?? ''),
          maxLength: f.multiline ? 1000 : 120,
          autoFocus: f.key === focusKey,
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
      {onDelete ? (
        <ConfirmButton
          label="Remove Contact"
          question={`Remove ${contact?.name || 'this contact'} from My Contacts?`}
          confirmLabel="Remove"
          onConfirm={onDelete}
        />
      ) : null}
    </Card>
  );
}

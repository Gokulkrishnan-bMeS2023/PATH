import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Chip, Field, Segmented } from '@/components/ui/form';
import { Bubble, Card, Reveal, Row, Warn } from '@/components/ui/blocks';
import { showToast } from '@/components/ui/toast';
import { usePlan } from '@/hooks/use-plan';
import { DOC_KINDS } from '@/lib/content';
import { shortDate } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { addDocument, deleteDocument } from '@/lib/repo/activity';
import type { DocKind } from '@/types/case';

type For = 'mine' | 'other';

/** 10 · Documents (optional) */
export default function DocumentsScreen() {
  const { medCase, documents, mutate } = usePlan();
  const mineLabel = medCase.whoFor === 'other' ? medCase.patientName || 'The Patient' : 'My Documents';

  const [forWhom, setForWhom] = useState<For>('mine');
  const [docName, setDocName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const upload = async () => {
    setError('');
    const typedName = docName.trim();
    if (!typedName) {
      setError('Enter a name for the document before uploading.');
      return;
    }
    setBusy(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      await mutate((db, caseId) =>
        addDocument(db, caseId, {
          kind: 'other',
          name: typedName,
          uri: a.uri,
          mimeType: a.mimeType ?? '',
          personName: forWhom === 'other' ? 'other' : '',
        }),
      );
      showToast(`${typedName} added`);
      setDocName('');
    } catch {
      setError('We couldn’t add that document. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const labelOf = (k: DocKind) => DOC_KINDS.find((d) => d.value === k)?.label ?? 'Document';
  const iconOf = (k: DocKind) => DOC_KINDS.find((d) => d.value === k)?.icon ?? 'file';

  const visibleDocs = documents
    .filter((d) => (forWhom === 'other' ? !!d.personName : !d.personName))
    .sort((a, b) => (a.name || labelOf(a.kind)).localeCompare(b.name || labelOf(b.kind), undefined, { sensitivity: 'base' }));

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Documents, optional</AppText>
      <AppText>Store a copy of a document if it helps you stay organized. Uploading is completely optional.</AppText>

      <Segmented
        options={[
          { value: 'mine', label: mineLabel },
          { value: 'other', label: 'Someone Else' },
        ]}
        value={forWhom}
        onChange={setForWhom}
      />

      <Row>
        <Field
          label="Document name"
          placeholder={forWhom === 'other' ? 'Name- Document type' : undefined}
          value={docName}
          onChangeText={setDocName}
          flex
        />
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Button variant="primary" icon="plus" label="Add" loading={busy} onPress={upload} />
        </View>
      </Row>

      {visibleDocs.map((d) => (
        <Card key={d.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Bubble icon={iconOf(d.kind)} tone="sky" />
            <View style={{ flex: 1 }}>
              <AppText variant="h2">{d.name || labelOf(d.kind)}</AppText>
              <AppText variant="small" numberOfLines={1}>
                {labelOf(d.kind)} · Added {shortDate(d.createdAt)}
              </AppText>
            </View>
            {confirmDelete !== d.id ? (
              <Chip
                label="Delete"
                onPress={() => {
                  haptics.warning();
                  setConfirmDelete(d.id);
                }}
                accessibilityLabel={`Delete ${d.name}`}
              />
            ) : null}
          </View>
          {confirmDelete === d.id ? (
            <Reveal style={{ gap: 8 }}>
              <AppText variant="strong" accessibilityRole="alert">
                Delete this {labelOf(d.kind).toLowerCase()} from the app?
              </AppText>
              <Row>
                <Button size="sm" tone="neutral" icon="x" label="Keep" onPress={() => setConfirmDelete(null)} />
                <Button
                  size="sm"
                  variant="danger"
                  icon="trash-2"
                  label="Delete"
                  onPress={async () => {
                    await mutate((db, caseId) => deleteDocument(db, caseId, d.id));
                    setConfirmDelete(null);
                    showToast(`${labelOf(d.kind)} deleted`, 'info');
                  }}
                />
              </Row>
            </Reveal>
          ) : null}
        </Card>
      ))}

      {error ? <Warn>{error}</Warn> : null}

      <Row>
        <Button variant="primary" icon="upload" label="Upload Document" loading={busy} onPress={upload} />
        <Button label="Skip" onPress={() => (router.canGoBack() ? router.back() : router.replace('/plan'))} />
      </Row>

      <AppText variant="small">Every other feature works without an upload.</AppText>
    </Screen>
  );
}

import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Checkbox, Chip, ChipSelect, Field } from '@/components/ui/form';
import { Card, Note, Row, Warn } from '@/components/ui/blocks';
import { usePlan } from '@/hooks/use-plan';
import { REMIND_LABEL, REMIND_OFFSET_DAYS, REMIND_OPTIONS } from '@/lib/content';
import { addDaysISO, dateError, maskDateInput, parseUSDate, shortDate, toUSDate, todayISO } from '@/lib/dates';
import { deleteTask, saveTask, setTaskDone } from '@/lib/repo/activity';
import { callNumber, openWebsite } from '@/lib/phone';
import { useTokens } from '@/theme/use-tokens';
import type { RemindOption, Task } from '@/types/case';

type Form = {
  title: string;
  organization: string;
  phoneOrUrl: string;
  reason: string;
  due: string;
  reminder: string;
  dueUnknown: boolean;
  remindOption: RemindOption | null;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyDevice: boolean;
  notes: string;
};

const emptyForm = (prefill?: Partial<Form>): Form => ({
  title: '',
  organization: '',
  phoneOrUrl: '',
  reason: '',
  due: '',
  reminder: '',
  dueUnknown: false,
  remindOption: '1_day',
  notifyInApp: true,
  notifyEmail: false,
  notifyDevice: false,
  notes: '',
  ...prefill,
});

const fromTask = (t: Task): Form => ({
  title: t.title,
  organization: t.organization,
  phoneOrUrl: t.phoneOrUrl,
  reason: t.reason,
  due: toUSDate(t.dueDate),
  reminder: toUSDate(t.reminderDate),
  dueUnknown: t.dueUnknown,
  remindOption: t.remindOption,
  notifyInApp: t.notifyInApp,
  notifyEmail: t.notifyEmail,
  notifyDevice: t.notifyDevice,
  notes: t.notes,
});

/** 07 · Deadlines & reminders */
export default function RemindersScreen() {
  const params = useLocalSearchParams<{ title?: string; org?: string; phone?: string }>();
  const { tasks, mutate } = usePlan();
  const { p } = useTokens();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(() =>
    emptyForm({ title: params.title ?? '', organization: params.org ?? '', phoneOrUrl: params.phone ?? '' }),
  );
  const [errors, setErrors] = useState<{ title?: string; due?: string; reminder?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const today = todayISO();

  const save = async () => {
    const next = {
      title: form.title.trim() ? undefined : 'Give the task a name.',
      due: form.dueUnknown ? undefined : dateError(form.due),
      reminder: dateError(form.reminder),
    };
    setErrors(next);
    if (next.title || next.due || next.reminder) return;

    const dueDate = form.dueUnknown ? null : parseUSDate(form.due);
    let reminderDate = parseUSDate(form.reminder);
    if (!reminderDate && dueDate && form.remindOption && form.remindOption in REMIND_OFFSET_DAYS) {
      reminderDate = addDaysISO(dueDate, -REMIND_OFFSET_DAYS[form.remindOption]);
    }
    if (!reminderDate && form.remindOption === 'weekly') reminderDate = addDaysISO(today, 7);

    setSaving(true);
    try {
      await mutate((db, caseId) =>
        saveTask(
          db,
          caseId,
          {
            title: form.title.trim(),
            organization: form.organization.trim(),
            phoneOrUrl: form.phoneOrUrl.trim(),
            reason: form.reason.trim(),
            dueDate,
            reminderDate,
            dueUnknown: form.dueUnknown,
            remindOption: form.remindOption,
            notifyInApp: form.notifyInApp,
            notifyEmail: form.notifyEmail,
            notifyDevice: form.notifyDevice,
            notes: form.notes.trim(),
          },
          editingId ?? undefined,
        ),
      );
      setForm(emptyForm());
      setEditingId(null);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const contactAction = (t: Task) => {
    if (!t.phoneOrUrl) return null;
    const isPhone = /^[0-9()\-\s+.]+$/.test(t.phoneOrUrl);
    return (
      <Button
        size="sm"
        icon={isPhone ? 'phone' : 'external-link'}
        label={isPhone ? 'Call' : 'Website'}
        onPress={() => (isPhone ? callNumber(t.phoneOrUrl) : openWebsite(t.phoneOrUrl))}
      />
    );
  };

  return (
    <Screen left={{ kind: 'back' }}>
      <AppText variant="h1">Deadlines &amp; reminders</AppText>

      {tasks.length === 0 ? <Note>No tasks yet. Add one below, or record a call with a follow-up date.</Note> : null}

      {tasks.map((t) => {
        const overdue = !t.done && !!t.dueDate && t.dueDate < today;
        const reminderDue = !t.done && !!t.reminderDate && t.reminderDate <= today;
        return (
          <Card key={t.id} style={t.done ? { opacity: 0.7 } : undefined}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <AppText variant="h2" style={{ flex: 1, textDecorationLine: t.done ? 'line-through' : 'none' }}>
                {t.title}
              </AppText>
              {t.dueDate ? (
                <AppText variant="tag" color={overdue ? p.coral : undefined}>
                  {overdue ? 'Overdue ' : 'Due '}
                  {shortDate(t.dueDate)}
                </AppText>
              ) : t.dueUnknown ? (
                <AppText variant="tag">Date unknown</AppText>
              ) : null}
            </View>
            <AppText variant="small">
              {[
                t.organization,
                t.phoneOrUrl,
                t.remindOption ? `Reminder ${REMIND_LABEL[t.remindOption].toLowerCase()}` : null,
                t.done ? 'Done' : 'Pending',
              ]
                .filter(Boolean)
                .join(' · ')}
            </AppText>
            {t.reason ? <AppText>{t.reason}</AppText> : null}
            {reminderDue ? <Chip tone="due" label="Reminder due" /> : null}
            <Row>
              <Button
                size="sm"
                icon="edit-2"
                label="Edit"
                onPress={() => {
                  setEditingId(t.id);
                  setForm(fromTask(t));
                  setSaved(false);
                }}
              />
              <Button
                size="sm"
                icon={t.done ? 'rotate-ccw' : 'check'}
                label={t.done ? 'Undo' : 'Mark done'}
                onPress={() => mutate((db, caseId) => setTaskDone(db, caseId, t.id, !t.done))}
              />
            </Row>
            {contactAction(t)}
          </Card>
        );
      })}

      {saved ? <Note icon="check-circle">Task saved.</Note> : null}

      <AppText variant="h2">{editingId ? 'Edit task' : 'Add a task'}</AppText>
      <Field label="Task name" required placeholder="e.g. Call insurance" maxLength={100} value={form.title} onChangeText={(v) => set('title', v)} error={errors.title} />
      <Field label="Organization / contact" placeholder="Who" maxLength={80} value={form.organization} onChangeText={(v) => set('organization', v)} />
      <Field label="Phone or website" placeholder="Phone or URL" autoCapitalize="none" maxLength={120} value={form.phoneOrUrl} onChangeText={(v) => set('phoneOrUrl', v)} />
      <Field label="Reason" placeholder="Why this task" maxLength={200} value={form.reason} onChangeText={(v) => set('reason', v)} />
      {!form.dueUnknown ? (
        <Row>
          <Field
            label="Due date"
            placeholder="MM/DD/YYYY"
            keyboardType="number-pad"
            value={form.due}
            onChangeText={(v) => set('due', maskDateInput(v))}
            error={errors.due}
          />
          <Field
            label="Reminder date"
            placeholder="MM/DD/YYYY"
            keyboardType="number-pad"
            value={form.reminder}
            onChangeText={(v) => set('reminder', maskDateInput(v))}
            error={errors.reminder}
          />
        </Row>
      ) : null}
      <Button
        size="sm"
        icon={form.dueUnknown ? 'calendar' : 'help-circle'}
        label={form.dueUnknown ? 'I Know the Date' : 'I Don’t Know the Follow-Up Date'}
        onPress={() => set('dueUnknown', !form.dueUnknown)}
      />
      {form.dueUnknown ? (
        <Note>Added to your call guide: “Before ending the call, ask when you should follow up.”</Note>
      ) : null}

      <AppText variant="h2">Remind me</AppText>
      <ChipSelect options={REMIND_OPTIONS} value={form.remindOption} onChange={(v) => set('remindOption', v)} label="Remind me" />

      <AppText variant="h2">Notify by</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18 }}>
        <Checkbox label="In-app" checked={form.notifyInApp} onChange={(v) => set('notifyInApp', v)} />
        <Checkbox label="Email" checked={form.notifyEmail} onChange={(v) => set('notifyEmail', v)} />
        <Checkbox label="Device" checked={form.notifyDevice} onChange={(v) => set('notifyDevice', v)} />
      </View>
      {form.notifyEmail || form.notifyDevice ? (
        <AppText variant="small">
          Your choice is saved. For now, reminders appear in the app on your Action Plan; email and device alerts are
          coming later.
        </AppText>
      ) : null}
      <Field label="Notes" placeholder="Optional" multiline maxLength={1000} value={form.notes} onChangeText={(v) => set('notes', v)} />

      {errors.title || errors.due || errors.reminder ? <Warn>Please fix the highlighted fields.</Warn> : null}
      <Button variant="primary" icon="save" label={editingId ? 'Save Changes' : 'Save Task'} loading={saving} onPress={save} />
      {editingId ? (
        <Row>
          <Button
            size="sm"
            label="Cancel Edit"
            onPress={() => {
              setEditingId(null);
              setForm(emptyForm());
            }}
          />
          <Button
            size="sm"
            icon="trash-2"
            label="Delete Task"
            onPress={async () => {
              await mutate((db, caseId) => deleteTask(db, caseId, editingId));
              setEditingId(null);
              setForm(emptyForm());
            }}
          />
        </Row>
      ) : null}
      <AppText variant="small">
        Only enter deadlines given to you by your insurer, a notice, your clinician, pharmacy or assistance program. The
        app never invents deadlines.
      </AppText>
      <Button variant="ghost" label="Back to My Plan" onPress={() => router.dismissTo('/plan')} />
    </Screen>
  );
}

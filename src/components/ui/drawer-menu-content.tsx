import React from 'react';
import { View } from 'react-native';
import { router, type Href } from 'expo-router';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/form';
import { Screen } from '@/components/ui/screen';
import { Bubble, Card, Section } from '@/components/ui/blocks';
import { AccessibilityControls } from '@/components/accessibility-controls';
import { useAuth } from '@/context/auth-context';
import { useCase } from '@/context/case-context';
import { ROLE_LABEL } from '@/lib/content';

/** 14 · Menu — content of the drawer opened by the hamburger "Menu" chip. */
export function DrawerMenuContent({ navigation }: DrawerContentComponentProps) {
  const { user } = useAuth();
  const { data: activeCase } = useCase();

  const go = (href: Href) => {
    navigation.closeDrawer();
    router.push(href);
  };
  // Plan screens need an open case; without one, start a case instead.
  const goPlan = (href: Href) => go(activeCase ? href : '/problem-selection');

  return (
    <Screen
      menu={false}
      right={<Chip tone="bar" icon="x" label="Close" accessibilityLabel="Close menu" onPress={() => navigation.closeDrawer()} />}>
      {user ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Bubble icon="user" tone="solid" size={56} />
            <View style={{ flex: 1 }}>
              <AppText variant="h2">
                {user.firstName} {user.lastName}
              </AppText>
              <AppText variant="small" numberOfLines={1}>
                {ROLE_LABEL[user.role]} · {user.email}
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}

      <Section title="My Profile" icon="user" tone="teal" onPress={() => go('/profile')} />
      <Section title="My Action Plan" icon="clipboard" tone="sky" onPress={() => goPlan('/plan')} />
      <Section title="Deadlines and Reminders" icon="calendar" tone="sun" onPress={() => goPlan('/plan/reminders')} />
      <Section title="My Contacts" icon="users" tone="purple" onPress={() => goPlan('/plan/contacts')} />
      <Section title="Insurance and Pharmacy Terms" icon="book-open" tone="teal" onPress={() => go('/terms')} />
      <Section title="Accessibility" icon="accessibility" tone="sky">
        <AccessibilityControls readAloudText="Menu. My Profile, My Action Plan, Deadlines and Reminders, My Contacts, Insurance and Pharmacy Terms, Accessibility, Start Another Medication Case, Log Out." />
      </Section>
      <Section title="Start Another Medication Case" icon="plus" tone="green" onPress={() => go('/problem-selection')} />

      {/* Pushes Log Out to the bottom of the drawer. */}
      <View style={{ flexGrow: 1 }} />
      <Button variant="danger-outline" icon="log-out" label="Log Out" onPress={() => go('/logout')} />
    </Screen>
  );
}

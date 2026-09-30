import React from 'react';
import { View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/form';
import { Bubble, Card, Section } from '@/components/ui/blocks';
import { AccessibilityControls } from '@/components/accessibility-controls';
import { useAuth } from '@/context/auth-context';
import { useCase } from '@/context/case-context';
import { ROLE_LABEL } from '@/lib/content';

/** Leave the menu, then open the chosen screen in its place. */
function go(href: Href) {
  if (router.canGoBack()) router.back();
  router.push(href);
}

/** 14 · Menu */
export default function MenuScreen() {
  const { user } = useAuth();
  const { data: activeCase } = useCase();
  const close = () => (router.canGoBack() ? router.back() : router.replace(activeCase ? '/plan' : '/problem-selection'));

  return (
    <Screen
      left={{ kind: 'brand' }}
      menu={false}
      right={<Chip tone="bar" icon="x" label="Close" accessibilityLabel="Close menu" onPress={close} />}>
      {user ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Bubble icon="user" tone="solid" size={40} />
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
      {activeCase ? (
        <>
          <Section title="My Action Plan" icon="map" tone="sky" onPress={() => go('/plan')} />
          <Section title="Deadlines and Reminders" icon="calendar" tone="sun" onPress={() => go('/plan/reminders')} />
          <Section title="My Contacts" icon="users" tone="purple" onPress={() => go('/plan/contacts')} />
          <Section title="Insurance and Pharmacy Terms" icon="book-open" tone="teal" onPress={() => go('/plan/terms')} />
        </>
      ) : null}
      <Section title="Accessibility" icon="eye" tone="sky">
        <AccessibilityControls readAloudText="Menu. My Profile, My Action Plan, Deadlines and Reminders, My Contacts, Insurance and Pharmacy Terms, Accessibility, Start Another Medication Case, Log Out." />
      </Section>
      <Section title="Start Another Medication Case" icon="plus-circle" tone="green" onPress={() => go('/problem-selection')} />

      <View style={{ flexGrow: 1, minHeight: 8 }} />
      <Button icon="log-out" label="Log Out" onPress={() => go('/logout')} />
    </Screen>
  );
}

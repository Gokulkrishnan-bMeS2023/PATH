import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/form';
import { Bubble, Card, Section } from '@/components/ui/blocks';
import { AccessibilityControls } from '@/components/accessibility-controls';
import { useAuth } from '@/context/auth-context';
import { useCase } from '@/context/case-context';
import { ROLE_LABEL } from '@/lib/content';
import { useTokens } from '@/theme/use-tokens';

/** Content of the real drawer navigator opened by the hamburger "Menu" chip. */
export function DrawerMenuContent({ navigation }: DrawerContentComponentProps) {
  const { user } = useAuth();
  const { data: activeCase } = useCase();
  const { p } = useTokens();

  const go = (href: Href) => {
    navigation.closeDrawer();
    router.push(href);
  };

  return (
    <DrawerContentScrollView contentContainerStyle={[styles.body, { backgroundColor: p.bg }]}>
      <View style={styles.header}>
        <AppText variant="h2">Menu</AppText>
        <Chip icon="x" label="Close" accessibilityLabel="Close menu" onPress={() => navigation.closeDrawer()} />
      </View>

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

      <Button icon="log-out" label="Log Out" onPress={() => go('/logout')} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { padding: 16, gap: 16 },
});

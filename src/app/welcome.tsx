import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/form';
import { BrandArt, Note } from '@/components/ui/blocks';
import { AccessibilityControls } from '@/components/accessibility-controls';
import { useAccessibility } from '@/context/accessibility-context';
import { translations } from '@/constants/translations';

/** 01 · Welcome */
export default function WelcomeScreen() {
  const { language, cycleTextScale, textScale } = useAccessibility();
  const t = translations[language] || translations.en;

  return (
    <Screen
      left={{ kind: 'brand' }}
      footer={false}
      right={
        <Chip
          tone="bar"
          label="Aa"
          onPress={cycleTextScale}
          accessibilityLabel={`Accessibility: change text size. Currently ${textScale}`}
        />
      }>
      <BrandArt height={150} />
      <AppText variant="h1">{t.headline}</AppText>
      <AppText>{t.description}</AppText>

      <View style={{ flexGrow: 1, minHeight: 8 }} />

      <Button variant="primary" icon="user-plus" label={t.createAccount} onPress={() => router.push('/register')} />
      <Button icon="log-in" label={t.logIn} onPress={() => router.push('/login')} />

      <AppText variant="label" style={{ marginTop: 8 }}>
        {t.accessibilityHeading}
      </AppText>
      <AccessibilityControls readAloudText={`${t.headline} ${t.description} ${t.disclaimer}`} />

      <Note>{t.disclaimer}</Note>
    </Screen>
  );
}

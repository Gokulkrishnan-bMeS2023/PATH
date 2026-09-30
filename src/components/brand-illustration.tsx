import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAccessibility } from '@/context/accessibility-context';
import { translations } from '@/constants/translations';

export function BrandIllustration() {
  const { highContrast, scaleMultiplier, language } = useAccessibility();
  const t = translations[language] || translations.en;

  return (
    <View
      style={[
        styles.container,
        highContrast && styles.containerHighContrast,
      ]}
      accessibilityRole="image"
      accessibilityLabel={t.brandIllustrationText || 'Brand mark / illustration'}>
      <Text
        style={[
          styles.text,
          { fontSize: 13 * scaleMultiplier },
          highContrast && styles.textHighContrast,
        ]}>
        {t.brandIllustrationText || 'Brand mark / illustration'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    backgroundColor: '#FAFBFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
  },
  containerHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontFamily: 'monospace',
    color: '#64748B',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  textHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
});

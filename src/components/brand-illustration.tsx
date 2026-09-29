import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/accessibility-context';

export function BrandIllustration() {
  const { highContrast, scaleMultiplier } = useAccessibility();

  return (
    <View
      style={[
        styles.container,
        highContrast && styles.containerHighContrast,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Brand mark and illustration placeholder">
      <View style={styles.iconRow}>
        <View style={[styles.iconBubble, highContrast && styles.iconBubbleHighContrast]}>
          <Ionicons
            name="medkit-outline"
            size={24 * scaleMultiplier}
            color={highContrast ? '#000000' : '#0E6B60'}
          />
        </View>
        <Ionicons
          name="arrow-forward"
          size={16 * scaleMultiplier}
          color={highContrast ? '#000000' : '#94A3B8'}
          style={styles.arrow}
        />
        <View style={[styles.iconBubble, highContrast && styles.iconBubbleHighContrast]}>
          <Ionicons
            name="navigate-outline"
            size={24 * scaleMultiplier}
            color={highContrast ? '#000000' : '#0E6B60'}
          />
        </View>
        <Ionicons
          name="arrow-forward"
          size={16 * scaleMultiplier}
          color={highContrast ? '#000000' : '#94A3B8'}
          style={styles.arrow}
        />
        <View style={[styles.iconBubble, highContrast && styles.iconBubbleHighContrast]}>
          <Ionicons
            name="checkmark-circle-outline"
            size={24 * scaleMultiplier}
            color={highContrast ? '#000000' : '#0E6B60'}
          />
        </View>
      </View>

      <Text
        style={[
          styles.text,
          { fontSize: 13 * scaleMultiplier },
          highContrast && styles.textHighContrast,
        ]}>
        Brand mark / illustration
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  arrow: {
    marginHorizontal: 2,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBubbleHighContrast: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
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

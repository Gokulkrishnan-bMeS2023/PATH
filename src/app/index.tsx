import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/accessibility-context';
import { translations } from '@/constants/translations';
import { BrandIllustration } from '@/components/brand-illustration';
import { LanguageModal } from '@/components/language-modal';

export default function WelcomeScreen() {
  const router = useRouter();
  const {
    textScale,
    scaleMultiplier,
    cycleTextScale,
    highContrast,
    toggleHighContrast,
    isReading,
    toggleReadAloud,
    language,
  } = useAccessibility();

  const t = translations[language] || translations.en;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleReadAloud = () => {
    const speechScript = `${t.headline}. ${t.description}. ${t.disclaimer}`;
    toggleReadAloud(speechScript);
  };

  const getTextScaleLabel = () => {
    if (textScale === 'large') return '120%';
    if (textScale === 'xlarge') return '140%';
    return '100%';
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        highContrast && styles.safeAreaHighContrast,
      ]}
      edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Top In-App Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.appNameContainer}>
              <View
                style={[
                  styles.appLogoPlaceholder,
                  highContrast && styles.appLogoPlaceholderHighContrast,
                ]}>
                <Ionicons
                  name="square-outline"
                  size={18 * scaleMultiplier}
                  color={highContrast ? '#000000' : '#64748B'}
                />
              </View>
              <Text
                style={[
                  styles.appNameText,
                  { fontSize: 16 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                App name
              </Text>
            </View>

            {/* Top Right 'Aa' Text Size Button */}
            <TouchableOpacity
              onPress={cycleTextScale}
              accessibilityRole="button"
              accessibilityLabel={`Change text size. Currently ${getTextScaleLabel()}`}
              accessibilityHint="Cycles between normal, large, and extra large text size"
              style={[
                styles.aaButton,
                textScale !== 'normal' && styles.aaButtonActive,
                highContrast && styles.aaButtonHighContrast,
              ]}>
              <Text
                style={[
                  styles.aaButtonText,
                  highContrast && styles.textHighContrast,
                ]}>
                Aa
              </Text>
              {textScale !== 'normal' && <View style={styles.activeDot} />}
            </TouchableOpacity>
          </View>

          {/* Brand Mark / Illustration Area */}
          <View style={styles.illustrationWrapper}>
            <BrandIllustration />
          </View>

          {/* Main Headline */}
          <Text
            style={[
              styles.headline,
              { fontSize: 24 * scaleMultiplier, lineHeight: 32 * scaleMultiplier },
              highContrast && styles.headlineHighContrast,
            ]}>
            {t.headline}
          </Text>

          {/* Subtitle / Description Paragraph */}
          <Text
            style={[
              styles.description,
              { fontSize: 15 * scaleMultiplier, lineHeight: 23 * scaleMultiplier },
              highContrast && styles.descriptionHighContrast,
            ]}>
            {t.description}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Create Account Button (Solid Teal) */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                highContrast && styles.primaryButtonHighContrast,
              ]}
              onPress={() => router.push('/register')}
              accessibilityRole="button"
              accessibilityLabel={t.createAccount}>
              <Text
                style={[
                  styles.primaryButtonText,
                  { fontSize: 16 * scaleMultiplier },
                ]}>
                {t.createAccount}
              </Text>
            </TouchableOpacity>

            {/* Log In Button (White with border) */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                highContrast && styles.secondaryButtonHighContrast,
              ]}
              onPress={() => router.push('/login')}
              accessibilityRole="button"
              accessibilityLabel={t.logIn}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  { fontSize: 16 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {t.logIn}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Accessibility Section */}
          <View style={styles.accessibilitySection}>
            <View style={styles.accessibilityHeadingRow}>
              <Text
                style={[
                  styles.accessibilityHeading,
                  { fontSize: 14 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {t.accessibilityHeading}
              </Text>
              {highContrast && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>High Contrast Active</Text>
                </View>
              )}
            </View>

            {/* 2x2 Grid of Accessibility Controls */}
            <View style={styles.accessibilityGrid}>
              {/* Increase Text Size */}
              <TouchableOpacity
                style={[
                  styles.accessCard,
                  textScale !== 'normal' && styles.accessCardActive,
                  highContrast && styles.accessCardHighContrast,
                ]}
                onPress={cycleTextScale}
                accessibilityRole="button"
                accessibilityLabel={`${t.increaseTextSize}, current size ${getTextScaleLabel()}`}>
                <Text
                  style={[
                    styles.accessCardText,
                    { fontSize: 13 * scaleMultiplier },
                    highContrast && styles.textHighContrast,
                  ]}
                  numberOfLines={2}>
                  {t.increaseTextSize}
                </Text>
                {textScale !== 'normal' && (
                  <Text style={styles.indicatorText}>{getTextScaleLabel()}</Text>
                )}
              </TouchableOpacity>

              {/* High Contrast */}
              <TouchableOpacity
                style={[
                  styles.accessCard,
                  highContrast && styles.accessCardActive,
                  highContrast && styles.accessCardHighContrast,
                ]}
                onPress={toggleHighContrast}
                accessibilityRole="button"
                accessibilityLabel={`${t.highContrast}, ${highContrast ? 'enabled' : 'disabled'}`}>
                <Text
                  style={[
                    styles.accessCardText,
                    { fontSize: 13 * scaleMultiplier },
                    highContrast && styles.textHighContrast,
                  ]}
                  numberOfLines={2}>
                  {t.highContrast}
                </Text>
                {highContrast && <Text style={styles.indicatorText}>ON</Text>}
              </TouchableOpacity>

              {/* Read Page Aloud */}
              <TouchableOpacity
                style={[
                  styles.accessCard,
                  isReading && styles.accessCardReading,
                  highContrast && styles.accessCardHighContrast,
                ]}
                onPress={handleReadAloud}
                accessibilityRole="button"
                accessibilityLabel={isReading ? t.stopReading : t.readAloud}>
                <View style={styles.readAloudContent}>
                  {isReading && (
                    <Ionicons
                      name="volume-high"
                      size={15 * scaleMultiplier}
                      color={highContrast ? '#000000' : '#0E6B60'}
                      style={styles.speakingIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.accessCardText,
                      { fontSize: 13 * scaleMultiplier },
                      isReading && styles.accessCardTextReading,
                      highContrast && styles.textHighContrast,
                    ]}
                    numberOfLines={2}>
                    {isReading ? t.stopReading : t.readAloud}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Choose Language */}
              <TouchableOpacity
                style={[
                  styles.accessCard,
                  highContrast && styles.accessCardHighContrast,
                ]}
                onPress={() => setLanguageModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={`${t.chooseLanguage}, currently ${language.toUpperCase()}`}>
                <Text
                  style={[
                    styles.accessCardText,
                    { fontSize: 13 * scaleMultiplier },
                    highContrast && styles.textHighContrast,
                  ]}
                  numberOfLines={2}>
                  {t.chooseLanguage}
                </Text>
                {language !== 'en' && (
                  <Text style={styles.indicatorText}>{language.toUpperCase()}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Informational Disclaimer Card */}
          <View
            style={[
              styles.disclaimerCard,
              highContrast && styles.disclaimerCardHighContrast,
            ]}
            accessible={true}
            accessibilityRole="text">
            <Text
              style={[
                styles.disclaimerText,
                { fontSize: 12.5 * scaleMultiplier, lineHeight: 18 * scaleMultiplier },
                highContrast && styles.disclaimerTextHighContrast,
              ]}>
              {t.disclaimer}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeAreaHighContrast: {
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  appLogoPlaceholderHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
  },
  appNameText: {
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  aaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  aaButtonActive: {
    borderColor: '#0E6B60',
    backgroundColor: '#F0FDF9',
  },
  aaButtonHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  aaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  activeDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0E6B60',
  },
  illustrationWrapper: {
    marginBottom: 18,
  },
  headline: {
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  headlineHighContrast: {
    color: '#000000',
    fontWeight: '900',
  },
  description: {
    color: '#475569',
    marginBottom: 24,
    fontWeight: '400',
  },
  descriptionHighContrast: {
    color: '#000000',
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0E6B60',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonHighContrast: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonHighContrast: {
    borderWidth: 2.5,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  accessibilitySection: {
    marginBottom: 20,
  },
  accessibilityHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  accessibilityHeading: {
    fontWeight: '700',
    color: '#334155',
  },
  badgeContainer: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  accessibilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    position: 'relative',
  },
  accessCardActive: {
    borderColor: '#0E6B60',
    backgroundColor: '#F0FDF9',
  },
  accessCardReading: {
    borderColor: '#0E6B60',
    backgroundColor: '#ECFDF5',
  },
  accessCardHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  accessCardText: {
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'center',
  },
  accessCardTextReading: {
    color: '#0E6B60',
  },
  readAloudContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speakingIcon: {
    marginRight: 2,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0E6B60',
    marginTop: 2,
  },
  disclaimerCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  disclaimerCardHighContrast: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  disclaimerText: {
    color: '#4B5563',
    textAlign: 'left',
  },
  disclaimerTextHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
  textHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
});

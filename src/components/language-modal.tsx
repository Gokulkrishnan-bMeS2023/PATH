import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAccessibility,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '@/context/accessibility-context';
import { translations } from '@/constants/translations';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const { language, setLanguage, highContrast, scaleMultiplier } = useAccessibility();
  const t = translations[language] || translations.en;

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, highContrast && styles.modalContentHighContrast]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                { fontSize: 18 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              {t.selectLanguageTitle}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.close}
              style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24 * scaleMultiplier}
                color={highContrast ? '#000000' : '#475569'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.languageOption,
                    isSelected && styles.languageOptionSelected,
                    highContrast && styles.languageOptionHighContrast,
                    highContrast && isSelected && styles.languageOptionSelectedHighContrast,
                  ]}
                  onPress={() => handleSelect(item.code)}
                  accessibilityRole="radio"
                  aria-selected={isSelected}>
                  <View style={styles.languageTextContainer}>
                    <Text
                      style={[
                        styles.languageNativeText,
                        { fontSize: 16 * scaleMultiplier },
                        isSelected && styles.languageTextSelected,
                        highContrast && styles.textHighContrast,
                      ]}>
                      {item.nativeLabel}
                    </Text>
                    <Text
                      style={[
                        styles.languageSubText,
                        { fontSize: 13 * scaleMultiplier },
                        isSelected && styles.languageTextSelected,
                        highContrast && styles.textHighContrast,
                      ]}>
                      {item.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22 * scaleMultiplier}
                      color={highContrast ? '#000000' : '#0E6B60'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
    elevation: 8,
  },
  modalContentHighContrast: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  textHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
  closeButton: {
    padding: 6,
  },
  languageList: {
    gap: 10,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  languageOptionHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  languageOptionSelected: {
    borderColor: '#0E6B60',
    backgroundColor: '#F0FDF9',
  },
  languageOptionSelectedHighContrast: {
    borderColor: '#000000',
    backgroundColor: '#F0F0F0',
    borderWidth: 2.5,
  },
  languageTextContainer: {
    flexDirection: 'column',
  },
  languageNativeText: {
    fontWeight: '600',
    color: '#1E293B',
  },
  languageSubText: {
    color: '#64748B',
    marginTop: 2,
  },
  languageTextSelected: {
    color: '#0E6B60',
  },
});

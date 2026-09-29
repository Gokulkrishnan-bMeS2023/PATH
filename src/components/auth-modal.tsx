import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/accessibility-context';
import { translations } from '@/constants/translations';

interface AuthModalProps {
  visible: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (mode: 'login' | 'signup') => void;
}

export function AuthModal({ visible, mode, onClose, onSuccess }: AuthModalProps) {
  const { language, highContrast, scaleMultiplier } = useAccessibility();
  const t = translations[language] || translations.en;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = () => {
    if (!email || !password || (isSignup && !name)) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const msg = isSignup ? t.accountCreatedSuccess : t.loginSuccess;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Success', msg);
      }
      onSuccess(mode);
      onClose();
    }, 800);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, highContrast && styles.modalCardHighContrast]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View>
              <Text
                style={[
                  styles.title,
                  { fontSize: 20 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {isSignup ? t.createAccountTitle : t.loginTitle}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { fontSize: 13 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {isSignup ? t.createAccountSubtitle : t.loginSubtitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.close}
              style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22 * scaleMultiplier}
                color={highContrast ? '#000000' : '#475569'}
              />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#B91C1C" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {isSignup && (
              <View style={styles.fieldGroup}>
                <Text
                  style={[
                    styles.label,
                    { fontSize: 13 * scaleMultiplier },
                    highContrast && styles.textHighContrast,
                  ]}>
                  {t.nameLabel}
                </Text>
                <TextInput
                  style={[styles.input, highContrast && styles.inputHighContrast]}
                  placeholder="Jane Doe"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text
                style={[
                  styles.label,
                  { fontSize: 13 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {t.emailLabel}
              </Text>
              <TextInput
                style={[styles.input, highContrast && styles.inputHighContrast]}
                placeholder="patient@example.org"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text
                style={[
                  styles.label,
                  { fontSize: 13 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {t.passwordLabel}
              </Text>
              <TextInput
                style={[styles.input, highContrast && styles.inputHighContrast]}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                highContrast && styles.primaryBtnHighContrast,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityRole="button">
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.primaryBtnText,
                    { fontSize: 16 * scaleMultiplier },
                    highContrast && styles.btnTextHighContrast,
                  ]}>
                  {isSignup ? t.createAccount : t.logIn}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityRole="button">
              <Text
                style={[
                  styles.cancelBtnText,
                  { fontSize: 14 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                {t.cancelButton}
              </Text>
            </TouchableOpacity>
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
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  modalCardHighContrast: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    color: '#64748B',
    marginTop: 4,
    maxWidth: 280,
  },
  closeBtn: {
    padding: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  primaryBtn: {
    backgroundColor: '#0E6B60',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnHighContrast: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnTextHighContrast: {
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  textHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
});

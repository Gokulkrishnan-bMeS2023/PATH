import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/accessibility-context';

type UserRole = 'patient' | 'caregiver' | 'both';

export default function RegisterScreen() {
  const router = useRouter();
  const { highContrast, scaleMultiplier } = useAccessibility();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('patient');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const passwordsMismatch =
    (confirmPassword.length > 0 && password !== confirmPassword) ||
    (hasAttemptedSubmit && password !== confirmPassword);

  const handleCreateAccount = () => {
    setHasAttemptedSubmit(true);
    if (!password || password !== confirmPassword) {
      return;
    }
    // Navigate directly to the Problem Selection step
    router.push('/problem-selection');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        highContrast && styles.safeAreaHighContrast,
      ]}
      edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Header with < Back */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={20 * scaleMultiplier}
            color={highContrast ? '#000000' : '#0E6B60'}
          />
          <Text
            style={[
              styles.backText,
              { fontSize: 16 * scaleMultiplier },
              highContrast && styles.textHighContrast,
            ]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Segmented Switch: [ Create account | Log in ] */}
          <View
            style={[
              styles.segmentContainer,
              highContrast && styles.segmentContainerHighContrast,
            ]}>
            <View style={[styles.segmentActive, highContrast && styles.segmentActiveHighContrast]}>
              <Text
                style={[
                  styles.segmentActiveText,
                  { fontSize: 15 * scaleMultiplier },
                ]}>
                Create account
              </Text>
            </View>

            <TouchableOpacity
              style={styles.segmentInactive}
              onPress={() => router.push('/login')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Log in">
              <Text
                style={[
                  styles.segmentInactiveText,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Log in
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { fontSize: 28 * scaleMultiplier },
              highContrast && styles.titleHighContrast,
            ]}>
            Create your account
          </Text>

          {/* First name & Last name row */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfCol]}>
              <Text
                style={[
                  styles.label,
                  { fontSize: 13.5 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                First name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.inputHighContrast,
                ]}
                placeholder="First name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfCol]}>
              <Text
                style={[
                  styles.label,
                  { fontSize: 13.5 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Last name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.inputHighContrast,
                ]}
                placeholder="Last name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Email address */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.label,
                { fontSize: 13.5 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Email address
            </Text>
            <TextInput
              style={[
                styles.input,
                { fontSize: 15 * scaleMultiplier },
                highContrast && styles.inputHighContrast,
              ]}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.label,
                { fontSize: 13.5 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Username
            </Text>
            <TextInput
              style={[
                styles.input,
                { fontSize: 15 * scaleMultiplier },
                highContrast && styles.inputHighContrast,
              ]}
              placeholder="Choose a username"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.label,
                { fontSize: 13.5 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Password
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.inputHighContrast,
                ]}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={[
                  styles.showBtn,
                  highContrast && styles.showBtnHighContrast,
                ]}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <Text
                  style={[
                    styles.showBtnText,
                    { fontSize: 14 * scaleMultiplier },
                    highContrast && styles.textHighContrast,
                  ]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.helperText,
                { fontSize: 12 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              At least 8 characters · one letter and one number
            </Text>
          </View>

          {/* Confirm password */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.label,
                { fontSize: 13.5 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Confirm password
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.inputHighContrast,
                ]}
                placeholder="Re-enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={[
                  styles.showBtn,
                  highContrast && styles.showBtnHighContrast,
                ]}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                <Text
                  style={[
                    styles.showBtnText,
                    { fontSize: 14 * scaleMultiplier },
                    highContrast && styles.textHighContrast,
                  ]}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Validation Alert (as shown in wireframe) */}
          {passwordsMismatch ? (
            <View style={styles.warningBanner}>
              <Text
                style={[
                  styles.warningText,
                  { fontSize: 13.5 * scaleMultiplier },
                ]}>
                Passwords do not match.
              </Text>
            </View>
          ) : null}

          {/* Radio Group: I am using this app as a... */}
          <View style={styles.radioSection}>
            <Text
              style={[
                styles.radioTitle,
                { fontSize: 14 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              I am using this app as a...
            </Text>

            {/* Patient Option */}
            <TouchableOpacity
              style={[
                styles.radioOption,
                role === 'patient' && styles.radioOptionSelected,
                highContrast && styles.radioOptionHighContrast,
                highContrast && role === 'patient' && styles.radioOptionSelectedHighContrast,
              ]}
              onPress={() => setRole('patient')}
              accessibilityRole="radio"
              accessibilityState={{ selected: role === 'patient' }}>
              <View
                style={[
                  styles.radioCircle,
                  role === 'patient' && styles.radioCircleSelected,
                  highContrast && styles.radioCircleHighContrast,
                ]}>
                {role === 'patient' && <View style={styles.radioInnerDot} />}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Patient
              </Text>
            </TouchableOpacity>

            {/* Caregiver Option */}
            <TouchableOpacity
              style={[
                styles.radioOption,
                role === 'caregiver' && styles.radioOptionSelected,
                highContrast && styles.radioOptionHighContrast,
                highContrast && role === 'caregiver' && styles.radioOptionSelectedHighContrast,
              ]}
              onPress={() => setRole('caregiver')}
              accessibilityRole="radio"
              accessibilityState={{ selected: role === 'caregiver' }}>
              <View
                style={[
                  styles.radioCircle,
                  role === 'caregiver' && styles.radioCircleSelected,
                  highContrast && styles.radioCircleHighContrast,
                ]}>
                {role === 'caregiver' && <View style={styles.radioInnerDot} />}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Caregiver
              </Text>
            </TouchableOpacity>

            {/* Both Option */}
            <TouchableOpacity
              style={[
                styles.radioOption,
                role === 'both' && styles.radioOptionSelected,
                highContrast && styles.radioOptionHighContrast,
                highContrast && role === 'both' && styles.radioOptionSelectedHighContrast,
              ]}
              onPress={() => setRole('both')}
              accessibilityRole="radio"
              accessibilityState={{ selected: role === 'both' }}>
              <View
                style={[
                  styles.radioCircle,
                  role === 'both' && styles.radioCircleSelected,
                  highContrast && styles.radioCircleHighContrast,
                ]}>
                {role === 'both' && <View style={styles.radioInnerDot} />}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Both
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.roleHelperText,
                { fontSize: 12.5 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Wording adapts: “Contact your doctor’s office” vs “Contact the patient’s doctor’s office.”
            </Text>
          </View>

          {/* Primary CTA: Create Account */}
          <TouchableOpacity
            style={[
              styles.createBtn,
              highContrast && styles.createBtnHighContrast,
            ]}
            onPress={handleCreateAccount}
            accessibilityRole="button"
            accessibilityLabel="Create Account">
            <Text
              style={[
                styles.createBtnText,
                { fontSize: 16 * scaleMultiplier },
              ]}>
              Create Account
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.subcaption,
              { fontSize: 12.5 * scaleMultiplier },
              highContrast && styles.textHighContrast,
            ]}>
            You’ll be logged in automatically.
          </Text>

          {/* Footer Disclaimer */}
          <View style={styles.footerContainer}>
            <Text
              style={[
                styles.footerText,
                { fontSize: 11.5 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Educational and organizational support — not medical advice.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  topNav: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#0E6B60',
    fontWeight: '600',
    marginLeft: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 440,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#262626',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 28,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  segmentContainerHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  segmentActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202324',
  },
  segmentActiveHighContrast: {
    backgroundColor: '#000000',
  },
  segmentActiveText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  segmentInactive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentInactiveText: {
    fontWeight: '700',
    color: '#262626',
  },
  title: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 22,
    letterSpacing: -0.5,
  },
  titleHighContrast: {
    color: '#000000',
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
    color: '#000000',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  showBtn: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  showBtnHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  showBtnText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  helperText: {
    color: '#64748B',
    marginTop: 6,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  warningText: {
    color: '#78350F',
    fontWeight: '600',
  },
  radioSection: {
    marginTop: 4,
    marginBottom: 24,
  },
  radioTitle: {
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  radioOptionSelected: {
    borderColor: '#0E6B60',
    backgroundColor: '#E6F4F1',
  },
  radioOptionHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  radioOptionSelectedHighContrast: {
    borderColor: '#000000',
    backgroundColor: '#F3F4F6',
    borderWidth: 2.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: '#0E6B60',
  },
  radioCircleHighContrast: {
    borderColor: '#000000',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0E6B60',
  },
  radioLabel: {
    fontWeight: '600',
    color: '#1E293B',
  },
  roleHelperText: {
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  createBtn: {
    backgroundColor: '#0E6B60',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  createBtnHighContrast: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subcaption: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    color: '#64748B',
    textAlign: 'center',
  },
  textHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
});

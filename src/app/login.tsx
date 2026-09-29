import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/accessibility-context';

export default function LoginScreen() {
  const router = useRouter();
  const { highContrast, scaleMultiplier } = useAccessibility();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please enter your username/email and password.');
      return;
    }
    setErrorMessage('');
    // Successful login navigates to the Problem Selection screen
    router.push('/problem-selection');
  };

  const handleOpenCurrentPlan = () => {
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
            <TouchableOpacity
              style={styles.segmentInactive}
              onPress={() => router.push('/register')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Create account">
              <Text
                style={[
                  styles.segmentInactiveText,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Create account
              </Text>
            </TouchableOpacity>

            <View style={[styles.segmentActive, highContrast && styles.segmentActiveHighContrast]}>
              <Text
                style={[
                  styles.segmentActiveText,
                  { fontSize: 15 * scaleMultiplier },
                ]}>
                Log in
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { fontSize: 28 * scaleMultiplier },
              highContrast && styles.titleHighContrast,
            ]}>
            Welcome back
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#B91C1C" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Field: Username or email */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.label,
                { fontSize: 14 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              Username or email
            </Text>
            <TextInput
              style={[
                styles.input,
                { fontSize: 15 * scaleMultiplier },
                highContrast && styles.inputHighContrast,
              ]}
              placeholder="Username or email"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
            />
          </View>

          {/* Field: Password with Show button */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.label,
                { fontSize: 14 * scaleMultiplier },
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
          </View>

          {/* Remember me & Forgot password row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeGroup}
              onPress={() => setRememberMe(!rememberMe)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}>
              <View
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                  highContrast && styles.checkboxHighContrast,
                ]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.rememberMeText,
                  { fontSize: 14 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Forgot password">
              <Text
                style={[
                  styles.forgotPasswordText,
                  { fontSize: 14 * scaleMultiplier },
                  highContrast && styles.forgotPasswordHighContrast,
                ]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Primary CTA: Log In */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              highContrast && styles.loginButtonHighContrast,
            ]}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Log In">
            <Text
              style={[
                styles.loginButtonText,
                { fontSize: 16 * scaleMultiplier },
              ]}>
              Log In
            </Text>
          </TouchableOpacity>

          {/* Returning User Active Case Card */}
          <View
            style={[
              styles.caseCard,
              highContrast && styles.caseCardHighContrast,
            ]}>
            <Text
              style={[
                styles.caseBadge,
                highContrast && styles.caseBadgeHighContrast,
              ]}>
              RETURNING USER · ACTIVE CASE
            </Text>
            <Text
              style={[
                styles.caseSubtitle,
                { fontSize: 14 * scaleMultiplier },
                highContrast && styles.textHighContrast,
              ]}>
              You have an open medication case.
            </Text>
            <TouchableOpacity
              style={[
                styles.planButton,
                highContrast && styles.planButtonHighContrast,
              ]}
              onPress={handleOpenCurrentPlan}
              accessibilityRole="button"
              accessibilityLabel="Open My Current Plan">
              <Text
                style={[
                  styles.planButtonText,
                  { fontSize: 15 * scaleMultiplier },
                  highContrast && styles.textHighContrast,
                ]}>
                Open My Current Plan
              </Text>
            </TouchableOpacity>
          </View>

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
  title: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  titleHighContrast: {
    color: '#000000',
    fontWeight: '900',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
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
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  showBtn: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 24,
    paddingHorizontal: 20,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberMeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0E6B60',
    borderColor: '#0E6B60',
  },
  checkboxHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  rememberMeText: {
    color: '#334155',
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: '#0E6B60',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  forgotPasswordHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: '#0E6B60',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  loginButtonHighContrast: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  caseCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 40,
  },
  caseCardHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  caseBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0E6B60',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  caseBadgeHighContrast: {
    color: '#000000',
  },
  caseSubtitle: {
    color: '#334155',
    fontWeight: '500',
    marginBottom: 16,
  },
  planButton: {
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  planButtonHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  planButtonText: {
    color: '#1E293B',
    fontWeight: '700',
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

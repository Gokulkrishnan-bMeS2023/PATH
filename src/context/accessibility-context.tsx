import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export type TextScale = 'normal' | 'large' | 'xlarge';
export type SupportedLanguage = 'en' | 'es' | 'zh' | 'vi' | 'tl';

export interface AccessibilityContextType {
  textScale: TextScale;
  scaleMultiplier: number;
  cycleTextScale: () => void;
  setTextScale: (scale: TextScale) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  isReading: boolean;
  toggleReadAloud: (content?: string) => Promise<void>;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const SCALE_MULTIPLIERS: Record<TextScale, number> = {
  normal: 1.0,
  large: 1.18,
  xlarge: 1.36,
};

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { code: 'tl', label: 'Tagalog', nativeLabel: 'Filipino / Tagalog' },
];

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [textScale, setTextScale] = useState<TextScale>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isReading, setIsReading] = useState<boolean>(false);

  const scaleMultiplier = SCALE_MULTIPLIERS[textScale];

  const cycleTextScale = () => {
    setTextScale((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleReadAloud = async (content?: string) => {
    if (isReading) {
      Speech.stop();
      setIsReading(false);
      return;
    }

    const defaultSpeechText =
      content ||
      'Helping patients navigate medication-access barriers, one step at a time. ' +
      'If you are having trouble getting a prescribed medication, this app can help you understand the problem, prepare for important calls, and track what needs to happen next. ' +
      'This app provides educational and organizational support. It does not provide medical advice or make insurance decisions.';

    try {
      setIsReading(true);

      const speechLangMap: Record<SupportedLanguage, string> = {
        en: 'en-US',
        es: 'es-ES',
        zh: 'zh-CN',
        vi: 'vi-VN',
        tl: 'fil-PH',
      };

      Speech.speak(defaultSpeechText, {
        language: speechLangMap[language] || 'en-US',
        rate: 0.9,
        onDone: () => setIsReading(false),
        onStopped: () => setIsReading(false),
        onError: () => setIsReading(false),
      });
    } catch {
      setIsReading(false);
    }
  };

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        textScale,
        scaleMultiplier,
        cycleTextScale,
        setTextScale,
        highContrast,
        toggleHighContrast,
        isReading,
        toggleReadAloud,
        language,
        setLanguage,
      }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

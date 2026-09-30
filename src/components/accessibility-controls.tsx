import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Row } from '@/components/ui/blocks';
import { LanguageModal } from '@/components/language-modal';
import { useAccessibility } from '@/context/accessibility-context';
import { translations } from '@/constants/translations';

const SCALE_LABEL = { normal: '100%', large: '120%', xlarge: '140%' } as const;

/** The 2×2 accessibility grid from the Welcome screen. */
export function AccessibilityControls({ readAloudText }: { readAloudText: string }) {
  const { textScale, cycleTextScale, highContrast, toggleHighContrast, isReading, toggleReadAloud, language } =
    useAccessibility();
  const t = translations[language] || translations.en;
  const [langOpen, setLangOpen] = useState(false);

  return (
    <View style={{ gap: 10 }}>
      <Row>
        <Button
          size="sm"
          icon="type"
          label={textScale === 'normal' ? t.increaseTextSize : `${t.textSizeBadge} ${SCALE_LABEL[textScale]}`}
          onPress={cycleTextScale}
          accessibilityLabel={`${t.increaseTextSize}. Currently ${SCALE_LABEL[textScale]}`}
        />
        <Button
          size="sm"
          icon="sun"
          label={highContrast ? `${t.highContrast}: on` : t.highContrast}
          onPress={toggleHighContrast}
          accessibilityLabel={`${t.highContrast}, ${highContrast ? 'on' : 'off'}`}
        />
      </Row>
      <Row>
        <Button
          size="sm"
          icon={isReading ? 'volume-x' : 'volume-2'}
          label={isReading ? t.stopReading : t.readAloud}
          onPress={() => toggleReadAloud(readAloudText)}
        />
        <Button
          size="sm"
          icon="globe"
          label={language === 'en' ? t.chooseLanguage : `${t.chooseLanguage} · ${language.toUpperCase()}`}
          onPress={() => setLangOpen(true)}
        />
      </Row>
      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

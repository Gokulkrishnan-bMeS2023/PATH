import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SuccessBadge } from '@/components/ui/blocks';
import { useAccessibility } from '@/context/accessibility-context';
import { usePlan } from '@/hooks/use-plan';
import { setCaseStatus } from '@/lib/repo/cases';
import { ArtDots } from '@/theme/tokens';

/** 13 · Success & close case */
export default function SuccessScreen() {
  const { medCase, mutate } = usePlan();
  const [closing, setClosing] = useState(false);

  const close = async () => {
    setClosing(true);
    // Leave /plan first: once the case is resolved the plan layout has no case to show.
    router.replace('/problem-selection');
    await mutate((db) => setCaseStatus(db, medCase.userId, medCase.id, 'resolved'));
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen left={{ kind: 'back' }}>
        <View style={{ height: 12 }} />
        <View style={{ alignItems: 'center' }}>
          <SuccessBadge />
        </View>
        <AppText variant="h1" align="center">
          Medication received
        </AppText>
        <AppText align="center">The medication-access goal has been completed.</AppText>
        <View style={{ height: 8 }} />
        <Button variant="primary" icon="archive" label="Close Case" loading={closing} onPress={close} />
        <Button icon="folder" label="Keep Case Open" onPress={() => router.dismissTo('/plan')} />
        <Button icon="plus-circle" label="Start Another Medication Case" onPress={() => router.push('/problem-selection')} />
        <AppText variant="small" align="center">
          Closing stops future reminders. Call history is kept unless you delete it.
        </AppText>
      </Screen>
      <Confetti />
    </View>
  );
}

function Confetti() {
  const { reduceMotion } = useAccessibility();
  const { height, width } = useWindowDimensions();
  const [pieces] = useState(() => Array.from({ length: 8 }, () => new Animated.Value(0)));

  useEffect(() => {
    if (reduceMotion) return;
    const loops = pieces.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 450),
          Animated.timing(v, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [pieces, reduceMotion]);

  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -16,
            left: `${8 + i * 12}%`,
            width: 10,
            height: 15,
            borderRadius: 2,
            backgroundColor: ArtDots[i % ArtDots.length],
            opacity: v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.min(height, 700) * 0.8] }) },
              { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, (i % 2 ? 1 : -1) * width * 0.03, 0] }) },
              { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

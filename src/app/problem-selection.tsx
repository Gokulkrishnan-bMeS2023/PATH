import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/context/accessibility-context';

interface ProblemOption {
  id: string;
  title: string;
  tags: string;
  explanations: { term: string; definition: string }[];
}

const PROBLEM_OPTIONS: ProblemOption[] = [
  {
    id: 'denied',
    title: 'Medication denied by insurance',
    tags: 'Prior authorization • Step therapy • Not covered • Quantity limit • Coverage denial • Appeal / exception',
    explanations: [
      {
        term: 'Prior authorization',
        definition: 'your plan may need approval from your doctor before it covers the medication.',
      },
      {
        term: 'Step therapy',
        definition: 'you may need to try another treatment first.',
      },
      {
        term: 'Non-formulary',
        definition: "not on the plan's covered list.",
      },
      {
        term: 'Quantity limit',
        definition: 'the plan limits how much it covers.',
      },
      {
        term: 'Appeal',
        definition: 'asking the plan to review its decision.',
      },
    ],
  },
  {
    id: 'expensive',
    title: 'Medication too expensive',
    tags: 'High copay • High deductible • High coinsurance • Unaffordable pharmacy price • Financial assistance',
    explanations: [
      {
        term: 'High copay / coinsurance',
        definition: 'the portion you must pay out-of-pocket is higher than expected.',
      },
      {
        term: 'Deductible',
        definition: 'the annual amount you must pay before insurance starts contributing.',
      },
      {
        term: 'Copay assistance',
        definition: 'manufacturer copay cards, foundation grants, or state assistance programs.',
      },
    ],
  },
  {
    id: 'delayed',
    title: 'Medication delayed or unavailable',
    tags: 'Out of stock • Backordered • Waiting for doctor / insurance • Specialty pharmacy • Wrong pharmacy • Shipment delayed',
    explanations: [
      {
        term: 'Specialty pharmacy',
        definition: 'requires cold-chain shipping or specialized clinical dispensing.',
      },
      {
        term: 'Backorder',
        definition: 'temporary supply interruption at the manufacturer or wholesaler level.',
      },
      {
        term: 'Prescription routing',
        definition: 'prescription sent to an out-of-network pharmacy needing transfer.',
      },
    ],
  },
  {
    id: 'unsure',
    title: 'I’m not sure what is preventing access',
    tags: "Confusing insurance letter • Unclear pharmacy message • Don't know what to do next",
    explanations: [
      {
        term: 'Complex denial notices',
        definition: 'letters often mix multiple standard insurance codes and disclaimers.',
      },
      {
        term: 'Guided diagnosis',
        definition: 'we will walk you through a step-by-step checklist to isolate the blocker.',
      },
    ],
  },
];

export default function ProblemSelectionScreen() {
  const router = useRouter();
  const { highContrast, scaleMultiplier } = useAccessibility();

  const [selectedProblemId, setSelectedProblemId] = useState<string>('denied');
  const [expandedId, setExpandedId] = useState<string | null>('denied');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleContinue = () => {
    const selected = PROBLEM_OPTIONS.find((p) => p.id === selectedProblemId);
    const message = `You selected: "${selected?.title}". Starting personalized access roadmap.`;
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Problem Selected', message);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        highContrast && styles.safeAreaHighContrast,
      ]}
      edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.logoBox,
              highContrast && styles.logoBoxHighContrast,
            ]}>
            <Ionicons
              name="square-outline"
              size={16 * scaleMultiplier}
              color={highContrast ? '#000000' : '#64748B'}
            />
          </View>
          <Text
            style={[
              styles.appName,
              { fontSize: 15 * scaleMultiplier },
              highContrast && styles.textHighContrast,
            ]}>
            App name
          </Text>
        </View>

        <Text
          style={[
            styles.stepBadge,
            { fontSize: 13 * scaleMultiplier },
            highContrast && styles.textHighContrast,
          ]}>
          Step 0 · Problem
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Main Title & Subtitle */}
          <Text
            style={[
              styles.headline,
              { fontSize: 26 * scaleMultiplier, lineHeight: 32 * scaleMultiplier },
              highContrast && styles.headlineHighContrast,
            ]}>
            How can we help today?
          </Text>
          <Text
            style={[
              styles.subhead,
              { fontSize: 14.5 * scaleMultiplier, lineHeight: 21 * scaleMultiplier },
              highContrast && styles.textHighContrast,
            ]}>
            Choose the closest match. You don’t need to know the technical term.
          </Text>

          {/* Cards List */}
          <View style={styles.cardsList}>
            {PROBLEM_OPTIONS.map((item) => {
              const isSelected = selectedProblemId === item.id;
              const isExpanded = expandedId === item.id;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                    highContrast && styles.cardHighContrast,
                    highContrast && isSelected && styles.cardSelectedHighContrast,
                  ]}>
                  {/* Card Title */}
                  <Text
                    style={[
                      styles.cardTitle,
                      { fontSize: 16 * scaleMultiplier },
                      highContrast && styles.textHighContrast,
                    ]}>
                    {item.title}
                  </Text>

                  {/* Tags / Subtitle */}
                  <Text
                    style={[
                      styles.cardTags,
                      { fontSize: 12.5 * scaleMultiplier, lineHeight: 18 * scaleMultiplier },
                      highContrast && styles.textHighContrast,
                    ]}>
                    {item.tags}
                  </Text>

                  {/* "What does this mean?" Collapsible Trigger */}
                  <TouchableOpacity
                    style={styles.meanRow}
                    onPress={() => toggleExpand(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`What does ${item.title} mean?`}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18 * scaleMultiplier}
                      color={highContrast ? '#000000' : '#0E6B60'}
                    />
                    <Text
                      style={[
                        styles.meanText,
                        { fontSize: 13.5 * scaleMultiplier },
                        highContrast && styles.textHighContrast,
                      ]}>
                      What does this mean?
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14 * scaleMultiplier}
                      color={highContrast ? '#000000' : '#0E6B60'}
                    />
                  </TouchableOpacity>

                  {/* Expanded Explanations Box */}
                  {isExpanded && (
                    <View
                      style={[
                        styles.explanationBox,
                        highContrast && styles.explanationBoxHighContrast,
                      ]}>
                      {item.explanations.map((exp, idx) => (
                        <Text
                          key={idx}
                          style={[
                            styles.expText,
                            { fontSize: 12.5 * scaleMultiplier, lineHeight: 19 * scaleMultiplier },
                            highContrast && styles.textHighContrast,
                          ]}>
                          <Text style={styles.expTerm}>{exp.term} — </Text>
                          {exp.definition}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Card Select Button */}
                  {isSelected ? (
                    <TouchableOpacity
                      style={[
                        styles.selectedBtn,
                        highContrast && styles.selectedBtnHighContrast,
                      ]}
                      onPress={() => setSelectedProblemId(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title} selected`}>
                      <Text
                        style={[
                          styles.selectedBtnText,
                          { fontSize: 15 * scaleMultiplier },
                        ]}>
                        Selected
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.unselectedBtn,
                        highContrast && styles.unselectedBtnHighContrast,
                      ]}
                      onPress={() => setSelectedProblemId(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select problem: ${item.title}`}>
                      <Text
                        style={[
                          styles.unselectedBtnText,
                          { fontSize: 15 * scaleMultiplier },
                          highContrast && styles.textHighContrast,
                        ]}>
                        Select This Problem
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Continue button */}
      <View
        style={[
          styles.stickyBottomBar,
          highContrast && styles.stickyBottomBarHighContrast,
        ]}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            highContrast && styles.continueBtnHighContrast,
          ]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step">
          <Text
            style={[
              styles.continueBtnText,
              { fontSize: 16 * scaleMultiplier },
            ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  logoBoxHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
  },
  appName: {
    fontWeight: '700',
    color: '#0F172A',
  },
  stepBadge: {
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Space for sticky bottom bar
  },
  content: {
    width: '100%',
    maxWidth: 440,
  },
  headline: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headlineHighContrast: {
    color: '#000000',
    fontWeight: '900',
  },
  subhead: {
    color: '#475569',
    marginBottom: 20,
    fontWeight: '400',
  },
  cardsList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 16,
  },
  cardSelected: {
    backgroundColor: '#E6F4F1',
    borderColor: '#0E6B60',
    borderWidth: 1.5,
  },
  cardHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  cardSelectedHighContrast: {
    borderColor: '#000000',
    borderWidth: 3,
    backgroundColor: '#F3F4F6',
  },
  cardTitle: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  cardTags: {
    color: '#64748B',
    marginBottom: 12,
  },
  meanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  meanText: {
    color: '#0E6B60',
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  explanationBoxHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  expText: {
    color: '#334155',
  },
  expTerm: {
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedBtn: {
    backgroundColor: '#0E6B60',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBtnHighContrast: {
    backgroundColor: '#000000',
  },
  selectedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  unselectedBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedBtnHighContrast: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  unselectedBtnText: {
    color: '#1E293B',
    fontWeight: '700',
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  stickyBottomBarHighContrast: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  continueBtn: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0E6B60',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnHighContrast: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textHighContrast: {
    color: '#000000',
    fontWeight: '700',
  },
});

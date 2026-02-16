import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, serifFont, sansFont, spacing, radius } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to PG Essays',
    description: 'Read all 228 of Paul Graham\'s essays in a calm, distraction-free experience.',
    icon: '📚',
  },
  {
    title: 'Tap to Reveal UI',
    description: 'Tap anywhere on the screen while reading to show or hide the interface controls.',
    icon: '👆',
  },
  {
    title: 'Swipe to Close',
    description: 'Swipe down to dismiss the reader and return to your library.',
    icon: '👇',
  },
  {
    title: 'Scroll to Focus',
    description: 'Start scrolling to automatically hide the UI and focus on reading.',
    icon: '📖',
  },
];

export default function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    setCurrentStep(0);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip tutorial"
            accessibilityRole="button"
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.icon}>{step.icon}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>

          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            accessibilityLabel={isLastStep ? 'Done' : 'Next'}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Start Reading' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  nextButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.md,
    minWidth: 140,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: sansFont,
    fontSize: 16,
    fontWeight: '600',
    color: '#F7F5F0',
  },
});

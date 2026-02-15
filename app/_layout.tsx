import { Stack } from 'expo-router';
import { AppStateProvider, useAppState } from '@/contexts/AppStateContext';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function RootNavigator() {
  const { settings, isLoading, updateSettings } = useAppState();

  const handleOnboardingComplete = async () => {
    await updateSettings({ hasCompletedOnboarding: true });
  };

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="reader/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Library',
            headerTintColor: '#007AFF',
          }}
        />
      </Stack>

      {/* Show onboarding on first launch */}
      <OnboardingModal
        visible={!isLoading && !settings.hasCompletedOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <RootNavigator />
      </AppStateProvider>
    </ErrorBoundary>
  );
}

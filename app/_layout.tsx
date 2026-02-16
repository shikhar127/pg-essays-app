import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AppStateProvider, useAppState } from '@/contexts/AppStateContext';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors, sansFont } from '@/lib/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
            headerTintColor: colors.accent,
            headerStyle: {
              backgroundColor: colors.bg,
            },
            headerShadowVisible: false,
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

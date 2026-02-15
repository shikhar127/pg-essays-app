import { Stack } from 'expo-router';
import { AppStateProvider } from '@/contexts/AppStateContext';

export default function RootLayout() {
  return (
    <AppStateProvider>
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
    </AppStateProvider>
  );
}

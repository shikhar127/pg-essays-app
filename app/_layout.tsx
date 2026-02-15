import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
  );
}

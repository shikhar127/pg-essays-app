import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="library"
        options={{
          title: 'Library',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}

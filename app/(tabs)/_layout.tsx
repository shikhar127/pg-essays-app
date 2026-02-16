import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { colors, sansFont } from '@/lib/theme';
import { TabBarProvider, useTabBar } from '@/contexts/TabBarContext';

function TabsNavigator() {
  const { tabBarTranslateY } = useTabBar();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bg,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: sansFont,
          fontWeight: '600',
          color: colors.text,
        },
        headerTintColor: colors.accent,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          elevation: 0,
          transform: [{ translateY: tabBarTranslateY as unknown as number }],
        },
        tabBarLabelStyle: {
          fontFamily: sansFont,
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => (
            <Ionicons name="library" size={24} color={color} accessibilityLabel="Library tab" />
          ),
          tabBarAccessibilityLabel: 'Library tab',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={24} color={color} accessibilityLabel="Favorites tab" />
          ),
          tabBarAccessibilityLabel: 'Favorites tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} accessibilityLabel="Settings tab" />
          ),
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <TabBarProvider>
      <TabsNavigator />
    </TabBarProvider>
  );
}

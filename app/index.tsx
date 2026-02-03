import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReader } from '../context/ReaderContext';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useReader();
  const insets = useSafeAreaInsets();

  // For Step 1, auto-navigate to reader on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/reader/how-to-do-great-work');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          PG Essays
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          228 essays by Paul Graham
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.accent }]}
          onPress={() => router.push('/reader/how-to-do-great-work')}
        >
          <Text style={styles.buttonText}>Start Reading</Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Step 1: The Perfect Reader{'\n'}
          Testing with "How to Do Great Work"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

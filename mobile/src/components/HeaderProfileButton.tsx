import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Brand } from '@/constants/brand';

export function HeaderProfileButton() {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={() => router.push('/hesabim')}
      hitSlop={12}
      accessibilityLabel="Hesabım"
    >
      <Ionicons name="person-circle-outline" size={22} color={Brand.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderRadius: 17,
  },
  buttonPressed: {
    backgroundColor: Brand.bg,
  },
});

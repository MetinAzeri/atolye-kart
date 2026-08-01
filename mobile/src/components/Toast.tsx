import { StyleSheet, Text } from 'react-native';

import { useCart } from '@/context/CartContext';

export function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return <Text style={styles.toast}>✓ {toast}</Text>;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#3d2b1f',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
});

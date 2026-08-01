import { useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

import { assetUrl } from '@/lib/assets';

export function ProductImage({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  return (
    <Pressable style={styles.wrap} onPress={() => setIndex((current) => (current === 0 ? 1 : 0))}>
      {images.map((src, i) => (
        <Image key={src} style={[styles.photo, { opacity: i === index ? 1 : 0 }]} source={{ uri: assetUrl(src) }} />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

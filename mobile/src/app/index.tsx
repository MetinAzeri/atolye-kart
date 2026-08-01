import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductList } from '@/components/ProductList';
import { Brand } from '@/constants/brand';
import { products } from '@/data/products';
import { assetUrl } from '@/lib/assets';

const featuredProducts = products.slice(0, 3);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: assetUrl('assets/hero.jpg') }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Kilhane Atölye</Text>
            <Text style={styles.heroTagline}>"Toprağın sabırla şekle dönüştüğü yer."</Text>
          </View>
        </View>

        <View style={styles.trustStrip}>
          <Text style={styles.trustItem}>20+ El Yapımı Ürün</Text>
          <Text style={styles.trustItem}>%100 El İşçiliği</Text>
          <Text style={styles.trustItem}>Fırında Pişirilmiş</Text>
        </View>

        <Text style={styles.sectionTitle}>En Çok Tercih Edilen Ürünler</Text>
        <ProductList products={featuredProducts} />

        <View style={styles.ctaBand}>
          <Text style={styles.ctaTitle}>Hayalindeki Parçayı Kendin Tasarla</Text>
          <Text style={styles.ctaText}>
            Ürün tipini, rengini, desenini ve üzerine yazılacak sözü sen seç — birebir sana özel bir seramik parçası
            oluştur.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            onPress={() => router.push('/kendin-tasarla')}
          >
            <Text style={styles.ctaButtonText}>Tasarlamaya Başla</Text>
          </Pressable>
        </View>

        <View style={styles.ctaBand}>
          <Text style={styles.ctaTitle}>Biz Kimiz</Text>
          <Text style={styles.ctaText}>
            Kilhane Atölye, elleriyle üretmenin değerine inanan bir aile atölyesi — her kase ve vazo, saatlerce
            şekillenen çamurun ve özenle sürülen sırın hikâyesini taşır.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            onPress={() => router.push('/biz-kimiz')}
          >
            <Text style={styles.ctaButtonText}>Bizi Tanı</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(61, 43, 31, 0.48)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  heroTagline: {
    marginTop: 12,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
  },
  trustStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  trustItem: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Brand.textSecondary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 16,
  },
  ctaBand: {
    marginTop: 32,
    padding: 28,
    borderRadius: 16,
    backgroundColor: '#fdf1e6',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 21,
    color: Brand.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: Brand.accent,
  },
  ctaButtonPressed: {
    backgroundColor: Brand.accentDark,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
